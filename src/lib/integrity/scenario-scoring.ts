/**
 * Soft-skill scenario (SJT) scoring — pure, so it is unit-testable and is the
 * single implementation used by `scenarioService.score`.
 *
 * Competencies (used for matching): each dimension is min–max normalized
 * against what the bank can actually produce for it — the sum over questions of
 * the lowest and highest loading any option has on that dimension. So the
 * weakest possible pattern for a dimension scores 0, the strongest 100, and the
 * scale is comparable across dimensions.
 *
 * Personality traits: normalized the same way, then mapped into
 * [TRAIT_FLOOR, TRAIT_CEIL] — six items never justify an extreme claim.
 *
 * Submissions are validated first: every question answered with one of its
 * own option ids, nothing else. Partial or bogus submissions are rejected,
 * never scored as zeros.
 */
import { z } from "zod";
import {
  PERSONALITY_DIMENSIONS,
  SOFT_DIMENSIONS,
  type ScenarioQuestion,
  type ScenarioResult,
} from "../scenario/types";
import { seededShuffle } from "./shuffle";
import { TRAIT_CEIL, TRAIT_FLOOR } from "./traits";

export class InvalidScenarioAnswers extends Error {
  constructor(msg = "Every question needs exactly one valid answer.") {
    super(msg);
    this.name = "InvalidScenarioAnswers";
  }
}

const answersShape = z.record(z.string().max(64), z.string().max(64));

/** Validate a submission against the bank. */
export function validateScenarioAnswers(
  questions: ScenarioQuestion[],
  answers: unknown,
): { ok: true; answers: Record<string, string> } | { ok: false; error: string } {
  const parsed = answersShape.safeParse(answers);
  if (!parsed.success) return { ok: false, error: "Answers are malformed." };
  const given = parsed.data;
  const qids = new Set(questions.map((q) => q.id));
  for (const k of Object.keys(given)) {
    if (!qids.has(k)) return { ok: false, error: "Unknown question in submission." };
  }
  const clean: Record<string, string> = {};
  for (const q of questions) {
    const v = Object.hasOwn(given, q.id) ? given[q.id] : undefined;
    if (typeof v !== "string") return { ok: false, error: "Please answer every question." };
    if (!q.options.some((o) => o.id === v)) return { ok: false, error: "An answer isn't a valid option." };
    clean[q.id] = v;
  }
  return { ok: true, answers: clean };
}

type Key = "weights" | "traits";

/** Lowest and highest total a dimension can reach across the bank. */
export function dimensionRange(questions: ScenarioQuestion[], key: Key, dim: string): { min: number; max: number } {
  let min = 0;
  let max = 0;
  for (const q of questions) {
    const vals = q.options.map((o) => (o[key] as Record<string, number | undefined>)[dim] ?? 0);
    min += Math.min(...vals);
    max += Math.max(...vals);
  }
  return { min, max };
}

function normalized(questions: ScenarioQuestion[], answers: Record<string, string>, key: Key, dim: string): number {
  const { min, max } = dimensionRange(questions, key, dim);
  if (max <= min) return 0.5;
  let earned = 0;
  for (const q of questions) {
    const chosen = q.options.find((o) => o.id === answers[q.id]);
    earned += chosen ? ((chosen[key] as Record<string, number | undefined>)[dim] ?? 0) : 0;
  }
  return Math.max(0, Math.min(1, (earned - min) / (max - min)));
}

/** Score a submission. Throws InvalidScenarioAnswers unless it validates. */
export function scoreScenario(questions: ScenarioQuestion[], answers: unknown): ScenarioResult {
  const v = validateScenarioAnswers(questions, answers);
  if (!v.ok) throw new InvalidScenarioAnswers(v.error);
  return {
    scores: SOFT_DIMENSIONS.map((name) => ({
      name,
      level: Math.round(100 * normalized(questions, v.answers, "weights", name)),
    })),
    traits: PERSONALITY_DIMENSIONS.map((name) => ({
      name,
      level: Math.round(TRAIT_FLOOR + (TRAIT_CEIL - TRAIT_FLOOR) * normalized(questions, v.answers, "traits", name)),
    })),
  };
}

/** A scenario question as the browser may see it: text only, no loadings. */
export interface PublicScenarioQuestion {
  id: string;
  prompt: string;
  options: { id: string; text: string }[];
}

/** Strip weights/traits and shuffle option order for one attempt (server-side). */
export function toPublicQuestions(questions: ScenarioQuestion[], attemptSeed: string): PublicScenarioQuestion[] {
  return questions.map((q) => ({
    id: q.id,
    prompt: q.prompt,
    options: seededShuffle(
      q.options.map((o) => ({ id: o.id, text: o.text })),
      `${attemptSeed}\u0000${q.id}`,
    ),
  }));
}
