import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Bookmark,
  CheckCircle2,
  AlertTriangle,
  MapPin,
  Building2,
} from "lucide-react";

export default async function MatchDetailPage({
  params,
}: {
  params: Promise<{ applicationId: string }>;
}) {
  const session = await auth();
  if (!session?.user || session.user.role !== "CANDIDATE") redirect("/login");

  const { applicationId } = await params;

  const profile = await prisma.candidateProfile.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  });

  const application = await prisma.application.findUnique({
    where: { id: applicationId },
    include: {
      role: {
        include: {
          company: { select: { name: true } },
          createdBy: { select: { name: true } },
        },
      },
      skillGaps: true,
    },
  });

  if (!application || application.candidateId !== profile?.id) notFound();

  // Parse score breakdown
  let hardScore: number | null = null;
  let softScore: number | null = null;
  let mutualFit = application.matchScore ?? 0;

  if (application.scoreBreakdown) {
    try {
      const breakdown = JSON.parse(application.scoreBreakdown) as {
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

  // Separate skill gaps into strengths and stretches
  const strengths = application.skillGaps.filter((g) => g.status === "MET");
  const stretches = application.skillGaps.filter(
    (g) => g.status === "PARTIAL" || g.status === "MISSING"
  );

  const hardStrengths = strengths.filter((g) => g.category === "HARD");
  const softStrengths = strengths.filter((g) => g.category === "SOFT");
  const hardStretches = stretches.filter((g) => g.category === "HARD");
  const softStretches = stretches.filter((g) => g.category === "SOFT");

  const hiringManagerName = application.role.createdBy?.name ?? "Hiring manager";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Link
          href="/dashboard/candidate/matches"
          className="mb-3 inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to matches
        </Link>

        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">{application.role.title}</h1>
            <p className="flex items-center gap-1 text-sm text-muted-foreground">
              <Building2 className="h-3.5 w-3.5" />
              {application.role.company.name}
              <span aria-hidden="true">&middot;</span>
              <MapPin className="h-3.5 w-3.5" />
              Remote
            </p>
          </div>

          <div className="text-right">
            <p className="text-4xl font-bold text-primary">{mutualFit}%</p>
            <p className="text-sm text-muted-foreground">mutual fit</p>
          </div>
        </div>
      </div>

      {/* Fit Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Fit breakdown</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Hard skill evidence */}
          {(hardStrengths.length > 0 || hardStretches.length > 0) && (
            <div className="space-y-2">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Hard skills
              </p>
              <ul className="space-y-1.5">
                {hardStrengths.map((gap) => (
                  <li key={gap.id} className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-green-600" />
                    <span>{gap.skill}</span>
                    <span className="text-muted-foreground">Strength</span>
                  </li>
                ))}
                {hardStretches.map((gap) => (
                  <li key={gap.id} className="flex items-center gap-2 text-sm">
                    <AlertTriangle className="h-4 w-4 shrink-0 text-amber-500" />
                    <span>{gap.skill}</span>
                    <span className="text-muted-foreground">
                      {gap.status === "MISSING" ? "Gap" : "Stretch"}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Separator between hard and soft */}
          {(hardStrengths.length > 0 || hardStretches.length > 0) &&
            (softStrengths.length > 0 || softStretches.length > 0) && (
              <Separator />
            )}

          {/* Soft skill evidence */}
          {(softStrengths.length > 0 || softStretches.length > 0) && (
            <div className="space-y-2">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Soft skills
              </p>
              <ul className="space-y-1.5">
                {softStrengths.map((gap) => (
                  <li key={gap.id} className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-green-600" />
                    <span>{gap.skill}</span>
                    <span className="text-muted-foreground">Strength</span>
                  </li>
                ))}
                {softStretches.map((gap) => (
                  <li key={gap.id} className="flex items-center gap-2 text-sm">
                    <AlertTriangle className="h-4 w-4 shrink-0 text-amber-500" />
                    <span>{gap.skill}</span>
                    <span className="text-muted-foreground">
                      {gap.status === "MISSING" ? "Gap" : "Stretch"}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Overall scores */}
          {(hardScore !== null || softScore !== null) && (
            <>
              <Separator />
              <div className="flex items-center gap-6">
                {hardScore !== null && (
                  <div className="text-sm">
                    <span className="text-muted-foreground">Hard skills </span>
                    <span className="font-semibold">{hardScore}%</span>
                  </div>
                )}
                {softScore !== null && (
                  <div className="text-sm">
                    <span className="text-muted-foreground">Soft skills </span>
                    <span className="font-semibold">{softScore}%</span>
                  </div>
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Direct Line */}
      <Card className="bg-accent border-primary/20">
        <CardHeader>
          <CardTitle className="text-base">
            Direct line to the hiring manager
          </CardTitle>
          <CardDescription>
            {hiringManagerName} is hiring for this role.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Skip the queue. This match is strong enough for a direct
            introduction.
          </p>
          <div className="flex items-center gap-3">
            <Button asChild>
              <Link href="#">
                Request intro
                <ArrowRight className="ml-1.5 h-4 w-4" />
              </Link>
            </Button>
            <Button variant="outline">
              <Bookmark className="mr-1.5 h-4 w-4" />
              Save for later
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Gap Summary */}
      {stretches.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Areas to develop</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <ul className="space-y-3">
              {stretches.map((gap) => (
                <li key={gap.id} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{gap.skill}</span>
                    <span className="text-muted-foreground">
                      {gap.currentLevel} / {gap.requiredLevel}
                    </span>
                  </div>
                  <div className="flex h-2 overflow-hidden rounded-full bg-muted">
                    <div
                      className="rounded-full bg-amber-500"
                      style={{
                        width: `${gap.requiredLevel > 0 ? Math.round((gap.currentLevel / gap.requiredLevel) * 100) : 0}%`,
                      }}
                    />
                  </div>
                </li>
              ))}
            </ul>

            <Button variant="outline" asChild className="w-full">
              <Link href={`/dashboard/candidate/gaps/${applicationId}`}>
                See full growth report
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
