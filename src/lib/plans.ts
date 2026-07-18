/**
 * Plan model. Holicruit's paying customers are organisations (hiring-manager
 * companies, training providers) — so paid tiers use a corporate flow (request
 * a quote → invoice / PO, annual contracts), not a consumer card checkout.
 * Candidates and recruiters are always free.
 */

export interface Plan {
  key: string;
  hat: "hiring_manager" | "provider";
  name: string;
  /** Display price. */
  price: string;
  cadence?: string;
  /** Max concurrent open roles (undefined = unlimited). */
  openRoleLimit?: number;
  /** Whether this tier can promote/sponsor programs. */
  canPromote?: boolean;
  /** Paid tiers go through the corporate quote/invoice flow. */
  paid: boolean;
  /** Top tier — "Contact sales". */
  enterprise?: boolean;
  highlight?: boolean;
  features: string[];

  /** Baseline capability flags (now table stakes — included free). */
  scoreSheets?: boolean;
  pipelineTools?: boolean;

  /** Premium capability flags (gate the differentiated, paid features). */
  talentPool?: boolean;       // Team+  — silver-medalist re-engagement
  calibration?: boolean;      // Team+  — custom role bar & hard/soft weighting
  decisionIntel?: boolean;    // Team+  — multi-interviewer consensus scoring
  interviewKit?: boolean;     // Team+  — AI-generated structured interview guides
  analytics?: boolean;        // Scale  — quality-of-hire & fairness analytics
  customAssessments?: boolean;// Scale  — company-specific scenario assessments
  priorityMatching?: boolean; // Scale  — wider net, surfaced first
}

export const PLANS: Plan[] = [
  {
    key: "hm-starter",
    hat: "hiring_manager",
    name: "Starter",
    price: "Free",
    openRoleLimit: 1,
    paid: false,
    // Pipeline + structured score sheets are table stakes — free for everyone.
    scoreSheets: true,
    pipelineTools: true,
    features: [
      "1 open role",
      "Full pipeline & opt-in matching",
      "Structured score sheets",
      "Auto-drafted Growth Report feedback",
    ],
  },
  {
    key: "hm-team",
    hat: "hiring_manager",
    name: "Team",
    price: "€500",
    cadence: "/mo · billed annually",
    openRoleLimit: 5,
    paid: true,
    highlight: true,
    scoreSheets: true,
    pipelineTools: true,
    talentPool: true,
    calibration: true,
    decisionIntel: true,
    interviewKit: true,
    features: [
      "Up to 5 open roles · 5 seats",
      "Silver-medalist talent pool",
      "AI-generated interview guides",
      "Custom role calibration",
      "Team decision intelligence",
    ],
  },
  {
    key: "hm-scale",
    hat: "hiring_manager",
    name: "Scale",
    price: "Custom",
    cadence: "annual contract",
    paid: true,
    enterprise: true,
    scoreSheets: true,
    pipelineTools: true,
    talentPool: true,
    calibration: true,
    decisionIntel: true,
    interviewKit: true,
    analytics: true,
    customAssessments: true,
    priorityMatching: true,
    features: [
      "Everything in Team, unlimited roles & seats",
      "Quality-of-hire & fairness analytics",
      "Company-specific assessments",
      "Priority matching · SSO · DPA",
    ],
  },
  {
    key: "provider-listed",
    hat: "provider",
    name: "Listed",
    price: "Free",
    canPromote: false,
    paid: false,
    features: ["Programs listed in the marketplace", "Ranked by real outcomes", "Gap-demand analytics"],
  },
  {
    key: "provider-partner",
    hat: "provider",
    name: "Partner",
    price: "€300",
    cadence: "/mo · billed annually",
    canPromote: true,
    paid: true,
    highlight: true,
    features: ["Everything in Listed", "Promoted / featured placement", "Targeted gap campaigns", "Priority support"],
  },
];

export const FREE_PLAN_KEY: Record<Plan["hat"], string> = {
  hiring_manager: "hm-starter",
  provider: "provider-listed",
};

export function planByKey(key: string): Plan | undefined {
  return PLANS.find((p) => p.key === key);
}

export function plansFor(hat: Plan["hat"]): Plan[] {
  return PLANS.filter((p) => p.hat === hat);
}

export function defaultPlan(hat: Plan["hat"]): Plan {
  return planByKey(FREE_PLAN_KEY[hat])!;
}
