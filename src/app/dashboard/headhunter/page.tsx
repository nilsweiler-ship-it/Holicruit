import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, MessageCircle, TrendingUp, DollarSign } from "lucide-react";

const ACTIVE_STAGES = ["APPLIED", "SHORTLISTED", "INTERVIEW"];

function stagePill(stage: string) {
  switch (stage) {
    case "INTERVIEW":
      return <Badge variant="outline">interview</Badge>;
    case "OFFER":
      return (
        <Badge variant="default" className="bg-primary text-primary-foreground">
          offer ★
        </Badge>
      );
    case "HIRED":
      return (
        <Badge variant="default" className="bg-primary text-primary-foreground">
          hired ★
        </Badge>
      );
    default:
      return (
        <Badge variant="secondary" className="text-muted-foreground">
          {stage.toLowerCase()}
        </Badge>
      );
  }
}

export default async function HeadhunterDashboard() {
  const session = await auth();
  if (!session?.user || session.user.role !== "HEADHUNTER") redirect("/login");

  const profile = await prisma.headhunterProfile.findUnique({
    where: { userId: session.user.id },
  });

  if (!profile) redirect("/onboarding/headhunter");

  // Fetch all applications submitted by this headhunter with role + company + candidate
  const applications = await prisma.application.findMany({
    where: { headhunterId: profile.id },
    include: {
      role: { include: { company: true } },
      candidate: { include: { user: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  // Stat: active intros (APPLIED, SHORTLISTED, INTERVIEW)
  const activeIntros = applications.filter((a) =>
    ACTIVE_STAGES.includes(a.stage)
  );
  const activeCount = activeIntros.length;

  // Stat: in interview
  const interviewCount = applications.filter(
    (a) => a.stage === "INTERVIEW"
  ).length;

  // Stat: earned from placements
  const placements = await prisma.placement.findMany({
    where: { headhunterId: profile.id },
  });
  const totalEarnedCents = placements.reduce(
    (sum, p) => sum + p.commissionCents,
    0
  );
  const totalEarnedEur = (totalEarnedCents / 100).toLocaleString("en-IE", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });

  // Active introductions: applications in active or offer stages
  const introStages = ["APPLIED", "SHORTLISTED", "INTERVIEW", "OFFER"];
  const activeIntroductions = applications.filter((a) =>
    introStages.includes(a.stage)
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Recruiter Desk
          </h1>
          <p className="text-sm text-muted-foreground">
            Welcome back, {session.user.name}
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/headhunter/roles">Browse Roles</Link>
        </Button>
      </div>

      {/* Stat tiles */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Intros</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeCount}</div>
            <p className="text-xs text-muted-foreground">
              candidates in pipeline
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">In Interview</CardTitle>
            <MessageCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{interviewCount}</div>
            <p className="text-xs text-muted-foreground">
              actively interviewing
            </p>
          </CardContent>
        </Card>

        <Card className="bg-primary text-primary-foreground">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-primary-foreground/80">
              Earned on Hires
            </CardTitle>
            <DollarSign className="h-4 w-4 text-primary-foreground/60" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">&euro;{totalEarnedEur}</div>
            <p className="text-xs text-primary-foreground/70">
              {placements.length} placement{placements.length !== 1 ? "s" : ""}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Where you add value */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">Where you add value</h2>
        </div>

        {activeIntroductions.length > 0 ? (
          <div className="space-y-2">
            {activeIntroductions.map((app) => (
              <Card key={app.id} className="p-0">
                <div className="flex items-center gap-4 px-4 py-3">
                  {/* Avatar placeholder */}
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-semibold text-muted-foreground">
                    {app.candidate.user.name
                      ? app.candidate.user.name.charAt(0).toUpperCase()
                      : "?"}
                  </div>

                  {/* Intro details */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {app.candidate.user.name} &rarr; {app.role.title}
                      {app.role.company?.name
                        ? ` @ ${app.role.company.name}`
                        : ""}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      You facilitated this match
                    </p>
                  </div>

                  {/* Stage pill */}
                  <div className="shrink-0">{stagePill(app.stage)}</div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-muted-foreground">
                No active introductions yet.{" "}
                <Link
                  href="/dashboard/headhunter/roles"
                  className="underline hover:text-primary"
                >
                  Browse roles to get started
                </Link>
              </p>
            </CardContent>
          </Card>
        )}
      </section>

      {/* Footer banner */}
      <div className="rounded-lg border border-primary/20 bg-primary/5 px-6 py-4 text-center">
        <p className="text-sm text-muted-foreground">
          No retainers, no exclusivity. A success fee only when your intro gets
          hired.
        </p>
      </div>
    </div>
  );
}
