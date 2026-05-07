import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { MatchScoreBadge } from "@/components/matching/match-score-badge";
import { StageBadge } from "@/components/pipeline/stage-badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ApplyButtonClient } from "./apply-button";

export default async function CandidateMatchesPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "CANDIDATE") redirect("/login");

  const profile = await prisma.candidateProfile.findUnique({
    where: { userId: session.user.id },
    include: {
      applications: {
        include: {
          role: { include: { company: { select: { name: true } } } },
        },
        orderBy: { matchScore: "desc" },
      },
    },
  });

  const appliedRoleIds = profile?.applications.map((a) => a.roleId) || [];
  const availableRoles = await prisma.jobRole.findMany({
    where: {
      status: "PUBLISHED",
      ...(appliedRoleIds.length > 0 && {
        id: { notIn: appliedRoleIds },
      }),
    },
    include: { company: { select: { name: true } } },
    take: 10,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">My Matches</h1>
        <p className="text-muted-foreground">
          Roles you&apos;ve applied to and available opportunities
        </p>
      </div>

      {profile?.applications && profile.applications.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Your Applications</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {profile.applications.map((app) => (
              <div
                key={app.id}
                className="flex items-center justify-between rounded-lg border p-3"
              >
                <div>
                  <p className="font-medium">{app.role.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {app.role.company.name}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {app.matchScore !== null && (
                    <MatchScoreBadge score={app.matchScore} />
                  )}
                  <StageBadge stage={app.stage} />
                  <Button size="sm" variant="outline" asChild>
                    <Link href={`/dashboard/candidate/gaps/${app.id}`}>
                      Gap Report
                    </Link>
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {availableRoles.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Available Roles</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {availableRoles.map((role) => (
              <div
                key={role.id}
                className="flex items-center justify-between rounded-lg border p-3"
              >
                <div>
                  <p className="font-medium">{role.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {role.company.name}
                  </p>
                </div>
                <ApplyButtonClient
                  roleId={role.id}
                  candidateProfileId={profile?.id || ""}
                />
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {(!profile?.applications || profile.applications.length === 0) &&
        availableRoles.length === 0 && (
          <div className="rounded-lg border border-dashed p-8 text-center">
            <p className="text-muted-foreground">
              No matches or available roles yet. Complete your profile to get
              matched!
            </p>
          </div>
        )}
    </div>
  );
}
