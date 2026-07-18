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

  /** Quality of hire — avg mutual fit of candidates that reached the offer stage. */
  offerAvgFit: number | null;
  /** Silver medalists: strong candidates passed on, now nurtured for re-match. */
  silverMedalists: number;

  /** Fairness — share of active candidates (talking/offer) with a structured scorecard (%). */
  reviewedShare: number;
  /** Panel agreement among candidates scored by 2+ interviewers (%), or null. */
  panelAgreement: number | null;
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
    select: {
      stage: true,
      gaps: true,
      mutualFit: true,
      stageChangedAt: true,
      scoreSheets: { select: { overall: true } },
    },
  });

  const funnel = { new: 0, talking: 0, offer: 0, closed: 0 };
  const gapCount = new Map<string, number>();
  let scoreSum = 0;
  let scoreN = 0;
  let stalled = 0;
  let offerFitSum = 0;
  let offerN = 0;
  let activeN = 0; // talking + offer
  let reviewedN = 0; // active with ≥1 scorecard
  let panelN = 0; // active with ≥2 scorecards
  let panelAgree = 0; // of those, raters within 1 point
  const cutoff = Date.now() - WEEK_MS;

  for (const m of matches) {
    if (m.stage in funnel) funnel[m.stage as keyof typeof funnel] += 1;
    for (const g of JSON.parse(m.gaps) as SkillGap[]) {
      gapCount.set(g.skill, (gapCount.get(g.skill) ?? 0) + 1);
    }
    const overalls = m.scoreSheets.map((s) => s.overall);
    for (const o of overalls) {
      scoreSum += o;
      scoreN += 1;
    }
    if (m.stage === "offer") {
      offerFitSum += m.mutualFit;
      offerN += 1;
    }
    if (m.stage === "talking" || m.stage === "offer") {
      activeN += 1;
      if (overalls.length >= 1) reviewedN += 1;
      if (overalls.length >= 2) {
        panelN += 1;
        if (Math.max(...overalls) - Math.min(...overalls) <= 1) panelAgree += 1;
      }
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
    offerAvgFit: offerN ? Math.round(offerFitSum / offerN) : null,
    silverMedalists: funnel.closed,
    reviewedShare: activeN ? Math.round((reviewedN / activeN) * 100) : 0,
    panelAgreement: panelN ? Math.round((panelAgree / panelN) * 100) : null,
  };
}
