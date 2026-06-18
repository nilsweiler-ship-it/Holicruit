import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

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
                <div className="rounded-lg border px-4 py-4 hover:bg-accent/50 transition-colors">
                  <div className="flex items-center justify-between">
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
                        <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs text-muted-foreground">
                          {newCount} new
                        </span>
                        <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs text-muted-foreground">
                          {talkingCount} talking
                        </span>
                        <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs text-muted-foreground">
                          {offerCount} offer
                        </span>
                      </div>
                    </div>

                    {/* Right side — large matched count */}
                    <div className="text-right pl-4">
                      <p className="text-3xl font-bold tabular-nums">
                        {matched}
                      </p>
                      <p className="text-xs text-muted-foreground">matched</p>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="rounded-lg border px-4 py-12 text-center">
          <p className="text-muted-foreground mb-4">No roles yet.</p>
          <Button asChild>
            <Link href="/dashboard/hiring-manager/roles/new">
              <Plus className="mr-2 h-4 w-4" />
              Create your first role
            </Link>
          </Button>
        </div>
      )}

      {/* Auto-feedback footer */}
      <div className="border-t border-dashed pt-3 px-1">
        <p className="text-sm text-muted-foreground">
          &#9889; Auto-feedback drafted for everyone you pass &mdash; review
          &amp; send in one click.
        </p>
      </div>
    </div>
  );
}
