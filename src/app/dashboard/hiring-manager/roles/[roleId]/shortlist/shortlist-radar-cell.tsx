"use client";

import { MatchRadarChart } from "@/components/matching/match-radar-chart";

interface ShortlistRadarCellProps {
  scoreBreakdown: string | null;
}

export function ShortlistRadarCell({ scoreBreakdown }: ShortlistRadarCellProps) {
  if (!scoreBreakdown) return <span className="text-muted-foreground text-xs">N/A</span>;

  const scores = JSON.parse(scoreBreakdown);
  return (
    <div className="w-[120px]">
      <MatchRadarChart scores={scores} size="sm" />
    </div>
  );
}
