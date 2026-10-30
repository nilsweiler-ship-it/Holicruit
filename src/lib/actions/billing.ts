"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { assertHat } from "@/lib/access";
import { planByKey } from "@/lib/plans";

/**
 * Choose a plan. Only FREE tiers can be self-selected here. Paid tiers are the
 * corporate flow (contactSales → quote → invoice/PO) and are activated by us
 * once terms are agreed — never by this action.
 */
export async function choosePlan(formData: FormData): Promise<void> {
  const plan = planByKey(String(formData.get("plan") ?? ""));
  if (!plan) redirect("/select-role");
  const user = await assertHat(plan.hat);
  const billingPath = plan.hat === "hiring_manager" ? "/hiring-manager/billing" : "/provider/billing";
  if (plan.paid || plan.enterprise) redirect(billingPath);

  await prisma.subscription.upsert({
    where: { userId_hat: { userId: user.id, hat: plan.hat } },
    update: { plan: plan.key, status: "active" },
    create: { userId: user.id, hat: plan.hat, plan: plan.key, status: "active" },
  });

  revalidatePath(billingPath);
  revalidatePath(plan.hat === "hiring_manager" ? "/hiring-manager/roles" : "/provider");
  redirect(`${billingPath}?activated=${encodeURIComponent(plan.key)}`);
}

/** Enterprise "Contact sales" — records a lead (never silently lost); sales follows up. */
export async function contactSales(formData: FormData): Promise<void> {
  const hat = String(formData.get("hat") ?? "hiring_manager") === "provider" ? "provider" : "hiring_manager";
  const user = await assertHat(hat);
  // Only a real plan of this hat; default to the hat's top tier ("Contact sales").
  const requested = planByKey(String(formData.get("plan") ?? "").trim());
  const plan = requested && requested.hat === hat ? requested : undefined;
  const planKey = plan?.key ?? (hat === "provider" ? "provider-partner" : "hm-scale");
  await prisma.lead.create({
    data: {
      name: String(formData.get("name") ?? "").trim().slice(0, 120) || user.name,
      email: String(formData.get("email") ?? "").trim().toLowerCase().slice(0, 200) || user.email,
      company: String(formData.get("company") ?? "").trim().slice(0, 160) || null,
      message: String(formData.get("message") ?? "").trim().slice(0, 4000) || null,
      source: "sales",
      plan: planKey,
    },
  });
  const billing = hat === "provider" ? "/provider/billing" : "/hiring-manager/billing";
  // The banner names the plan the request was about.
  redirect(`${billing}?contacted=${encodeURIComponent(planKey)}`);
}
