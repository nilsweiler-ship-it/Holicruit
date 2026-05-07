import type { MatchResult, ParsedCandidate, ParsedRole, SkillGapItem } from "./types";

function normalizeSkillName(name: string): string {
  return name.toLowerCase().trim();
}

function scoreSkills(
  candidateSkills: Array<{ name: string; level: number }>,
  requiredSkills: Array<{ name: string; level: number; required?: boolean }>,
  category: "HARD" | "SOFT"
): { score: number; gaps: SkillGapItem[] } {
  if (requiredSkills.length === 0) return { score: 100, gaps: [] };

  const gaps: SkillGapItem[] = [];
  let totalScore = 0;

  for (const required of requiredSkills) {
    const normalizedRequired = normalizeSkillName(required.name);
    const match = candidateSkills.find(
      (s) => normalizeSkillName(s.name) === normalizedRequired
    );

    const currentLevel = match?.level || 0;
    const ratio = Math.min(currentLevel / required.level, 1.0);
    totalScore += ratio * 100;

    let status: "MET" | "PARTIAL" | "MISSING";
    if (currentLevel >= required.level) {
      status = "MET";
    } else if (currentLevel > 0) {
      status = "PARTIAL";
    } else {
      status = "MISSING";
    }

    const recommendations: string[] = [];
    if (status === "MISSING") {
      recommendations.push(
        `Learn ${required.name} — target proficiency level ${required.level}`
      );
      recommendations.push(
        `Consider online courses or certifications in ${required.name}`
      );
    } else if (status === "PARTIAL") {
      const gap = required.level - currentLevel;
      recommendations.push(
        `Improve ${required.name} by ${gap} level${gap > 1 ? "s" : ""} (current: ${currentLevel}, required: ${required.level})`
      );
      recommendations.push(
        `Seek hands-on experience with advanced ${required.name} concepts`
      );
    }

    gaps.push({
      skill: required.name,
      category,
      currentLevel,
      requiredLevel: required.level,
      status,
      recommendations,
    });
  }

  return {
    score: totalScore / requiredSkills.length,
    gaps,
  };
}

function scoreExperience(
  candidateExperience: ParsedCandidate["experience"]
): number {
  if (candidateExperience.length === 0) return 20; // minimal baseline

  const totalYears = candidateExperience.reduce((sum, e) => sum + e.years, 0);

  // Score based on total experience: 0-2yr=40, 3-5yr=60, 5-8yr=80, 8+=100
  if (totalYears >= 8) return 100;
  if (totalYears >= 5) return 80;
  if (totalYears >= 3) return 60;
  if (totalYears >= 1) return 40;
  return 20;
}

function scoreEducation(
  candidateEducation: ParsedCandidate["education"]
): number {
  if (candidateEducation.length === 0) return 30; // baseline

  const degrees = candidateEducation.map((e) => e.degree.toLowerCase());

  if (degrees.some((d) => d.includes("phd") || d.includes("doctorate")))
    return 100;
  if (degrees.some((d) => d.includes("master") || d.includes("mba")))
    return 85;
  if (degrees.some((d) => d.includes("bachelor") || d.includes("bsc") || d.includes("ba")))
    return 70;
  if (degrees.some((d) => d.includes("associate") || d.includes("diploma")))
    return 55;

  return 40;
}

export function computeMatchScore(
  candidate: ParsedCandidate,
  role: ParsedRole
): MatchResult {
  const hardSkillResult = scoreSkills(
    candidate.skills.filter((s) => s.category !== "soft"),
    role.hardSkills,
    "HARD"
  );

  const softSkillResult = scoreSkills(
    candidate.skills.filter((s) => s.category === "soft"),
    role.softSkills,
    "SOFT"
  );

  const experienceScore = scoreExperience(candidate.experience);
  const educationScore = scoreEducation(candidate.education);

  const dimensions = {
    hardSkills: Math.round(hardSkillResult.score),
    softSkills: Math.round(softSkillResult.score),
    experience: experienceScore,
    education: educationScore,
  };

  // Normalize weights to sum to 100
  const totalWeight =
    role.weights.hardSkills +
    role.weights.softSkills +
    role.weights.experience +
    role.weights.education;

  const normalizedWeights = {
    hardSkills: role.weights.hardSkills / totalWeight,
    softSkills: role.weights.softSkills / totalWeight,
    experience: role.weights.experience / totalWeight,
    education: role.weights.education / totalWeight,
  };

  const overallScore = Math.round(
    dimensions.hardSkills * normalizedWeights.hardSkills +
      dimensions.softSkills * normalizedWeights.softSkills +
      dimensions.experience * normalizedWeights.experience +
      dimensions.education * normalizedWeights.education
  );

  return {
    overallScore,
    dimensions,
    skillGaps: [...hardSkillResult.gaps, ...softSkillResult.gaps],
  };
}
