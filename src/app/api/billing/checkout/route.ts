import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { stripe, STRIPE_ENABLED, getPriceId } from "@/lib/stripe";
import { z } from "zod";
import { HM_PLANS, HH_PLANS } from "@/lib/plans";
import type { HMPlanTier, HHPlanTier } from "@/types";

const checkoutSchema = z.object({
  plan: z.string(),
});

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { plan } = checkoutSchema.parse(body);

  const role = session.user.role as "HIRING_MANAGER" | "HEADHUNTER";
  if (role !== "HIRING_MANAGER" && role !== "HEADHUNTER") {
    return NextResponse.json(
      { error: "Billing not available for this role" },
      { status: 400 }
    );
  }

  // Validate plan exists
  if (role === "HIRING_MANAGER" && !(plan in HM_PLANS)) {
    return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
  }
  if (role === "HEADHUNTER" && !(plan in HH_PLANS)) {
    return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
  }

  // Free plans don't need Stripe
  if (plan === "STARTER" || plan === "FREE") {
    return NextResponse.json(
      { error: "Cannot checkout for free plans" },
      { status: 400 }
    );
  }

  // If Stripe is not configured, fall back to stub activation
  if (!STRIPE_ENABLED || !stripe) {
    return await stubActivation(session.user.id, role, plan);
  }

  const priceId = getPriceId(role, plan);
  if (!priceId) {
    // Price ID not configured — fall back to stub
    return await stubActivation(session.user.id, role, plan);
  }

  try {
    const checkoutSession = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${process.env.NEXTAUTH_URL}/dashboard/${role === "HIRING_MANAGER" ? "hiring-manager" : "headhunter"}/billing?success=true`,
      cancel_url: `${process.env.NEXTAUTH_URL}/dashboard/${role === "HIRING_MANAGER" ? "hiring-manager" : "headhunter"}/billing?canceled=true`,
      metadata: {
        userId: session.user.id,
        role,
        plan,
      },
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error) {
    console.error("Stripe checkout error:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}

async function stubActivation(
  userId: string,
  role: "HIRING_MANAGER" | "HEADHUNTER",
  plan: string
) {
  const now = new Date();
  const periodEnd = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  if (role === "HIRING_MANAGER") {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { companyId: true },
    });
    if (!user?.companyId) {
      return NextResponse.json({ error: "No company" }, { status: 400 });
    }

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

    return NextResponse.json({
      stub: true,
      plan,
      features: HM_PLANS[plan as HMPlanTier],
    });
  }

  const profile = await prisma.headhunterProfile.findUnique({
    where: { userId },
    select: { id: true },
  });
  if (!profile) {
    return NextResponse.json({ error: "No profile" }, { status: 400 });
  }

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

  return NextResponse.json({
    stub: true,
    plan,
    features: HH_PLANS[plan as HHPlanTier],
  });
}
