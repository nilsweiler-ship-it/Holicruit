"use client";

import { ExternalLink, BookOpen, Briefcase } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface SkillGap {
  id: string;
  skill: string;
  category: string;
  currentLevel: number;
  requiredLevel: number;
  status: string;
  recommendations: string;
}

interface ImprovementActionsProps {
  gaps: SkillGap[];
}

function getTrainingLinks(skill: string) {
  const encoded = encodeURIComponent(skill);
  return [
    {
      label: "Coursera",
      url: `https://www.coursera.org/search?query=${encoded}`,
    },
    {
      label: "Udemy",
      url: `https://www.udemy.com/courses/search/?q=${encoded}`,
    },
    {
      label: "LinkedIn Learning",
      url: `https://www.linkedin.com/learning/search?keywords=${encoded}`,
    },
  ];
}

function getJobLinks(skill: string) {
  const encoded = encodeURIComponent(skill);
  return [
    {
      label: "LinkedIn Jobs",
      url: `https://www.linkedin.com/jobs/search/?keywords=${encoded}`,
    },
    {
      label: "Indeed",
      url: `https://www.indeed.com/jobs?q=${encoded}`,
    },
  ];
}

function getLevelLabel(level: number): string {
  const labels = ["", "Beginner", "Elementary", "Intermediate", "Advanced", "Expert"];
  return labels[level] || `Level ${level}`;
}

export function ImprovementActions({ gaps }: ImprovementActionsProps) {
  const actionableGaps = gaps.filter((g) => g.status !== "MET");

  if (actionableGaps.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-6 text-center">
        <p className="text-sm text-green-600 font-medium">
          All skills met! Your profile is a strong match for this role.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {actionableGaps.map((gap) => {
        const trainings = getTrainingLinks(gap.skill);
        const jobs = getJobLinks(gap.skill);
        const levelGap = gap.requiredLevel - gap.currentLevel;

        return (
          <Card key={gap.id} className="border-l-4 border-l-amber-400">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold">
                  {gap.skill}
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Badge
                    variant="outline"
                    className="text-xs"
                  >
                    {getLevelLabel(gap.currentLevel)} → {getLevelLabel(gap.requiredLevel)}
                  </Badge>
                  <Badge
                    className={
                      gap.status === "MISSING"
                        ? "bg-red-100 text-red-800"
                        : "bg-yellow-100 text-yellow-800"
                    }
                    variant="secondary"
                  >
                    {gap.status === "MISSING"
                      ? `+${gap.requiredLevel} levels needed`
                      : `+${levelGap} level${levelGap > 1 ? "s" : ""} needed`}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Training links */}
              <div>
                <div className="flex items-center gap-1.5 mb-1.5">
                  <BookOpen className="h-3.5 w-3.5 text-blue-600" />
                  <span className="text-xs font-medium text-muted-foreground">
                    Learn {gap.skill}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {trainings.map((t) => (
                    <a
                      key={t.label}
                      href={t.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 rounded-md border px-2.5 py-1 text-xs font-medium hover:bg-accent transition-colors"
                    >
                      {t.label}
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  ))}
                </div>
              </div>

              {/* Job experience links */}
              <div>
                <div className="flex items-center gap-1.5 mb-1.5">
                  <Briefcase className="h-3.5 w-3.5 text-green-600" />
                  <span className="text-xs font-medium text-muted-foreground">
                    Gain experience in {gap.skill}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {jobs.map((j) => (
                    <a
                      key={j.label}
                      href={j.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 rounded-md border px-2.5 py-1 text-xs font-medium hover:bg-accent transition-colors"
                    >
                      {j.label}
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
