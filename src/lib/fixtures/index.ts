/**
 * Mock data the (mocked) matching + scenario services read from.
 *
 * This is fixture data standing in for two separate backend services this UI
 * only consumes — the matching engine and the scenario assessment. Nothing here
 * is a real algorithm; it's a believable, internally-consistent snapshot.
 */

import type { GrowthReport } from "../fit/types";
import type {
  CandidateProfile,
  Company,
  FeedbackDraft,
  GapDemand,
  Match,
  Opening,
  Person,
  Program,
  Provider,
  ProviderStats,
  RecruiterIntro,
  Thread,
} from "../types";

/* ── People ──────────────────────────────────────────────────────────── */

/** The signed-in candidate (the "me" for candidate-side screens). */
export const CURRENT_CANDIDATE: CandidateProfile = {
  id: "cand-sam",
  name: "Sam Rivera",
  headline: "Senior Frontend Engineer · 6 yrs",
  initials: "SR",
  completeness: 72,
  scenarioCompleted: true,
  hardSkills: [
    { name: "React", verified: true },
    { name: "TypeScript", verified: false },
    { name: "System design", verified: true },
    { name: "Node.js", verified: false },
    { name: "GraphQL", verified: false },
    { name: "Testing", verified: true },
  ],
  softSkills: [
    { name: "Communication", level: 88 },
    { name: "Collaboration", level: 82 },
    { name: "Ownership", level: 79 },
    { name: "Adaptability", level: 74 },
    { name: "Problem-solving", level: 90 },
  ],
};

const priya: Person = { id: "hm-priya", name: "Priya Nair", headline: "Eng Lead, Northwind", initials: "PN" };
const marcus: Person = { id: "hm-marcus", name: "Marcus Hale", headline: "VP Engineering, Lumen Labs", initials: "MH" };
const lena: Person = { id: "hm-lena", name: "Lena Ortiz", headline: "Head of Platform, Veda Health", initials: "LO" };
const dev: Person = { id: "hm-dev", name: "Dev Shah", headline: "CTO, Orbit Pay", initials: "DS" };
const cobaltHM: Person = { id: "hm-aria", name: "Aria Lund", headline: "Eng Manager, Cobalt", initials: "AL" };

/** Candidates in the hiring-manager's pipeline (manager-side screens). */
const poolCandidates: Person[] = [
  CURRENT_CANDIDATE,
  { id: "cand-mia", name: "Mia Chen", headline: "Frontend Engineer · 5 yrs", initials: "MC" },
  { id: "cand-omar", name: "Omar Haddad", headline: "Full-stack Engineer · 7 yrs", initials: "OH" },
  { id: "cand-tess", name: "Tess Bauer", headline: "UI Engineer · 4 yrs", initials: "TB" },
  { id: "cand-nik", name: "Nik Petrov", headline: "Senior Engineer · 8 yrs", initials: "NP" },
  { id: "cand-zoe", name: "Zoe Adebayo", headline: "Frontend Engineer · 6 yrs", initials: "ZA" },
  { id: "cand-ravi", name: "Ravi Menon", headline: "Engineer · 5 yrs", initials: "RM" },
  { id: "cand-iris", name: "Iris Wong", headline: "Product Engineer · 6 yrs", initials: "IW" },
  { id: "cand-leo", name: "Leo Marsh", headline: "Frontend Engineer · 4 yrs", initials: "LM" },
];

/* ── Companies & openings ────────────────────────────────────────────── */

const northwind: Company = { id: "co-northwind", name: "Northwind", location: "Berlin, DE" };
const lumen: Company = { id: "co-lumen", name: "Lumen Labs", location: "Remote (EU)" };
const veda: Company = { id: "co-veda", name: "Veda Health", location: "Munich, DE" };
const orbit: Company = { id: "co-orbit", name: "Orbit Pay", location: "Amsterdam, NL" };
const cobalt: Company = { id: "co-cobalt", name: "Cobalt", location: "London, UK" };

const openNorthwind: Opening = {
  id: "open-northwind-sfe",
  title: "Senior Frontend Engineer",
  company: northwind,
  location: "Berlin · Hybrid",
  salaryMin: 85000,
  salaryMax: 105000,
  currency: "€",
  hiringManager: priya,
  requiredHard: ["React", "TypeScript", "System design", "Testing"],
  requiredSoft: ["Communication", "Collaboration", "Ownership"],
};
const openLumen: Opening = {
  id: "open-lumen-lead",
  title: "Frontend Lead",
  company: lumen,
  location: "Remote (EU)",
  salaryMin: 95000,
  salaryMax: 120000,
  currency: "€",
  hiringManager: marcus,
  requiredHard: ["React", "TypeScript", "System design"],
  requiredSoft: ["Communication", "Ownership", "Team leadership"],
};
const openOrbit: Opening = {
  id: "open-orbit-fs",
  title: "Full-stack Engineer",
  company: orbit,
  location: "Amsterdam · Hybrid",
  salaryMin: 80000,
  salaryMax: 100000,
  currency: "€",
  hiringManager: dev,
  requiredHard: ["TypeScript at scale", "Node.js", "React", "GraphQL"],
  requiredSoft: ["Communication", "Collaboration"],
};
const openVeda: Opening = {
  id: "open-veda-platform",
  title: "Platform Engineer",
  company: veda,
  location: "Munich · On-site",
  salaryMin: 78000,
  salaryMax: 98000,
  currency: "€",
  hiringManager: lena,
  requiredHard: ["Kubernetes", "Node.js", "System design"],
  requiredSoft: ["Ownership", "Communication"],
};
const openCobalt: Opening = {
  id: "open-cobalt-pe",
  title: "Product Engineer",
  company: cobalt,
  location: "London · Hybrid",
  salaryMin: 70000,
  salaryMax: 90000,
  currency: "£",
  hiringManager: cobaltHM,
  requiredHard: ["React", "TypeScript", "Product sense"],
  requiredSoft: ["Communication", "Adaptability"],
};

/* ── Candidate-side matches (ranked by mutualFit desc) ───────────────── */

export const CANDIDATE_MATCHES: Match[] = [
  {
    id: "match-northwind",
    candidate: CURRENT_CANDIDATE,
    opening: openNorthwind,
    stage: "new",
    contactable: true,
    fit: { hardFit: 90, softFit: 94, mutualFit: 92, verified: true, gaps: [], candidateRank: 2, poolSize: 28 },
  },
  {
    id: "match-lumen",
    candidate: CURRENT_CANDIDATE,
    opening: openLumen,
    stage: "new",
    contactable: true,
    fit: {
      hardFit: 88,
      softFit: 84,
      mutualFit: 86,
      verified: true,
      candidateRank: 5,
      poolSize: 41,
      gaps: [{ skill: "Team leadership", type: "soft", severity: "moderate" }],
    },
  },
  {
    id: "match-orbit",
    candidate: CURRENT_CANDIDATE,
    opening: openOrbit,
    stage: "new",
    contactable: true,
    fit: {
      hardFit: 76,
      softFit: 88,
      mutualFit: 81,
      verified: true,
      candidateRank: 9,
      poolSize: 52,
      gaps: [{ skill: "TypeScript at scale", type: "hard", severity: "moderate" }],
    },
  },
  {
    id: "match-veda",
    candidate: CURRENT_CANDIDATE,
    opening: openVeda,
    stage: "new",
    contactable: true,
    fit: {
      hardFit: 68,
      softFit: 80,
      mutualFit: 73,
      verified: false,
      gaps: [{ skill: "Kubernetes", type: "hard", severity: "major" }],
    },
  },
  {
    id: "match-cobalt",
    candidate: CURRENT_CANDIDATE,
    opening: openCobalt,
    stage: "new",
    contactable: true,
    fit: {
      hardFit: 72,
      softFit: 86,
      mutualFit: 78,
      verified: true,
      candidateRank: 3,
      poolSize: 33,
      gaps: [],
    },
  },
];

/** A closed (rejected) match — the one the Growth Report is built for. */
export const CLOSED_MATCH: Match = {
  id: "match-orbit-closed",
  candidate: CURRENT_CANDIDATE,
  opening: openOrbit,
  stage: "closed",
  contactable: true,
  fit: {
    hardFit: 72,
    softFit: 88,
    mutualFit: 80,
    verified: true,
    gaps: [{ skill: "TypeScript at scale", type: "hard", severity: "moderate" }],
  },
};

/** Curated daily set for the mobile swipe view (~3, anti-firehose). */
export const DAILY_MATCH_IDS = ["match-northwind", "match-cobalt", "match-lumen"];

/* ── Growth report (auto-generated for the closed match) ─────────────── */

export const GROWTH_REPORTS: GrowthReport[] = [
  {
    id: "growth-orbit",
    matchId: "match-orbit-closed",
    roleTitle: openOrbit.title,
    company: orbit.name,
    hard: {
      type: "hard",
      comparison: { label: "Hard skills", you: 72, roleBar: 85 },
      gap: { skill: "TypeScript at scale", type: "hard", severity: "moderate" },
      note: "Gap: TypeScript at scale",
    },
    soft: {
      type: "soft",
      comparison: { label: "Soft skills", you: 88, roleBar: 80 },
      aboveBar: true,
      note: "Above bar — a strength",
    },
    primaryGap: { skill: "TypeScript at scale", type: "hard", severity: "moderate" },
    rolesClearedIfClosed: 7,
    matchingProgramCount: 2,
  },
];

/* ── Hiring-manager pipeline (for openNorthwind, viewed as Priya) ────── */

function fit(hardFit: number, softFit: number, mutualFit: number, verified: boolean): Match["fit"] {
  return { hardFit, softFit, mutualFit, verified, gaps: [] };
}

export const PIPELINE_OPENING_ID = openNorthwind.id;

export const PIPELINE_MATCHES: Match[] = [
  // New (5)
  { id: "pm-1", candidate: poolCandidates[1], opening: openNorthwind, stage: "new", contactable: true, fit: fit(91, 86, 89, true) },
  { id: "pm-2", candidate: poolCandidates[3], opening: openNorthwind, stage: "new", contactable: true, fit: fit(84, 88, 86, true) },
  { id: "pm-3", candidate: poolCandidates[5], opening: openNorthwind, stage: "new", contactable: true, fit: fit(82, 85, 83, false) },
  { id: "pm-4", candidate: poolCandidates[6], opening: openNorthwind, stage: "new", contactable: true, fit: fit(79, 83, 81, true) },
  { id: "pm-5", candidate: poolCandidates[8], opening: openNorthwind, stage: "new", contactable: true, fit: fit(77, 80, 78, false) },
  // Talking (3) — Sam is the highlighted active conversation
  { id: "pm-6", candidate: CURRENT_CANDIDATE, opening: openNorthwind, stage: "talking", contactable: true, hasThread: true, fit: fit(90, 94, 92, true) },
  { id: "pm-7", candidate: poolCandidates[2], opening: openNorthwind, stage: "talking", contactable: true, hasThread: true, fit: fit(88, 82, 85, true) },
  { id: "pm-8", candidate: poolCandidates[7], opening: openNorthwind, stage: "talking", contactable: true, hasThread: true, fit: fit(85, 84, 84, true) },
  // Offer (1)
  { id: "pm-9", candidate: poolCandidates[4], opening: openNorthwind, stage: "offer", contactable: true, fit: fit(93, 90, 92, true) },
];

/* ── Direct chat thread (Priya ↔ Sam) ───────────────────────────────── */

export const THREADS: Thread[] = [
  {
    id: "thread-priya-sam",
    matchId: "pm-6",
    me: priya,
    them: CURRENT_CANDIDATE,
    messages: [
      { id: "m1", fromId: priya.id, text: "Hi Sam — loved your system-design scenario. The way you scoped the rollout caught my eye.", ts: "Mon 09:14" },
      { id: "m2", fromId: CURRENT_CANDIDATE.id, text: "Thanks Priya! I'd love to hear how the team handles incremental migration today.", ts: "Mon 09:31" },
      { id: "m3", fromId: priya.id, text: "Let's get into it properly. I dropped a couple of slots below — grab whatever works.", ts: "Mon 09:40" },
      { id: "m4", fromId: CURRENT_CANDIDATE.id, text: "Thursday 2pm is perfect.", ts: "Mon 10:02" },
    ],
    interview: { when: "Thu · 2:00pm", medium: "video", scoreSheetAttached: false },
  },
];

/* ── Auto-drafted feedback (pending manager review) ──────────────────── */

export const FEEDBACK_DRAFTS: FeedbackDraft[] = [
  {
    id: "fb-mia",
    matchId: "pm-1",
    candidateName: "Mia Chen",
    hardSummary: "Hard skills 91 — above the role bar on React and testing.",
    softSummary: "Soft skills 86 — strong collaboration, communication just under bar.",
    gap: { skill: "System design at scale", type: "hard", severity: "minor" },
    body:
      "Hi Mia — thank you for the conversation. You were genuinely strong on React and testing (above our bar). " +
      "Where it was close: system design at scale — we leaned toward a candidate with more large-system rollout " +
      "experience. That's the one gap; close it and you'd clear the bar here next time. Full breakdown in your Growth Report.",
    sent: false,
  },
];

/* ── Recruiter desk ──────────────────────────────────────────────────── */

export const RECRUITER_INTROS: RecruiterIntro[] = [
  { id: "ri-1", candidateName: "Sam Rivera", roleTitle: "Senior Frontend Engineer", company: "Northwind", valueNote: "You spotted the soft-skill fit the filter missed.", stage: "interview" },
  { id: "ri-2", candidateName: "Omar Haddad", roleTitle: "Full-stack Engineer", company: "Orbit Pay", valueNote: "Coached the profile, closed the TS gap.", stage: "offer" },
  { id: "ri-3", candidateName: "Tess Bauer", roleTitle: "UI Engineer", company: "Lumen Labs", valueNote: "Reframed her portfolio around design systems.", stage: "interview" },
  { id: "ri-4", candidateName: "Nik Petrov", roleTitle: "Platform Engineer", company: "Veda Health", valueNote: "Surfaced him for a role he'd have scrolled past.", stage: "talking" },
  { id: "ri-5", candidateName: "Zoe Adebayo", roleTitle: "Product Engineer", company: "Cobalt", valueNote: "Prepped the scenario debrief.", stage: "interview" },
  { id: "ri-6", candidateName: "Iris Wong", roleTitle: "Frontend Engineer", company: "Northwind", valueNote: "Nudged timing — applied the week the req opened.", stage: "talking" },
  { id: "ri-7", candidateName: "Ravi Menon", roleTitle: "Engineer", company: "Orbit Pay", valueNote: "Closed last year — referred two more since.", stage: "hired" },
];

/* ── Fourth-party training providers + upskilling marketplace ─────────── */

const providerFM: Provider = {
  id: "prov-fm",
  name: "Frontend Masters",
  headline: "Course platform · partner",
  initials: "FM",
  kind: "Course platform",
};
const providerTUD: Provider = {
  id: "prov-tud",
  name: "TU Delft (online)",
  headline: "University · accredited micro-credentials",
  initials: "TU",
  kind: "University",
};
const providerLaunch: Provider = {
  id: "prov-launch",
  name: "Launchpad",
  headline: "Bootcamp · cohort-based",
  initials: "LP",
  kind: "Bootcamp",
};

export const PROVIDERS: Provider[] = [providerFM, providerTUD, providerLaunch];

/** The signed-in provider (the "me" for provider-side screens). */
export const CURRENT_PROVIDER = providerFM;

export const PROGRAMS: Program[] = [
  {
    id: "prog-ts-scale",
    providerId: providerFM.id,
    provider: providerFM.name,
    providerKind: providerFM.kind,
    title: "TypeScript at Scale",
    format: "Online course · 4 weeks · cert",
    credential: "Certificate",
    tags: ["partner", "hands-on"],
    closesGap: "TypeScript at scale",
    gapType: "hard",
    sponsored: true,
    enrollments: 1240,
    completions: 870,
    reMatches: 610,
  },
  {
    id: "prog-ts-uni",
    providerId: providerTUD.id,
    provider: providerTUD.name,
    providerKind: providerTUD.kind,
    title: "Type-Safe Systems Engineering",
    format: "Micro-credential · Part-time · 1 semester",
    credential: "Accredited micro-credential",
    tags: ["accredited", "deeper"],
    closesGap: "TypeScript at scale",
    gapType: "hard",
    sponsored: false,
    enrollments: 320,
    completions: 210,
    reMatches: 150,
  },
  {
    id: "prog-sysdesign",
    providerId: providerFM.id,
    provider: providerFM.name,
    providerKind: providerFM.kind,
    title: "Designing Large-Scale Systems",
    format: "Online course · 6 weeks · cert",
    credential: "Certificate",
    tags: ["partner"],
    closesGap: "System design at scale",
    gapType: "hard",
    sponsored: true,
    enrollments: 980,
    completions: 640,
    reMatches: 430,
  },
  {
    id: "prog-lead",
    providerId: providerLaunch.id,
    provider: providerLaunch.name,
    providerKind: providerLaunch.kind,
    title: "From Senior to Lead",
    format: "Cohort bootcamp · 6 weeks · live",
    tags: ["cohort", "coaching"],
    closesGap: "Team leadership",
    gapType: "soft",
    sponsored: false,
    enrollments: 410,
    completions: 290,
    reMatches: 180,
  },
  {
    id: "prog-k8s",
    providerId: providerFM.id,
    provider: providerFM.name,
    providerKind: providerFM.kind,
    title: "Kubernetes in Production",
    format: "Online course · 5 weeks · cert",
    credential: "Certificate",
    tags: ["partner", "hands-on"],
    closesGap: "Kubernetes",
    gapType: "hard",
    sponsored: false,
    enrollments: 760,
    completions: 480,
    reMatches: 300,
  },
];

/** Aggregate demand for skill gaps — what providers target ("stretch" gaps). */
export const GAP_DEMAND: GapDemand[] = [
  { skill: "TypeScript at scale", type: "hard", candidatesWithGap: 147, rolesBlocked: 7, programsOffered: 2 },
  { skill: "System design at scale", type: "hard", candidatesWithGap: 112, rolesBlocked: 9, programsOffered: 1 },
  { skill: "Team leadership", type: "soft", candidatesWithGap: 89, rolesBlocked: 4, programsOffered: 1 },
  { skill: "Kubernetes", type: "hard", candidatesWithGap: 64, rolesBlocked: 5, programsOffered: 1 },
  { skill: "Product sense", type: "soft", candidatesWithGap: 53, rolesBlocked: 6, programsOffered: 0 },
];

/** Provider desk headline stats (for CURRENT_PROVIDER). */
export const PROVIDER_STATS: ProviderStats = {
  activePrograms: 3,
  learnersEnrolled: 2980,
  gapsClosed: 1990,
  reMatchesGenerated: 1340,
  revenue: 96400,
  currency: "€",
};
