export type UserRole = "CANDIDATE" | "HEADHUNTER" | "HIRING_MANAGER" | "ADMIN";

export type ApplicationStage =
  | "APPLIED"
  | "SCREENING"
  | "SHORTLISTED"
  | "INTERVIEW"
  | "OFFER"
  | "HIRED"
  | "REJECTED";

export type RoleStatus = "DRAFT" | "PUBLISHED" | "CLOSED";

export type RoleType = "PERMANENT" | "CONTRACT_SHORT" | "CONTRACT_MEDIUM" | "CONTRACT_LONG" | "PROJECT";

export type MilestoneType = "SHORTLIST" | "HIRE";

export interface Skill {
  name: string;
  level: number; // 1-5
  category?: string;
  weight?: number;
  required?: boolean;
}

export interface ExperienceEntry {
  title: string;
  company: string;
  years: number;
  description?: string;
}

export interface EducationEntry {
  degree: string;
  institution: string;
  year: number;
}

export interface CandidatePreferences {
  locations?: string[];
  remote?: boolean;
  salary?: { min?: number; max?: number };
}

export interface RoleWeights {
  hardSkills: number;
  softSkills: number;
  experience: number;
  education: number;
}

export interface AuditEntry {
  timestamp: string;
  action: string;
  actor: string;
  details?: string;
}

export const APPLICATION_STAGES: ApplicationStage[] = [
  "APPLIED",
  "SCREENING",
  "SHORTLISTED",
  "INTERVIEW",
  "OFFER",
  "HIRED",
  "REJECTED",
];

export const ROLE_TYPES: { value: RoleType; label: string }[] = [
  { value: "PERMANENT", label: "Permanent" },
  { value: "CONTRACT_SHORT", label: "Contract (<3 months)" },
  { value: "CONTRACT_MEDIUM", label: "Contract (3-6 months)" },
  { value: "CONTRACT_LONG", label: "Contract (6+ months)" },
  { value: "PROJECT", label: "Project-bound" },
];

// Plan types
export type HMPlanTier = "STARTER" | "PROFESSIONAL" | "ENTERPRISE";
export type HHPlanTier = "FREE" | "PRO";

export interface PlanFeatures {
  activeRoles: number; // -1 = unlimited
  appsPerRole: number; // -1 = unlimited
  matchScoring: "score_only" | "full_breakdown" | "full_custom";
  gapAnalysis: boolean;
  teamMembers: number; // -1 = unlimited
}

export interface HHPlanFeatures {
  roleClaims: number; // -1 = unlimited
  monthlySubmissions: number; // -1 = unlimited
  candidateProfiles: "browse" | "full_access";
}

export interface QuotaCheckResult {
  allowed: boolean;
  current: number;
  limit: number; // -1 = unlimited
  message?: string;
}
