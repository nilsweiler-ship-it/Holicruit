import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { getHMUsageSummary } from "@/lib/plans";
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

export default async function HiringManagerDashboard() {
  const session = await auth();
  if (!session?.user || session.user.role !== "HIRING_MANAGER")
    redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { company: true },
  });

  const roles = await prisma.jobRole.findMany({
    where: { createdById: session.user.id },
    include: { applications: true },
    orderBy: { createdAt: "desc" },
  });

  const totalApplications = roles.reduce(
    (sum, r) => sum + r.applications.length,
    0
  );
  const shortlisted = roles.reduce(
    (sum, r) =>
      sum + r.applications.filter((a) => a.stage === "SHORTLISTED").length,
    0
  );

  const planSummary = await getHMUsageSummary(session.user.id);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-2xl font-bold">Welcome, {session.user.name}</h1>
            <p className="text-muted-foreground">
              {user?.company?.name || "Hiring Manager"} Dashboard
            </p>
          </div>
          <PlanBadge plan={planSummary.tier} />
        </div>
        <Button asChild>
          <Link href="/dashboard/hiring-manager/roles/new">Create Role</Link>
        </Button>
      </div>

      <UsageNudge
        label="Active roles"
        current={planSummary.usage.activeRoles.current}
        limit={planSummary.usage.activeRoles.limit}
        upgradeUrl="/dashboard/hiring-manager/billing"
      />

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active Roles</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {roles.filter((r) => r.status === "PUBLISHED").length}
            </div>
            <p className="text-xs text-muted-foreground">
              {planSummary.usage.activeRoles.limit === -1
                ? "Unlimited"
                : `${planSummary.usage.activeRoles.current} of ${planSummary.usage.activeRoles.limit} used`}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Total Applicants
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalApplications}</div>
            <p className="text-xs text-muted-foreground">
              Across all roles
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Shortlisted</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{shortlisted}</div>
            <p className="text-xs text-muted-foreground">
              Candidates shortlisted
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Plan Usage</CardTitle>
          <CardDescription>
            <Link href="/dashboard/hiring-manager/billing" className="underline hover:text-primary">
              Manage plan
            </Link>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <UsageIndicator
            label="Active Roles"
            current={planSummary.usage.activeRoles.current}
            limit={planSummary.usage.activeRoles.limit}
            upgradeUrl="/dashboard/hiring-manager/billing"
          />
          <UsageIndicator
            label="Team Members"
            current={planSummary.usage.teamMembers.current}
            limit={planSummary.usage.teamMembers.limit}
            upgradeUrl="/dashboard/hiring-manager/billing"
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Your Roles</CardTitle>
          <CardDescription>Manage your open positions</CardDescription>
        </CardHeader>
        <CardContent>
          {roles.length ? (
            <div className="space-y-3">
              {roles.map((role) => (
                <Link
                  key={role.id}
                  href={`/dashboard/hiring-manager/roles/${role.id}`}
                  className="flex items-center justify-between rounded-lg border p-3 hover:bg-accent/50 transition-colors"
                >
                  <div>
                    <p className="font-medium">{role.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {role.applications.length} applicant
                      {role.applications.length !== 1 ? "s" : ""}
                    </p>
                  </div>
                  <Badge
                    variant={
                      role.status === "PUBLISHED" ? "default" : "secondary"
                    }
                  >
                    {role.status}
                  </Badge>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">
              No roles yet.{" "}
              <Link
                href="/dashboard/hiring-manager/roles/new"
                className="underline hover:text-primary"
              >
                Create your first role
              </Link>
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
