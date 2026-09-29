"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/persona";
import { planByKey } from "@/lib/plans";

/**
 * Choose a plan. Free tiers activate instantly; paid tiers are the corporate
 * flow — the form collects the billing organisation's details and we record the
 * plan as active with an invoice to follow (no card checkout). Stripe could back
 * the invoicing later without changing this action's contract.
 */
export async function choosePlan(formData: FormData): Promise<void> {
  const user = await requireUser();
  const plan = planByKey(String(formData.get("plan") ?? ""));
  if (!plan) redirect("/select-role");

  await prisma.subscription.upsert({
    where: { userId_hat: { userId: user.id, hat: plan.hat } },
    update: { plan: plan.key, status: "active" },
    create: { userId: user.id, hat: plan.hat, plan: plan.key, status: "active" },
  });

  const billing = plan.hat === "hiring_manager" ? "/hiring-manager/billing" : "/provider/billing";
  revalidatePath(billing);
  revalidatePath(plan.hat === "hiring_manager" ? "/hiring-manager/roles" : "/provider");
  redirect(`${billing}?activated=${plan.key}`);
}

/** Enterprise "Contact sales" — records a lead (never silently lost); sales follows up. */
export async function contactSales(formData: FormData): Promise<void> {
  const user = await requireUser();
  const hat = String(formData.get("hat") ?? "hiring_manager");
  await prisma.lead.create({
    data: {
      name: String(formData.get("name") ?? "").trim() || user.name,
      email: String(formData.get("email") ?? "").trim().toLowerCase() || user.email,
      company: String(formData.get("company") ?? "").trim() || null,
      message: String(formData.get("message") ?? "").trim() || null,
      source: "sales",
      plan: String(formData.get("plan") ?? "").trim() || (hat === "provider" ? "provider-partner" : "hm-scale"),
    },
  });
  const billing = hat === "provider" ? "/provider/billing" : "/hiring-manager/billing";
  redirect(`${billing}?contacted=1`);
}
