import { describe, it, expect } from "vitest";
import { generateGapSummary } from "@/lib/matching/gap-analysis";
import type { SkillGapItem } from "@/lib/matching/types";

describe("generateGapSummary", () => {
  it("returns correct counts for mixed gap statuses", () => {
    const gaps: SkillGapItem[] = [
      { skill: "TypeScript", category: "HARD", currentLevel: 5, requiredLevel: 5, status: "MET", recommendations: [] },
      { skill: "React", category: "HARD", currentLevel: 3, requiredLevel: 5, status: "PARTIAL", recommendations: ["Improve"] },
      { skill: "Rust", category: "HARD", currentLevel: 0, requiredLevel: 4, status: "MISSING", recommendations: ["Learn"] },
      { skill: "Leadership", category: "SOFT", currentLevel: 2, requiredLevel: 4, status: "PARTIAL", recommendations: ["Practice"] },
    ];

    const summary = generateGapSummary(gaps);
    expect(summary.met).toBe(1);
    expect(summary.partial).toBe(2);
    expect(summary.missing).toBe(1);
    expect(summary.topPriorities.length).toBeLessThanOrEqual(5);
  });

  it("returns empty summary for no gaps", () => {
    const summary = generateGapSummary([]);
    expect(summary.met).toBe(0);
    expect(summary.partial).toBe(0);
    expect(summary.missing).toBe(0);
    expect(summary.topPriorities).toHaveLength(0);
  });

  it("prioritizes MISSING gaps over PARTIAL", () => {
    const gaps: SkillGapItem[] = [
      { skill: "A", category: "HARD", currentLevel: 2, requiredLevel: 4, status: "PARTIAL", recommendations: [] },
      { skill: "B", category: "HARD", currentLevel: 0, requiredLevel: 5, status: "MISSING", recommendations: [] },
      { skill: "C", category: "HARD", currentLevel: 1, requiredLevel: 3, status: "PARTIAL", recommendations: [] },
    ];

    const summary = generateGapSummary(gaps);
    expect(summary.topPriorities[0].skill).toBe("B");
  });

  it("limits priority gaps to 5", () => {
    const gaps: SkillGapItem[] = Array.from({ length: 10 }, (_, i) => ({
      skill: `Skill${i}`,
      category: "HARD" as const,
      currentLevel: 0,
      requiredLevel: 5,
      status: "MISSING" as const,
      recommendations: [],
    }));

    const summary = generateGapSummary(gaps);
    expect(summary.topPriorities).toHaveLength(5);
  });
});
