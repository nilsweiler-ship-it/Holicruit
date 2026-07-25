/**
 * Applied skill-check item bank. Deliberately "AI-proof": every item tests
 * judgment, verification, and trade-off reasoning applied to a realistic
 * situation — the things you can't Google or have an AI decide for you — rather
 * than factual recall. Items are parameterised by the skill name so any role's
 * required skill gets a relevant, work-sample-style check out of the box.
 *
 * Providers (Scale plan) can override the bank per role via `opening.quiz`.
 */

export interface SkillCheckOption {
  id: string;
  text: string;
  /** 0–10: how strong this choice is (judgment, not "correct trivia"). */
  score: number;
}
export interface SkillCheckItem {
  id: string;
  prompt: string;
  /** Optional guidance shown to the candidate. */
  note?: string;
  options: SkillCheckOption[];
}

/** Universal applied-judgment template — works for any skill `X`. */
function genericItems(skill: string): SkillCheckItem[] {
  const X = skill;
  return [
    {
      id: "ambiguity",
      prompt: `You're handed a task that leans heavily on ${X}, but the requirements are ambiguous and the deadline is real. What do you do first?`,
      options: [
        { id: "a", text: "Clarify the goal, constraints, and definition of done before building.", score: 10 },
        { id: "b", text: "Start on the part you're sure about and flag the rest early.", score: 7 },
        { id: "c", text: "Ask an AI tool to spec it and build exactly what it says.", score: 3 },
        { id: "d", text: "Wait until someone gives you clearer requirements.", score: 2 },
      ],
    },
    {
      id: "verify",
      prompt: `An AI assistant produces a ${X} solution that looks right, but you didn't write it and can't fully explain it. How do you proceed?`,
      note: "There's no penalty for using AI here — we're interested in your judgment.",
      options: [
        { id: "a", text: "Test it against real cases and edge cases before trusting it.", score: 10 },
        { id: "b", text: "Read it line by line until you can explain every part.", score: 8 },
        { id: "c", text: "Ship it — it looks correct and saves time.", score: 2 },
        { id: "d", text: "Throw it away and rewrite from scratch to be safe.", score: 4 },
      ],
    },
    {
      id: "tradeoff",
      prompt: `You must trade off speed against quality on a ${X} deliverable due tomorrow. What's your move?`,
      options: [
        { id: "a", text: "Ship a correct, minimal version and clearly flag what's deferred.", score: 10 },
        { id: "b", text: "Polish it fully even if it means missing the deadline.", score: 4 },
        { id: "c", text: "Cut corners quietly and hope no one notices.", score: 1 },
        { id: "d", text: "Ask for more time before doing anything.", score: 5 },
      ],
    },
    {
      id: "disagreement",
      prompt: `A teammate's ${X} approach differs sharply from yours and you think theirs is riskier. How do you handle it?`,
      options: [
        { id: "a", text: "Surface your reasoning, agree on the criteria, and let the evidence decide.", score: 10 },
        { id: "b", text: "Propose a small test to compare both approaches.", score: 9 },
        { id: "c", text: "Defer to them to avoid friction.", score: 3 },
        { id: "d", text: "Insist on your approach — you're confident you're right.", score: 3 },
      ],
    },
  ];
}

export function itemsForSkill(skill: string): SkillCheckItem[] {
  return genericItems(skill);
}

/** Score chosen options → 0–100. */
export function scoreSkillCheck(
  items: SkillCheckItem[],
  answers: Record<string, string>,
): number {
  let earned = 0;
  let max = 0;
  for (const item of items) {
    max += Math.max(0, ...item.options.map((o) => o.score));
    const chosen = item.options.find((o) => o.id === answers[item.id]);
    if (chosen) earned += chosen.score;
  }
  return max > 0 ? Math.round((earned / max) * 100) : 0;
}

/** Passing an applied check verifies the skill. */
export const SKILL_CHECK_PASS = 70;
