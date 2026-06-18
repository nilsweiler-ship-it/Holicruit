"use client";

import Link from "next/link";

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
  { key: "new", label: "NEW", stages: ["APPLIED", "SCREENING", "SHORTLISTED"] },
  { key: "talking", label: "TALKING", stages: ["INTERVIEW"], indicator: "chat" },
  { key: "offer", label: "OFFER", stages: ["OFFER", "HIRED"], indicator: "star" },
];

export function PipelineBoard({
  applications,
  roleId,
  highlightedId,
}: PipelineBoardProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {COLUMNS.map((col) => {
        const colApps = applications.filter((a) =>
          col.stages.includes(a.stage)
        );
        return (
          <div key={col.key}>
            {/* Column header */}
            <p className="text-xs font-medium tracking-widest text-muted-foreground mb-3">
              {col.label} ({colApps.length})
            </p>

            {/* Stacked cards */}
            <div className="space-y-2">
              {colApps.length === 0 && (
                <p className="text-xs text-muted-foreground py-8 text-center">
                  No candidates
                </p>
              )}
              {colApps.map((app) => {
                const isHighlighted = app.id === highlightedId;
                const isTalkingActive =
                  col.indicator === "chat" && app.hasMessages;

                return (
                  <Link
                    key={app.id}
                    href={`/dashboard/hiring-manager/applications/${app.id}`}
                    className="block"
                  >
                    <div
                      className={`rounded-lg border px-3 py-2.5 transition-colors hover:border-foreground/20 ${
                        isHighlighted || isTalkingActive
                          ? "bg-amber-50 border-amber-200 dark:bg-amber-950/30 dark:border-amber-800"
                          : ""
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {/* Avatar circle */}
                        <div className="h-6 w-6 shrink-0 rounded-full bg-muted" />

                        {/* Name placeholder + indicator */}
                        <div className="flex-1 min-w-0 flex items-center gap-1.5">
                          <span className="text-sm font-medium truncate">
                            {app.candidateName}
                          </span>
                          {col.indicator === "chat" && app.hasMessages && (
                            <span className="shrink-0 text-xs" aria-label="Active conversation">
                              &#x1F4AC;
                            </span>
                          )}
                          {col.indicator === "star" && (
                            <span className="shrink-0 text-xs text-amber-500" aria-label="Offer">
                              &#9733;
                            </span>
                          )}
                        </div>

                        {/* Fit score */}
                        {app.matchScore !== null && (
                          <span className="text-lg font-bold tabular-nums text-foreground">
                            {app.matchScore}
                          </span>
                        )}
                      </div>
                    </div>
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
