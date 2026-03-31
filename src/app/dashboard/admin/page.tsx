import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default async function AdminDashboardPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") redirect("/login");

  const [userCount, roleCount, applicationCount, companyCount] =
    await Promise.all([
      prisma.user.count(),
      prisma.jobRole.count(),
      prisma.application.count(),
      prisma.company.count(),
    ]);

  const recentUsers = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    take: 5,
    select: { id: true, name: true, email: true, role: true, createdAt: true },
  });

  const rolesByStatus = await prisma.jobRole.groupBy({
    by: ["status"],
    _count: true,
  });

  const applicationsByStage = await prisma.application.groupBy({
    by: ["stage"],
    _count: true,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground">Platform overview and metrics</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">
              Total Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{userCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">
              Companies
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{companyCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">
              Job Roles
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{roleCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">
              Applications
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{applicationCount}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Roles by Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {rolesByStatus.map((group) => (
                <div
                  key={group.status}
                  className="flex items-center justify-between text-sm"
                >
                  <span>{group.status}</span>
                  <span className="font-medium">{group._count}</span>
                </div>
              ))}
              {rolesByStatus.length === 0 && (
                <p className="text-sm text-muted-foreground">No roles yet</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Applications by Stage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {applicationsByStage.map((group) => (
                <div
                  key={group.stage}
                  className="flex items-center justify-between text-sm"
                >
                  <span>{group.stage}</span>
                  <span className="font-medium">{group._count}</span>
                </div>
              ))}
              {applicationsByStage.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  No applications yet
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recent Users</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentUsers.map((user) => (
              <div
                key={user.id}
                className="flex items-center justify-between rounded-lg border p-3"
              >
                <div>
                  <p className="font-medium">{user.name || "No name"}</p>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="rounded bg-muted px-2 py-0.5 text-xs font-medium">
                    {user.role}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {user.createdAt.toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
