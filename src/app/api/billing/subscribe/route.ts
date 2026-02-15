import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";
import { HM_PLANS, HH_PLANS } from "@/lib/plans";
import type { HMPlanTier, HHPlanTier } from "@/types";

const subscribeSchema = z.object({
  plan: z.string(),
});

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (session.user.role === "HIRING_MANAGER") {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { companyId: true },
    });
    if (!user?.companyId) {
      return NextResponse.json({ plan: "STARTER", features: HM_PLANS.STARTER });
    }
    const subscription = await prisma.subscription.findUnique({
      where: { companyId: user.companyId },
    });
    const tier = (subscription?.plan || "STARTER") as HMPlanTier;
    return NextResponse.json({
      plan: tier,
      features: HM_PLANS[tier],
      subscription,
    });
  }

  if (session.user.role === "HEADHUNTER") {
    const profile = await prisma.headhunterProfile.findUnique({
      where: { userId: session.user.id },
      select: { id: true },
    });
    if (!profile) {
      return NextResponse.json({ plan: "FREE", features: HH_PLANS.FREE });
    }
    const subscription = await prisma.subscription.findUnique({
      where: { headhunterProfileId: profile.id },
    });
    const tier = (subscription?.plan || "FREE") as HHPlanTier;
    return NextResponse.json({
      plan: tier,
      features: HH_PLANS[tier],
      subscription,
    });
  }

  return NextResponse.json({ error: "No billing for this role" }, { status: 400 });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const data = subscribeSchema.parse(body);

    if (session.user.role === "HIRING_MANAGER") {
      if (!(data.plan in HM_PLANS)) {
        return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
      }
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { companyId: true },
      });
      if (!user?.companyId) {
        return NextResponse.json({ error: "No company" }, { status: 400 });
      }

      // Stubbed checkout: direct DB activation
      const subscription = await prisma.subscription.upsert({
        where: { companyId: user.companyId },
        update: {
          plan: data.plan,
          status: "ACTIVE",
          currentPeriodStart: new Date(),
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        },
        create: {
          companyId: user.companyId,
          plan: data.plan,
          status: "ACTIVE",
          currentPeriodStart: new Date(),
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        },
      });

      return NextResponse.json({
        plan: data.plan,
        features: HM_PLANS[data.plan as HMPlanTier],
        subscription,
      });
    }

    if (session.user.role === "HEADHUNTER") {
      if (!(data.plan in HH_PLANS)) {
        return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
      }
      const profile = await prisma.headhunterProfile.findUnique({
        where: { userId: session.user.id },
        select: { id: true },
      });
      if (!profile) {
        return NextResponse.json({ error: "No profile" }, { status: 400 });
      }

      const subscription = await prisma.subscription.upsert({
        where: { headhunterProfileId: profile.id },
        update: {
          plan: data.plan,
          status: "ACTIVE",
          currentPeriodStart: new Date(),
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        },
        create: {
          headhunterProfileId: profile.id,
          plan: data.plan,
          status: "ACTIVE",
          currentPeriodStart: new Date(),
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        },
      });

      return NextResponse.json({
        plan: data.plan,
        features: HH_PLANS[data.plan as HHPlanTier],
        subscription,
      });
    }

    return NextResponse.json({ error: "No billing for this role" }, { status: 400 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation failed" }, { status: 400 });
    }
    console.error("Subscribe error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
