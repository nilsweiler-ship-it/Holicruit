"use client";

import type { RoleWeights } from "@/types";
import { MatchRadarChart } from "./match-radar-chart";

interface DimensionScores {
  hardSkills: number;
  softSkills: number;
  experience: number;
  education: number;
}

interface MatchBreakdownProps {
  scores: DimensionScores;
  weights: RoleWeights;
}

function getBarColor(score: number): string {
  if (score >= 80) return "bg-green-500";
  if (score >= 60) return "bg-yellow-500";
  if (score >= 40) return "bg-orange-500";
  return "bg-red-500";
}

export function MatchBreakdown({ scores, weights }: MatchBreakdownProps) {
  const dimensions = [
    { key: "hardSkills", label: "Hard Skills" },
    { key: "softSkills", label: "Soft Skills" },
    { key: "experience", label: "Experience" },
    { key: "education", label: "Education" },
  ] as const;

  return (
    <div className="space-y-4">
      <MatchRadarChart scores={scores} weights={weights} />
      {dimensions.map(({ key, label }) => (
        <div key={key} className="space-y-1">
          <div className="flex justify-between text-sm">
            <span>{label}</span>
            <span className="text-muted-foreground">
              {Math.round(scores[key])}% (weight: {weights[key]}%)
            </span>
          </div>
          <div className="h-3 rounded-full bg-muted overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${getBarColor(scores[key])}`}
              style={{ width: `${scores[key]}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
