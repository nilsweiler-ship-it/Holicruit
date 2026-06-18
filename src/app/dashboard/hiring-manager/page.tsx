import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Info } from "lucide-react";

export default async function HiringManagerDashboard() {
  const session = await auth();
  if (!session?.user || session.user.role !== "HIRING_MANAGER")
    redirect("/login");

  const roles = await prisma.jobRole.findMany({
    where: { createdById: session.user.id },
    include: { applications: true, company: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Your roles</h1>
        <Button asChild>
          <Link href="/dashboard/hiring-manager/roles/new">
            <Plus className="mr-2 h-4 w-4" />
            Create Role
          </Link>
        </Button>
      </div>

      {/* Role list */}
      {roles.length > 0 ? (
        <div className="space-y-3">
          {roles.map((role) => {
            const matched = role.applications.length;
            const newCount = role.applications.filter(
              (a) => a.stage === "APPLIED" || a.stage === "SHORTLISTED"
            ).length;
            const talkingCount = role.applications.filter(
              (a) => a.stage === "INTERVIEW"
            ).length;
            const offerCount = role.applications.filter(
              (a) => a.stage === "OFFER" || a.stage === "HIRED"
            ).length;

            return (
              <Link
                key={role.id}
                href={`/dashboard/hiring-manager/roles/${role.id}`}
                className="block"
              >
                <Card className="hover:bg-accent/50 transition-colors">
                  <CardContent className="flex items-center justify-between py-4">
                    {/* Left side */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{role.title}</span>
                        <span className="text-sm text-muted-foreground">
                          {role.company.name}
                        </span>
                        <Badge
                          variant={
                            role.status === "PUBLISHED"
                              ? "default"
                              : "secondary"
                          }
                        >
                          {role.status.toLowerCase()}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {newCount} new
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {talkingCount} talking
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {offerCount} offer
                        </Badge>
                      </div>
                    </div>

                    {/* Right side */}
                    <div className="text-right">
                      <p className="text-2xl font-bold text-primary">
                        {matched}
                      </p>
                      <p className="text-xs text-muted-foreground">matched</p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      ) : (
        /* Empty state */
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-muted-foreground mb-4">No roles yet.</p>
            <Button asChild>
              <Link href="/dashboard/hiring-manager/roles/new">
                <Plus className="mr-2 h-4 w-4" />
                Create your first role
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Footer banner */}
      <div className="rounded-lg border border-primary/20 bg-primary/5 px-4 py-3 flex items-center gap-3">
        <Info className="h-4 w-4 text-primary shrink-0" />
        <p className="text-sm text-foreground">
          Auto-feedback drafted for everyone you pass &mdash; review &amp; send
          in one click.
        </p>
      </div>
    </div>
  );
}
