import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { generateGapSummary } from "@/lib/matching/gap-analysis";
import type { SkillGapItem } from "@/lib/matching/types";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ applicationId: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { applicationId } = await params;

  const application = await prisma.application.findUnique({
    where: { id: applicationId },
    include: { skillGaps: true },
  });

  if (!application) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Plan gate: HMs need Professional+ for gap reports; candidates can always see their own
  if (session.user.role === "HIRING_MANAGER") {
    const { checkQuota } = await import("@/lib/plans");
    const quota = await checkQuota(session.user.id, "VIEW_GAP_REPORT");
    if (!quota.allowed) {
      return NextResponse.json(
        {
          error: "QUOTA_EXCEEDED",
          message: quota.message,
          quota: { current: quota.current, limit: quota.limit },
        },
        { status: 403 }
      );
    }
  }

  const gaps: SkillGapItem[] = application.skillGaps.map((g) => ({
    skill: g.skill,
    category: g.category as "HARD" | "SOFT",
    currentLevel: g.currentLevel,
    requiredLevel: g.requiredLevel,
    status: g.status as "MET" | "PARTIAL" | "MISSING",
    recommendations: JSON.parse(g.recommendations),
  }));

  const summary = generateGapSummary(gaps);

  return NextResponse.json({
    gaps: application.skillGaps,
    summary,
  });
}
