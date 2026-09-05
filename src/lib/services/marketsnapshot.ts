/**
 * Role market snapshot — the honest "never-empty" first-run signal for a hiring
 * manager. Recomputes real fit for the whole candidate pool against one role, so
 * a fresh HM always sees a truthful talent landscape instead of a blank screen:
 * how many clear their bar, how many are one skill away, and the common gaps.
 *
 * Nothing here is fabricated: every count comes from real profiles. Individual
 * near-miss candidates are shown BLIND (no identity) — consistent with opt-in
 * matching, identities only ever surface through a real, mutual, opted-in match.
 */
import { prisma } from "../db";
import { computeFit, MATCH_THRESHOLD, PRIORITY_THRESHOLD } from "../matching/engine";
import type { SkillGap } from "../fit/types";

export type NearMiss = {
  candidateId: string;
  headline: string;
  industry: string;
  mutualFit: number;
  /** The single hard skill that would lift this candidate over the bar. */
  unlockSkill: string;
  projectedFit: number;
};

export type RoleMarketSnapshot = {
  roleTitle: string;
  companyName: string;
  passBar: number;
  considered: number;
  aboveBar: number;
  nearCount: number;
  bands: { label: string; count: number }[];
  commonGaps: { skill: string; count: number }[];
  nearMisses: NearMiss[];
};

function parseWeights(json: string | null | undefined): Record<string, string> {
  if (!json) return {};
  try {
    return JSON.parse(json) as Record<string, string>;
  } catch {
    return {};
  }
}

/**
 * Build the market snapshot for one opening. Evaluates every candidate profile
 * against the role's real bar and calibration.
 */
export async function getRoleMarketSnapshot(openingId: string): Promise<RoleMarketSnapshot | null> {
  const opening = await prisma.opening.findUnique({
    where: { id: openingId },
    include: { company: { select: { name: true } } },
  });
  if (!opening) return null;

  const requiredHard = JSON.parse(opening.requiredHard) as string[];
  const requiredSoft = JSON.parse(opening.requiredSoft) as string[];
  const skillWeights = parseWeights(opening.skillWeights);
  const base = opening.passBar ?? MATCH_THRESHOLD;
  const threshold = opening.priority ? Math.min(base, PRIORITY_THRESHOLD) : base;

  // Landscape reflects the real marketplace — claimed candidates only, never a
  // single HM's private imports.
  const profiles = await prisma.candidateProfile.findMany({
    where: { claimed: true },
    include: { hardSkills: true, softSkills: true },
  });

  const fitOf = (hardSkills: { name: string; verified: boolean }[], soft: { name: string; level: number }[]) =>
    computeFit({
      hardSkills,
      softSkills: soft,
      requiredHard,
      requiredSoft,
      hardWeight: opening.hardWeight,
      softWeight: opening.softWeight,
      skillWeights,
    });

  // Candidates already matched to this role: use the fit the HM already sees
  // (the stored match), so the landscape agrees with the pipeline instead of
  // silently recomputing and disagreeing.
  const existing = await prisma.match.findMany({
    where: { openingId },
    select: { candidateId: true, mutualFit: true, gaps: true },
  });
  const byCandidate = new Map(existing.map((m) => [m.candidateId, m]));

  let aboveBar = 0;
  let within = 0; // within 15 below the bar
  let developing = 0; // 15–30 below
  let early = 0; // >30 below
  const nearMisses: NearMiss[] = [];
  const gapTally = new Map<string, number>();

  for (const p of profiles) {
    const stored = byCandidate.get(p.id);
    const recomputed = stored ? null : fitOf(p.hardSkills, p.softSkills);
    const mutualFit = stored ? stored.mutualFit : recomputed!.mutualFit;
    const gaps = (stored ? JSON.parse(stored.gaps) : recomputed!.gaps) as SkillGap[];

    if (mutualFit >= threshold) {
      aboveBar++;
      continue;
    }

    const delta = threshold - mutualFit;
    if (delta <= 15) within++;
    else if (delta <= 30) developing++;
    else early++;

    // Tally hard gaps for the addressable near-bar group (within 20 of the bar).
    if (delta <= 20) {
      for (const g of gaps) {
        if (g.type === "hard") gapTally.set(g.skill, (gapTally.get(g.skill) ?? 0) + 1);
      }
    }

    // "One skill away" — only for the untapped pool (not already-matched people).
    // Adding a single missing hard skill (verified) would clear the bar.
    if (!stored) {
      const missingHard = gaps.filter((g) => g.type === "hard").map((g) => g.skill);
      let best: { skill: string; projected: number } | null = null;
      for (const skill of missingHard) {
        const projected = fitOf([...p.hardSkills, { name: skill, verified: true }], p.softSkills).mutualFit;
        if (projected >= threshold && (!best || projected > best.projected)) {
          best = { skill, projected };
        }
      }
      if (best) {
        nearMisses.push({
          candidateId: p.id,
          headline: p.headline,
          industry: p.industry,
          mutualFit,
          unlockSkill: best.skill,
          projectedFit: best.projected,
        });
      }
    }
  }

  nearMisses.sort((a, b) => b.projectedFit - a.projectedFit || b.mutualFit - a.mutualFit);

  const commonGaps = [...gapTally.entries()]
    .map(([skill, count]) => ({ skill, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 4);

  return {
    roleTitle: opening.title,
    companyName: opening.company.name,
    passBar: threshold,
    considered: profiles.length,
    aboveBar,
    nearCount: nearMisses.length,
    bands: [
      { label: "Clears your bar", count: aboveBar },
      { label: "Within reach", count: within },
      { label: "Developing", count: developing },
      { label: "Early", count: early },
    ],
    commonGaps,
    nearMisses: nearMisses.slice(0, 6),
  };
}
