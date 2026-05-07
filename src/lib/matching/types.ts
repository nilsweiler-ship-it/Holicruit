export interface SkillGapItem {
  skill: string;
  category: "HARD" | "SOFT";
  currentLevel: number;
  requiredLevel: number;
  status: "MET" | "PARTIAL" | "MISSING";
  recommendations: string[];
}

export interface DimensionScores {
  hardSkills: number;
  softSkills: number;
  experience: number;
  education: number;
}

export interface MatchResult {
  overallScore: number;
  dimensions: DimensionScores;
  skillGaps: SkillGapItem[];
}

export interface ParsedCandidate {
  skills: Array<{ name: string; level: number; category?: string }>;
  experience: Array<{ title: string; company: string; years: number; description?: string }>;
  education: Array<{ degree: string; institution: string; year: number }>;
}

export interface ParsedRole {
  hardSkills: Array<{ name: string; level: number; required?: boolean }>;
  softSkills: Array<{ name: string; level: number }>;
  weights: { hardSkills: number; softSkills: number; experience: number; education: number };
}
