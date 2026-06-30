/**
 * Billing reads — the current account's plan (defaults to the free tier) and
 * usage that drives plan gating.
 */
import type { Plan } from "../plans";
import { defaultPlan, planByKey } from "../plans";
import { prisma } from "../db";

export async function getActivePlan(
  userId: string,
  hat: Plan["hat"],
): Promise<{ plan: Plan; status: string }> {
  const sub = await prisma.subscription.findUnique({ where: { userId_hat: { userId, hat } } });
  const plan = (sub && planByKey(sub.plan)) || defaultPlan(hat);
  return { plan, status: sub?.status ?? "active" };
}

export async function countOpenRoles(userId: string): Promise<number> {
  return prisma.opening.count({ where: { company: { ownerId: userId } } });
}
