"use client";

import { Card, CardContent } from "@/components/ui/card";
import { User } from "lucide-react";
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

/**
 * Standalone pipeline card for use outside the main board.
 * The main kanban board (PipelineBoard) renders its own inline cards.
 */
export function PipelineCard({ application }: PipelineCardProps) {
  return (
    <Link
      href={`/dashboard/hiring-manager/applications/${application.id}`}
      className="block"
    >
      <Card className="transition-colors hover:border-primary/40 hover:shadow-sm">
        <CardContent className="p-3">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted">
              <User className="h-4 w-4 text-muted-foreground" />
            </div>
            <span className="text-sm font-medium truncate flex-1">
              {application.candidateName}
            </span>
            {application.matchScore !== null && (
              <span className="text-lg font-bold tabular-nums text-foreground">
                {application.matchScore}
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
