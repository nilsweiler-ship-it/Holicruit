import { describe, it, expect } from "vitest";
import { computeMatchScore } from "@/lib/matching/engine";
import type { ParsedCandidate, ParsedRole } from "@/lib/matching/types";

const DEFAULT_WEIGHTS = {
  hardSkills: 40,
  softSkills: 25,
  experience: 25,
  education: 10,
};

function makeCandidate(
  overrides: Partial<ParsedCandidate> = {}
): ParsedCandidate {
  return {
    skills: [],
    experience: [],
    education: [],
    ...overrides,
  };
}

function makeRole(overrides: Partial<ParsedRole> = {}): ParsedRole {
  return {
    hardSkills: [],
    softSkills: [],
    weights: DEFAULT_WEIGHTS,
    ...overrides,
  };
}

describe("computeMatchScore", () => {
  it("returns 100 when no skills are required and candidate has max experience/education", () => {
    const candidate = makeCandidate({
      experience: [{ title: "Engineer", company: "Co", years: 10 }],
      education: [{ degree: "PhD in CS", institution: "MIT", year: 2020 }],
    });
    const role = makeRole();

    const result = computeMatchScore(candidate, role);
    expect(result.overallScore).toBe(100);
    expect(result.skillGaps).toHaveLength(0);
  });

  it("computes correct score for perfect hard skill match", () => {
    const candidate = makeCandidate({
      skills: [
        { name: "TypeScript", level: 4, category: "hard" },
        { name: "React", level: 5, category: "hard" },
      ],
      experience: [{ title: "Dev", company: "Co", years: 10 }],
      education: [{ degree: "PhD", institution: "MIT", year: 2020 }],
    });
    const role = makeRole({
      hardSkills: [
        { name: "TypeScript", level: 4 },
        { name: "React", level: 5 },
      ],
    });

    const result = computeMatchScore(candidate, role);
    expect(result.dimensions.hardSkills).toBe(100);
    expect(result.overallScore).toBe(100);
  });

  it("produces PARTIAL gaps when candidate has lower skill level", () => {
    const candidate = makeCandidate({
      skills: [{ name: "Python", level: 2, category: "hard" }],
    });
    const role = makeRole({
      hardSkills: [{ name: "Python", level: 5 }],
    });

    const result = computeMatchScore(candidate, role);
    expect(result.dimensions.hardSkills).toBe(40); // 2/5 = 0.4 -> 40
    const gap = result.skillGaps.find((g) => g.skill === "Python");
    expect(gap).toBeDefined();
    expect(gap!.status).toBe("PARTIAL");
    expect(gap!.currentLevel).toBe(2);
    expect(gap!.requiredLevel).toBe(5);
  });

  it("produces MISSING gaps when candidate lacks a skill entirely", () => {
    const candidate = makeCandidate({
      skills: [],
    });
    const role = makeRole({
      hardSkills: [{ name: "Rust", level: 3 }],
    });

    const result = computeMatchScore(candidate, role);
    expect(result.dimensions.hardSkills).toBe(0);
    const gap = result.skillGaps.find((g) => g.skill === "Rust");
    expect(gap).toBeDefined();
    expect(gap!.status).toBe("MISSING");
    expect(gap!.recommendations.length).toBeGreaterThan(0);
  });

  it("normalizes skill names case-insensitively", () => {
    const candidate = makeCandidate({
      skills: [{ name: "  typescript  ", level: 5, category: "hard" }],
    });
    const role = makeRole({
      hardSkills: [{ name: "TypeScript", level: 5 }],
    });

    const result = computeMatchScore(candidate, role);
    expect(result.dimensions.hardSkills).toBe(100);
  });

  it("scores experience correctly across tiers", () => {
    const tests = [
      { years: 0, expected: 20 },
      { years: 1, expected: 40 },
      { years: 3, expected: 60 },
      { years: 5, expected: 80 },
      { years: 8, expected: 100 },
      { years: 15, expected: 100 },
    ];

    for (const { years, expected } of tests) {
      const candidate = makeCandidate({
        experience: years > 0 ? [{ title: "Dev", company: "Co", years }] : [],
      });
      const role = makeRole();

      const result = computeMatchScore(candidate, role);
      expect(result.dimensions.experience).toBe(expected);
    }
  });

  it("scores education by degree level", () => {
    const tests = [
      { degree: "PhD in CS", expected: 100 },
      { degree: "Master of Science", expected: 85 },
      { degree: "Bachelor of Science", expected: 70 },
      { degree: "Associate Degree", expected: 55 },
      { degree: "Certificate", expected: 40 },
    ];

    for (const { degree, expected } of tests) {
      const candidate = makeCandidate({
        education: [{ degree, institution: "Uni", year: 2020 }],
      });
      const role = makeRole();

      const result = computeMatchScore(candidate, role);
      expect(result.dimensions.education).toBe(expected);
    }
  });

  it("applies weights correctly", () => {
    const candidate = makeCandidate({
      skills: [{ name: "JS", level: 5, category: "hard" }],
      experience: [{ title: "Dev", company: "Co", years: 10 }],
      education: [{ degree: "PhD", institution: "MIT", year: 2020 }],
    });
    const role = makeRole({
      hardSkills: [{ name: "JS", level: 5 }],
      weights: { hardSkills: 100, softSkills: 0, experience: 0, education: 0 },
    });

    const result = computeMatchScore(candidate, role);
    // 100% hard skills * 100% weight = 100
    expect(result.overallScore).toBe(100);
  });

  it("handles soft skills separately from hard skills", () => {
    const candidate = makeCandidate({
      skills: [
        { name: "Leadership", level: 4, category: "soft" },
        { name: "TypeScript", level: 5, category: "hard" },
      ],
    });
    const role = makeRole({
      hardSkills: [{ name: "TypeScript", level: 5 }],
      softSkills: [{ name: "Leadership", level: 4 }],
    });

    const result = computeMatchScore(candidate, role);
    expect(result.dimensions.hardSkills).toBe(100);
    expect(result.dimensions.softSkills).toBe(100);
  });

  it("caps skill score at 100 when candidate exceeds required level", () => {
    const candidate = makeCandidate({
      skills: [{ name: "Python", level: 5, category: "hard" }],
    });
    const role = makeRole({
      hardSkills: [{ name: "Python", level: 2 }],
    });

    const result = computeMatchScore(candidate, role);
    expect(result.dimensions.hardSkills).toBe(100);
    const gap = result.skillGaps.find((g) => g.skill === "Python");
    expect(gap!.status).toBe("MET");
  });
});
