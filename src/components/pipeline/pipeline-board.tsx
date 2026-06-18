"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, Star, User } from "lucide-react";

interface ApplicationItem {
  id: string;
  candidateName: string;
  matchScore: number | null;
  stage: string;
  createdAt: string;
  roleId: string;
  hasMessages?: boolean;
}

interface PipelineBoardProps {
  applications: ApplicationItem[];
  roleId: string;
  highlightedId?: string;
}

type KanbanColumn = {
  key: string;
  label: string;
  stages: string[];
  indicator?: "chat" | "star";
};

const COLUMNS: KanbanColumn[] = [
  { key: "new", label: "New", stages: ["APPLIED", "SCREENING", "SHORTLISTED"] },
  { key: "talking", label: "Talking", stages: ["INTERVIEW"], indicator: "chat" },
  { key: "offer", label: "Offer", stages: ["OFFER", "HIRED"], indicator: "star" },
];

export function PipelineBoard({
  applications,
  roleId,
  highlightedId,
}: PipelineBoardProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {COLUMNS.map((col) => {
        const colApps = applications.filter((a) =>
          col.stages.includes(a.stage)
        );
        return (
          <div key={col.key} className="space-y-3">
            {/* Column header */}
            <div className="flex items-center justify-between px-1">
              <h3 className="text-sm font-semibold text-foreground">
                {col.label}
              </h3>
              <Badge variant="secondary" className="text-xs tabular-nums">
                {colApps.length}
              </Badge>
            </div>

            {/* Column body */}
            <div className="rounded-xl bg-muted/40 p-3 min-h-[200px] space-y-2">
              {colApps.length === 0 && (
                <p className="text-xs text-muted-foreground text-center py-8">
                  No candidates
                </p>
              )}
              {colApps.map((app) => {
                const isHighlighted = app.id === highlightedId;
                return (
                  <Link
                    key={app.id}
                    href={`/dashboard/hiring-manager/applications/${app.id}`}
                    className="block"
                  >
                    <Card
                      className={`transition-colors hover:border-primary/40 hover:shadow-sm ${
                        isHighlighted
                          ? "bg-amber-50 border-amber-200 dark:bg-amber-950/30 dark:border-amber-800"
                          : ""
                      }`}
                    >
                      <CardContent className="p-3">
                        <div className="flex items-center gap-3">
                          {/* Avatar placeholder */}
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted">
                            <User className="h-4 w-4 text-muted-foreground" />
                          </div>

                          {/* Name + indicator */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="text-sm font-medium truncate">
                                {app.candidateName}
                              </span>
                              {col.indicator === "chat" && app.hasMessages && (
                                <MessageCircle className="h-3.5 w-3.5 text-primary shrink-0" />
                              )}
                              {col.indicator === "star" && (
                                <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500 shrink-0" />
                              )}
                            </div>
                          </div>

                          {/* Fit score */}
                          {app.matchScore !== null && (
                            <span className="text-lg font-bold tabular-nums text-foreground">
                              {app.matchScore}
                            </span>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
