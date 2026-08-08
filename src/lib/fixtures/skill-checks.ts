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
 *      education), else
 *   3. a universal applied-judgment fallback.
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

// ── Skill → category. Order matters: specific domains before broad ones. ──────
const CATEGORY_KEYWORDS: [Category, string[]][] = [
  [
    "quality",
    ["quality", "gmp", "gxp", "capa", "aseptic", "validation", "audit", "regulatory", "pharmacovig", "clinical research", "batch record", "deviation", "root cause"],
  ],
  ["healthcare", ["nurse", "clinical", "patient", "triage", "acls", "ehr", "epic", "ventilator", "medication", "critical care"]],
  ["data", ["machine learning", "deep learning", "data", "tableau", "power bi", "dbt", "snowflake", "spark", "sql", "analytics", "forecasting", "kafka", "elasticsearch"]],
  ["design", ["ux", "ui", "figma", "prototyp", "design system"]],
  ["product", ["product management", "product strategy", "roadmap", "user research", "product sense"]],
  ["pm", ["project management", "program management", "agile", "scrum", "stakeholder"]],
  ["sales", ["sales", "pipeline", "solution selling", "account", "negotiation", "crm", "quota", "discovery", "customer success", "salesforce"]],
  ["marketing", ["seo", "sem", "content marketing", "copywriting", "growth marketing", "demand generation"]],
  ["finance", ["financial modeling", "fp&a", "accounting", "bookkeeping", "payroll", "ifrs"]],
  ["ops", ["supply chain", "operations", "people operations", "recruiting"]],
  ["education", ["curriculum", "classroom", "teaching"]],
  [
    "engineering",
    ["typescript", "javascript", "react", "node", "python", "kubernetes", "docker", "aws", "gcp", "azure", "java", "kotlin", "swift", "go", "rust", "c++", "c#", "graphql", "grpc", "microservices", "ci/cd", "terraform", "system design", "next.js", "vue", "angular", "svelte", "redux", "rest", "git", "ruby", "php", "scala", "testing"],
  ],
];

function categoryOf(skill: string): Category | null {
  const s = skill.toLowerCase();
  for (const [cat, keys] of CATEGORY_KEYWORDS) {
    if (keys.some((k) => s.includes(k))) return cat;
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
        { id: "a", text: "Failure modes and edge cases the tests don't cover, plus how it behaves under load.", score: 10 },
        { id: "b", text: "Readability and naming so the team can maintain it.", score: 7 },
        { id: "c", text: "Whether it matches your personal style preferences.", score: 3 },
        { id: "d", text: "Trust the green CI and approve — tests passed.", score: 2 },
      ],
    },
    {
      id: "incident",
      prompt: `A ${X} change you shipped yesterday is implicated in a partial outage now. First move?`,
      options: [
        { id: "a", text: "Mitigate first (roll back / feature-flag off), then investigate root cause calmly.", score: 10 },
        { id: "b", text: "Dig into logs to fully understand it before touching anything.", score: 5 },
        { id: "c", text: "Push a quick hot-fix straight to prod based on your best guess.", score: 3 },
        { id: "d", text: "Wait to see if it resolves itself.", score: 1 },
      ],
    },
    {
      id: "ai-verify",
      prompt: `An AI assistant generates a ${X} implementation that looks right, but you can't fully explain it.`,
      note: "No penalty for using AI — we care about how you verify.",
      options: [
        { id: "a", text: "Test it against real and edge cases, and read it until you can explain it.", score: 10 },
        { id: "b", text: "Read it closely but skip writing tests if it looks clean.", score: 6 },
        { id: "c", text: "Ship it — it compiles and looks correct.", score: 2 },
        { id: "d", text: "Discard it and rewrite from scratch to be safe.", score: 4 },
      ],
    },
    {
      id: "debt",
      prompt: `You can ship a ${X} feature fast with a shortcut that will be costly to unwind later, or slower done cleanly. Deadline is real.`,
      options: [
        { id: "a", text: "Ship the clean minimal version; if you must take the shortcut, isolate it and log the debt.", score: 10 },
        { id: "b", text: "Take the shortcut and note it in a ticket to fix later.", score: 6 },
        { id: "c", text: "Take the shortcut quietly — you'll remember to fix it.", score: 2 },
        { id: "d", text: "Miss the deadline to do it perfectly.", score: 4 },
      ],
    },
  ],
  data: (X) => [
    {
      id: "surprise",
      prompt: `Your ${X} work produces a surprising result that happens to support what leadership wants to hear. Before you present it?`,
      options: [
        { id: "a", text: "Try hard to disprove it — check the pipeline, assumptions, and confounders first.", score: 10 },
        { id: "b", text: "Sanity-check the headline number and present with caveats.", score: 6 },
        { id: "c", text: "Present it — a clean result that lands well is a win.", score: 2 },
        { id: "d", text: "Bury it because surprising results cause trouble.", score: 1 },
      ],
    },
    {
      id: "messy",
      prompt: `A stakeholder needs a metric today, but the underlying data has nulls, duplicates, and inconsistent definitions.`,
      options: [
        { id: "a", text: "Deliver a defensible estimate with the caveats and definition you used, and flag the data gaps.", score: 10 },
        { id: "b", text: "Clean what you can and deliver the number without commentary.", score: 5 },
        { id: "c", text: "Give the raw number quickly — they need it now.", score: 2 },
        { id: "d", text: "Refuse until the data is fixed.", score: 3 },
      ],
    },
    {
      id: "leakage",
      prompt: `Your ${X} model scores well offline, but you suspect target leakage. Shipping it would hit this quarter's goal.`,
      options: [
        { id: "a", text: "Investigate and fix the leakage before shipping, even if it delays the goal.", score: 10 },
        { id: "b", text: "Ship with a monitoring plan and fix leakage in the next iteration.", score: 5 },
        { id: "c", text: "Ship it — offline metrics are strong.", score: 2 },
        { id: "d", text: "Drop the project to avoid the risk.", score: 3 },
      ],
    },
    {
      id: "ambiguity",
      prompt: `You're asked to "look into churn with ${X}" — no clear question, real deadline.`,
      options: [
        { id: "a", text: "Agree the decision this should inform, then scope the analysis to answer it.", score: 10 },
        { id: "b", text: "Start exploring and share early findings to converge.", score: 7 },
        { id: "c", text: "Build a broad dashboard of everything churn-related.", score: 4 },
        { id: "d", text: "Wait for a precise question.", score: 2 },
      ],
    },
  ],
  quality: (X) => [
    {
      id: "deviation",
      prompt: `During ${X} you notice a minor deviation in a batch record hours before a release deadline. It probably has no product impact.`,
      options: [
        { id: "a", text: "Document it and follow the deviation process — assessment decides impact, not the clock.", score: 10 },
        { id: "b", text: "Flag it to your lead and let them decide whether to record it.", score: 6 },
        { id: "c", text: "Note it informally and release, since impact looks negligible.", score: 2 },
        { id: "d", text: "Correct the record so it's clean and move on.", score: 0 },
      ],
    },
    {
      id: "sop-gap",
      prompt: `You find the line is doing a step differently from the approved SOP — and their way is arguably better.`,
      options: [
        { id: "a", text: "Stop the drift, document it, and raise a change control to update the SOP properly.", score: 10 },
        { id: "b", text: "Ask the line to follow the SOP for now and suggest a revision later.", score: 8 },
        { id: "c", text: "Let them continue since their way is better.", score: 2 },
        { id: "d", text: "Quietly update the SOP yourself to match practice.", score: 1 },
      ],
    },
    {
      id: "capa",
      prompt: `A CAPA is overdue and pressure is mounting to close it, but the root cause still isn't clear.`,
      options: [
        { id: "a", text: "Keep it open; a CAPA closed without a verified root cause isn't closed.", score: 10 },
        { id: "b", text: "Extend with a documented justification and interim controls.", score: 8 },
        { id: "c", text: "Close it citing the most likely cause to clear the metric.", score: 2 },
        { id: "d", text: "Close it and reopen if the issue recurs.", score: 1 },
      ],
    },
    {
      id: "audit",
      prompt: `An auditor asks a question and you're not certain of the answer.`,
      options: [
        { id: "a", text: "Say you'll confirm and follow up accurately, rather than guess.", score: 10 },
        { id: "b", text: "Give your best understanding, clearly labelled as such.", score: 6 },
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
        { id: "a", text: "Act on the safest reasonable interpretation while escalating and gathering more information.", score: 10 },
        { id: "b", text: "Follow protocol strictly even where it doesn't quite fit.", score: 6 },
        { id: "c", text: "Wait until you have complete information before acting.", score: 3 },
        { id: "d", text: "Go with your gut without escalating.", score: 3 },
      ],
    },
    {
      id: "protocol",
      prompt: `A protocol conflicts with what you're observing in front of you.`,
      options: [
        { id: "a", text: "Escalate the discrepancy immediately and document, rather than silently overriding.", score: 10 },
        { id: "b", text: "Follow the protocol and note your concern afterward.", score: 6 },
        { id: "c", text: "Do what you think is right and skip the paperwork.", score: 3 },
        { id: "d", text: "Ignore your observation — the protocol is the protocol.", score: 2 },
      ],
    },
    {
      id: "handoff",
      prompt: `You're handing off at end of shift and one detail is uncertain but potentially important.`,
      options: [
        { id: "a", text: "Flag the uncertainty explicitly in the handoff so the next person can watch for it.", score: 10 },
        { id: "b", text: "Mention it only if asked, to keep the handoff short.", score: 4 },
        { id: "c", text: "Leave it out — you're not sure it matters.", score: 1 },
        { id: "d", text: "Write a long note covering everything equally.", score: 5 },
      ],
    },
    {
      id: "speakup",
      prompt: `A more senior colleague is about to make what looks like an error.`,
      options: [
        { id: "a", text: "Speak up clearly and respectfully, focused on the specific concern.", score: 10 },
        { id: "b", text: "Ask a clarifying question to prompt a second look.", score: 8 },
        { id: "c", text: "Stay quiet — they outrank you.", score: 1 },
        { id: "d", text: "Report it afterward instead of raising it now.", score: 3 },
      ],
    },
  ],
  design: (X) => [
    {
      id: "evidence",
      prompt: `User testing contradicts a ${X} direction a senior stakeholder loves.`,
      options: [
        { id: "a", text: "Show the evidence neutrally and propose a small test to decide together.", score: 10 },
        { id: "b", text: "Redesign toward the evidence and present it as an option.", score: 8 },
        { id: "c", text: "Go with the stakeholder — they have the final say.", score: 3 },
        { id: "d", text: "Insist on your data-backed design.", score: 4 },
      ],
    },
    {
      id: "a11y",
      prompt: `A tight deadline tempts you to skip accessibility on a ${X} deliverable.`,
      options: [
        { id: "a", text: "Keep the essentials (contrast, focus, labels) — they're not optional — and cut scope elsewhere.", score: 10 },
        { id: "b", text: "Ship now and add accessibility in a fast follow.", score: 5 },
        { id: "c", text: "Skip it — few users need it.", score: 1 },
        { id: "d", text: "Miss the deadline to make it perfect.", score: 4 },
      ],
    },
    {
      id: "consistency",
      prompt: `A one-off request would break the design system's consistency but pleases one team.`,
      options: [
        { id: "a", text: "Solve their need within the system, or propose a system change if it's a real pattern.", score: 10 },
        { id: "b", text: "Make the exception and document it.", score: 5 },
        { id: "c", text: "Give them exactly what they asked for.", score: 3 },
        { id: "d", text: "Refuse outright to protect the system.", score: 4 },
      ],
    },
    {
      id: "ambiguity",
      prompt: `A ${X} brief is vague and the deadline is real.`,
      options: [
        { id: "a", text: "Align on the user problem and success criteria before pushing pixels.", score: 10 },
        { id: "b", text: "Sketch a few directions to react to.", score: 8 },
        { id: "c", text: "Polish one idea you like.", score: 4 },
        { id: "d", text: "Wait for a clearer brief.", score: 2 },
      ],
    },
  ],
  product: (X) => [
    {
      id: "conflict",
      prompt: `Two teams want conflicting features, the data is thin, and you (${X}) must decide.`,
      options: [
        { id: "a", text: "Tie the call to the outcome/metric it should move and the cheapest way to learn.", score: 10 },
        { id: "b", text: "Ship a small version of both and measure.", score: 7 },
        { id: "c", text: "Pick the louder stakeholder to keep the peace.", score: 2 },
        { id: "d", text: "Delay until the data is conclusive.", score: 4 },
      ],
    },
    {
      id: "vanity",
      prompt: `A headline metric is up, but support tickets and churn signals are rising too.`,
      options: [
        { id: "a", text: "Dig past the vanity metric to the user outcome before celebrating.", score: 10 },
        { id: "b", text: "Report both and investigate the tension.", score: 8 },
        { id: "c", text: "Report the win — the metric is the target.", score: 2 },
        { id: "d", text: "Assume tickets are unrelated.", score: 2 },
      ],
    },
    {
      id: "scope",
      prompt: `You're over scope a week from launch.`,
      options: [
        { id: "a", text: "Cut to the smallest thing that delivers the core value and ship it.", score: 10 },
        { id: "b", text: "Ask for a short extension with a clear plan.", score: 6 },
        { id: "c", text: "Push the team to work overtime to fit it all.", score: 3 },
        { id: "d", text: "Ship everything half-finished.", score: 1 },
      ],
    },
    {
      id: "ai-verify",
      prompt: `An AI tool drafts a ${X} plan that reads convincingly.`,
      note: "No penalty for using AI — we care about your judgment.",
      options: [
        { id: "a", text: "Pressure-test its assumptions against real user and business constraints before adopting.", score: 10 },
        { id: "b", text: "Use it as a first draft and revise heavily.", score: 8 },
        { id: "c", text: "Adopt it — it's well-argued.", score: 2 },
        { id: "d", text: "Ignore it entirely.", score: 4 },
      ],
    },
  ],
  pm: (X) => [
    {
      id: "slip",
      prompt: `A dependency slips and threatens your ${X} milestone.`,
      options: [
        { id: "a", text: "Re-plan the critical path, communicate impact early, and propose options.", score: 10 },
        { id: "b", text: "Push the owner hard to catch up.", score: 5 },
        { id: "c", text: "Hold the date and hope it recovers.", score: 2 },
        { id: "d", text: "Wait until it's clearly late to raise it.", score: 1 },
      ],
    },
    {
      id: "creep",
      prompt: `A stakeholder adds "just one more thing" mid-sprint.`,
      options: [
        { id: "a", text: "Make the trade-off explicit: what moves out if this comes in, and let the owner decide.", score: 10 },
        { id: "b", text: "Absorb it if small and note it.", score: 5 },
        { id: "c", text: "Say yes to keep them happy.", score: 2 },
        { id: "d", text: "Refuse — the sprint is locked.", score: 4 },
      ],
    },
    {
      id: "priority",
      prompt: `Two senior stakeholders disagree on what's top priority.`,
      options: [
        { id: "a", text: "Surface the shared goal and the trade-offs, and drive to an explicit decision.", score: 10 },
        { id: "b", text: "Escalate to their manager for a ruling.", score: 6 },
        { id: "c", text: "Pick one and hope the other doesn't notice.", score: 1 },
        { id: "d", text: "Try to do both at once.", score: 3 },
      ],
    },
    {
      id: "status",
      prompt: `A project is quietly going off-track. The next steering update is in a week.`,
      options: [
        { id: "a", text: "Raise it now with impact and options, rather than waiting for the scheduled update.", score: 10 },
        { id: "b", text: "Prepare a full analysis for the scheduled update.", score: 5 },
        { id: "c", text: "Wait — you might still recover before then.", score: 2 },
        { id: "d", text: "Mention it informally to one ally.", score: 4 },
      ],
    },
  ],
  sales: (X) => [
    {
      id: "discount",
      prompt: `Early in ${X}, a prospect immediately asks for a big discount.`,
      options: [
        { id: "a", text: "Explore the need and value first — anchor on fit before price.", score: 10 },
        { id: "b", text: "Offer a modest discount tied to a commitment.", score: 6 },
        { id: "c", text: "Give the discount to keep them engaged.", score: 3 },
        { id: "d", text: "Refuse to discuss price at all.", score: 3 },
      ],
    },
    {
      id: "quota",
      prompt: `You're behind quota with two days left in the quarter.`,
      options: [
        { id: "a", text: "Focus on the few deals with real, verifiable next steps and remove blockers.", score: 10 },
        { id: "b", text: "Blast every open opportunity with a discount offer.", score: 4 },
        { id: "c", text: "Pull deals forward that aren't ready, risking churn.", score: 2 },
        { id: "d", text: "Sandbag and roll them to next quarter.", score: 3 },
      ],
    },
    {
      id: "ghost",
      prompt: `A deal you forecast as "committed" just went silent.`,
      options: [
        { id: "a", text: "Re-qualify honestly and adjust the forecast — hope isn't a stage.", score: 10 },
        { id: "b", text: "Keep it committed and chase the champion harder.", score: 4 },
        { id: "c", text: "Leave the forecast as-is until the deadline.", score: 2 },
        { id: "d", text: "Mark it closed-won optimistically.", score: 1 },
      ],
    },
    {
      id: "overpromise",
      prompt: `A prospect will sign today if you promise a feature that doesn't exist yet.`,
      options: [
        { id: "a", text: "Be honest about what exists and what's on the roadmap; don't commit what you can't deliver.", score: 10 },
        { id: "b", text: "Loop in product to confirm before promising anything.", score: 9 },
        { id: "c", text: "Promise it — sales can sort out delivery later.", score: 1 },
        { id: "d", text: "Imply it's coming without saying so directly.", score: 2 },
      ],
    },
  ],
  marketing: (X) => [
    {
      id: "attribution",
      prompt: `A ${X} campaign metric spikes, but attribution is murky.`,
      options: [
        { id: "a", text: "Validate the lift against a holdout/baseline before crediting the campaign.", score: 10 },
        { id: "b", text: "Report the spike with clear caveats about attribution.", score: 7 },
        { id: "c", text: "Claim the win — the number is up.", score: 2 },
        { id: "d", text: "Ignore it as noise.", score: 3 },
      ],
    },
    {
      id: "brand",
      prompt: `A tactic would boost short-term conversions but risks the brand's credibility.`,
      options: [
        { id: "a", text: "Weigh lifetime value and trust, not just the conversion bump; avoid eroding credibility.", score: 10 },
        { id: "b", text: "Test it small and watch brand signals.", score: 7 },
        { id: "c", text: "Run it — conversions are the target.", score: 2 },
        { id: "d", text: "Reject any aggressive tactic on principle.", score: 4 },
      ],
    },
    {
      id: "abtest",
      prompt: `An A/B test is inconclusive and the launch is tomorrow.`,
      options: [
        { id: "a", text: "Default to the safer/reversible option and note the test was inconclusive.", score: 10 },
        { id: "b", text: "Extend the test and delay if you can.", score: 6 },
        { id: "c", text: "Pick the variant you personally prefer.", score: 3 },
        { id: "d", text: "Call a small, non-significant difference a winner.", score: 1 },
      ],
    },
    {
      id: "ambiguity",
      prompt: `You're told to "grow the funnel with ${X}" with no specific target.`,
      options: [
        { id: "a", text: "Define the stage and metric to move, then design experiments around it.", score: 10 },
        { id: "b", text: "Launch a few channels and measure.", score: 6 },
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
        { id: "a", text: "Show the result across a range of that assumption and make the sensitivity explicit.", score: 10 },
        { id: "b", text: "Use a conservative value and note it.", score: 7 },
        { id: "c", text: "Keep the aggressive assumption — it supports the case.", score: 2 },
        { id: "d", text: "Remove the driver to avoid the issue.", score: 3 },
      ],
    },
    {
      id: "reconcile",
      prompt: `At close, a reconciliation is off by a small, immaterial amount and time is tight.`,
      options: [
        { id: "a", text: "Investigate the cause — small differences can hide real errors — then decide with a documented rationale.", score: 10 },
        { id: "b", text: "Post a plug and flag it for review next cycle.", score: 5 },
        { id: "c", text: "Ignore it since it's immaterial.", score: 2 },
        { id: "d", text: "Adjust another line to make it balance.", score: 0 },
      ],
    },
    {
      id: "forecast",
      prompt: `Leadership pressures you to present a rosier forecast than the numbers support.`,
      options: [
        { id: "a", text: "Present the honest base case with clearly labelled upside/downside scenarios.", score: 10 },
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
        { id: "a", text: "Trace the formulas and reconcile to source data before trusting the output.", score: 10 },
        { id: "b", text: "Spot-check the key numbers and assumptions.", score: 7 },
        { id: "c", text: "Use it as-is — it's well formatted.", score: 1 },
        { id: "d", text: "Rebuild it from scratch to be safe.", score: 5 },
      ],
    },
  ],
  ops: (X) => [
    {
      id: "sla",
      prompt: `A supplier misses SLA during your peak period (${X}).`,
      options: [
        { id: "a", text: "Trigger the contingency plan, communicate to those affected, and fix the process gap after.", score: 10 },
        { id: "b", text: "Escalate to the supplier and wait for their fix.", score: 5 },
        { id: "c", text: "Absorb the hit quietly this once.", score: 3 },
        { id: "d", text: "Switch suppliers immediately mid-peak.", score: 2 },
      ],
    },
    {
      id: "bottleneck",
      prompt: `A recurring bottleneck keeps causing delays. A quick patch exists and a slower structural fix.`,
      options: [
        { id: "a", text: "Patch to stop the bleeding now, then schedule the structural fix so it doesn't recur.", score: 10 },
        { id: "b", text: "Go straight for the structural fix.", score: 6 },
        { id: "c", text: "Keep patching each time it happens.", score: 3 },
        { id: "d", text: "Live with it — it's manageable.", score: 2 },
      ],
    },
    {
      id: "floor",
      prompt: `The dashboard says the process is fine, but the floor team says it isn't.`,
      options: [
        { id: "a", text: "Go see for yourself and reconcile the data with what's actually happening.", score: 10 },
        { id: "b", text: "Trust the team and adjust the process.", score: 6 },
        { id: "c", text: "Trust the dashboard — data over anecdote.", score: 3 },
        { id: "d", text: "Ask for more reports.", score: 4 },
      ],
    },
    {
      id: "ambiguity",
      prompt: `You're told to "improve efficiency in ${X}" with no specific target.`,
      options: [
        { id: "a", text: "Find the biggest constraint with data, then target that before anything else.", score: 10 },
        { id: "b", text: "Interview the team for the worst pain points.", score: 7 },
        { id: "c", text: "Optimise whatever is easiest to change.", score: 3 },
        { id: "d", text: "Wait for a specific goal.", score: 2 },
      ],
    },
  ],
  education: (X) => [
    {
      id: "notlanding",
      prompt: `Mid-lesson, it's clear a ${X} concept isn't landing for most of the class.`,
      options: [
        { id: "a", text: "Adapt in the moment — try a different explanation or example and check understanding.", score: 10 },
        { id: "b", text: "Finish the plan and revisit it next time.", score: 4 },
        { id: "c", text: "Push on — the plan is the plan.", score: 2 },
        { id: "d", text: "Blame the material and move on.", score: 1 },
      ],
    },
    {
      id: "assess",
      prompt: `You must choose between an engaging activity and one that better assesses learning.`,
      options: [
        { id: "a", text: "Combine them — build a check for understanding into the engaging activity.", score: 10 },
        { id: "b", text: "Assess now; engagement can come later.", score: 6 },
        { id: "c", text: "Go for engagement — assessment can wait.", score: 4 },
        { id: "d", text: "Do a standard test regardless of fit.", score: 3 },
      ],
    },
    {
      id: "struggling",
      prompt: `One student is falling behind while the rest are ready to move on.`,
      options: [
        { id: "a", text: "Keep the class moving and set up targeted support for the student.", score: 10 },
        { id: "b", text: "Slow the whole class to bring them along.", score: 4 },
        { id: "c", text: "Move on and hope they catch up.", score: 2 },
        { id: "d", text: "Focus on the student and let the class idle.", score: 3 },
      ],
    },
    {
      id: "ambiguity",
      prompt: `A ${X} objective is vague and you have limited class time.`,
      options: [
        { id: "a", text: "Define what students should be able to do by the end, then design backward from it.", score: 10 },
        { id: "b", text: "Cover the material and see what sticks.", score: 5 },
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
        { id: "a", text: "Read the query plan to find the actual bottleneck before changing anything.", score: 10 },
        { id: "b", text: "Add indexes on the columns in the WHERE clause and hope it helps.", score: 5 },
        { id: "c", text: "Rewrite it with more subqueries to look thorough.", score: 2 },
        { id: "d", text: "Cache the result and move on.", score: 3 },
      ],
    },
    {
      id: "join-dupes",
      prompt: "After a JOIN, your row counts are higher than expected and a SUM is inflated.",
      options: [
        { id: "a", text: "Check the join keys' cardinality — a one-to-many join is likely fanning out rows.", score: 10 },
        { id: "b", text: "Add DISTINCT to make the numbers look right.", score: 3 },
        { id: "c", text: "Divide the total by a fudge factor.", score: 0 },
        { id: "d", text: "Switch to a LEFT JOIN and re-run.", score: 4 },
      ],
    },
    {
      id: "null-logic",
      prompt: "A stakeholder reports a customer count that doesn't match yours; you used a `<>` filter on a nullable column.",
      options: [
        { id: "a", text: "Remember NULLs don't match `<>` — account for them explicitly and reconcile the definition.", score: 10 },
        { id: "b", text: "Trust your number; theirs is probably wrong.", score: 3 },
        { id: "c", text: "Change to `=` and see if it matches.", score: 4 },
        { id: "d", text: "Report both numbers without explaining the gap.", score: 5 },
      ],
    },
    {
      id: "prod-update",
      prompt: "You need to fix bad rows in production with an UPDATE. What do you do first?",
      options: [
        { id: "a", text: "Run the exact WHERE as a SELECT in a transaction to confirm the affected rows before updating.", score: 10 },
        { id: "b", text: "Run the UPDATE and check the affected-row count after.", score: 4 },
        { id: "c", text: "Update and rely on backups if it goes wrong.", score: 2 },
        { id: "d", text: "Update everything and re-fix exceptions.", score: 0 },
      ],
    },
  ],
  react: [
    {
      id: "stale-state",
      prompt: "A component occasionally shows stale data after an async update. Where do you look first?",
      options: [
        { id: "a", text: "Effect dependencies and closures capturing old state — the usual cause of staleness.", score: 10 },
        { id: "b", text: "Add a key to force a remount and see if it fixes it.", score: 4 },
        { id: "c", text: "Sprinkle in more state until it behaves.", score: 1 },
        { id: "d", text: "Wrap everything in useMemo.", score: 2 },
      ],
    },
    {
      id: "perf",
      prompt: "A list re-renders too much and feels janky. Best-judgment first step?",
      options: [
        { id: "a", text: "Profile to find what's actually re-rendering before optimising.", score: 10 },
        { id: "b", text: "Wrap every component in React.memo preemptively.", score: 4 },
        { id: "c", text: "Move all state to the top and pass props down.", score: 2 },
        { id: "d", text: "Add useCallback everywhere.", score: 3 },
      ],
    },
    {
      id: "ai-component",
      prompt: "An AI tool generates a React component that renders correctly in the happy path.",
      note: "No penalty for using AI — we care about verification.",
      options: [
        { id: "a", text: "Test loading, error, and empty states and check accessibility before trusting it.", score: 10 },
        { id: "b", text: "Eyeball it in the browser and ship if it looks right.", score: 3 },
        { id: "c", text: "Ship it — it renders.", score: 1 },
        { id: "d", text: "Rewrite it from scratch.", score: 5 },
      ],
    },
    {
      id: "state-shape",
      prompt: "Two components need the same server data. What's the cleanest approach?",
      options: [
        { id: "a", text: "Lift/share the source of truth (or use a data layer) so it isn't duplicated and drifting.", score: 10 },
        { id: "b", text: "Fetch it independently in each component.", score: 4 },
        { id: "c", text: "Copy it into both via props and sync manually.", score: 2 },
        { id: "d", text: "Store it in a global for everything.", score: 5 },
      ],
    },
  ],
};

/** Universal applied-judgment fallback for skills with no specific/domain bank. */
function genericItems(skill: string): SkillCheckItem[] {
  const X = skill;
  return [
    {
      id: "ambiguity",
      prompt: `You're handed a task that leans heavily on ${X}, but the requirements are ambiguous and the deadline is real. What do you do first?`,
      options: [
        { id: "a", text: "Clarify the goal, constraints, and definition of done before building.", score: 10 },
        { id: "b", text: "Start on the part you're sure about and flag the rest early.", score: 7 },
        { id: "c", text: "Ask an AI tool to spec it and build exactly what it says.", score: 3 },
        { id: "d", text: "Wait until someone gives you clearer requirements.", score: 2 },
      ],
    },
    {
      id: "verify",
      prompt: `An AI assistant produces a ${X} solution that looks right, but you didn't write it and can't fully explain it. How do you proceed?`,
      note: "There's no penalty for using AI here — we're interested in your judgment.",
      options: [
        { id: "a", text: "Test it against real cases and edge cases before trusting it.", score: 10 },
        { id: "b", text: "Read it line by line until you can explain every part.", score: 8 },
        { id: "c", text: "Ship it — it looks correct and saves time.", score: 2 },
        { id: "d", text: "Throw it away and rewrite from scratch to be safe.", score: 4 },
      ],
    },
    {
      id: "tradeoff",
      prompt: `You must trade off speed against quality on a ${X} deliverable due tomorrow. What's your move?`,
      options: [
        { id: "a", text: "Ship a correct, minimal version and clearly flag what's deferred.", score: 10 },
        { id: "b", text: "Polish it fully even if it means missing the deadline.", score: 4 },
        { id: "c", text: "Cut corners quietly and hope no one notices.", score: 1 },
        { id: "d", text: "Ask for more time before doing anything.", score: 5 },
      ],
    },
    {
      id: "disagreement",
      prompt: `A teammate's ${X} approach differs sharply from yours and you think theirs is riskier. How do you handle it?`,
      options: [
        { id: "a", text: "Surface your reasoning, agree on the criteria, and let the evidence decide.", score: 10 },
        { id: "b", text: "Propose a small test to compare both approaches.", score: 9 },
        { id: "c", text: "Defer to them to avoid friction.", score: 3 },
        { id: "d", text: "Insist on your approach — you're confident you're right.", score: 3 },
      ],
    },
  ];
}

/**
 * Resolve the most specific applicable check for a skill: exact skill bank →
 * domain bank → universal fallback.
 */
export function itemsForSkill(skill: string): SkillCheckItem[] {
  const specific = SKILL_ITEMS[skill.toLowerCase()];
  if (specific) return specific;
  const cat = categoryOf(skill);
  if (cat) return CATEGORY_ITEMS[cat](skill);
  return genericItems(skill);
}

/** Score chosen options → 0–100. */
export function scoreSkillCheck(
  items: SkillCheckItem[],
  answers: Record<string, string>,
): number {
  let earned = 0;
  let max = 0;
  for (const item of items) {
    max += Math.max(0, ...item.options.map((o) => o.score));
    const chosen = item.options.find((o) => o.id === answers[item.id]);
    if (chosen) earned += chosen.score;
  }
  return max > 0 ? Math.round((earned / max) * 100) : 0;
}

/** Passing an applied check verifies the skill. */
export const SKILL_CHECK_PASS = 70;
