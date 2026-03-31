import Stripe from "stripe";

if (!process.env.STRIPE_SECRET_KEY) {
  console.warn(
    "STRIPE_SECRET_KEY not set — Stripe checkout will fall back to stub mode"
  );
}

export const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2026-03-25.dahlia" })
  : null;

export const STRIPE_ENABLED = !!stripe;

// Map internal plan tiers to Stripe Price IDs (set in env)
export const PRICE_IDS: Record<string, string | undefined> = {
  // Hiring Manager plans
  HM_PROFESSIONAL: process.env.STRIPE_PRICE_HM_PROFESSIONAL,
  HM_ENTERPRISE: process.env.STRIPE_PRICE_HM_ENTERPRISE,
  // Headhunter plans
  HH_PRO: process.env.STRIPE_PRICE_HH_PRO,
};

export function getPriceId(
  role: "HIRING_MANAGER" | "HEADHUNTER",
  plan: string
): string | undefined {
  if (role === "HIRING_MANAGER") {
    return PRICE_IDS[`HM_${plan}`];
  }
  return PRICE_IDS[`HH_${plan}`];
}
