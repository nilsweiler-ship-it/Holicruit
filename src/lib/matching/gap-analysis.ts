import type { SkillGapItem } from "./types";

export function generateGapSummary(gaps: SkillGapItem[]): {
  met: number;
  partial: number;
  missing: number;
  topPriorities: SkillGapItem[];
} {
  const met = gaps.filter((g) => g.status === "MET").length;
  const partial = gaps.filter((g) => g.status === "PARTIAL").length;
  const missing = gaps.filter((g) => g.status === "MISSING").length;

  // Prioritize missing skills first, then partial, sorted by gap size
  const topPriorities = gaps
    .filter((g) => g.status !== "MET")
    .sort((a, b) => {
      if (a.status === "MISSING" && b.status === "PARTIAL") return -1;
      if (a.status === "PARTIAL" && b.status === "MISSING") return 1;
      return b.requiredLevel - b.currentLevel - (a.requiredLevel - a.currentLevel);
    })
    .slice(0, 5);

  return { met, partial, missing, topPriorities };
}
