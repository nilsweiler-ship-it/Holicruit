/** Hiring analytics for a manager's roles (Scale plan). */
import type { SkillGap } from "../fit/types";
import { prisma } from "../db";

export interface HiringAnalytics {
  roles: number;
  matched: number;
  funnel: { new: number; talking: number; offer: number; closed: number };
  /** offer stage as a share of all matched (%). */
  offerRate: number;
  /** average score-sheet overall (1–5), or null if none yet. */
  avgScore: number | null;
  scoreSheetCount: number;
  /** most common gaps blocking this manager's candidates. */
  topGaps: { skill: string; count: number }[];
  /** candidates stuck in "talking" for more than a week. */
  stalledTalking: number;
}

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

export async function getHiringAnalytics(userId: string): Promise<HiringAnalytics> {
  const openings = await prisma.opening.findMany({
    where: { company: { ownerId: userId } },
    select: { id: true },
  });
  const openingIds = openings.map((o) => o.id);
  const matches = await prisma.match.findMany({
    where: { openingId: { in: openingIds } },
    select: { stage: true, gaps: true, stageChangedAt: true, scoreSheets: { select: { overall: true } } },
  });

  const funnel = { new: 0, talking: 0, offer: 0, closed: 0 };
  const gapCount = new Map<string, number>();
  let scoreSum = 0;
  let scoreN = 0;
  let stalled = 0;
  const cutoff = Date.now() - WEEK_MS;

  for (const m of matches) {
    if (m.stage in funnel) funnel[m.stage as keyof typeof funnel] += 1;
    for (const g of JSON.parse(m.gaps) as SkillGap[]) {
      gapCount.set(g.skill, (gapCount.get(g.skill) ?? 0) + 1);
    }
    for (const s of m.scoreSheets) {
      scoreSum += s.overall;
      scoreN += 1;
    }
    if (m.stage === "talking" && m.stageChangedAt.getTime() < cutoff) stalled += 1;
  }

  const matched = matches.length;
  return {
    roles: openings.length,
    matched,
    funnel,
    offerRate: matched ? Math.round((funnel.offer / matched) * 100) : 0,
    avgScore: scoreN ? Math.round((scoreSum / scoreN) * 10) / 10 : null,
    scoreSheetCount: scoreN,
    topGaps: [...gapCount.entries()]
      .map(([skill, count]) => ({ skill, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5),
    stalledTalking: stalled,
  };
}
