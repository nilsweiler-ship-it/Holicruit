/**
 * Types for the soft-skill scenario assessment. The five dimensions are
 * universal across every industry — the scenarios are situational-judgment
 * questions about behavior, not domain knowledge — so the same assessment works
 * for a nurse, a salesperson, a teacher, or an engineer.
 */

export const SOFT_DIMENSIONS = [
  "Communication",
  "Collaboration",
  "Ownership",
  "Adaptability",
  "Problem-solving",
] as const;

export type SoftDimension = (typeof SOFT_DIMENSIONS)[number];

export interface ScenarioOption {
  id: string;
  text: string;
  /** Points (0–10) this option contributes to each soft dimension. */
  weights: Partial<Record<SoftDimension, number>>;
}

export interface ScenarioQuestion {
  id: string;
  /** A universal, domain-agnostic situation. */
  prompt: string;
  options: ScenarioOption[];
}

export interface ScenarioResult {
  /** 0–100 per dimension, compatible with SoftSkillScore. */
  scores: { name: SoftDimension; level: number }[];
}
