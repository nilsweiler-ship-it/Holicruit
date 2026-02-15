import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { getHHUsageSummary } from "@/lib/plans";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PlanBadge } from "@/components/billing/plan-badge";
import { UsageIndicator } from "@/components/billing/usage-indicator";
import { UsageNudge } from "@/components/billing/usage-nudge";

export default async function HeadhunterDashboard() {
  const session = await auth();
  if (!session?.user || session.user.role !== "HEADHUNTER") redirect("/login");

  const profile = await prisma.headhunterProfile.findUnique({
    where: { userId: session.user.id },
    include: {
      claimedRoles: true,
      applications: {
        include: { role: true, candidate: { include: { user: true } } },
        orderBy: { createdAt: "desc" },
        take: 5,
      },
    },
  });

  const avgScore = profile?.applications.length
    ? Math.round(
        profile.applications.reduce((sum, a) => sum + (a.matchScore || 0), 0) /
          profile.applications.length
      )
    : 0;

  const planSummary = await getHHUsageSummary(session.user.id);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-2xl font-bold">Welcome, {session.user.name}</h1>
            <p className="text-muted-foreground">Headhunter Dashboard</p>
          </div>
          <PlanBadge plan={planSummary.tier} />
        </div>
        <Button asChild>
          <Link href="/dashboard/headhunter/roles">Browse Roles</Link>
        </Button>
      </div>

      <UsageNudge
        label="Role claims"
        current={planSummary.usage.roleClaims.current}
        limit={planSummary.usage.roleClaims.limit}
        upgradeUrl="/dashboard/headhunter/billing"
      />

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Claimed Roles</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {profile?.claimedRoles.length || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {planSummary.usage.roleClaims.limit === -1
                ? "Unlimited"
                : `${planSummary.usage.roleClaims.current} of ${planSummary.usage.roleClaims.limit} used`}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Submissions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {profile?.applications.length || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {planSummary.usage.monthlySubmissions.limit === -1
                ? "Unlimited this month"
                : `${planSummary.usage.monthlySubmissions.current} of ${planSummary.usage.monthlySubmissions.limit} this month`}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Avg Match Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {avgScore ? `${avgScore}%` : "N/A"}
            </div>
            <p className="text-xs text-muted-foreground">
              Across submissions
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Plan Usage</CardTitle>
          <CardDescription>
            <Link href="/dashboard/headhunter/billing" className="underline hover:text-primary">
              Manage plan
            </Link>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <UsageIndicator
            label="Role Claims"
            current={planSummary.usage.roleClaims.current}
            limit={planSummary.usage.roleClaims.limit}
            upgradeUrl="/dashboard/headhunter/billing"
          />
          <UsageIndicator
            label="Monthly Submissions"
            current={planSummary.usage.monthlySubmissions.current}
            limit={planSummary.usage.monthlySubmissions.limit}
            upgradeUrl="/dashboard/headhunter/billing"
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Submissions</CardTitle>
          <CardDescription>Your latest candidate submissions</CardDescription>
        </CardHeader>
        <CardContent>
          {profile?.applications.length ? (
            <div className="space-y-3">
              {profile.applications.map((app) => (
                <div
                  key={app.id}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div>
                    <p className="font-medium">{app.candidate.user.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {app.role.title}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {app.matchScore && (
                      <Badge variant="secondary">{app.matchScore}%</Badge>
                    )}
                    <Badge>{app.stage}</Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">
              No submissions yet.{" "}
              <Link
                href="/dashboard/headhunter/roles"
                className="underline hover:text-primary"
              >
                Browse roles to get started
              </Link>
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
