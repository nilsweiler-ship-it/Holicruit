/**
 * Applied skill-check item bank. Deliberately "AI-proof": every item tests
 * judgment, verification, and trade-off reasoning applied to a realistic
 * situation — the things you can't Google or have an AI decide for you — rather
 * than factual recall.
 *
 * Tailoring: `itemsForSkill` resolves in three layers so a check is as specific
 * as we can make it —
 *   1. a hand-authored bank for that exact skill (SKILL_ITEMS), else
 *   2. a domain bank for the skill's category (engineering, data, quality,
 *      sales, design, product, pm, marketing, finance, ops, healthcare,
 *      education), resolved by whole-word alias matching, else
 *   3. a universal applied-judgment fallback.
 *
 * Integrity rules for authors (enforced by tests/unit/skill-checks.test.ts):
 *   • the strongest option sits at a different position from item to item —
 *     within every bank each position holds the best answer exactly once, and
 *     "always pick option X" never reaches the pass mark;
 *   • the strongest option is usually NOT the longest (a long, reasonable-
 *     sounding distractor is fine; the best answer is often the terse one);
 *   • scores never leave the server — the page sends `{ id, text }` only, the
 *     server shuffles option order per attempt and scores by option id.
 *
 * Hiring managers (Scale plan) can still override the bank per role via
 * `opening.quiz`.
 */

export interface SkillCheckOption {
  id: string;
  text: string;
  /** 0–10: how strong this choice is (judgment, not "correct trivia"). */
  score: number;
}
export interface SkillCheckItem {
  id: string;
  prompt: string;
  /** Optional guidance shown to the candidate. */
  note?: string;
  options: SkillCheckOption[];
}

type Category =
  | "engineering"
  | "data"
  | "quality"
  | "healthcare"
  | "design"
  | "product"
  | "pm"
  | "sales"
  | "marketing"
  | "finance"
  | "ops"
  | "education";

// ── Skill → category: explicit, whole-word aliases ───────────────────────────
// Matching is on whole tokens/phrases (never substrings), longest alias first,
// so "Accounting" can't hit "account", "Recruiting" can't hit "ui", and
// "Google Ads" can't hit "go".
const CATEGORY_ALIASES: Record<Category, string[]> = {
  quality: [
    "quality", "quality assurance", "quality control", "qa", "qc", "gmp", "gxp", "gcp compliance", "capa",
    "aseptic", "aseptic processing", "validation", "process validation", "audit", "audits", "auditing",
    "regulatory", "regulatory affairs", "pharmacovigilance", "clinical research", "batch record",
    "batch records", "deviation", "deviations", "root cause", "root cause analysis", "iso 13485",
    "iso 9001", "biocompatibility", "sterilization",
  ],
  healthcare: [
    "nurse", "nurses", "nursing", "registered nurse", "clinical", "patient", "patient care", "triage",
    "acls", "bls", "ehr", "epic", "epic ehr", "ventilator", "medication", "medication administration",
    "critical care", "icu", "emergency medicine", "phlebotomy", "wound care",
  ],
  data: [
    "machine learning", "deep learning", "data", "data analysis", "data analytics", "data science",
    "data engineering", "data visualization", "tableau", "power bi", "looker", "dbt", "snowflake",
    "spark", "sql", "postgresql", "mysql", "bigquery", "analytics", "forecasting", "kafka",
    "elasticsearch", "statistics", "pandas", "excel", "ml", "ai", "nlp", "etl",
  ],
  design: [
    "ux", "ui", "ui ux", "ux ui", "ux design", "ui design", "user interface", "user experience",
    "interaction design", "visual design", "graphic design", "product design", "figma", "sketch",
    "prototyping", "prototype", "prototypes", "design system", "design systems", "usability testing",
  ],
  product: [
    "product management", "product manager", "product strategy", "product owner", "roadmap",
    "roadmapping", "user research", "product sense", "product discovery", "requirements engineering",
    "requirements", "go to market", "go-to-market",
  ],
  pm: [
    "project management", "program management", "agile", "scrum", "kanban", "stakeholder",
    "stakeholder management", "pmp", "prince2", "jira", "delivery management",
  ],
  sales: [
    "sales", "pipeline", "pipeline management", "solution selling", "account management",
    "account executive", "key account management", "negotiation", "crm", "quota", "discovery",
    "customer success", "salesforce", "hubspot", "business development", "lead generation",
    "cold calling",
  ],
  marketing: [
    "seo", "sem", "google ads", "facebook ads", "paid social", "content marketing", "copywriting",
    "growth marketing", "demand generation", "marketing", "digital marketing", "email marketing",
    "brand", "branding", "social media",
  ],
  finance: [
    "financial modeling", "financial modelling", "fp&a", "accounting", "bookkeeping", "payroll", "ifrs",
    "gaap", "audit readiness", "treasury", "liquidity", "liquidity risk", "risk management", "budgeting",
    "controlling", "tax", "valuation", "corporate finance",
  ],
  ops: [
    "supply chain", "operations", "operations management", "people operations", "recruiting",
    "recruitment", "talent acquisition", "logistics", "procurement", "inventory", "inventory management",
    "warehouse", "warehousing", "category management", "lean", "six sigma", "hr",
  ],
  education: [
    "curriculum", "curriculum design", "curriculum development", "classroom", "classroom management",
    "teaching", "tutoring", "instructional design", "lesson planning", "pedagogy",
  ],
  engineering: [
    "typescript", "javascript", "react", "react native", "node", "node.js", "nodejs", "python",
    "kubernetes", "docker", "aws", "gcp", "azure", "java", "kotlin", "swift", "go", "golang", "rust",
    "c++", "c#", ".net", "graphql", "grpc", "microservices", "ci cd", "ci", "terraform",
    "system design", "next.js", "nextjs", "vue", "vue.js", "angular", "svelte", "redux", "rest",
    "rest api", "rest apis", "git", "ruby", "rails", "ruby on rails", "php", "scala", "testing",
    "unit testing", "software engineering", "backend", "frontend", "full stack", "devops", "linux",
  ],
};

/** Lowercase, and turn separators into single spaces (keeps + # & . inside tokens). */
function normalizePhrase(s: string): string {
  return s
    .toLowerCase()
    .replace(/[\s/,;:()[\]{}|_\-–—]+/g, " ")
    .trim();
}

/** [normalized alias, category], longest alias (by words, then chars) first. */
const ALIAS_INDEX: ReadonlyArray<readonly [string, Category]> = (
  Object.entries(CATEGORY_ALIASES) as [Category, string[]][]
)
  .flatMap(([cat, aliases]) => aliases.map((a) => [normalizePhrase(a), cat] as const))
  .sort((x, y) => {
    const wx = x[0].split(" ").length;
    const wy = y[0].split(" ").length;
    return wy - wx || y[0].length - x[0].length;
  });

export function categoryOf(skill: string): Category | null {
  const s = ` ${normalizePhrase(skill)} `;
  if (s.trim() === "") return null;
  for (const [alias, cat] of ALIAS_INDEX) {
    if (s.includes(` ${alias} `)) return cat;
  }
  return null;
}

// ── Domain banks (applied judgment, flavoured to the skill by name) ───────────
const CATEGORY_ITEMS: Record<Category, (skill: string) => SkillCheckItem[]> = {
  engineering: (X) => [
    {
      id: "review",
      prompt: `A teammate opens a ${X} pull request that passes CI. You have 20 minutes to review it. Where do you focus?`,
      options: [
        { id: "a", text: "Whether it follows your personal style preferences, since consistency across the codebase matters to you.", score: 3 },
        { id: "b", text: "Failure modes and edge cases the tests miss, and behaviour under load.", score: 10 },
        { id: "c", text: "Trust the green CI and approve.", score: 2 },
        { id: "d", text: "Readability and naming so the team can maintain it.", score: 7 },
      ],
    },
    {
      id: "incident",
      prompt: `A ${X} change you shipped yesterday is implicated in a partial outage now. First move?`,
      options: [
        { id: "a", text: "Push a quick hot-fix straight to prod based on your best guess.", score: 3 },
        { id: "b", text: "Wait to see if it resolves itself.", score: 1 },
        { id: "c", text: "Dig into the logs until you fully understand the failure before touching anything in production.", score: 5 },
        { id: "d", text: "Mitigate first — roll back or flag it off — then find the root cause.", score: 10 },
      ],
    },
    {
      id: "ai-verify",
      prompt: `An AI assistant generates a ${X} implementation that looks right, but you can't fully explain it.`,
      note: "No penalty for using AI — we care about how you verify.",
      options: [
        { id: "a", text: "Test it on real and edge cases, and read it until you can explain it.", score: 10 },
        { id: "b", text: "Read it closely; skip tests if it looks clean.", score: 6 },
        { id: "c", text: "Ship it — it compiles and looks correct.", score: 2 },
        { id: "d", text: "Discard it and rewrite from scratch to be safe.", score: 4 },
      ],
    },
    {
      id: "debt",
      prompt: `You can ship a ${X} feature fast with a shortcut that will be costly to unwind later, or slower done cleanly. Deadline is real.`,
      options: [
        { id: "a", text: "Take the shortcut and log a ticket to fix it later.", score: 6 },
        { id: "b", text: "Take the shortcut quietly — you'll remember to fix it once the deadline has passed and things calm down.", score: 2 },
        { id: "c", text: "Ship a clean minimal version; if you must cut a corner, isolate it and log the debt.", score: 10 },
        { id: "d", text: "Miss the deadline to do it perfectly.", score: 4 },
      ],
    },
  ],
  data: (X) => [
    {
      id: "surprise",
      prompt: `Your ${X} work produces a surprising result that happens to support what leadership wants to hear. Before you present it?`,
      options: [
        { id: "a", text: "Present it — a clean result that lands well is a win.", score: 2 },
        { id: "b", text: "Sanity-check the headline number, then present it with sensible caveats so leadership knows the limits.", score: 6 },
        { id: "c", text: "Try hard to disprove it first — pipeline, assumptions, confounders.", score: 10 },
        { id: "d", text: "Bury it because surprising results cause trouble.", score: 1 },
      ],
    },
    {
      id: "messy",
      prompt: `A stakeholder needs a metric today, but the underlying data has nulls, duplicates, and inconsistent definitions.`,
      options: [
        { id: "a", text: "Give a defensible estimate, state the definition used, and flag the data gaps.", score: 10 },
        { id: "b", text: "Give the raw number quickly — they need it now.", score: 2 },
        { id: "c", text: "Refuse until the data is fixed.", score: 3 },
        { id: "d", text: "Clean what you can and deliver the number without commentary, so the stakeholder isn't confused by caveats.", score: 5 },
      ],
    },
    {
      id: "leakage",
      prompt: `Your ${X} model scores well offline, but you suspect target leakage. Shipping it would hit this quarter's goal.`,
      options: [
        { id: "a", text: "Ship with a monitoring plan and fix the leakage in the next iteration, since the quarter's goal is real.", score: 5 },
        { id: "b", text: "Ship it — offline metrics are strong.", score: 2 },
        { id: "c", text: "Drop the project to avoid the risk.", score: 3 },
        { id: "d", text: "Find and fix the leakage before shipping, even if the goal slips.", score: 10 },
      ],
    },
    {
      id: "ambiguity",
      prompt: `You're asked to "look into churn with ${X}" — no clear question, real deadline.`,
      options: [
        { id: "a", text: "Build a broad churn dashboard.", score: 4 },
        { id: "b", text: "Agree on the decision it should inform, then scope to that.", score: 10 },
        { id: "c", text: "Start exploring and share early findings to converge.", score: 7 },
        { id: "d", text: "Wait for a precise question.", score: 2 },
      ],
    },
  ],
  quality: (X) => [
    {
      id: "deviation",
      prompt: `During ${X} you notice a minor deviation in a batch record hours before a release deadline. It probably has no product impact.`,
      options: [
        { id: "a", text: "Flag it to your lead and let them decide.", score: 6 },
        { id: "b", text: "Note it informally and release on time, since the impact looks negligible and the batch is needed.", score: 2 },
        { id: "c", text: "Correct the record so it's clean and move on.", score: 0 },
        { id: "d", text: "Document it and open a deviation — assessment decides impact, not the clock.", score: 10 },
      ],
    },
    {
      id: "sop-gap",
      prompt: `You find the line is doing a step differently from the approved SOP — and their way is arguably better.`,
      options: [
        { id: "a", text: "Let them continue since their way is better — the SOP can catch up when someone has time.", score: 2 },
        { id: "b", text: "Stop the drift, document it, and raise a change control.", score: 10 },
        { id: "c", text: "Ask the line to follow the SOP for now and suggest a revision later.", score: 7 },
        { id: "d", text: "Quietly update the SOP yourself to match practice.", score: 1 },
      ],
    },
    {
      id: "capa",
      prompt: `A CAPA is overdue and pressure is mounting to close it, but the root cause still isn't clear.`,
      options: [
        { id: "a", text: "Close it citing the most likely cause to clear the metric, since leadership is tracking overdue CAPAs.", score: 2 },
        { id: "b", text: "Close it and reopen if the issue recurs.", score: 1 },
        { id: "c", text: "Keep it open — no verified root cause, no closure.", score: 10 },
        { id: "d", text: "Extend it with a documented justification and interim controls.", score: 8 },
      ],
    },
    {
      id: "audit",
      prompt: `An auditor asks a question and you're not certain of the answer.`,
      options: [
        { id: "a", text: "Say you'll confirm and follow up accurately rather than guess.", score: 10 },
        { id: "b", text: "Give your best understanding, labelled as such.", score: 6 },
        { id: "c", text: "Answer confidently to look in control.", score: 1 },
        { id: "d", text: "Defer every question to your manager.", score: 4 },
      ],
    },
  ],
  healthcare: (X) => [
    {
      id: "ambiguous",
      prompt: `In your ${X} work a situation is ambiguous and time-sensitive, and the information you have is incomplete.`,
      options: [
        { id: "a", text: "Wait until you have complete information before acting.", score: 3 },
        { id: "b", text: "Act on the safest reasonable reading while escalating and gathering more.", score: 10 },
        { id: "c", text: "Go with your gut without escalating.", score: 3 },
        { id: "d", text: "Follow protocol strictly, even where it doesn't quite fit the situation in front of you.", score: 6 },
      ],
    },
    {
      id: "protocol",
      prompt: `A protocol conflicts with what you're observing in front of you.`,
      options: [
        { id: "a", text: "Do what you think is right and skip the paperwork — the patient in front of you matters more than the form.", score: 3 },
        { id: "b", text: "Ignore your observation — the protocol is the protocol.", score: 2 },
        { id: "c", text: "Follow the protocol and note your concern afterward in the record.", score: 6 },
        { id: "d", text: "Escalate the discrepancy now and document it.", score: 10 },
      ],
    },
    {
      id: "handoff",
      prompt: `You're handing off at end of shift and one detail is uncertain but potentially important.`,
      options: [
        { id: "a", text: "Flag the uncertainty explicitly so the next person watches for it.", score: 10 },
        { id: "b", text: "Write a long note covering everything equally so nothing at all could possibly be missed.", score: 5 },
        { id: "c", text: "Mention it only if asked, to keep the handoff short.", score: 4 },
        { id: "d", text: "Leave it out — you're not sure it matters.", score: 1 },
      ],
    },
    {
      id: "speakup",
      prompt: `A more senior colleague is about to make what looks like an error.`,
      options: [
        { id: "a", text: "Ask a clarifying question to prompt a second look.", score: 8 },
        { id: "b", text: "Stay quiet — they outrank you.", score: 1 },
        { id: "c", text: "Speak up clearly and respectfully about the specific concern.", score: 10 },
        { id: "d", text: "Report it afterward instead of raising it now.", score: 3 },
      ],
    },
  ],
  design: (X) => [
    {
      id: "evidence",
      prompt: `User testing contradicts a ${X} direction a senior stakeholder loves.`,
      options: [
        { id: "a", text: "Go with the stakeholder — they have the final say.", score: 3 },
        { id: "b", text: "Redesign toward the evidence and present it as an alternative option alongside theirs.", score: 8 },
        { id: "c", text: "Show the evidence neutrally and propose a small test to decide together.", score: 10 },
        { id: "d", text: "Insist on your data-backed design.", score: 4 },
      ],
    },
    {
      id: "a11y",
      prompt: `A tight deadline tempts you to skip accessibility on a ${X} deliverable.`,
      options: [
        { id: "a", text: "Keep the essentials — contrast, focus, labels — and cut scope elsewhere.", score: 10 },
        { id: "b", text: "Skip it — few users need it.", score: 1 },
        { id: "c", text: "Miss the deadline to make it perfect.", score: 4 },
        { id: "d", text: "Ship now and add accessibility in a fast follow once the deadline pressure is off and the team has room.", score: 5 },
      ],
    },
    {
      id: "consistency",
      prompt: `A one-off request would break the design system's consistency but pleases one team.`,
      options: [
        { id: "a", text: "Make the exception and document it.", score: 5 },
        { id: "b", text: "Give them exactly what they asked for so the team stays happy and keeps trusting the design function.", score: 3 },
        { id: "c", text: "Refuse outright to protect the system.", score: 4 },
        { id: "d", text: "Solve it within the system, or propose a system change if it's a real pattern.", score: 10 },
      ],
    },
    {
      id: "ambiguity",
      prompt: `A ${X} brief is vague and the deadline is real.`,
      options: [
        { id: "a", text: "Polish one idea you like.", score: 4 },
        { id: "b", text: "Align on the user problem and success criteria first.", score: 10 },
        { id: "c", text: "Sketch a few directions to react to.", score: 7 },
        { id: "d", text: "Wait for a clearer brief.", score: 2 },
      ],
    },
  ],
  product: (X) => [
    {
      id: "conflict",
      prompt: `Two teams want conflicting features, the data is thin, and you (${X}) must decide.`,
      options: [
        { id: "a", text: "Ship a small version of both features and measure which one actually moves the numbers.", score: 7 },
        { id: "b", text: "Pick the louder stakeholder to keep the peace.", score: 2 },
        { id: "c", text: "Delay until the data is conclusive.", score: 4 },
        { id: "d", text: "Tie the call to the metric it should move and the cheapest way to learn.", score: 10 },
      ],
    },
    {
      id: "vanity",
      prompt: `A headline metric is up, but support tickets and churn signals are rising too.`,
      options: [
        { id: "a", text: "Report the win — the metric is the target.", score: 2 },
        { id: "b", text: "Look past the headline metric to the user outcome.", score: 10 },
        { id: "c", text: "Report both signals to leadership and open an investigation into the tension between them.", score: 8 },
        { id: "d", text: "Assume the tickets are unrelated — support volume always rises when usage grows, so it's expected noise.", score: 2 },
      ],
    },
    {
      id: "scope",
      prompt: `You're over scope a week from launch.`,
      options: [
        { id: "a", text: "Push the team to work overtime to fit it all.", score: 3 },
        { id: "b", text: "Ship everything half-finished.", score: 1 },
        { id: "c", text: "Cut to the smallest thing that delivers the core value, and ship it.", score: 10 },
        { id: "d", text: "Ask for a short extension with a clear plan.", score: 6 },
      ],
    },
    {
      id: "ai-verify",
      prompt: `An AI tool drafts a ${X} plan that reads convincingly.`,
      note: "No penalty for using AI — we care about your judgment.",
      options: [
        { id: "a", text: "Pressure-test its assumptions against real constraints before adopting it.", score: 10 },
        { id: "b", text: "Use it as a first draft and revise heavily.", score: 8 },
        { id: "c", text: "Adopt it — it's well-argued, internally consistent, and saves the team weeks of planning.", score: 2 },
        { id: "d", text: "Ignore it entirely.", score: 4 },
      ],
    },
  ],
  pm: (X) => [
    {
      id: "slip",
      prompt: `A dependency slips and threatens your ${X} milestone.`,
      options: [
        { id: "a", text: "Hold the date and hope it recovers.", score: 2 },
        { id: "b", text: "Re-plan the critical path, tell people early, and offer options.", score: 10 },
        { id: "c", text: "Wait until it's clearly late to raise it.", score: 1 },
        { id: "d", text: "Push the owner hard to catch up.", score: 5 },
      ],
    },
    {
      id: "creep",
      prompt: `A stakeholder adds "just one more thing" mid-sprint.`,
      options: [
        { id: "a", text: "Say yes to keep them happy.", score: 2 },
        { id: "b", text: "Refuse — the sprint is locked, and changing it mid-way would undermine the team's process.", score: 4 },
        { id: "c", text: "Absorb it if it's small and note it.", score: 5 },
        { id: "d", text: "Make the trade-off explicit: what moves out if this comes in?", score: 10 },
      ],
    },
    {
      id: "priority",
      prompt: `Two senior stakeholders disagree on what's top priority.`,
      options: [
        { id: "a", text: "Surface the shared goal and trade-offs; drive to an explicit decision.", score: 10 },
        { id: "b", text: "Escalate to their manager for a ruling so the decision carries authority and you stay neutral.", score: 6 },
        { id: "c", text: "Pick one and hope the other doesn't notice.", score: 1 },
        { id: "d", text: "Try to do both at once.", score: 3 },
      ],
    },
    {
      id: "status",
      prompt: `A project is quietly going off-track. The next steering update is in a week.`,
      options: [
        { id: "a", text: "Prepare a full analysis for the scheduled update.", score: 5 },
        { id: "b", text: "Wait — you might still recover before then.", score: 2 },
        { id: "c", text: "Raise it now, with impact and options.", score: 10 },
        { id: "d", text: "Mention it informally to one ally who can help you think through how to present it later.", score: 4 },
      ],
    },
  ],
  sales: (X) => [
    {
      id: "discount",
      prompt: `Early in ${X}, a prospect immediately asks for a big discount.`,
      options: [
        { id: "a", text: "Give the discount to keep them engaged.", score: 3 },
        { id: "b", text: "Offer a modest discount tied to a longer commitment, so both sides give something up front.", score: 6 },
        { id: "c", text: "Explore need and value first — fit before price.", score: 10 },
        { id: "d", text: "Refuse to discuss price at all.", score: 3 },
      ],
    },
    {
      id: "quota",
      prompt: `You're behind quota with two days left in the quarter.`,
      options: [
        { id: "a", text: "Focus on the few deals with real next steps and clear their blockers.", score: 10 },
        { id: "b", text: "Pull deals forward that aren't ready, risking churn.", score: 2 },
        { id: "c", text: "Sandbag and roll them to next quarter.", score: 3 },
        { id: "d", text: "Blast every open opportunity with a time-limited discount offer to create urgency before the quarter closes.", score: 4 },
      ],
    },
    {
      id: "ghost",
      prompt: `A deal you forecast as "committed" just went silent.`,
      options: [
        { id: "a", text: "Keep it committed and chase the champion harder through every channel you have.", score: 4 },
        { id: "b", text: "Leave the forecast as-is until the deadline.", score: 2 },
        { id: "c", text: "Mark it closed-won optimistically.", score: 1 },
        { id: "d", text: "Re-qualify honestly and adjust the forecast.", score: 10 },
      ],
    },
    {
      id: "overpromise",
      prompt: `A prospect will sign today if you promise a feature that doesn't exist yet.`,
      options: [
        { id: "a", text: "Imply it's coming without saying so directly.", score: 2 },
        { id: "b", text: "Be honest about what exists and what's planned; don't commit what you can't deliver.", score: 10 },
        { id: "c", text: "Loop in product to confirm the roadmap before promising anything.", score: 9 },
        { id: "d", text: "Promise it — sales can sort out delivery later.", score: 1 },
      ],
    },
  ],
  marketing: (X) => [
    {
      id: "attribution",
      prompt: `A ${X} campaign metric spikes, but attribution is murky.`,
      options: [
        { id: "a", text: "Report the spike with clear caveats about how uncertain the attribution currently is.", score: 7 },
        { id: "b", text: "Claim the win — the number is up.", score: 2 },
        { id: "c", text: "Ignore it as noise — spikes like this usually revert within a week or two, so it isn't worth chasing.", score: 3 },
        { id: "d", text: "Check the lift against a holdout or baseline first.", score: 10 },
      ],
    },
    {
      id: "brand",
      prompt: `A tactic would boost short-term conversions but risks the brand's credibility.`,
      options: [
        { id: "a", text: "Run it — conversions are the target.", score: 2 },
        { id: "b", text: "Weigh lifetime value and trust, not just the bump.", score: 10 },
        { id: "c", text: "Test it on a small segment and watch brand-sentiment signals closely before scaling.", score: 7 },
        { id: "d", text: "Reject any aggressive tactic on principle, even if the numbers say it would work for this quarter's goals.", score: 4 },
      ],
    },
    {
      id: "abtest",
      prompt: `An A/B test is inconclusive and the launch is tomorrow.`,
      options: [
        { id: "a", text: "Pick the variant you personally prefer.", score: 3 },
        { id: "b", text: "Call the small, non-significant difference a winner.", score: 1 },
        { id: "c", text: "Default to the safer, reversible option and note the test was inconclusive.", score: 10 },
        { id: "d", text: "Extend the test and delay if you can.", score: 6 },
      ],
    },
    {
      id: "ambiguity",
      prompt: `You're told to "grow the funnel with ${X}" with no specific target.`,
      options: [
        { id: "a", text: "Define the stage and metric to move, then design experiments.", score: 10 },
        { id: "b", text: "Launch a few new channels at once and measure which ones gain traction over the quarter.", score: 6 },
        { id: "c", text: "Do more of what you did last quarter.", score: 4 },
        { id: "d", text: "Wait for a target.", score: 2 },
      ],
    },
  ],
  finance: (X) => [
    {
      id: "assumption",
      prompt: `Your ${X} output depends on one aggressive assumption that conveniently gives the desired answer.`,
      options: [
        { id: "a", text: "Keep the aggressive assumption — it supports the case leadership is making.", score: 2 },
        { id: "b", text: "Show results across a range for that assumption.", score: 10 },
        { id: "c", text: "Remove the driver to avoid the issue.", score: 3 },
        { id: "d", text: "Use a conservative value and note it.", score: 7 },
      ],
    },
    {
      id: "reconcile",
      prompt: `At close, a reconciliation is off by a small, immaterial amount and time is tight.`,
      options: [
        { id: "a", text: "Adjust another line so it balances.", score: 0 },
        { id: "b", text: "Ignore it since it's immaterial.", score: 2 },
        { id: "c", text: "Post a plug, flag it for review next cycle, and move on so the close isn't delayed.", score: 5 },
        { id: "d", text: "Find the cause first — small differences can hide real errors.", score: 10 },
      ],
    },
    {
      id: "forecast",
      prompt: `Leadership pressures you to present a rosier forecast than the numbers support.`,
      options: [
        { id: "a", text: "Present the honest base case with labelled upside and downside.", score: 10 },
        { id: "b", text: "Show the optimistic case but disclose the assumptions.", score: 6 },
        { id: "c", text: "Give them the number they want.", score: 1 },
        { id: "d", text: "Refuse to present anything.", score: 3 },
      ],
    },
    {
      id: "ai-verify",
      prompt: `An AI tool builds a ${X} analysis that looks polished.`,
      note: "No penalty for using AI — we care about how you check it.",
      options: [
        { id: "a", text: "Spot-check the key numbers and assumptions.", score: 7 },
        { id: "b", text: "Use it as-is — it's well formatted and the totals look plausible at a glance.", score: 1 },
        { id: "c", text: "Trace the formulas and reconcile to source data before trusting it.", score: 10 },
        { id: "d", text: "Rebuild it from scratch to be safe.", score: 5 },
      ],
    },
  ],
  ops: (X) => [
    {
      id: "sla",
      prompt: `A supplier misses SLA during your peak period (${X}).`,
      options: [
        { id: "a", text: "Absorb the hit quietly this once.", score: 3 },
        { id: "b", text: "Escalate to the supplier and wait for their fix.", score: 5 },
        { id: "c", text: "Trigger the contingency plan, tell those affected, fix the gap after.", score: 10 },
        { id: "d", text: "Switch suppliers immediately mid-peak.", score: 2 },
      ],
    },
    {
      id: "bottleneck",
      prompt: `A recurring bottleneck keeps causing delays. A quick patch exists and a slower structural fix.`,
      options: [
        { id: "a", text: "Patch it now, then schedule the structural fix.", score: 10 },
        { id: "b", text: "Keep patching each time it happens, since the patch is proven and cheap.", score: 3 },
        { id: "c", text: "Live with it — it's manageable.", score: 2 },
        { id: "d", text: "Go straight for the structural fix.", score: 6 },
      ],
    },
    {
      id: "floor",
      prompt: `The dashboard says the process is fine, but the floor team says it isn't.`,
      options: [
        { id: "a", text: "Trust the team and adjust the process.", score: 6 },
        { id: "b", text: "Trust the dashboard — data over anecdote, especially when the floor team's view is based on a few shifts.", score: 3 },
        { id: "c", text: "Ask for more reports.", score: 4 },
        { id: "d", text: "Go and see, then reconcile the data with what's actually happening.", score: 10 },
      ],
    },
    {
      id: "ambiguity",
      prompt: `You're told to "improve efficiency in ${X}" with no specific target.`,
      options: [
        { id: "a", text: "Optimise whatever is easiest to change.", score: 3 },
        { id: "b", text: "Find the biggest constraint with data and target that first.", score: 10 },
        { id: "c", text: "Interview the team for the worst pain points and build a prioritized list from what they tell you.", score: 7 },
        { id: "d", text: "Wait for a specific goal.", score: 2 },
      ],
    },
  ],
  education: (X) => [
    {
      id: "notlanding",
      prompt: `Mid-lesson, it's clear a ${X} concept isn't landing for most of the class.`,
      options: [
        { id: "a", text: "Finish the plan as written and revisit the concept at the start of next lesson.", score: 4 },
        { id: "b", text: "Push on — the plan is the plan.", score: 2 },
        { id: "c", text: "Blame the material and move on.", score: 1 },
        { id: "d", text: "Adapt now: try another explanation or example, then check understanding.", score: 10 },
      ],
    },
    {
      id: "assess",
      prompt: `You must choose between an engaging activity and one that better assesses learning.`,
      options: [
        { id: "a", text: "Do a standard test regardless of fit.", score: 3 },
        { id: "b", text: "Build a check for understanding into the engaging activity.", score: 10 },
        { id: "c", text: "Assess now; engagement can come later once you know where students actually stand.", score: 6 },
        { id: "d", text: "Go for engagement — assessment can wait.", score: 4 },
      ],
    },
    {
      id: "struggling",
      prompt: `One student is falling behind while the rest are ready to move on.`,
      options: [
        { id: "a", text: "Move on and hope they catch up.", score: 2 },
        { id: "b", text: "Focus on the student and let the class idle.", score: 3 },
        { id: "c", text: "Keep the class moving and set up targeted support for the student.", score: 10 },
        { id: "d", text: "Slow the whole class to bring them along.", score: 4 },
      ],
    },
    {
      id: "ambiguity",
      prompt: `A ${X} objective is vague and you have limited class time.`,
      options: [
        { id: "a", text: "Define what students should be able to do, then plan backward.", score: 10 },
        { id: "b", text: "Cover the material thoroughly and see what sticks in the end-of-unit assessment.", score: 5 },
        { id: "c", text: "Do the activity you enjoy teaching most.", score: 3 },
        { id: "d", text: "Wait for clearer guidance.", score: 2 },
      ],
    },
  ],
};

// ── A few hand-authored, skill-specific banks (highest-value skills) ──────────
const SKILL_ITEMS: Record<string, SkillCheckItem[]> = {
  sql: [
    {
      id: "slow-query",
      prompt: "A dashboard query has become painfully slow as data grew. What's your first, most reliable move?",
      options: [
        { id: "a", text: "Rewrite it with more subqueries to look thorough.", score: 2 },
        { id: "b", text: "Add indexes on every column in the WHERE clause and re-run it to see whether it helps.", score: 5 },
        { id: "c", text: "Read the query plan to find the real bottleneck first.", score: 10 },
        { id: "d", text: "Cache the result and move on.", score: 3 },
      ],
    },
    {
      id: "join-dupes",
      prompt: "After a JOIN, your row counts are higher than expected and a SUM is inflated.",
      options: [
        { id: "a", text: "Check join-key cardinality — a one-to-many join is fanning out rows.", score: 10 },
        { id: "b", text: "Add DISTINCT to make the numbers look right.", score: 3 },
        { id: "c", text: "Divide the total by a fudge factor.", score: 0 },
        { id: "d", text: "Switch to a LEFT JOIN, re-run the query, and compare the row counts against the source tables.", score: 4 },
      ],
    },
    {
      id: "null-logic",
      prompt: "A stakeholder reports a customer count that doesn't match yours; you used a `<>` filter on a nullable column.",
      options: [
        { id: "a", text: "Report both numbers to the stakeholder without explaining the gap, and let them choose.", score: 5 },
        { id: "b", text: "Trust your number; theirs is probably wrong.", score: 3 },
        { id: "c", text: "Change to `=` and see if it matches.", score: 4 },
        { id: "d", text: "NULLs don't match `<>` — handle them explicitly and reconcile the definition.", score: 10 },
      ],
    },
    {
      id: "prod-update",
      prompt: "You need to fix bad rows in production with an UPDATE. What do you do first?",
      options: [
        { id: "a", text: "Update and rely on backups if it goes wrong.", score: 2 },
        { id: "b", text: "Run the same WHERE as a SELECT in a transaction first.", score: 10 },
        { id: "c", text: "Run the UPDATE directly and then check the affected-row count afterwards to confirm it looks right.", score: 4 },
        { id: "d", text: "Update everything and re-fix exceptions.", score: 0 },
      ],
    },
  ],
  react: [
    {
      id: "stale-state",
      prompt: "A component occasionally shows stale data after an async update. Where do you look first?",
      options: [
        { id: "a", text: "Add a key to force a remount and see if that makes the stale data go away.", score: 4 },
        { id: "b", text: "Sprinkle in more state until it behaves.", score: 1 },
        { id: "c", text: "Wrap everything in useMemo.", score: 2 },
        { id: "d", text: "Effect dependencies and closures capturing old state.", score: 10 },
      ],
    },
    {
      id: "perf",
      prompt: "A list re-renders too much and feels janky. Best-judgment first step?",
      options: [
        { id: "a", text: "Move all state to the top and pass props down.", score: 2 },
        { id: "b", text: "Profile to see what actually re-renders before optimising.", score: 10 },
        { id: "c", text: "Wrap every component in React.memo preemptively so nothing re-renders unless its props change.", score: 4 },
        { id: "d", text: "Add useCallback everywhere.", score: 3 },
      ],
    },
    {
      id: "ai-component",
      prompt: "An AI tool generates a React component that renders correctly in the happy path.",
      note: "No penalty for using AI — we care about verification.",
      options: [
        { id: "a", text: "Eyeball it in the browser and ship if it looks right.", score: 3 },
        { id: "b", text: "Ship it — it renders.", score: 1 },
        { id: "c", text: "Test loading, error and empty states, and check accessibility.", score: 10 },
        { id: "d", text: "Rewrite it from scratch so you fully understand every line of it before it goes anywhere near production.", score: 5 },
      ],
    },
    {
      id: "state-shape",
      prompt: "Two components need the same server data. What's the cleanest approach?",
      options: [
        { id: "a", text: "Share one source of truth (or a data layer) so it can't drift.", score: 10 },
        { id: "b", text: "Store it in a global for everything.", score: 5 },
        { id: "c", text: "Copy it into both via props and keep them in sync manually with effects.", score: 2 },
        { id: "d", text: "Fetch it independently in each component.", score: 4 },
      ],
    },
  ],
};

/** Universal applied-judgment fallback for skills with no specific/domain bank. */
function genericItems(skill: string): SkillCheckItem[] {
  const X = skill.trim() || "this skill";
  return [
    {
      id: "ambiguity",
      prompt: `You're handed a task that leans heavily on ${X}, but the requirements are ambiguous and the deadline is real. What do you do first?`,
      options: [
        { id: "a", text: "Ask an AI tool to spec it and build exactly what it says.", score: 3 },
        { id: "b", text: "Clarify the goal, constraints and definition of done first.", score: 10 },
        { id: "c", text: "Wait until someone gives you clearer requirements.", score: 2 },
        { id: "d", text: "Start on the part you're sure about and flag the rest early to whoever owns the requirements.", score: 7 },
      ],
    },
    {
      id: "verify",
      prompt: `An AI assistant produces a ${X} solution that looks right, but you didn't write it and can't fully explain it. How do you proceed?`,
      note: "There's no penalty for using AI here — we're interested in your judgment.",
      options: [
        { id: "a", text: "Ship it — it looks correct and saves time.", score: 2 },
        { id: "b", text: "Throw it away and rewrite it from scratch yourself, since you can't vouch for code you didn't write.", score: 4 },
        { id: "c", text: "Read it line by line until you can explain every part of it to a colleague.", score: 8 },
        { id: "d", text: "Test it on real and edge cases before trusting it.", score: 10 },
      ],
    },
    {
      id: "tradeoff",
      prompt: `You must trade off speed against quality on a ${X} deliverable due tomorrow. What's your move?`,
      options: [
        { id: "a", text: "Ship a correct, minimal version and flag what's deferred.", score: 10 },
        { id: "b", text: "Ask for more time before doing anything.", score: 5 },
        { id: "c", text: "Cut corners quietly and hope no one notices.", score: 1 },
        { id: "d", text: "Polish it fully even if it means missing the deadline.", score: 4 },
      ],
    },
    {
      id: "disagreement",
      prompt: `A teammate's ${X} approach differs sharply from yours and you think theirs is riskier. How do you handle it?`,
      options: [
        { id: "a", text: "Propose a small test to compare both approaches.", score: 9 },
        { id: "b", text: "Defer to them to avoid friction.", score: 3 },
        { id: "c", text: "Surface your reasoning, agree on criteria, let evidence decide.", score: 10 },
        { id: "d", text: "Insist on your approach — you're confident you're right, and changing course now would slow everyone down.", score: 3 },
      ],
    },
  ];
}

/**
 * Resolve the most specific applicable check for a skill: exact skill bank →
 * domain bank → universal fallback. Always returns a non-empty array
 * (prototype-named skills like "constructor" or "__proto__" can't escape it).
 */
export function itemsForSkill(skill: string): SkillCheckItem[] {
  const name = typeof skill === "string" ? skill : "";
  const key = normalizePhrase(name);
  if (Object.hasOwn(SKILL_ITEMS, key)) return SKILL_ITEMS[key]!;
  const cat = categoryOf(name);
  if (cat) return CATEGORY_ITEMS[cat](name.trim());
  return genericItems(name);
}

/**
 * Score chosen options → 0–100, by option id. Negative option scores (possible
 * in a custom HM quiz) count as 0; unknown ids and unanswered items earn 0.
 */
export function scoreSkillCheck(items: SkillCheckItem[], answers: Record<string, string>): number {
  if (!Array.isArray(items) || !answers || typeof answers !== "object") return 0;
  let earned = 0;
  let max = 0;
  for (const item of items) {
    if (!item || !Array.isArray(item.options)) continue;
    max += Math.max(0, ...item.options.map((o) => (Number.isFinite(o.score) ? o.score : 0)));
    const pick = Object.hasOwn(answers, item.id) ? answers[item.id] : undefined;
    const chosen = item.options.find((o) => o.id === pick);
    if (chosen && Number.isFinite(chosen.score)) earned += Math.max(0, chosen.score);
  }
  return max > 0 ? Math.max(0, Math.min(100, Math.round((earned / max) * 100))) : 0;
}

/** Passing an applied check verifies the skill. */
export const SKILL_CHECK_PASS = 70;
