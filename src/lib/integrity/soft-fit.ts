/**
 * Soft-skill part of the fit computation — pure and unit-tested; called by
 * `computeFit` in matching/engine.ts.
 *
 * Unassessed rule (B7): a candidate with no soft-skill scores has *not* been
 * measured. We don't pretend otherwise:
 *   • no soft gaps are invented for them (we don't know they have any);
 *   • their soft fit is a neutral placeholder, UNASSESSED_SOFT_FIT = 45 —
 *     just under the midpoint (50) of the normalized scenario scale, so skipping
 *     the assessment never beats an average assessed candidate and is strictly
 *     below any good assessed score (≥ the 75 soft bar), without burying an
 *     unassessed candidate whose hard skills are strong;
 *   • `softAssessed: false` is returned so views can say "not assessed".
 * Excluding soft fit entirely (hard-only mutual fit) was rejected: it would let
 * an unassessed candidate with perfect hard skills outrank an equally strong
 * candidate who took the assessment and did well — the same perverse incentive.
 */
import type { SkillGap } from "../fit/types";

export const UNASSESSED_SOFT_FIT = 45;

export interface SoftFitInput {
  softSkills: { name: string; level: number }[];
  requiredSoft: string[];
  /** Importance weight for a skill name (case-insensitive lookup done by caller). */
  weightOf: (skill: string) => number;
  severityOf: (skill: string) => SkillGap["severity"];
  softBar: number;
}

export interface SoftFitResult {
  softFit: number;
  softAssessed: boolean;
  gaps: SkillGap[];
}

export function computeSoftFit(input: SoftFitInput): SoftFitResult {
  if (input.softSkills.length === 0) {
    return { softFit: UNASSESSED_SOFT_FIT, softAssessed: false, gaps: [] };
  }
  const gaps: SkillGap[] = [];
  // Defensive: a bad write (NaN, 150, -3) must not poison the fit — clamp to 0–100, drop NaN.
  const softMap = new Map(
    input.softSkills
      .filter((s) => Number.isFinite(s.level))
      .map((s) => [s.name.toLowerCase(), Math.max(0, Math.min(100, s.level))] as const),
  );
  const relevant = input.requiredSoft.length ? input.requiredSoft : input.softSkills.map((s) => s.name);
  let softSum = 0;
  let softWtot = 0;
  for (const req of relevant) {
    const w = input.weightOf(req);
    const lvl = softMap.get(req.toLowerCase());
    if (lvl != null) {
      softSum += w * lvl;
      softWtot += w;
      if (lvl < input.softBar) {
        gaps.push({ skill: req, type: "soft", severity: lvl < input.softBar - 15 ? "moderate" : "minor" });
      }
    } else {
      // Assessed, but this role asks for a dimension the assessment didn't cover.
      gaps.push({ skill: req, type: "soft", severity: input.severityOf(req) });
    }
  }
  const softFit = softWtot ? Math.round(softSum / softWtot) : UNASSESSED_SOFT_FIT;
  return { softFit, softAssessed: true, gaps };
}
