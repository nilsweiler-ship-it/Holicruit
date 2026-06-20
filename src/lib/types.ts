/**
 * Domain entities for Holicruit. The fit primitive lives in `./fit/types`;
 * these are the people, roles, matches, threads and programs the UI renders.
 */

import type { FitObject, SkillGap } from "./fit/types";

/** One account, three interchangeable "hats". */
export type RoleHat = "candidate" | "hiring_manager" | "recruiter";

export interface Person {
  id: string;
  name: string;
  headline: string;
  /** Optional real avatar; UI falls back to initials. */
  avatarUrl?: string;
  initials: string;
}

/** A hard/technical skill. `verified` is earned (peer endorsement, scenario,
 *  work samples) — never user-toggled. */
export interface HardSkill {
  name: string;
  verified: boolean;
}

/** A soft-skill score from the scenario assessment (0–100), not self-rated. */
export interface SoftSkillScore {
  name: string;
  level: number;
}

export interface CandidateProfile extends Person {
  /** Profile completeness ring, 0–100. */
  completeness: number;
  hardSkills: HardSkill[];
  softSkills: SoftSkillScore[];
  /** Whether the 8-min skill scenario has been taken. */
  scenarioCompleted: boolean;
}

export interface Company {
  id: string;
  name: string;
  location: string;
  logoUrl?: string;
}

export interface Opening {
  id: string;
  title: string;
  company: Company;
  location: string;
  salaryMin?: number;
  salaryMax?: number;
  currency?: string;
  /** The named hiring manager — the person the candidate would actually work
   *  with. Powers the "direct line, no recruiter relay" framing. */
  hiringManager: Person;
  requiredHard: string[];
  requiredSoft: string[];
}

/** Stage of a candidate within a role's pipeline. */
export type PipelineStage = "new" | "talking" | "offer" | "closed";

/**
 * A match links a candidate ↔ an opening ↔ a fit object. The same record is
 * projected candidate-side (a list of openings) or manager-side (a pipeline of
 * candidates). Both sides opt in before it becomes a conversation — no cold
 * applications.
 */
export interface Match {
  id: string;
  candidate: Person;
  opening: Opening;
  fit: FitObject;
  stage: PipelineStage;
  /** Both sides opted in → contactable. */
  contactable: boolean;
  /** Candidate bookmarked this match. */
  saved?: boolean;
  /** Active conversation indicator (drives the 💬 marker). */
  hasThread?: boolean;
}

export interface ChatMessage {
  id: string;
  fromId: string;
  text: string;
  /** Display timestamp string (fixtures avoid runtime clocks). */
  ts: string;
}

export interface ScheduledInterview {
  /** e.g. "Thu · 2:00pm". */
  when: string;
  /** e.g. "video". */
  medium: string;
  scoreSheetAttached: boolean;
}

export interface Thread {
  id: string;
  matchId: string;
  /** The viewer's side of the conversation. */
  me: Person;
  /** The other expert. */
  them: Person;
  messages: ChatMessage[];
  interview?: ScheduledInterview;
}

/**
 * Auto-drafted when a hiring manager passes a candidate. The manager
 * reviews/edits and sends in one click; on send the candidate's Growth Report
 * is generated. Rejection is never silent.
 */
export interface FeedbackDraft {
  id: string;
  matchId: string;
  candidateName: string;
  hardSummary: string;
  softSummary: string;
  gap: SkillGap;
  /** Editable draft body. */
  body: string;
  sent: boolean;
}

/** Recruiter desk: a candidate the recruiter is facilitating. */
export interface RecruiterIntro {
  id: string;
  candidateName: string;
  roleTitle: string;
  company: string;
  /** One line on the value the recruiter added. */
  valueNote: string;
  stage: "talking" | "interview" | "offer" | "hired";
}

/** Upskilling marketplace program (future revenue line). */
export interface Program {
  id: string;
  provider: string;
  title: string;
  /** e.g. "Online course · 4 weeks · cert". */
  format: string;
  tags: string[];
  /** The skill this program closes. */
  closesGap: string;
}
