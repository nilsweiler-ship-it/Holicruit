import { prisma } from "@/lib/db";
import type { RoleType, MilestoneType } from "@/types";

export async function getPlatformConfig() {
  let config = await prisma.platformConfig.findFirst();
  if (!config) {
    config = await prisma.platformConfig.create({ data: {} });
  }
  return config;
}

export function getHireFeeForRoleType(
  config: { hireFeePermanentCents: number; hireFeeContractShort: number; hireFeeContractMedium: number; hireFeeContractLong: number },
  roleType: RoleType
): number {
  switch (roleType) {
    case "PERMANENT":
      return config.hireFeePermanentCents;
    case "CONTRACT_SHORT":
      return config.hireFeeContractShort;
    case "CONTRACT_MEDIUM":
      return config.hireFeeContractMedium;
    case "CONTRACT_LONG":
      return config.hireFeeContractLong;
    case "PROJECT":
      return config.hireFeeContractMedium;
    default:
      return config.hireFeePermanentCents;
  }
}

export async function triggerMilestone(roleId: string, milestone: MilestoneType) {
  const existing = await prisma.milestoneCharge.findFirst({
    where: { roleId, milestone },
  });
  if (existing) return existing;

  const fee = await prisma.milestoneFee.findUnique({
    where: { roleId_milestone: { roleId, milestone } },
  });

  if (!fee) {
    const config = await getPlatformConfig();
    const role = await prisma.jobRole.findUnique({ where: { id: roleId } });
    const roleType = (role?.roleType || "PERMANENT") as RoleType;
    const amount =
      milestone === "SHORTLIST"
        ? config.shortlistFeeCents
        : getHireFeeForRoleType(config, roleType);

    return prisma.milestoneCharge.create({
      data: { roleId, milestone, amountCents: amount },
    });
  }

  return prisma.milestoneCharge.create({
    data: { roleId, milestone, amountCents: fee.amountCents, currency: fee.currency },
  });
}

export async function createPlacement(applicationId: string) {
  const application = await prisma.application.findUnique({
    where: { id: applicationId },
    include: { role: true },
  });

  if (!application || !application.headhunterId) return null;

  const config = await getPlatformConfig();
  const roleType = (application.role.roleType || "PERMANENT") as RoleType;
  const totalFee = getHireFeeForRoleType(config, roleType);

  const customBounty = application.role.bounty;
  let hhShare: number;
  let platformShare: number;

  if (customBounty) {
    hhShare = customBounty;
    platformShare = totalFee - customBounty;
    if (platformShare < 0) platformShare = 0;
  } else {
    hhShare = Math.round(totalFee * (config.defaultHHSplitPct / 100));
    platformShare = totalFee - hhShare;
  }

  return prisma.placement.create({
    data: {
      applicationId,
      headhunterId: application.headhunterId,
      commissionCents: hhShare,
      platformCents: platformShare,
    },
  });
}

export function formatCents(cents: number): string {
  return `$${(cents / 100).toFixed(0)}`;
}
