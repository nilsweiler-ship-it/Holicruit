import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { MatchScoreBadge } from "@/components/matching/match-score-badge";
import { MatchBreakdown } from "@/components/matching/match-breakdown";
import { SkillRadarChart } from "@/components/matching/skill-radar-chart";
import { GapReportView } from "@/components/matching/gap-report-view";
import { ImprovementActions } from "@/components/matching/improvement-actions";
import { StageBadge } from "@/components/pipeline/stage-badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
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
    select: { id: true, skills: true },
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

  const candidateSkills: Array<{ name: string; level: number; category?: string }> =
    JSON.parse(profile?.skills || "[]");
  const roleHardSkills: Array<{ name: string; level: number }> =
    JSON.parse(application.role.hardSkills);
  const roleSoftSkills: Array<{ name: string; level: number }> =
    JSON.parse(application.role.softSkills);
  const allRequiredSkills = [...roleHardSkills, ...roleSoftSkills];

  const radarPoints = allRequiredSkills.map((req) => {
    const match = candidateSkills.find(
      (s) => s.name.toLowerCase().trim() === req.name.toLowerCase().trim()
    );
    return {
      label: req.name,
      candidate: match?.level || 0,
      required: req.level,
    };
  });

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

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Radar chart */}
        {radarPoints.length >= 3 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Skills Match</CardTitle>
              <CardDescription>
                Your profile vs. role requirements
              </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center">
              <SkillRadarChart points={radarPoints} size={320} />
            </CardContent>
          </Card>
        )}

        {/* Score breakdown */}
        {breakdown && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Score Breakdown</CardTitle>
              <CardDescription>
                How your overall score is calculated
              </CardDescription>
            </CardHeader>
            <CardContent>
              <MatchBreakdown scores={breakdown} weights={weights} />
            </CardContent>
          </Card>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Skill Gap Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <GapReportView gaps={application.skillGaps} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Improve Your Profile</CardTitle>
          <CardDescription>
            Targeted training courses and job opportunities to close your skill gaps
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ImprovementActions gaps={application.skillGaps} />
        </CardContent>
      </Card>
    </div>
  );
}
