import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getHMUsageSummary } from "@/lib/plans";
import { UsageIndicator } from "@/components/billing/usage-indicator";
import { PlanBadge } from "@/components/billing/plan-badge";
import { SubscriptionManager } from "@/components/billing/subscription-manager";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const hmPlanOptions = [
  {
    tier: "STARTER",
    label: "Starter",
    price: 0,
    features: [
      "2 active roles",
      "10 apps per role",
      "Score only matching",
      "1 team member",
    ],
  },
  {
    tier: "PROFESSIONAL",
    label: "Professional",
    price: 99,
    features: [
      "10 active roles",
      "50 apps per role",
      "Full match breakdown",
      "Gap analysis",
      "5 team members",
    ],
  },
  {
    tier: "ENTERPRISE",
    label: "Enterprise",
    price: 299,
    features: [
      "Unlimited roles",
      "Unlimited apps per role",
      "Full + custom scoring",
      "Gap analysis",
      "Unlimited team members",
    ],
  },
];

export default async function HMBillingPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "HIRING_MANAGER")
    redirect("/login");

  const summary = await getHMUsageSummary(session.user.id);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Billing & Plan</h1>
        <p className="text-muted-foreground">
          Manage your subscription and view usage
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Current Plan</CardTitle>
              <CardDescription>Your company&apos;s active subscription</CardDescription>
            </div>
            <PlanBadge plan={summary.tier} />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <UsageIndicator
            label="Active Roles"
            current={summary.usage.activeRoles.current}
            limit={summary.usage.activeRoles.limit}
            upgradeUrl="/dashboard/hiring-manager/billing"
          />
          <UsageIndicator
            label="Team Members"
            current={summary.usage.teamMembers.current}
            limit={summary.usage.teamMembers.limit}
            upgradeUrl="/dashboard/hiring-manager/billing"
          />
          {summary.periodEnd && (
            <p className="text-xs text-muted-foreground pt-2">
              Renews on{" "}
              {new Date(summary.periodEnd).toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </p>
          )}
        </CardContent>
      </Card>

      <div>
        <h2 className="text-lg font-semibold mb-4">Switch Plan</h2>
        <SubscriptionManager
          currentPlan={summary.tier}
          plans={hmPlanOptions}
          periodEnd={summary.periodEnd}
        />
      </div>
    </div>
  );
}
