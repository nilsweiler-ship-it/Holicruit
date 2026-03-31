import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { stripe, STRIPE_ENABLED } from "@/lib/stripe";

export async function POST(req: Request) {
  if (!STRIPE_ENABLED || !stripe) {
    return NextResponse.json(
      { error: "Stripe not configured" },
      { status: 400 }
    );
  }

  const body = await req.text();
  const sig = req.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!sig || !webhookSecret) {
    return NextResponse.json(
      { error: "Missing signature or webhook secret" },
      { status: 400 }
    );
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object;
      const { userId, role, plan } = session.metadata || {};
      if (!userId || !role || !plan) break;

      const now = new Date();
      const periodEnd = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

      if (role === "HIRING_MANAGER") {
        const user = await prisma.user.findUnique({
          where: { id: userId },
          select: { companyId: true },
        });
        if (user?.companyId) {
          await prisma.subscription.upsert({
            where: { companyId: user.companyId },
            update: {
              plan,
              status: "ACTIVE",
              currentPeriodStart: now,
              currentPeriodEnd: periodEnd,
            },
            create: {
              companyId: user.companyId,
              plan,
              status: "ACTIVE",
              currentPeriodStart: now,
              currentPeriodEnd: periodEnd,
            },
          });
        }
      } else if (role === "HEADHUNTER") {
        const profile = await prisma.headhunterProfile.findUnique({
          where: { userId },
          select: { id: true },
        });
        if (profile) {
          await prisma.subscription.upsert({
            where: { headhunterProfileId: profile.id },
            update: {
              plan,
              status: "ACTIVE",
              currentPeriodStart: now,
              currentPeriodEnd: periodEnd,
            },
            create: {
              headhunterProfileId: profile.id,
              plan,
              status: "ACTIVE",
              currentPeriodStart: now,
              currentPeriodEnd: periodEnd,
            },
          });
        }
      }
      break;
    }

    case "customer.subscription.deleted": {
      const subscription = event.data.object;
      const { userId, role } = subscription.metadata || {};
      if (!userId || !role) break;

      if (role === "HIRING_MANAGER") {
        const user = await prisma.user.findUnique({
          where: { id: userId },
          select: { companyId: true },
        });
        if (user?.companyId) {
          await prisma.subscription.update({
            where: { companyId: user.companyId },
            data: { status: "CANCELLED", plan: "STARTER" },
          });
        }
      } else if (role === "HEADHUNTER") {
        const profile = await prisma.headhunterProfile.findUnique({
          where: { userId },
          select: { id: true },
        });
        if (profile) {
          await prisma.subscription.update({
            where: { headhunterProfileId: profile.id },
            data: { status: "CANCELLED", plan: "FREE" },
          });
        }
      }
      break;
    }
  }

  return NextResponse.json({ received: true });
}
