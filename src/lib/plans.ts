import { prisma } from "@/lib/db";
import type {
  HMPlanTier,
  HHPlanTier,
  PlanFeatures,
  HHPlanFeatures,
  QuotaCheckResult,
} from "@/types";

// Static plan definitions
export const HM_PLANS: Record<HMPlanTier, PlanFeatures & { price: number; label: string }> = {
  STARTER: {
    label: "Starter",
    price: 0,
    activeRoles: 2,
    appsPerRole: 10,
    matchScoring: "score_only",
    gapAnalysis: false,
    teamMembers: 1,
  },
  PROFESSIONAL: {
    label: "Professional",
    price: 99,
    activeRoles: 10,
    appsPerRole: 50,
    matchScoring: "full_breakdown",
    gapAnalysis: true,
    teamMembers: 5,
  },
  ENTERPRISE: {
    label: "Enterprise",
    price: 299,
    activeRoles: -1,
    appsPerRole: -1,
    matchScoring: "full_custom",
    gapAnalysis: true,
    teamMembers: -1,
  },
};

export const HH_PLANS: Record<HHPlanTier, HHPlanFeatures & { price: number; label: string }> = {
  FREE: {
    label: "Free",
    price: 0,
    roleClaims: 3,
    monthlySubmissions: 10,
    candidateProfiles: "browse",
  },
  PRO: {
    label: "Pro",
    price: 49,
    roleClaims: -1,
    monthlySubmissions: -1,
    candidateProfiles: "full_access",
  },
};

export type QuotaAction =
  | "CREATE_ROLE"
  | "APPLY_TO_ROLE"
  | "CLAIM_ROLE"
  | "HH_SUBMIT"
  | "VIEW_GAP_REPORT";

export async function getHMPlan(userId: string): Promise<HMPlanTier> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { companyId: true },
  });
  if (!user?.companyId) return "STARTER";

  const subscription = await prisma.subscription.findUnique({
    where: { companyId: user.companyId },
  });
  if (!subscription || subscription.status !== "ACTIVE") return "STARTER";
  return subscription.plan as HMPlanTier;
}

export async function getHHPlan(userId: string): Promise<HHPlanTier> {
  const profile = await prisma.headhunterProfile.findUnique({
    where: { userId },
    select: { id: true },
  });
  if (!profile) return "FREE";

  const subscription = await prisma.subscription.findUnique({
    where: { headhunterProfileId: profile.id },
  });
  if (!subscription || subscription.status !== "ACTIVE") return "FREE";
  return subscription.plan as HHPlanTier;
}

export async function checkQuota(
  userId: string,
  action: QuotaAction,
  context?: { roleId?: string; companyId?: string }
): Promise<QuotaCheckResult> {
  switch (action) {
    case "CREATE_ROLE": {
      const tier = await getHMPlan(userId);
      const plan = HM_PLANS[tier];
      if (plan.activeRoles === -1) return { allowed: true, current: 0, limit: -1 };

      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { companyId: true },
      });
      const activeRoles = await prisma.jobRole.count({
        where: {
          companyId: user!.companyId!,
          status: { in: ["DRAFT", "PUBLISHED"] },
        },
      });

      return {
        allowed: activeRoles < plan.activeRoles,
        current: activeRoles,
        limit: plan.activeRoles,
        message:
          activeRoles >= plan.activeRoles
            ? `Your ${plan.label} plan allows ${plan.activeRoles} active roles. Upgrade to create more.`
            : undefined,
      };
    }

    case "APPLY_TO_ROLE": {
      // Enforced by the role-owning company's plan
      const companyId = context?.companyId;
      if (!companyId) return { allowed: true, current: 0, limit: -1 };

      const subscription = await prisma.subscription.findUnique({
        where: { companyId },
      });
      const tier = (subscription?.plan || "STARTER") as HMPlanTier;
      const plan = HM_PLANS[tier];
      if (plan.appsPerRole === -1) return { allowed: true, current: 0, limit: -1 };

      const roleId = context?.roleId;
      if (!roleId) return { allowed: true, current: 0, limit: -1 };

      const appCount = await prisma.application.count({
        where: { roleId },
      });

      return {
        allowed: appCount < plan.appsPerRole,
        current: appCount,
        limit: plan.appsPerRole,
        message:
          appCount >= plan.appsPerRole
            ? `This role has reached its application limit (${plan.appsPerRole}) under the ${plan.label} plan.`
            : undefined,
      };
    }

    case "CLAIM_ROLE": {
      const tier = await getHHPlan(userId);
      const plan = HH_PLANS[tier];
      if (plan.roleClaims === -1) return { allowed: true, current: 0, limit: -1 };

      const profile = await prisma.headhunterProfile.findUnique({
        where: { userId },
        select: { id: true },
      });
      if (!profile) return { allowed: false, current: 0, limit: 0, message: "Profile not found" };

      const claimedCount = await prisma.jobRole.count({
        where: { claimedById: profile.id },
      });

      return {
        allowed: claimedCount < plan.roleClaims,
        current: claimedCount,
        limit: plan.roleClaims,
        message:
          claimedCount >= plan.roleClaims
            ? `Your ${plan.label} plan allows ${plan.roleClaims} role claims. Upgrade to claim more.`
            : undefined,
      };
    }

    case "HH_SUBMIT": {
      const tier = await getHHPlan(userId);
      const plan = HH_PLANS[tier];
      if (plan.monthlySubmissions === -1) return { allowed: true, current: 0, limit: -1 };

      const profile = await prisma.headhunterProfile.findUnique({
        where: { userId },
        select: { id: true },
      });
      if (!profile) return { allowed: false, current: 0, limit: 0, message: "Profile not found" };

      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const monthlyCount = await prisma.application.count({
        where: {
          headhunterId: profile.id,
          createdAt: { gte: startOfMonth },
        },
      });

      return {
        allowed: monthlyCount < plan.monthlySubmissions,
        current: monthlyCount,
        limit: plan.monthlySubmissions,
        message:
          monthlyCount >= plan.monthlySubmissions
            ? `Your ${plan.label} plan allows ${plan.monthlySubmissions} submissions per month. Upgrade for unlimited.`
            : undefined,
      };
    }

    case "VIEW_GAP_REPORT": {
      const tier = await getHMPlan(userId);
      const plan = HM_PLANS[tier];
      return {
        allowed: plan.gapAnalysis,
        current: 0,
        limit: plan.gapAnalysis ? 1 : 0,
        message: !plan.gapAnalysis
          ? "Gap analysis is available on Professional and Enterprise plans."
          : undefined,
      };
    }

    default:
      return { allowed: true, current: 0, limit: -1 };
  }
}

export async function getHMUsageSummary(userId: string) {
  const tier = await getHMPlan(userId);
  const plan = HM_PLANS[tier];

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { companyId: true },
  });

  let activeRoles = 0;
  let teamMembers = 0;
  let periodEnd: string | null = null;
  if (user?.companyId) {
    activeRoles = await prisma.jobRole.count({
      where: {
        companyId: user.companyId,
        status: { in: ["DRAFT", "PUBLISHED"] },
      },
    });
    teamMembers = await prisma.user.count({
      where: { companyId: user.companyId },
    });
    const sub = await prisma.subscription.findUnique({
      where: { companyId: user.companyId },
      select: { currentPeriodEnd: true },
    });
    if (sub?.currentPeriodEnd) periodEnd = sub.currentPeriodEnd.toISOString();
  }

  return {
    tier,
    plan,
    periodEnd,
    usage: {
      activeRoles: { current: activeRoles, limit: plan.activeRoles },
      teamMembers: { current: teamMembers, limit: plan.teamMembers },
    },
  };
}

export async function getHHUsageSummary(userId: string) {
  const tier = await getHHPlan(userId);
  const plan = HH_PLANS[tier];

  const profile = await prisma.headhunterProfile.findUnique({
    where: { userId },
    select: { id: true },
  });

  let claimedRoles = 0;
  let monthlySubmissions = 0;
  let periodEnd: string | null = null;
  if (profile) {
    claimedRoles = await prisma.jobRole.count({
      where: { claimedById: profile.id },
    });

    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    monthlySubmissions = await prisma.application.count({
      where: {
        headhunterId: profile.id,
        createdAt: { gte: startOfMonth },
      },
    });

    const sub = await prisma.subscription.findUnique({
      where: { headhunterProfileId: profile.id },
      select: { currentPeriodEnd: true },
    });
    if (sub?.currentPeriodEnd) periodEnd = sub.currentPeriodEnd.toISOString();
  }

  return {
    tier,
    plan,
    periodEnd,
    usage: {
      roleClaims: { current: claimedRoles, limit: plan.roleClaims },
      monthlySubmissions: { current: monthlySubmissions, limit: plan.monthlySubmissions },
    },
  };
}
