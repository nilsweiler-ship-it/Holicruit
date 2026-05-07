import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getHHUsageSummary } from "@/lib/plans";
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

const hhPlanOptions = [
  {
    tier: "FREE",
    label: "Free",
    price: 0,
    features: [
      "3 role claims",
      "10 submissions per month",
      "Browse candidate profiles",
    ],
  },
  {
    tier: "PRO",
    label: "Pro",
    price: 49,
    features: [
      "Unlimited role claims",
      "Unlimited submissions",
      "Full candidate profile access",
    ],
  },
];

export default async function HHBillingPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "HEADHUNTER")
    redirect("/login");

  const summary = await getHHUsageSummary(session.user.id);

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
              <CardDescription>Your active subscription</CardDescription>
            </div>
            <PlanBadge plan={summary.tier} />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <UsageIndicator
            label="Role Claims"
            current={summary.usage.roleClaims.current}
            limit={summary.usage.roleClaims.limit}
            upgradeUrl="/dashboard/headhunter/billing"
          />
          <UsageIndicator
            label="Monthly Submissions"
            current={summary.usage.monthlySubmissions.current}
            limit={summary.usage.monthlySubmissions.limit}
            upgradeUrl="/dashboard/headhunter/billing"
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
          plans={hhPlanOptions}
          periodEnd={summary.periodEnd}
        />
      </div>
    </div>
  );
}
