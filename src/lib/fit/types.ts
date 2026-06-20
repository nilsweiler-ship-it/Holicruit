/**
 * The fit model — the core data primitive of Holicruit.
 *
 * Every match between a candidate and a role produces a `FitObject`. It is the
 * same underlying record everywhere; only its *presentation* changes per
 * audience (candidate match card, hiring-manager deep-dive, growth report…).
 *
 * Keep the hard / soft / verified|rank triplet visible wherever a match shows.
 */

export type SkillType = "hard" | "soft";

export type GapSeverity = "minor" | "moderate" | "major";

/** A specific, named skill gap. The single biggest gap drives the Growth
 *  Report and the marketplace routing. */
export interface SkillGap {
  skill: string;
  type: SkillType;
  severity: GapSeverity;
}

export interface FitObject {
  /** 0–100: match on hard/technical skills vs. the role's required bar. */
  hardFit: number;
  /** 0–100: match on soft skills, derived from the scenario assessment
   *  (NOT candidate self-rating). */
  softFit: number;
  /** 0–100: the headline number shown to both sides (weighted blend). */
  mutualFit: number;
  /** Whether claimed skills carry verification (peer endorsements,
   *  scenario score, work samples). */
  verified: boolean;
  /** Specific skill gaps for this match. */
  gaps: SkillGap[];
  /** The candidate's own ranking within the role's matched pool, e.g. 2.
   *  Shown to the candidate — a deliberate transparency feature. */
  candidateRank?: number;
  /** Size of the matched pool, for "top 3 of 28" context. */
  poolSize?: number;
}

/**
 * A single "You vs. Role bar" comparison — the Growth Report primitive.
 * `you` is the candidate's level; `roleBar` is the required bar (rendered
 * with a distinct hatched fill so the comparison is unmistakable).
 */
export interface BarComparison {
  label: string;
  /** 0–100 — the candidate's level. */
  you: number;
  /** 0–100 — the role's required bar. */
  roleBar: number;
}

/** One panel of the Growth Report (hard skills or soft skills). */
export interface GrowthPanel {
  type: SkillType;
  comparison: BarComparison;
  /** Below-bar: the specific gap that cost the role. */
  gap?: SkillGap;
  /** Above-bar: a strength (rendered in the success color). */
  aboveBar?: boolean;
  /** Human copy for the callout. */
  note: string;
}

/**
 * Auto-generated for every rejection. Explains *exactly why* the candidate
 * wasn't selected and routes them to fix it.
 */
export interface GrowthReport {
  id: string;
  matchId: string;
  roleTitle: string;
  company: string;
  hard: GrowthPanel;
  soft: GrowthPanel;
  /** The one gap carried into the marketplace as a filter. */
  primaryGap: SkillGap;
  /** "Finish one program and you'd clear the bar for N open roles." */
  rolesClearedIfClosed: number;
  /** Number of programs that match the primary gap. */
  matchingProgramCount: number;
}

/** True when the candidate's level meets or exceeds the role bar. */
export function isAboveBar(c: BarComparison): boolean {
  return c.you >= c.roleBar;
}
