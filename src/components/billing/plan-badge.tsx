"use client";

import { Badge } from "@/components/ui/badge";

const planStyles: Record<string, string> = {
  STARTER: "bg-tier-free-bg text-tier-free border-tier-free/20",
  FREE: "bg-tier-free-bg text-tier-free border-tier-free/20",
  PROFESSIONAL: "bg-tier-pro-bg text-tier-pro border-tier-pro/20",
  PRO: "bg-tier-pro-bg text-tier-pro border-tier-pro/20",
  ENTERPRISE: "bg-tier-enterprise-bg text-tier-enterprise border-tier-enterprise/20",
};

const planLabels: Record<string, string> = {
  STARTER: "Starter",
  FREE: "Free",
  PROFESSIONAL: "Professional",
  PRO: "Pro",
  ENTERPRISE: "Enterprise",
};

interface PlanBadgeProps {
  plan: string;
}

export function PlanBadge({ plan }: PlanBadgeProps) {
  return (
    <Badge variant="outline" className={planStyles[plan] || ""}>
      {planLabels[plan] || plan}
    </Badge>
  );
}
