import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { MatchScoreBadge } from "@/components/matching/match-score-badge";
import { MatchBreakdown } from "@/components/matching/match-breakdown";
import { GapReportView } from "@/components/matching/gap-report-view";
import { StageBadge } from "@/components/pipeline/stage-badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import type { RoleWeights } from "@/types";

export default async function CandidateGapReportPage({
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
      role: { include: { company: { select: { name: true } } } },
      skillGaps: true,
    },
  });

  if (!application || application.candidateId !== profile?.id) notFound();

  const breakdown = application.scoreBreakdown
    ? JSON.parse(application.scoreBreakdown)
    : null;
  const weights: RoleWeights = JSON.parse(application.role.weights);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Gap Report</h1>
          <p className="text-muted-foreground">
            {application.role.title} at {application.role.company.name}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {application.matchScore !== null && (
            <MatchScoreBadge score={application.matchScore} />
          )}
          <StageBadge stage={application.stage} />
          <Button variant="outline" asChild>
            <Link href="/dashboard/candidate/matches">Back to Matches</Link>
          </Button>
        </div>
      </div>

      {breakdown && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Score Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <MatchBreakdown scores={breakdown} weights={weights} />
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Skill Gap Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <GapReportView gaps={application.skillGaps} />
        </CardContent>
      </Card>
    </div>
  );
}
