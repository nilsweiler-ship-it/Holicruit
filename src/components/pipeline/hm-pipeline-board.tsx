"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { MessageCircle, Star } from "lucide-react";
import { PersonAvatar } from "@/components/people/person-avatar";
import type { Match } from "@/lib/types";
import { cn } from "@/lib/utils";

/** The three advanceable stages this board exposes (no "closed"). */
type BoardStage = "new" | "talking" | "offer";
type Board = Record<BoardStage, Match[]>;

/** The three advanceable columns of the hiring-manager pipeline. */
const COLUMNS: { stage: BoardStage; label: string }[] = [
  { stage: "new", label: "New" },
  { stage: "talking", label: "Talking" },
  { stage: "offer", label: "Offer" },
];

/**
 * Client kanban board for the manager pipeline. Cards are draggable to advance
 * a candidate to a later stage (local state only — the matching engine would
 * persist this in a real build). Clicking a card opens the deep-dive.
 */
export function HmPipelineBoard({
  newCol,
  talking,
  offer,
}: {
  newCol: Match[];
  talking: Match[];
  offer: Match[];
}) {
  const router = useRouter();
  const [board, setBoard] = useState<Board>({ new: newCol, talking, offer });
  const [dragOver, setDragOver] = useState<BoardStage | null>(null);
  // Tracks whether a real drag happened so a drop isn't read as a click.
  const draggingRef = useRef(false);

  function moveTo(matchId: string, target: BoardStage) {
    setBoard((prev) => {
      let moved: Match | undefined;
      const next: Board = { new: [], talking: [], offer: [] };
      (Object.keys(prev) as (keyof Board)[]).forEach((stage) => {
        next[stage] = prev[stage].filter((m) => {
          if (m.id === matchId) {
            moved = m;
            return false;
          }
          return true;
        });
      });
      if (!moved) return prev;
      next[target] = [...next[target], { ...moved, stage: target }];
      next[target].sort((a, b) => b.fit.mutualFit - a.fit.mutualFit);
      return next;
    });
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {COLUMNS.map(({ stage, label }) => {
        const items = board[stage];
        return (
          <div
            key={stage}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(stage);
            }}
            onDragLeave={() => setDragOver((s) => (s === stage ? null : s))}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(null);
              const id = e.dataTransfer.getData("text/plain");
              if (id) moveTo(id, stage);
            }}
            className={cn(
              "flex flex-col gap-3 rounded-2xl border border-border bg-muted/40 p-3 transition-colors",
              dragOver === stage && "border-primary/40 bg-primary/5",
            )}
          >
            <div className="flex items-center justify-between px-1">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                {label}
              </h2>
              <span className="text-sm font-semibold text-muted-foreground">{items.length}</span>
            </div>

            <div className="flex flex-col gap-2">
              {items.map((match) => {
                const active = stage === "talking" && match.hasThread;
                return (
                  <div
                    key={match.id}
                    draggable
                    onDragStart={(e) => {
                      draggingRef.current = true;
                      e.dataTransfer.setData("text/plain", match.id);
                      e.dataTransfer.effectAllowed = "move";
                    }}
                    onDragEnd={() => {
                      // Defer reset so the click that fires after drop is suppressed.
                      window.setTimeout(() => {
                        draggingRef.current = false;
                      }, 0);
                    }}
                    onClick={() => {
                      if (draggingRef.current) return;
                      router.push(`/hiring-manager/candidate/${match.id}`);
                    }}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        router.push(`/hiring-manager/candidate/${match.id}`);
                      }
                    }}
                    className={cn(
                      "flex cursor-pointer items-center gap-3 rounded-2xl border bg-card p-3 transition-colors hover:bg-accent",
                      active ? "border-primary/50 bg-primary/5" : "border-border",
                    )}
                  >
                    <PersonAvatar person={match.candidate} size={36} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-foreground">
                        {match.candidate.name}
                      </p>
                    </div>
                    {stage === "talking" && match.hasThread && (
                      <MessageCircle className="size-4 shrink-0 text-primary" aria-label="Active conversation" />
                    )}
                    {stage === "offer" && (
                      <Star className="size-4 shrink-0 fill-success text-success" aria-label="Offer stage" />
                    )}
                    <span className="text-base font-bold tabular-nums text-primary">
                      {match.fit.mutualFit}
                    </span>
                  </div>
                );
              })}
              {items.length === 0 && (
                <p className="px-1 py-6 text-center text-xs text-muted-foreground">
                  Drag a candidate here
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
