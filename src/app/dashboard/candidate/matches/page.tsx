import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Building2, MapPin } from "lucide-react";

export default async function CandidateMatchesPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "CANDIDATE") redirect("/login");

  const profile = await prisma.candidateProfile.findUnique({
    where: { userId: session.user.id },
    include: {
      applications: {
        include: {
          role: { include: { company: { select: { name: true } } } },
          skillGaps: true,
        },
        orderBy: { matchScore: "desc" },
      },
    },
  });

  const applications = profile?.applications ?? [];

  // Collect all roleIds to fetch competing applications for ranking
  const roleIds = [...new Set(applications.map((a) => a.roleId))];

  // Fetch all applications for these roles in one query to compute ranks
  const allRoleApplications =
    roleIds.length > 0
      ? await prisma.application.findMany({
          where: { roleId: { in: roleIds } },
          select: { id: true, roleId: true, matchScore: true },
        })
      : [];

  // Group by roleId for ranking
  const applicationsByRole = new Map<
    string,
    { id: string; matchScore: number | null }[]
  >();
  for (const app of allRoleApplications) {
    const list = applicationsByRole.get(app.roleId) ?? [];
    list.push(app);
    applicationsByRole.set(app.roleId, list);
  }

  // Enrich each application with computed fields
  const enrichedApplications = applications.map((app) => {
    // Compute mutualFit
    let mutualFit = app.matchScore ?? 0;
    let hardScore: number | null = null;
    let softScore: number | null = null;

    if (app.scoreBreakdown) {
      try {
        const breakdown = JSON.parse(app.scoreBreakdown) as {
          hardSkills: number;
          softSkills: number;
          experience: number;
          education: number;
        };
        hardScore = Math.round(breakdown.hardSkills);
        softScore = Math.round(breakdown.softSkills);
        mutualFit = Math.round(
          breakdown.hardSkills * 0.6 + breakdown.softSkills * 0.4
        );
      } catch {
        // fall back to matchScore
      }
    }

    // Compute candidateRank
    const competitors = applicationsByRole.get(app.roleId) ?? [];
    const higherCount = competitors.filter(
      (c) =>
        c.id !== app.id &&
        c.matchScore !== null &&
        app.matchScore !== null &&
        c.matchScore > app.matchScore
    ).length;
    const candidateRank = higherCount + 1;

    // Count skill gaps (where status !== MET)
    const hardGaps = app.skillGaps.filter(
      (g) => g.category === "HARD" && g.status !== "MET"
    ).length;
    const softGaps = app.skillGaps.filter(
      (g) => g.category === "SOFT" && g.status !== "MET"
    ).length;
    const totalGaps = hardGaps + softGaps;

    return {
      ...app,
      mutualFit,
      hardScore,
      softScore,
      candidateRank,
      hardGaps,
      softGaps,
      totalGaps,
    };
  });

  const visibleMatches = enrichedApplications.slice(0, 5);
  const remainingCount = enrichedApplications.length - visibleMatches.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-baseline justify-between">
          <h1 className="text-2xl font-bold">Your matches</h1>
          <span className="text-sm text-muted-foreground">
            ranked by <u>mutual</u> fit
          </span>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          Both sides opted in. No cold applications.
        </p>
      </div>

      {/* Match cards or empty state */}
      {enrichedApplications.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground">
              No matches yet. Complete your profile to get matched!
            </p>
            <Button asChild className="mt-4">
              <Link href="/dashboard/candidate/profile">Complete profile</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {visibleMatches.map((app) => (
            <Link
              key={app.id}
              href={`/dashboard/candidate/matches/${app.id}`}
              className="block"
            >
              <Card className="rounded-xl border-2 transition-colors hover:bg-muted/50">
                <CardContent className="space-y-4">
                  {/* Top row: logo + info + fit score */}
                  <div className="flex items-start justify-between gap-4">
                    {/* Left: square logo placeholder + role info */}
                    <div className="flex items-start gap-3">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-muted">
                        <Building2 className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="font-bold leading-tight">
                          {app.role.title}
                        </p>
                        <p className="flex items-center gap-1 text-sm text-muted-foreground mt-0.5">
                          {app.role.company.name}
                          <span aria-hidden="true">&middot;</span>
                          <MapPin className="h-3 w-3" />
                          Remote
                        </p>
                      </div>
                    </div>

                    {/* Right: large mutual fit percentage */}
                    <p className="text-4xl font-bold tabular-nums">
                      {app.mutualFit}%
                    </p>
                  </div>

                  {/* Bottom row: three equal-width pills */}
                  <div className="flex items-center gap-2">
                    <span className="flex-1 rounded-md border-2 py-1.5 text-center text-xs font-medium">
                      hard {app.hardScore !== null ? app.hardScore : "—"}
                    </span>
                    <span className="flex-1 rounded-md border-2 py-1.5 text-center text-xs font-medium">
                      soft {app.softScore !== null ? app.softScore : "—"}
                    </span>
                    {app.candidateRank <= 3 ? (
                      <span className="flex-1 rounded-md border-2 bg-[#FFE27A] py-1.5 text-center text-xs font-medium">
                        you&apos;re top 3
                      </span>
                    ) : app.totalGaps > 0 ? (
                      <span className="flex-1 rounded-md border-2 py-1.5 text-center text-xs font-medium text-muted-foreground">
                        {app.totalGaps} gap{app.totalGaps !== 1 ? "s" : ""}{" "}
                        &rarr;
                      </span>
                    ) : (
                      <span className="flex-1 rounded-md border-2 py-1.5 text-center text-xs font-medium text-muted-foreground">
                        &mdash;
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}

          {/* Footer: more matches */}
          {remainingCount > 0 && (
            <p className="text-center text-sm text-muted-foreground py-2">
              &darr; {remainingCount} more match{remainingCount !== 1 ? "es" : ""}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
