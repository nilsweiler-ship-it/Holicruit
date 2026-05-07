"use client";

import { Badge } from "@/components/ui/badge";
import { MatchScoreBadge } from "@/components/matching/match-score-badge";
import Link from "next/link";

interface PipelineCardProps {
  application: {
    id: string;
    candidateName: string;
    matchScore: number | null;
    stage: string;
    createdAt: string;
    roleId: string;
  };
}

export function PipelineCard({ application }: PipelineCardProps) {
  const daysInStage = Math.floor(
    (Date.now() - new Date(application.createdAt).getTime()) /
      (1000 * 60 * 60 * 24)
  );

  return (
    <Link
      href={`/dashboard/hiring-manager/applications/${application.id}`}
      className="block rounded-lg border p-3 hover:bg-accent/50 transition-colors"
    >
      <div className="flex items-center justify-between mb-1">
        <span className="font-medium text-sm">{application.candidateName}</span>
        {application.matchScore !== null && (
          <MatchScoreBadge score={application.matchScore} />
        )}
      </div>
      <div className="text-xs text-muted-foreground">
        {daysInStage}d in stage
      </div>
    </Link>
  );
}
