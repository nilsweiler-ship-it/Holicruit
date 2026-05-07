import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { computeMatchScore } from "@/lib/matching/engine";
import type { ParsedCandidate, ParsedRole } from "@/lib/matching/types";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { candidateId, roleId } = await req.json();

    const candidate = await prisma.candidateProfile.findUnique({
      where: { id: candidateId },
    });
    const role = await prisma.jobRole.findUnique({
      where: { id: roleId },
    });

    if (!candidate || !role) {
      return NextResponse.json(
        { error: "Candidate or role not found" },
        { status: 404 }
      );
    }

    // Authorization: only HH who claimed the role or HM whose company owns it
    if (session.user.role === "HEADHUNTER") {
      const hhProfile = await prisma.headhunterProfile.findUnique({
        where: { userId: session.user.id },
        select: { id: true },
      });
      if (role.claimedById !== hhProfile?.id) {
        return NextResponse.json({ error: "Not found" }, { status: 404 });
      }
    } else if (session.user.role === "HIRING_MANAGER") {
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { companyId: true },
      });
      if (role.companyId !== user?.companyId) {
        return NextResponse.json({ error: "Not found" }, { status: 404 });
      }
    } else {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const parsedCandidate: ParsedCandidate = {
      skills: JSON.parse(candidate.skills),
      experience: JSON.parse(candidate.experience),
      education: JSON.parse(candidate.education),
    };

    const parsedRole: ParsedRole = {
      hardSkills: JSON.parse(role.hardSkills),
      softSkills: JSON.parse(role.softSkills),
      weights: JSON.parse(role.weights),
    };

    const result = computeMatchScore(parsedCandidate, parsedRole);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Match score error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
