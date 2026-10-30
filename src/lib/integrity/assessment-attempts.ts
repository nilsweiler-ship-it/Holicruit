/**
 * Attempt bookkeeping for assessments — pure helpers.
 *
 * Attempts are recorded as `ScenarioResult` rows (an existing, timestamped,
 * per-profile table: `scores` is a JSON array of `{ name, level }`), so no schema
 * change is needed and the candidate sees their own attempt history in the GDPR
 * data export:
 *   • soft-skill scenario run → the five competency scores, as before;
 *   • applied skill check     → a single entry `{ name: "skill-check:<skill>", level: score }`.
 */
import { seededShuffle } from "./shuffle";
import type { SkillCheckItem } from "../fixtures/skill-checks";

/** One applied skill check per skill per 24 hours. */
export const SKILL_CHECK_COOLDOWN_MS = 24 * 60 * 60 * 1000;
/** One soft-skill scenario run per 7 days. */
export const SCENARIO_COOLDOWN_MS = 7 * 24 * 60 * 60 * 1000;

export const SKILL_CHECK_ATTEMPT_PREFIX = "skill-check:";

export function skillCheckAttemptName(skill: string): string {
  return SKILL_CHECK_ATTEMPT_PREFIX + skill.trim().replace(/\s+/g, " ").toLowerCase();
}

/**
 * Substring that identifies a skill-check attempt row for `skill` inside the
 * JSON `scores` column (JSON-encoded so quotes/backslashes in a skill name
 * can't break out of the string).
 */
export function skillCheckAttemptNeedle(skill: string): string {
  return `"name":${JSON.stringify(skillCheckAttemptName(skill))}`;
}

/** Serialized `scores` value for a skill-check attempt. */
export function skillCheckAttemptScores(skill: string, score: number): string {
  return JSON.stringify([{ name: skillCheckAttemptName(skill), level: score }]);
}

/** When the next attempt is allowed, or null if one is allowed now. */
export function nextAttemptAt(
  lastAttemptAt: Date | null | undefined,
  cooldownMs: number,
  now: Date = new Date(),
): Date | null {
  if (!lastAttemptAt) return null;
  const next = new Date(lastAttemptAt.getTime() + cooldownMs);
  return next.getTime() > now.getTime() ? next : null;
}

// ── What the browser is allowed to see ─────────────────────────────────────

/** A skill-check item without its answer key. */
export interface PublicSkillCheckItem {
  id: string;
  prompt: string;
  note?: string;
  options: { id: string; text: string }[];
}

/**
 * Strip scores and shuffle option order for one attempt. `attemptSeed` should
 * change between attempts (e.g. candidate + skill + last attempt timestamp) and
 * stay fixed within one, so reloads render the same order.
 */
export function toPublicSkillCheckItems(items: SkillCheckItem[], attemptSeed: string): PublicSkillCheckItem[] {
  return items.map((it) => ({
    id: it.id,
    prompt: it.prompt,
    ...(it.note ? { note: it.note } : {}),
    options: seededShuffle(
      it.options.map((o) => ({ id: o.id, text: o.text })),
      `${attemptSeed}\u0000${it.id}`,
    ),
  }));
}

/**
 * Validate a hiring manager's stored custom quiz (`opening.quiz` JSON) before it
 * is rendered or scored. Returns null for anything malformed.
 */
export function parseQuizItems(raw: string | null | undefined): SkillCheckItem[] | null {
  if (!raw) return null;
  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch {
    return null;
  }
  if (!Array.isArray(data) || data.length === 0 || data.length > 50) return null;
  const out: SkillCheckItem[] = [];
  const ids = new Set<string>();
  for (const it of data) {
    if (!it || typeof it !== "object") return null;
    const { id, prompt, note, options } = it as Record<string, unknown>;
    if (typeof id !== "string" || !id || ids.has(id) || typeof prompt !== "string") return null;
    if (!Array.isArray(options) || options.length < 2) return null;
    ids.add(id);
    const oids = new Set<string>();
    const opts: SkillCheckItem["options"] = [];
    for (const o of options) {
      if (!o || typeof o !== "object") return null;
      const { id: oid, text, score } = o as Record<string, unknown>;
      if (typeof oid !== "string" || !oid || oids.has(oid) || typeof text !== "string") return null;
      if (typeof score !== "number" || !Number.isFinite(score)) return null;
      oids.add(oid);
      opts.push({ id: oid, text, score });
    }
    out.push({ id, prompt, ...(typeof note === "string" && note ? { note } : {}), options: opts });
  }
  return out;
}

/**
 * A role's custom quiz applies only when the candidate is matched to that role
 * (caller passes the match's opening, or null when there is no match) AND the
 * skill being checked is one the role requires. Otherwise: null → the universal
 * bank is used. A caller-chosen openingId therefore can't route a candidate to
 * an arbitrary role's (possibly easier) quiz for an arbitrary skill.
 */
export function roleQuizFor(
  matchedOpening: { quiz: string | null; requiredHard: string } | null | undefined,
  skill: string,
): SkillCheckItem[] | null {
  if (!matchedOpening?.quiz) return null;
  let required: unknown;
  try {
    required = JSON.parse(matchedOpening.requiredHard);
  } catch {
    return null;
  }
  const want = skill.trim().toLowerCase();
  if (!Array.isArray(required) || !required.some((r) => typeof r === "string" && r.trim().toLowerCase() === want)) {
    return null;
  }
  return parseQuizItems(matchedOpening.quiz);
}

/**
 * Check a submission against the items that were served: every item answered
 * exactly once with one of its own option ids, nothing else.
 */
export function validateSkillCheckAnswers(
  items: SkillCheckItem[],
  answers: unknown,
): { ok: true; answers: Record<string, string> } | { ok: false; error: string } {
  if (!answers || typeof answers !== "object" || Array.isArray(answers)) {
    return { ok: false, error: "Answers are missing." };
  }
  const given = answers as Record<string, unknown>;
  const keys = Object.keys(given);
  if (keys.length !== items.length) return { ok: false, error: "Please answer every item." };
  const clean: Record<string, string> = {};
  for (const it of items) {
    if (!Object.hasOwn(given, it.id)) return { ok: false, error: "Please answer every item." };
    const v = given[it.id];
    if (typeof v !== "string" || !it.options.some((o) => o.id === v)) {
      return { ok: false, error: "One of the answers isn't valid for this check." };
    }
    clean[it.id] = v;
  }
  return { ok: true, answers: clean };
}
