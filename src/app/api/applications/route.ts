import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { createApplicationSchema } from "@/lib/validations/application";
import { computeMatchScore } from "@/lib/matching/engine";
import type { ParsedCandidate, ParsedRole } from "@/lib/matching/types";

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const roleId = searchParams.get("roleId");

  const where: Record<string, unknown> = {};

  if (session.user.role === "CANDIDATE") {
    const profile = await prisma.candidateProfile.findUnique({
      where: { userId: session.user.id },
      select: { id: true },
    });
    if (profile) where.candidateId = profile.id;
  } else if (session.user.role === "HEADHUNTER") {
    const profile = await prisma.headhunterProfile.findUnique({
      where: { userId: session.user.id },
      select: { id: true },
    });
    if (profile) where.headhunterId = profile.id;
  }

  if (roleId) where.roleId = roleId;

  const applications = await prisma.application.findMany({
    where,
    include: {
      role: { select: { title: true, company: { select: { name: true } } } },
      candidate: {
        include: { user: { select: { name: true, email: true } } },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(applications);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const data = createApplicationSchema.parse(body);

    // Verify role exists and is published
    const role = await prisma.jobRole.findUnique({
      where: { id: data.roleId },
    });
    if (!role || role.status !== "PUBLISHED") {
      return NextResponse.json(
        { error: "Role not found or not published" },
        { status: 400 }
      );
    }

    // Verify candidate profile exists
    const candidate = await prisma.candidateProfile.findUnique({
      where: { id: data.candidateId },
    });
    if (!candidate) {
      return NextResponse.json(
        { error: "Candidate not found" },
        { status: 400 }
      );
    }

    // Quota check: apps-per-role (enforced by role-owning company's plan)
    const { checkQuota } = await import("@/lib/plans");
    const appsQuota = await checkQuota(session.user.id, "APPLY_TO_ROLE", {
      roleId: data.roleId,
      companyId: role.companyId,
    });
    if (!appsQuota.allowed) {
      return NextResponse.json(
        {
          error: "QUOTA_EXCEEDED",
          message: appsQuota.message,
          quota: { current: appsQuota.current, limit: appsQuota.limit },
        },
        { status: 403 }
      );
    }

    // Quota check: HH monthly submission limit (if submitted by headhunter)
    if (data.headhunterId) {
      const hhQuota = await checkQuota(session.user.id, "HH_SUBMIT");
      if (!hhQuota.allowed) {
        return NextResponse.json(
          {
            error: "QUOTA_EXCEEDED",
            message: hhQuota.message,
            quota: { current: hhQuota.current, limit: hhQuota.limit },
          },
          { status: 403 }
        );
      }
    }

    // Check for duplicate
    const existing = await prisma.application.findUnique({
      where: {
        candidateId_roleId: {
          candidateId: data.candidateId,
          roleId: data.roleId,
        },
      },
    });
    if (existing) {
      return NextResponse.json(
        { error: "Application already exists" },
        { status: 400 }
      );
    }

    // Compute match score
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

    const matchResult = computeMatchScore(parsedCandidate, parsedRole);

    // Auto-shortlist if above threshold
    const stage =
      matchResult.overallScore >= role.threshold ? "SHORTLISTED" : "APPLIED";

    const auditLog = [
      {
        timestamp: new Date().toISOString(),
        action: "Application created",
        actor: session.user.name,
        details: `Match score: ${matchResult.overallScore}%`,
      },
      ...(stage === "SHORTLISTED"
        ? [
            {
              timestamp: new Date().toISOString(),
              action: "Auto-shortlisted",
              actor: "System",
              details: `Score ${matchResult.overallScore}% >= threshold ${role.threshold}%`,
            },
          ]
        : []),
    ];

    const application = await prisma.application.create({
      data: {
        candidateId: data.candidateId,
        roleId: data.roleId,
        headhunterId: data.headhunterId || null,
        matchScore: matchResult.overallScore,
        scoreBreakdown: JSON.stringify(matchResult.dimensions),
        stage,
        auditLog: JSON.stringify(auditLog),
      },
    });

    // Create skill gap records
    if (matchResult.skillGaps.length > 0) {
      await prisma.skillGap.createMany({
        data: matchResult.skillGaps.map((gap) => ({
          applicationId: application.id,
          skill: gap.skill,
          category: gap.category,
          currentLevel: gap.currentLevel,
          requiredLevel: gap.requiredLevel,
          status: gap.status,
          recommendations: JSON.stringify(gap.recommendations),
        })),
      });
    }

    // Send email notifications (fire-and-forget)
    try {
      const { sendApplicationReceived, sendShortlisted } = await import("@/lib/email");
      const hm = await prisma.user.findUnique({
        where: { id: role.createdById },
        select: { email: true },
      });
      const candidateUser = await prisma.user.findFirst({
        where: { candidateProfile: { id: data.candidateId } },
        select: { name: true, email: true },
      });
      const roleCompany = await prisma.company.findUnique({
        where: { id: role.companyId },
        select: { name: true },
      });

      if (hm?.email && candidateUser) {
        sendApplicationReceived(
          hm.email,
          candidateUser.name || "A candidate",
          role.title,
          matchResult.overallScore,
          role.id
        );
      }
      if (stage === "SHORTLISTED" && candidateUser?.email && roleCompany) {
        sendShortlisted(candidateUser.email, role.title, roleCompany.name);
      }
    } catch {
      // Don't fail the request if email fails
    }

    return NextResponse.json(application, { status: 201 });
  } catch (error) {
    console.error("Create application error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
