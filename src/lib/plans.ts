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

  /** Premium capability flags (gate real features). */
  scoreSheets?: boolean;
  pipelineTools?: boolean;
  analytics?: boolean;
  priorityMatching?: boolean;
}

export const PLANS: Plan[] = [
  {
    key: "hm-starter",
    hat: "hiring_manager",
    name: "Starter",
    price: "Free",
    openRoleLimit: 1,
    paid: false,
    features: ["1 open role", "Pipeline & opt-in matching", "Auto-drafted pass feedback"],
  },
  {
    key: "hm-team",
    hat: "hiring_manager",
    name: "Team",
    price: "€149",
    cadence: "/mo · billed annually",
    openRoleLimit: 5,
    paid: true,
    highlight: true,
    scoreSheets: true,
    pipelineTools: true,
    features: ["Up to 5 open roles", "Full pipeline management", "Structured score sheets", "Up to 5 seats"],
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
    analytics: true,
    priorityMatching: true,
    features: ["Unlimited open roles", "Priority matching", "Hiring analytics", "Unlimited seats · SSO · DPA"],
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
    price: "€299",
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
