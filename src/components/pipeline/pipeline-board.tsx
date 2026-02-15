"use client";

import { useState } from "react";
import { PipelineCard } from "./pipeline-card";
import { StageBadge } from "./stage-badge";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { APPLICATION_STAGES } from "@/types";

interface ApplicationItem {
  id: string;
  candidateName: string;
  matchScore: number | null;
  stage: string;
  createdAt: string;
  roleId: string;
}

interface PipelineBoardProps {
  applications: ApplicationItem[];
  roleId: string;
}

export function PipelineBoard({ applications, roleId }: PipelineBoardProps) {
  const router = useRouter();
  const stages = APPLICATION_STAGES.filter((s) => s !== "REJECTED");

  async function handleDrop(applicationId: string, newStage: string) {
    try {
      const res = await fetch(`/api/applications/${applicationId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stage: newStage }),
      });
      if (!res.ok) throw new Error();
      toast.success(`Moved to ${newStage}`);
      router.refresh();
    } catch {
      toast.error("Failed to update stage");
    }
  }

  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {stages.map((stage) => {
        const stageApps = applications.filter((a) => a.stage === stage);
        return (
          <div
            key={stage}
            className="min-w-[220px] flex-shrink-0 rounded-lg bg-muted/50 p-3"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              const id = e.dataTransfer.getData("applicationId");
              if (id) handleDrop(id, stage);
            }}
          >
            <div className="flex items-center justify-between mb-3">
              <StageBadge stage={stage} />
              <span className="text-xs text-muted-foreground">
                {stageApps.length}
              </span>
            </div>
            <div className="space-y-2">
              {stageApps.map((app) => (
                <div
                  key={app.id}
                  draggable
                  onDragStart={(e) =>
                    e.dataTransfer.setData("applicationId", app.id)
                  }
                  className="cursor-grab active:cursor-grabbing"
                >
                  <PipelineCard application={app} />
                </div>
              ))}
            </div>
          </div>
        );
      })}

      {/* Rejected column */}
      <div
        className="min-w-[220px] flex-shrink-0 rounded-lg bg-red-50 p-3"
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          const id = e.dataTransfer.getData("applicationId");
          if (id) handleDrop(id, "REJECTED");
        }}
      >
        <div className="flex items-center justify-between mb-3">
          <StageBadge stage="REJECTED" />
          <span className="text-xs text-muted-foreground">
            {applications.filter((a) => a.stage === "REJECTED").length}
          </span>
        </div>
        <div className="space-y-2">
          {applications
            .filter((a) => a.stage === "REJECTED")
            .map((app) => (
              <div
                key={app.id}
                draggable
                onDragStart={(e) =>
                  e.dataTransfer.setData("applicationId", app.id)
                }
                className="cursor-grab active:cursor-grabbing"
              >
                <PipelineCard application={app} />
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
