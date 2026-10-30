/**
 * Growth Report panel copy, derived from the actual numbers — pure, unit-tested.
 * A panel says "above bar" only when you >= bar, and names a gap only when the
 * candidate is below the bar AND there is a real gap skill of that type.
 */
import type { GrowthPanel, SkillGap, SkillType } from "../fit/types";

/** "1 open role", "3 open roles", "0 open roles". */
export function plural(n: number, one: string, many: string = `${one}s`): string {
  return `${n} ${n === 1 ? one : many}`;
}

/** A stored gap skill is "real" unless it's empty or a placeholder like "—". */
export function isRealGapSkill(skill: string | null | undefined): skill is string {
  return typeof skill === "string" && /[\p{L}\p{N}]/u.test(skill);
}

export function growthPanel(input: {
  type: SkillType;
  you: number;
  bar: number;
  /** The report's primary gap, if any. */
  primaryGap?: { skill: string; type: SkillType } | null;
}): GrowthPanel {
  const label = input.type === "hard" ? "Hard skills" : "Soft skills";
  const comparison = { label, you: input.you, roleBar: input.bar };
  if (input.you >= input.bar) {
    return { type: input.type, comparison, aboveBar: true, note: "Above bar — a strength" };
  }
  const gapSkill =
    input.primaryGap && input.primaryGap.type === input.type && isRealGapSkill(input.primaryGap.skill)
      ? input.primaryGap.skill
      : null;
  const diff = input.bar - input.you;
  if (gapSkill) {
    const gap: SkillGap = { skill: gapSkill, type: input.type, severity: diff >= 20 ? "major" : diff >= 10 ? "moderate" : "minor" };
    return { type: input.type, comparison, aboveBar: false, gap, note: `Gap: ${gapSkill}` };
  }
  return {
    type: input.type,
    comparison,
    aboveBar: false,
    note: `Below bar by ${plural(diff, "point")}`,
  };
}
