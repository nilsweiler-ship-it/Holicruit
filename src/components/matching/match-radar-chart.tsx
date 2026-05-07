"use client";

import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
} from "recharts";
import type { RoleWeights } from "@/types";

interface DimensionScores {
  hardSkills: number;
  softSkills: number;
  experience: number;
  education: number;
}

interface MatchRadarChartProps {
  scores: DimensionScores;
  weights?: RoleWeights;
  size?: "sm" | "md";
}

const COLORS = {
  score: { stroke: "#6366f1", fill: "#818cf8" },       // indigo
  weight: { stroke: "#f59e0b", fill: "#fbbf24" },      // amber
};

export function MatchRadarChart({
  scores,
  weights,
  size = "md",
}: MatchRadarChartProps) {
  const data = [
    {
      dimension: "Hard Skills",
      score: scores.hardSkills,
      weight: weights?.hardSkills ?? 0,
      fullMark: 100,
    },
    {
      dimension: "Soft Skills",
      score: scores.softSkills,
      weight: weights?.softSkills ?? 0,
      fullMark: 100,
    },
    {
      dimension: "Experience",
      score: scores.experience,
      weight: weights?.experience ?? 0,
      fullMark: 100,
    },
    {
      dimension: "Education",
      score: scores.education,
      weight: weights?.education ?? 0,
      fullMark: 100,
    },
  ];

  const height = size === "sm" ? 200 : 280;
  const outerRadius = size === "sm" ? 65 : 100;
  const fontSize = size === "sm" ? 11 : 13;

  return (
    <div style={{ width: "100%", height }}>
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={data} outerRadius={outerRadius}>
          <PolarGrid
            gridType="polygon"
            stroke="#e2e8f0"
            strokeWidth={1}
          />
          <PolarRadiusAxis
            angle={90}
            domain={[0, 100]}
            tick={false}
            axisLine={false}
          />
          <PolarAngleAxis
            dataKey="dimension"
            tick={{ fontSize, fill: "#64748b", fontWeight: 500 }}
          />
          {weights && (
            <Radar
              name="Weight"
              dataKey="weight"
              stroke={COLORS.weight.stroke}
              fill={COLORS.weight.fill}
              fillOpacity={0.15}
              strokeWidth={1.5}
              strokeDasharray="5 3"
            />
          )}
          <Radar
            name="Score"
            dataKey="score"
            stroke={COLORS.score.stroke}
            fill={COLORS.score.fill}
            fillOpacity={0.35}
            strokeWidth={2}
            dot={{ r: 4, fill: COLORS.score.stroke, strokeWidth: 0 }}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
