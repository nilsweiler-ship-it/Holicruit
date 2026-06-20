/**
 * Domain entities for Holicruit. The fit primitive lives in `./fit/types`;
 * these are the people, roles, matches, threads and programs the UI renders.
 */

import type { FitObject, GrowthReport, SkillGap, SkillType } from "./fit/types";

/** One account, interchangeable "hats". The training **provider** is a
 *  fourth-party entity that offers/promotes trainings to close candidate gaps. */
export type RoleHat = "candidate" | "hiring_manager" | "recruiter" | "provider";

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
  /** Industry / domain the candidate works in — the platform is domain-agnostic
   *  (Software, Healthcare, Sales, Finance, Education, …). */
  industry: string;
  /** Profile completeness ring, 0–100. */
  completeness: number;
  hardSkills: HardSkill[];
  softSkills: SoftSkillScore[];
  /** Whether the 8-min skill scenario has been taken. */
  scenarioCompleted: boolean;
}

/** A peer endorsement — the evidence that earns a hard skill its "verified"
 *  badge. Verification is earned this way, never user-toggled. */
export interface Endorsement {
  id: string;
  /** The hard skill this endorsement verifies. */
  skill: string;
  endorserName: string;
  endorserInitials: string;
  endorserHeadline: string;
  /** How they know the candidate, e.g. "Former manager". */
  relationship: string;
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
  /** Industry / domain of the role. */
  industry: string;
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

/** Everything that hangs off one candidate persona — used to demo the same UI
 *  across industries by switching the active persona. */
export interface CandidateWorld {
  profile: CandidateProfile;
  /** Active matches, ranked by mutualFit. */
  matches: Match[];
  /** Closed/decided matches (each has a growth report). */
  closed: Match[];
  growthReports: GrowthReport[];
  /** Ids (into `matches`) for the curated mobile daily set. */
  dailyIds: string[];
  endorsements: Endorsement[];
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

/**
 * A fourth-party training/education provider — course platforms, universities,
 * bootcamps. They offer and promote programs that close specific candidate gaps.
 */
export interface Provider extends Person {
  kind: "Course platform" | "University" | "Bootcamp";
  /** Programs sponsored ("promoted") get featured placement in the marketplace. */
}

/** Upskilling marketplace program — offered by a Provider to close a gap. */
export interface Program {
  id: string;
  providerId: string;
  /** Provider display name. */
  provider: string;
  providerKind: Provider["kind"];
  title: string;
  /** e.g. "Online course · 4 weeks · cert". */
  format: string;
  credential?: string;
  tags: string[];
  /** The skill this program closes, and whether it's a hard or soft gap. */
  closesGap: string;
  gapType: SkillType;
  /** Promoted/featured by the provider (a paid placement) → ranks first. */
  sponsored: boolean;
  enrollments: number;
  completions: number;
  /** Re-matches generated after learners completed it — the flywheel outcome. */
  reMatches: number;
}

/**
 * An aggregate, anonymized demand signal for a skill gap. This is what
 * providers target: which "stretch" gaps are most common across matched
 * candidates, and how many open roles they block.
 */
export interface GapDemand {
  skill: string;
  type: SkillType;
  /** Industry the demand sits in — shows the platform spans domains. */
  industry: string;
  /** Matched candidates currently carrying this gap. */
  candidatesWithGap: number;
  /** Open roles this gap is blocking. */
  rolesBlocked: number;
  /** Existing programs already covering it (the provider's competition). */
  programsOffered: number;
}

/** Provider desk headline stats. */
export interface ProviderStats {
  activePrograms: number;
  learnersEnrolled: number;
  /** Completions that closed a gap. */
  gapsClosed: number;
  /** Re-matches generated by completions — the platform's transparency loop. */
  reMatchesGenerated: number;
  revenue: number;
  currency: string;
}
