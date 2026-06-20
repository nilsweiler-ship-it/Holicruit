/**
 * Mock data the (mocked) matching + scenario + marketplace services read from.
 *
 * Standing in for separate backend services this UI only consumes. The platform
 * is domain-agnostic, so the data deliberately spans industries: the candidate
 * side ships three demo personas you can switch between — Software, Healthcare,
 * and Sales — and the hiring/recruiter/provider data is cross-industry too.
 */

import type { FitObject, GrowthReport } from "../fit/types";
import type {
  CandidateProfile,
  CandidateWorld,
  Endorsement,
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

/* ── helpers ─────────────────────────────────────────────────────────── */

function fitOf(
  hardFit: number,
  softFit: number,
  mutualFit: number,
  verified: boolean,
  opts: { gaps?: FitObject["gaps"]; rank?: number; pool?: number } = {},
): FitObject {
  return {
    hardFit,
    softFit,
    mutualFit,
    verified,
    gaps: opts.gaps ?? [],
    candidateRank: opts.rank,
    poolSize: opts.pool,
  };
}

const activeMatch = (id: string, candidate: Person, opening: Opening, fit: FitObject): Match => ({
  id,
  candidate,
  opening,
  fit,
  stage: "new",
  contactable: true,
});

const closedMatch = (id: string, candidate: Person, opening: Opening, fit: FitObject): Match => ({
  id,
  candidate,
  opening,
  fit,
  stage: "closed",
  contactable: true,
});

/* ═══════════════════════════════════════════════════════════════════════
   PERSONA 1 — Sam Rivera · Software
   ═══════════════════════════════════════════════════════════════════════ */

const samHMs = {
  priya: { id: "hm-priya", name: "Priya Nair", headline: "Eng Lead, Northwind", initials: "PN" } as Person,
  marcus: { id: "hm-marcus", name: "Marcus Hale", headline: "VP Engineering, Lumen Labs", initials: "MH" } as Person,
  lena: { id: "hm-lena", name: "Lena Ortiz", headline: "Head of Platform, Veda Health", initials: "LO" } as Person,
  dev: { id: "hm-dev", name: "Dev Shah", headline: "CTO, Orbit Pay", initials: "DS" } as Person,
  aria: { id: "hm-aria", name: "Aria Lund", headline: "Eng Manager, Cobalt", initials: "AL" } as Person,
};

export const CURRENT_CANDIDATE: CandidateProfile = {
  id: "cand-sam",
  name: "Sam Rivera",
  headline: "Senior Frontend Engineer · 6 yrs",
  initials: "SR",
  industry: "Software",
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

const openNorthwind: Opening = {
  id: "open-northwind-sfe",
  title: "Senior Frontend Engineer",
  industry: "Software",
  company: { id: "co-northwind", name: "Northwind", location: "Berlin, DE" },
  location: "Berlin · Hybrid",
  salaryMin: 85000,
  salaryMax: 105000,
  currency: "€",
  hiringManager: samHMs.priya,
  requiredHard: ["React", "TypeScript", "System design", "Testing"],
  requiredSoft: ["Communication", "Collaboration", "Ownership"],
};
const openLumen: Opening = {
  id: "open-lumen-lead",
  title: "Frontend Lead",
  industry: "Software",
  company: { id: "co-lumen", name: "Lumen Labs", location: "Remote (EU)" },
  location: "Remote (EU)",
  salaryMin: 95000,
  salaryMax: 120000,
  currency: "€",
  hiringManager: samHMs.marcus,
  requiredHard: ["React", "TypeScript", "System design"],
  requiredSoft: ["Communication", "Ownership", "Team leadership"],
};
const openOrbit: Opening = {
  id: "open-orbit-fs",
  title: "Full-stack Engineer",
  industry: "Software",
  company: { id: "co-orbit", name: "Orbit Pay", location: "Amsterdam, NL" },
  location: "Amsterdam · Hybrid",
  salaryMin: 80000,
  salaryMax: 100000,
  currency: "€",
  hiringManager: samHMs.dev,
  requiredHard: ["TypeScript at scale", "Node.js", "React", "GraphQL"],
  requiredSoft: ["Communication", "Collaboration"],
};
const openVeda: Opening = {
  id: "open-veda-platform",
  title: "Platform Engineer",
  industry: "Software",
  company: { id: "co-veda", name: "Veda Health", location: "Munich, DE" },
  location: "Munich · On-site",
  salaryMin: 78000,
  salaryMax: 98000,
  currency: "€",
  hiringManager: samHMs.lena,
  requiredHard: ["Kubernetes", "Node.js", "System design"],
  requiredSoft: ["Ownership", "Communication"],
};
const openCobalt: Opening = {
  id: "open-cobalt-pe",
  title: "Product Engineer",
  industry: "Software",
  company: { id: "co-cobalt", name: "Cobalt", location: "London, UK" },
  location: "London · Hybrid",
  salaryMin: 70000,
  salaryMax: 90000,
  currency: "£",
  hiringManager: samHMs.aria,
  requiredHard: ["React", "TypeScript", "Product sense"],
  requiredSoft: ["Communication", "Adaptability"],
};

const samMatches: Match[] = [
  activeMatch("match-northwind", CURRENT_CANDIDATE, openNorthwind, fitOf(90, 94, 92, true, { rank: 2, pool: 28 })),
  activeMatch("match-lumen", CURRENT_CANDIDATE, openLumen, fitOf(88, 84, 86, true, { rank: 5, pool: 41, gaps: [{ skill: "Team leadership", type: "soft", severity: "moderate" }] })),
  activeMatch("match-orbit", CURRENT_CANDIDATE, openOrbit, fitOf(76, 88, 81, true, { rank: 9, pool: 52, gaps: [{ skill: "TypeScript at scale", type: "hard", severity: "moderate" }] })),
  activeMatch("match-veda", CURRENT_CANDIDATE, openVeda, fitOf(68, 80, 73, false, { gaps: [{ skill: "Kubernetes", type: "hard", severity: "major" }] })),
  activeMatch("match-cobalt", CURRENT_CANDIDATE, openCobalt, fitOf(72, 86, 78, true, { rank: 3, pool: 33 })),
];

const samClosed = closedMatch(
  "match-orbit-closed",
  CURRENT_CANDIDATE,
  openOrbit,
  fitOf(72, 88, 80, true, { gaps: [{ skill: "TypeScript at scale", type: "hard", severity: "moderate" }] }),
);

const samGrowth: GrowthReport = {
  id: "growth-orbit",
  matchId: "match-orbit-closed",
  roleTitle: openOrbit.title,
  company: openOrbit.company.name,
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
};

const samEndorsements: Endorsement[] = [
  { id: "en-sam-1", skill: "React", endorserName: "Priya Nair", endorserInitials: "PN", endorserHeadline: "Eng Lead, Northwind", relationship: "Worked together" },
  { id: "en-sam-2", skill: "System design", endorserName: "Marcus Hale", endorserInitials: "MH", endorserHeadline: "VP Engineering, Lumen Labs", relationship: "Former manager" },
  { id: "en-sam-3", skill: "Testing", endorserName: "Mia Chen", endorserInitials: "MC", endorserHeadline: "Frontend Engineer", relationship: "Teammate" },
];

/* ═══════════════════════════════════════════════════════════════════════
   PERSONA 2 — Aisha Bello · Healthcare (ICU Nurse)
   ═══════════════════════════════════════════════════════════════════════ */

const aisha: CandidateProfile = {
  id: "cand-aisha",
  name: "Aisha Bello",
  headline: "ICU Nurse · 7 yrs",
  initials: "AB",
  industry: "Healthcare",
  completeness: 80,
  scenarioCompleted: true,
  hardSkills: [
    { name: "Triage", verified: true },
    { name: "Medication administration", verified: false },
    { name: "Epic EHR", verified: true },
    { name: "ACLS certification", verified: true },
    { name: "Ventilator management", verified: false },
    { name: "Patient education", verified: false },
  ],
  softSkills: [
    { name: "Communication", level: 91 },
    { name: "Collaboration", level: 89 },
    { name: "Ownership", level: 87 },
    { name: "Adaptability", level: 90 },
    { name: "Problem-solving", level: 85 },
  ],
};

const hmElena: Person = { id: "hm-elena", name: "Elena Ruiz", headline: "Nurse Manager, St. Mary's", initials: "ER" };
const hmJohn: Person = { id: "hm-john", name: "John Park", headline: "Director of Nursing, HealthFirst", initials: "JP" };
const hmMaria: Person = { id: "hm-maria", name: "Maria Costa", headline: "Chief Flight Nurse, MedEvac Air", initials: "MC" };
const hmRiver: Person = { id: "hm-river", name: "Sara Lindqvist", headline: "PICU Manager, Riverside Children's", initials: "SL" };

const openCharge: Opening = {
  id: "open-stmarys-charge",
  title: "ICU Charge Nurse",
  industry: "Healthcare",
  company: { id: "co-stmarys", name: "St. Mary's Medical Center", location: "Boston, US" },
  location: "Boston · On-site",
  salaryMin: 95000,
  salaryMax: 120000,
  currency: "$",
  hiringManager: hmElena,
  requiredHard: ["Triage", "ACLS certification", "Epic EHR", "Charge-nurse leadership"],
  requiredSoft: ["Communication", "Collaboration", "Ownership"],
};
const openEducator: Opening = {
  id: "open-healthfirst-educator",
  title: "Nurse Educator",
  industry: "Healthcare",
  company: { id: "co-healthfirst", name: "HealthFirst Network", location: "Chicago, US" },
  location: "Hybrid · Chicago",
  salaryMin: 88000,
  salaryMax: 108000,
  currency: "$",
  hiringManager: hmJohn,
  requiredHard: ["Patient education", "Curriculum design", "Epic EHR"],
  requiredSoft: ["Communication", "Collaboration"],
};
const openFlight: Opening = {
  id: "open-medevac-flight",
  title: "Flight Nurse",
  industry: "Healthcare",
  company: { id: "co-medevac", name: "MedEvac Air", location: "Denver, US" },
  location: "Denver · On-site",
  salaryMin: 98000,
  salaryMax: 125000,
  currency: "$",
  hiringManager: hmMaria,
  requiredHard: ["Critical care transport", "ACLS certification", "Triage"],
  requiredSoft: ["Adaptability", "Ownership"],
};
const openPICU: Opening = {
  id: "open-riverside-picu",
  title: "Pediatric ICU Nurse",
  industry: "Healthcare",
  company: { id: "co-riverside", name: "Riverside Children's", location: "Seattle, US" },
  location: "Seattle · On-site",
  salaryMin: 92000,
  salaryMax: 116000,
  currency: "$",
  hiringManager: hmRiver,
  requiredHard: ["Pediatric critical care", "Ventilator management", "Triage"],
  requiredSoft: ["Communication", "Adaptability"],
};

const aishaMatches: Match[] = [
  activeMatch("match-charge", aisha, openCharge, fitOf(88, 93, 90, true, { rank: 2, pool: 19 })),
  activeMatch("match-educator", aisha, openEducator, fitOf(80, 92, 85, true, { rank: 4, pool: 26, gaps: [{ skill: "Curriculum design", type: "soft", severity: "moderate" }] })),
  activeMatch("match-flight", aisha, openFlight, fitOf(82, 86, 84, true, { rank: 6, pool: 31, gaps: [{ skill: "Critical care transport", type: "hard", severity: "moderate" }] })),
];

const aishaClosed = closedMatch(
  "match-picu-closed",
  aisha,
  openPICU,
  fitOf(74, 90, 81, true, { gaps: [{ skill: "Pediatric critical care", type: "hard", severity: "moderate" }] }),
);

const aishaGrowth: GrowthReport = {
  id: "growth-picu",
  matchId: "match-picu-closed",
  roleTitle: openPICU.title,
  company: openPICU.company.name,
  hard: {
    type: "hard",
    comparison: { label: "Clinical skills", you: 74, roleBar: 86 },
    gap: { skill: "Pediatric critical care", type: "hard", severity: "moderate" },
    note: "Gap: Pediatric critical care",
  },
  soft: {
    type: "soft",
    comparison: { label: "Soft skills", you: 90, roleBar: 82 },
    aboveBar: true,
    note: "Above bar — a strength",
  },
  primaryGap: { skill: "Pediatric critical care", type: "hard", severity: "moderate" },
  rolesClearedIfClosed: 5,
  matchingProgramCount: 2,
};

const aishaEndorsements: Endorsement[] = [
  { id: "en-ai-1", skill: "Triage", endorserName: "Elena Ruiz", endorserInitials: "ER", endorserHeadline: "Nurse Manager, St. Mary's", relationship: "Former charge nurse" },
  { id: "en-ai-2", skill: "ACLS certification", endorserName: "David Osei", endorserInitials: "DO", endorserHeadline: "ICU Physician", relationship: "Worked together" },
  { id: "en-ai-3", skill: "Epic EHR", endorserName: "Lena Fox", endorserInitials: "LF", endorserHeadline: "Clinical Informatics", relationship: "Trained alongside" },
];

/* ═══════════════════════════════════════════════════════════════════════
   PERSONA 3 — Diego Marín · Sales (Enterprise AE)
   ═══════════════════════════════════════════════════════════════════════ */

const diego: CandidateProfile = {
  id: "cand-diego",
  name: "Diego Marín",
  headline: "Enterprise Account Executive · 5 yrs",
  initials: "DM",
  industry: "Sales",
  completeness: 68,
  scenarioCompleted: true,
  hardSkills: [
    { name: "Pipeline management", verified: true },
    { name: "Salesforce CRM", verified: false },
    { name: "Solution selling", verified: true },
    { name: "Contract negotiation", verified: false },
    { name: "Forecasting", verified: false },
    { name: "Discovery", verified: false },
  ],
  softSkills: [
    { name: "Communication", level: 93 },
    { name: "Collaboration", level: 81 },
    { name: "Ownership", level: 88 },
    { name: "Adaptability", level: 86 },
    { name: "Problem-solving", level: 83 },
  ],
};

const hmNina: Person = { id: "hm-nina", name: "Nina Brandt", headline: "VP Sales, Cloudza", initials: "NB" };
const hmRaj: Person = { id: "hm-raj", name: "Raj Patel", headline: "Sales Director, Northbeam", initials: "RP" };
const hmKim: Person = { id: "hm-kim", name: "Kim Larsen", headline: "RVP, Vantage Cloud", initials: "KL" };
const hmHelio: Person = { id: "hm-helio", name: "Tom Wells", headline: "Sales Manager, Helio CRM", initials: "TW" };

const openStrategic: Opening = {
  id: "open-cloudza-ae",
  title: "Strategic Account Executive",
  industry: "Sales",
  company: { id: "co-cloudza", name: "Cloudza", location: "Remote (US)" },
  location: "Remote (US)",
  salaryMin: 130000,
  salaryMax: 170000,
  currency: "$",
  hiringManager: hmNina,
  requiredHard: ["Solution selling", "Pipeline management", "Discovery", "Contract negotiation"],
  requiredSoft: ["Communication", "Ownership"],
};
const openSalesMgr: Opening = {
  id: "open-northbeam-mgr",
  title: "Sales Manager",
  industry: "Sales",
  company: { id: "co-northbeam", name: "Northbeam", location: "New York, US" },
  location: "New York · Hybrid",
  salaryMin: 140000,
  salaryMax: 180000,
  currency: "$",
  hiringManager: hmRaj,
  requiredHard: ["Pipeline management", "Forecasting", "Solution selling"],
  requiredSoft: ["Communication", "Team quota leadership"],
};
const openVantage: Opening = {
  id: "open-vantage-ae",
  title: "Enterprise Account Executive",
  industry: "Sales",
  company: { id: "co-vantage", name: "Vantage Cloud", location: "Austin, US" },
  location: "Austin · Hybrid",
  salaryMin: 120000,
  salaryMax: 160000,
  currency: "$",
  hiringManager: hmKim,
  requiredHard: ["Forecasting at scale", "Solution selling", "Discovery"],
  requiredSoft: ["Communication", "Collaboration"],
};
const openHelio: Opening = {
  id: "open-helio-ae",
  title: "Mid-Market Account Executive",
  industry: "Sales",
  company: { id: "co-helio", name: "Helio CRM", location: "Lisbon, PT" },
  location: "Lisbon · Hybrid",
  salaryMin: 80000,
  salaryMax: 110000,
  currency: "€",
  hiringManager: hmHelio,
  requiredHard: ["Forecasting at scale", "Pipeline management", "Discovery"],
  requiredSoft: ["Communication", "Adaptability"],
};

const diegoMatches: Match[] = [
  activeMatch("match-strategic", diego, openStrategic, fitOf(90, 92, 91, true, { rank: 3, pool: 44 })),
  activeMatch("match-salesmgr", diego, openSalesMgr, fitOf(84, 86, 85, true, { rank: 7, pool: 38, gaps: [{ skill: "Team quota leadership", type: "soft", severity: "moderate" }] })),
  activeMatch("match-vantage", diego, openVantage, fitOf(78, 85, 80, true, { rank: 11, pool: 49, gaps: [{ skill: "Forecasting at scale", type: "hard", severity: "moderate" }] })),
];

const diegoClosed = closedMatch(
  "match-helio-closed",
  diego,
  openHelio,
  fitOf(76, 90, 82, true, { gaps: [{ skill: "Forecasting at scale", type: "hard", severity: "moderate" }] }),
);

const diegoGrowth: GrowthReport = {
  id: "growth-helio",
  matchId: "match-helio-closed",
  roleTitle: openHelio.title,
  company: openHelio.company.name,
  hard: {
    type: "hard",
    comparison: { label: "Hard skills", you: 76, roleBar: 84 },
    gap: { skill: "Forecasting at scale", type: "hard", severity: "moderate" },
    note: "Gap: Forecasting at scale",
  },
  soft: {
    type: "soft",
    comparison: { label: "Soft skills", you: 90, roleBar: 80 },
    aboveBar: true,
    note: "Above bar — a strength",
  },
  primaryGap: { skill: "Forecasting at scale", type: "hard", severity: "moderate" },
  rolesClearedIfClosed: 6,
  matchingProgramCount: 2,
};

const diegoEndorsements: Endorsement[] = [
  { id: "en-di-1", skill: "Pipeline management", endorserName: "Nina Brandt", endorserInitials: "NB", endorserHeadline: "VP Sales, Cloudza", relationship: "Worked together" },
  { id: "en-di-2", skill: "Solution selling", endorserName: "Carla Mendes", endorserInitials: "CM", endorserHeadline: "Sales Engineer", relationship: "Co-sold deals" },
];

/* ── Persona registry ────────────────────────────────────────────────── */

export const DEFAULT_CANDIDATE_ID = CURRENT_CANDIDATE.id;

export const CANDIDATE_WORLDS: Record<string, CandidateWorld> = {
  [CURRENT_CANDIDATE.id]: {
    profile: CURRENT_CANDIDATE,
    matches: samMatches,
    closed: [samClosed],
    growthReports: [samGrowth],
    dailyIds: ["match-northwind", "match-cobalt", "match-lumen"],
    endorsements: samEndorsements,
  },
  [aisha.id]: {
    profile: aisha,
    matches: aishaMatches,
    closed: [aishaClosed],
    growthReports: [aishaGrowth],
    dailyIds: ["match-charge", "match-flight", "match-educator"],
    endorsements: aishaEndorsements,
  },
  [diego.id]: {
    profile: diego,
    matches: diegoMatches,
    closed: [diegoClosed],
    growthReports: [diegoGrowth],
    dailyIds: ["match-strategic", "match-salesmgr", "match-vantage"],
    endorsements: diegoEndorsements,
  },
};

/** Lightweight list for the persona switcher. */
export const CANDIDATE_PERSONAS = Object.values(CANDIDATE_WORLDS).map((w) => ({
  id: w.profile.id,
  name: w.profile.name,
  headline: w.profile.headline,
  industry: w.profile.industry,
  initials: w.profile.initials,
}));

/* ── Back-compat exports (default persona = Sam) ─────────────────────── */

export const CANDIDATE_MATCHES = samMatches;
export const CLOSED_MATCH = samClosed;
export const DAILY_MATCH_IDS = CANDIDATE_WORLDS[DEFAULT_CANDIDATE_ID].dailyIds;
export const GROWTH_REPORTS: GrowthReport[] = [samGrowth, aishaGrowth, diegoGrowth];

/* ═══════════════════════════════════════════════════════════════════════
   HIRING-MANAGER pipeline (Northwind Senior Frontend Engineer, viewed as Priya)
   ═══════════════════════════════════════════════════════════════════════ */

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

export const PIPELINE_OPENING_ID = openNorthwind.id;

export const PIPELINE_MATCHES: Match[] = [
  { id: "pm-1", candidate: poolCandidates[1], opening: openNorthwind, stage: "new", contactable: true, fit: fitOf(91, 86, 89, true) },
  { id: "pm-2", candidate: poolCandidates[3], opening: openNorthwind, stage: "new", contactable: true, fit: fitOf(84, 88, 86, true) },
  { id: "pm-3", candidate: poolCandidates[5], opening: openNorthwind, stage: "new", contactable: true, fit: fitOf(82, 85, 83, false) },
  { id: "pm-4", candidate: poolCandidates[6], opening: openNorthwind, stage: "new", contactable: true, fit: fitOf(79, 83, 81, true) },
  { id: "pm-5", candidate: poolCandidates[8], opening: openNorthwind, stage: "new", contactable: true, fit: fitOf(77, 80, 78, false) },
  { id: "pm-6", candidate: CURRENT_CANDIDATE, opening: openNorthwind, stage: "talking", contactable: true, hasThread: true, fit: fitOf(90, 94, 92, true) },
  { id: "pm-7", candidate: poolCandidates[2], opening: openNorthwind, stage: "talking", contactable: true, hasThread: true, fit: fitOf(88, 82, 85, true) },
  { id: "pm-8", candidate: poolCandidates[7], opening: openNorthwind, stage: "talking", contactable: true, hasThread: true, fit: fitOf(85, 84, 84, true) },
  { id: "pm-9", candidate: poolCandidates[4], opening: openNorthwind, stage: "offer", contactable: true, fit: fitOf(93, 90, 92, true) },
];

export const THREADS: Thread[] = [
  {
    id: "thread-priya-sam",
    matchId: "pm-6",
    me: samHMs.priya,
    them: CURRENT_CANDIDATE,
    messages: [
      { id: "m1", fromId: samHMs.priya.id, text: "Hi Sam — loved your system-design scenario. The way you scoped the rollout caught my eye.", ts: "Mon 09:14" },
      { id: "m2", fromId: CURRENT_CANDIDATE.id, text: "Thanks Priya! I'd love to hear how the team handles incremental migration today.", ts: "Mon 09:31" },
      { id: "m3", fromId: samHMs.priya.id, text: "Let's get into it properly. I dropped a couple of slots below — grab whatever works.", ts: "Mon 09:40" },
      { id: "m4", fromId: CURRENT_CANDIDATE.id, text: "Thursday 2pm is perfect.", ts: "Mon 10:02" },
    ],
    interview: { when: "Thu · 2:00pm", medium: "video", scoreSheetAttached: false },
  },
];

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

/* ═══════════════════════════════════════════════════════════════════════
   RECRUITER desk — cross-industry intros
   ═══════════════════════════════════════════════════════════════════════ */

export const RECRUITER_INTROS: RecruiterIntro[] = [
  { id: "ri-1", candidateName: "Aisha Bello", roleTitle: "ICU Charge Nurse", company: "St. Mary's", valueNote: "Spotted the soft-skill fit the keyword filter missed.", stage: "interview" },
  { id: "ri-2", candidateName: "Diego Marín", roleTitle: "Strategic AE", company: "Cloudza", valueNote: "Coached the forecasting story, closed the gap.", stage: "offer" },
  { id: "ri-3", candidateName: "Sam Rivera", roleTitle: "Senior Frontend Engineer", company: "Northwind", valueNote: "Surfaced him for a role he'd have scrolled past.", stage: "interview" },
  { id: "ri-4", candidateName: "Grace Okafor", roleTitle: "Secondary Maths Teacher", company: "Oakwood School", valueNote: "Reframed her portfolio around outcomes.", stage: "talking" },
  { id: "ri-5", candidateName: "Tom Becker", roleTitle: "Financial Analyst", company: "Meridian Capital", valueNote: "Prepped the modelling case study.", stage: "interview" },
  { id: "ri-6", candidateName: "Priya Shah", roleTitle: "Operations Lead", company: "Swiftport Logistics", valueNote: "Nudged timing — applied the week the req opened.", stage: "talking" },
  { id: "ri-7", candidateName: "Marco Rossi", roleTitle: "Line Cook → Sous Chef", company: "Osteria Vela", valueNote: "Closed last year — referred two more since.", stage: "hired" },
];

/* ═══════════════════════════════════════════════════════════════════════
   TRAINING PROVIDERS + upskilling marketplace — cross-industry
   ═══════════════════════════════════════════════════════════════════════ */

const providerFM: Provider = { id: "prov-fm", name: "Frontend Masters", headline: "Course platform · partner", initials: "FM", kind: "Course platform" };
const providerTUD: Provider = { id: "prov-tud", name: "TU Delft (online)", headline: "University · accredited", initials: "TU", kind: "University" };
const providerLaunch: Provider = { id: "prov-launch", name: "Launchpad", headline: "Bootcamp · cohort-based", initials: "LP", kind: "Bootcamp" };
const providerHopkins: Provider = { id: "prov-jh", name: "Johns Hopkins (online)", headline: "University · accredited", initials: "JH", kind: "University" };
const providerSalesAcad: Provider = { id: "prov-sa", name: "Sales Academy", headline: "Course platform · partner", initials: "SA", kind: "Course platform" };

export const PROVIDERS: Provider[] = [providerFM, providerTUD, providerLaunch, providerHopkins, providerSalesAcad];

/** The signed-in provider (the "me" for provider-side screens). */
export const CURRENT_PROVIDER = providerFM;

export const PROGRAMS: Program[] = [
  // Software
  { id: "prog-ts-scale", providerId: providerFM.id, provider: providerFM.name, providerKind: providerFM.kind, title: "TypeScript at Scale", format: "Online course · 4 weeks · cert", credential: "Certificate", tags: ["partner", "hands-on"], closesGap: "TypeScript at scale", gapType: "hard", sponsored: true, enrollments: 1240, completions: 870, reMatches: 610 },
  { id: "prog-ts-uni", providerId: providerTUD.id, provider: providerTUD.name, providerKind: providerTUD.kind, title: "Type-Safe Systems Engineering", format: "Micro-credential · Part-time · 1 semester", credential: "Accredited micro-credential", tags: ["accredited", "deeper"], closesGap: "TypeScript at scale", gapType: "hard", sponsored: false, enrollments: 320, completions: 210, reMatches: 150 },
  { id: "prog-sysdesign", providerId: providerFM.id, provider: providerFM.name, providerKind: providerFM.kind, title: "Designing Large-Scale Systems", format: "Online course · 6 weeks · cert", credential: "Certificate", tags: ["partner"], closesGap: "System design at scale", gapType: "hard", sponsored: true, enrollments: 980, completions: 640, reMatches: 430 },
  { id: "prog-k8s", providerId: providerFM.id, provider: providerFM.name, providerKind: providerFM.kind, title: "Kubernetes in Production", format: "Online course · 5 weeks · cert", credential: "Certificate", tags: ["partner", "hands-on"], closesGap: "Kubernetes", gapType: "hard", sponsored: false, enrollments: 760, completions: 480, reMatches: 300 },
  // Healthcare
  { id: "prog-picu", providerId: providerHopkins.id, provider: providerHopkins.name, providerKind: providerHopkins.kind, title: "Pediatric Critical Care", format: "Micro-credential · Part-time · 1 semester", credential: "Accredited micro-credential", tags: ["accredited", "clinical placement"], closesGap: "Pediatric critical care", gapType: "hard", sponsored: true, enrollments: 540, completions: 360, reMatches: 240 },
  { id: "prog-transport", providerId: providerHopkins.id, provider: providerHopkins.name, providerKind: providerHopkins.kind, title: "Critical Care Transport", format: "Online + sim · 6 weeks · cert", credential: "Certificate", tags: ["accredited"], closesGap: "Critical care transport", gapType: "hard", sponsored: false, enrollments: 210, completions: 150, reMatches: 95 },
  // Sales
  { id: "prog-forecast", providerId: providerSalesAcad.id, provider: providerSalesAcad.name, providerKind: providerSalesAcad.kind, title: "Enterprise Forecasting", format: "Online course · 4 weeks · cert", credential: "Certificate", tags: ["partner", "hands-on"], closesGap: "Forecasting at scale", gapType: "hard", sponsored: true, enrollments: 880, completions: 590, reMatches: 410 },
  { id: "prog-quota", providerId: providerLaunch.id, provider: providerLaunch.name, providerKind: providerLaunch.kind, title: "From Quota-Carrier to Manager", format: "Cohort bootcamp · 6 weeks · live", tags: ["cohort", "coaching"], closesGap: "Team quota leadership", gapType: "soft", sponsored: false, enrollments: 360, completions: 240, reMatches: 160 },
  // Cross-domain leadership
  { id: "prog-lead", providerId: providerLaunch.id, provider: providerLaunch.name, providerKind: providerLaunch.kind, title: "From Senior to Lead", format: "Cohort bootcamp · 6 weeks · live", tags: ["cohort", "coaching"], closesGap: "Team leadership", gapType: "soft", sponsored: false, enrollments: 410, completions: 290, reMatches: 180 },
];

/** Aggregate demand for skill gaps across industries — what providers target. */
export const GAP_DEMAND: GapDemand[] = [
  { skill: "TypeScript at scale", type: "hard", industry: "Software", candidatesWithGap: 147, rolesBlocked: 7, programsOffered: 2 },
  { skill: "Pediatric critical care", type: "hard", industry: "Healthcare", candidatesWithGap: 96, rolesBlocked: 5, programsOffered: 1 },
  { skill: "Forecasting at scale", type: "hard", industry: "Sales", candidatesWithGap: 132, rolesBlocked: 8, programsOffered: 1 },
  { skill: "Classroom management", type: "soft", industry: "Education", candidatesWithGap: 74, rolesBlocked: 6, programsOffered: 0 },
  { skill: "IFRS 17 reporting", type: "hard", industry: "Finance", candidatesWithGap: 61, rolesBlocked: 4, programsOffered: 0 },
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
