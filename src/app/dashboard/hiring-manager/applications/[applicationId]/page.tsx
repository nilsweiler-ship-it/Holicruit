import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { getHMPlan, HM_PLANS } from "@/lib/plans";
import { MatchScoreBadge } from "@/components/matching/match-score-badge";
import { MatchBreakdown } from "@/components/matching/match-breakdown";
import { GapReportView } from "@/components/matching/gap-report-view";
import { GapReportGate } from "@/components/billing/gap-report-gate";
import { StageBadge } from "@/components/pipeline/stage-badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { RoleWeights } from "@/types";

export default async function ApplicationDetailPage({
  params,
}: {
  params: Promise<{ applicationId: string }>;
}) {
  const session = await auth();
  if (!session?.user || session.user.role !== "HIRING_MANAGER")
    redirect("/login");

  const { applicationId } = await params;

  const application = await prisma.application.findUnique({
    where: { id: applicationId },
    include: {
      candidate: {
        include: { user: { select: { name: true, email: true } } },
      },
      role: true,
      skillGaps: true,
    },
  });

  if (!application || application.role.createdById !== session.user.id)
    notFound();

  const tier = await getHMPlan(session.user.id);
  const plan = HM_PLANS[tier];

  const breakdown = application.scoreBreakdown
    ? JSON.parse(application.scoreBreakdown)
    : null;
  const weights: RoleWeights = JSON.parse(application.role.weights);
  const auditLog: Array<{
    timestamp: string;
    action: string;
    actor: string;
    details?: string;
  }> = JSON.parse(application.auditLog);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            {application.candidate.user.name}
          </h1>
          <p className="text-muted-foreground">
            Applied for: {application.role.title}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {application.matchScore !== null && (
            <MatchScoreBadge score={application.matchScore} />
          )}
          <StageBadge stage={application.stage} />
        </div>
      </div>

      {breakdown && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Match Breakdown</CardTitle>
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
          {plan.gapAnalysis ? (
            <GapReportView gaps={application.skillGaps} />
          ) : (
            <GapReportGate />
          )}
        </CardContent>
      </Card>

      {auditLog.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Audit Log</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {auditLog.map((entry, i) => (
                <div key={i} className="flex items-start gap-3 text-sm">
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {new Date(entry.timestamp).toLocaleString()}
                  </span>
                  <span>
                    <span className="font-medium">{entry.action}</span>
                    {entry.details && (
                      <span className="text-muted-foreground">
                        {" "}
                        — {entry.details}
                      </span>
                    )}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
