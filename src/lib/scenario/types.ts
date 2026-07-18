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

/**
 * Personality dimensions — the scientifically validated Big Five (OCEAN),
 * extended with HEXACO's Honesty-Humility ("Integrity"), the strongest
 * predictor of counterproductive behavior. Ordered by job-performance
 * predictive validity (Conscientiousness first). These are *measured* from
 * behavior in the scenario, never self-rated.
 */
export const PERSONALITY_DIMENSIONS = [
  "Conscientiousness",
  "Emotional stability",
  "Agreeableness",
  "Extraversion",
  "Openness",
  "Integrity",
] as const;

export type PersonalityDimension = (typeof PERSONALITY_DIMENSIONS)[number];

export interface ScenarioOption {
  id: string;
  text: string;
  /** Points (0–10) this option contributes to each soft competency. */
  weights: Partial<Record<SoftDimension, number>>;
  /**
   * Behavioral-tendency loadings on the Big Five + Integrity. Every option is a
   * plausible choice — these say which trait the choice *expresses*, not which
   * answer is "correct". No option is globally best.
   */
  traits: Partial<Record<PersonalityDimension, number>>;
}

export interface ScenarioQuestion {
  id: string;
  /** A universal, domain-agnostic situation. */
  prompt: string;
  options: ScenarioOption[];
}

export interface ScenarioResult {
  /** 0–100 per competency, compatible with SoftSkillScore (used for matching). */
  scores: { name: SoftDimension; level: number }[];
  /** 0–100 per personality dimension — the Big Five + Integrity profile. */
  traits: { name: PersonalityDimension; level: number }[];
}
