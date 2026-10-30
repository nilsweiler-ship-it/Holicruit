/**
 * Aggregate "gaps in demand" from real match rows — pure, unit-tested.
 *
 * Privacy: this is a cross-tenant rollup shown to training providers, so a gap
 * appears only when at least MIN_COHORT distinct candidates carry it (small
 * cohorts could identify a person). Counts are of distinct candidates and
 * distinct roles, never of match rows.
 */
import type { GapDemand } from "../types";

export const MIN_COHORT = 3;

export interface GapRow {
  candidateId: string;
  openingId: string;
  industry: string;
  /** Match.gaps JSON: [{ skill, type, severity }] */
  gaps: string;
}

export function aggregateGapDemand(
  rows: GapRow[],
  programsByGap: Map<string, number>,
  minCohort: number = MIN_COHORT,
): GapDemand[] {
  type Acc = { skill: string; type: "hard" | "soft"; candidates: Set<string>; roles: Set<string>; industries: Map<string, number> };
  const by = new Map<string, Acc>();
  for (const r of rows) {
    let gaps: unknown;
    try {
      gaps = JSON.parse(r.gaps);
    } catch {
      continue;
    }
    if (!Array.isArray(gaps)) continue;
    for (const g of gaps) {
      if (!g || typeof g !== "object") continue;
      const { skill, type } = g as { skill?: unknown; type?: unknown };
      if (typeof skill !== "string" || !skill.trim() || (type !== "hard" && type !== "soft")) continue;
      const key = `${type}:${skill.trim().toLowerCase()}`;
      let a = by.get(key);
      if (!a) {
        a = { skill: skill.trim(), type, candidates: new Set(), roles: new Set(), industries: new Map() };
        by.set(key, a);
      }
      a.candidates.add(r.candidateId);
      a.roles.add(r.openingId);
      a.industries.set(r.industry, (a.industries.get(r.industry) ?? 0) + 1);
    }
  }
  const out: GapDemand[] = [];
  for (const a of by.values()) {
    if (a.candidates.size < minCohort) continue;
    const industry = [...a.industries.entries()].sort((x, y) => y[1] - x[1])[0]?.[0] ?? "General";
    out.push({
      skill: a.skill,
      type: a.type,
      industry,
      candidatesWithGap: a.candidates.size,
      rolesBlocked: a.roles.size,
      programsOffered: programsByGap.get(a.skill.toLowerCase()) ?? 0,
    });
  }
  return out.sort((x, y) => y.candidatesWithGap - x.candidatesWithGap || y.rolesBlocked - x.rolesBlocked);
}
