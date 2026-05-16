"use client";

import { Badge } from "@/components/ui/badge";
import { MatchScoreBadge } from "@/components/matching/match-score-badge";

interface TalentPoolCandidate {
  id: string;
  name: string;
  score: number;
  role: string;
  stage: string;
}

interface TalentPoolProps {
  candidates: TalentPoolCandidate[];
}

export function TalentPool({ candidates }: TalentPoolProps) {
  if (candidates.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-6 text-center">
        <p className="text-sm text-muted-foreground">
          No candidates in your talent pool yet. As you evaluate applicants,
          strong near-misses will appear here for future roles.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {candidates.map((c) => (
        <div
          key={c.id}
          className="flex items-center justify-between rounded-lg border p-3"
        >
          <div className="space-y-0.5">
            <p className="text-sm font-medium">{c.name}</p>
            <p className="text-xs text-muted-foreground">
              Previously applied for: {c.role}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <MatchScoreBadge score={c.score} />
            <Badge variant="outline" className="text-xs">
              {c.stage}
            </Badge>
          </div>
        </div>
      ))}
    </div>
  );
}
