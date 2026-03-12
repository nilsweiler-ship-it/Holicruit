import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { checkQuota } from "@/lib/plans";
import { computeMatchScore } from "@/lib/matching/engine";
import { generateFitNarrative } from "@/lib/ai";
import { logDataAccess } from "@/lib/audit";
import type { ParsedCandidate, ParsedRole } from "@/lib/matching/types";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== "HIRING_MANAGER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { candidateId, roleId } = await req.json();

    if (!candidateId || !roleId) {
      return NextResponse.json(
        { error: "candidateId and roleId are required" },
        { status: 400 }
      );
    }

    // Plan gate
    const quota = await checkQuota(session.user.id, "GENERATE_NARRATIVE");
    if (!quota.allowed) {
      return NextResponse.json(
        { error: quota.message || "Upgrade your plan to access AI narratives" },
        { status: 403 }
      );
    }

    // Fetch candidate and role
    const [candidateProfile, role] = await Promise.all([
      prisma.candidateProfile.findUnique({
        where: { id: candidateId },
        include: { user: { select: { name: true } } },
      }),
      prisma.jobRole.findUnique({
        where: { id: roleId },
      }),
    ]);

    if (!candidateProfile || !role) {
      return NextResponse.json(
        { error: "Candidate or role not found" },
        { status: 404 }
      );
    }

    // Verify HM owns this role
    if (role.createdById !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Build parsed data for matching
    const candidate: ParsedCandidate & { bio?: string } = {
      bio: candidateProfile.bio || undefined,
      skills: JSON.parse(candidateProfile.skills || "[]"),
      experience: JSON.parse(candidateProfile.experience || "[]"),
      education: JSON.parse(candidateProfile.education || "[]"),
    };

    const parsedRole: ParsedRole & { title: string; description: string } = {
      title: role.title,
      description: role.description,
      hardSkills: JSON.parse(role.hardSkills),
      softSkills: JSON.parse(role.softSkills),
      weights: JSON.parse(role.weights),
    };

    const matchResult = computeMatchScore(candidate, parsedRole);

    const narrative = await generateFitNarrative({
      candidate,
      role: parsedRole,
      matchResult,
    });

    // Audit log
    logDataAccess({
      userId: session.user.id,
      action: "GENERATE_NARRATIVE",
      resourceType: "Application",
      resourceId: `${candidateId}:${roleId}`,
      metadata: { candidateId, roleId, matchScore: matchResult.overallScore },
    });

    return NextResponse.json({ narrative });
  } catch (error) {
    console.error("Narrative generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate narrative" },
      { status: 500 }
    );
  }
}
