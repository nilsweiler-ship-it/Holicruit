"use client";

import { useMemo, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Bookmark, ChevronRight, MessageCircle, Search, Star } from "lucide-react";
import { PersonAvatar } from "@/components/people/person-avatar";
import type { Match } from "@/lib/types";
import { cn } from "@/lib/utils";
import { setStage, toggleSaved } from "@/lib/actions/hm";

/** The three advanceable stages this board exposes (no "closed"). */
type BoardStage = "new" | "talking" | "offer";
type Board = Record<BoardStage, Match[]>;

/** The three advanceable columns of the hiring-manager pipeline. */
const COLUMNS: { stage: BoardStage; label: string }[] = [
  { stage: "new", label: "New" },
  { stage: "talking", label: "Talking" },
  { stage: "offer", label: "Offer" },
];

/** Next stage for the tap-to-advance button (touch-friendly alternative to drag). */
const NEXT_STAGE: Record<BoardStage, BoardStage | null> = {
  new: "talking",
  talking: "offer",
  offer: null,
};

const NEXT_LABEL: Record<BoardStage, string> = {
  new: "Talking",
  talking: "Offer",
  offer: "",
};

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
  const [, startTransition] = useTransition();
  // Tracks whether a real drag happened so a drop isn't read as a click.
  const draggingRef = useRef(false);

  // Filters
  const [minFit, setMinFit] = useState(0);
  const [savedOnly, setSavedOnly] = useState(false);
  const [query, setQuery] = useState("");

  const filtersActive = minFit > 0 || savedOnly || query.trim().length > 0;

  const passes = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (m: Match) => {
      if (m.fit.mutualFit < minFit) return false;
      if (savedOnly && !m.saved) return false;
      if (q) {
        const inName = m.candidate.name.toLowerCase().includes(q);
        const inGap = (m.fit.gaps ?? []).some((g) => g.skill.toLowerCase().includes(q));
        if (!inName && !inGap) return false;
      }
      return true;
    };
  }, [minFit, savedOnly, query]);

  function toggleSave(matchId: string) {
    setBoard((prev) => {
      const next: Board = { new: [], talking: [], offer: [] };
      (Object.keys(prev) as BoardStage[]).forEach((st) => {
        next[st] = prev[st].map((m) => (m.id === matchId ? { ...m, saved: !m.saved } : m));
      });
      return next;
    });
    startTransition(() => toggleSaved(matchId));
  }

  function moveTo(matchId: string, target: BoardStage) {
    // Find the source column so we only persist when the stage actually changes.
    const sourceStage = (Object.keys(board) as BoardStage[]).find((stage) =>
      board[stage].some((m) => m.id === matchId),
    );
    if (!sourceStage || sourceStage === target) return;

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

    startTransition(() => setStage(matchId, target));
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-x-5 gap-y-3 rounded-2xl border border-border bg-card p-3">
        <div className="relative min-w-[180px] flex-1">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Filter by name or gap…"
            className="w-full rounded-lg border border-border bg-background py-1.5 pl-8 pr-3 text-sm outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
        <label className="flex items-center gap-2 text-sm text-muted-foreground">
          <span className="whitespace-nowrap">Min fit</span>
          <input
            type="range"
            min={0}
            max={100}
            step={5}
            value={minFit}
            onChange={(e) => setMinFit(Number(e.target.value))}
            className="w-28 accent-primary"
          />
          <span className="w-7 tabular-nums font-medium text-foreground">{minFit}</span>
        </label>
        <button
          type="button"
          onClick={() => setSavedOnly((v) => !v)}
          className={cn(
            "flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors",
            savedOnly
              ? "border-primary/40 bg-primary/10 text-primary"
              : "border-border text-muted-foreground hover:bg-accent",
          )}
        >
          <Bookmark className={cn("size-4", savedOnly && "fill-current")} />
          Saved
        </button>
        {filtersActive && (
          <button
            type="button"
            onClick={() => {
              setMinFit(0);
              setSavedOnly(false);
              setQuery("");
            }}
            className="text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            Clear
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {COLUMNS.map(({ stage, label }) => {
        const items = board[stage].filter(passes);
        const total = board[stage].length;
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
              <span className="text-sm font-semibold text-muted-foreground">
                {items.length}
                {filtersActive && total !== items.length ? ` / ${total}` : ""}
              </span>
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
                    <button
                      type="button"
                      aria-label={match.saved ? "Remove from saved" : "Save candidate"}
                      title={match.saved ? "Saved" : "Save"}
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleSave(match.id);
                      }}
                      className={cn(
                        "flex size-7 shrink-0 items-center justify-center rounded-lg border transition-colors",
                        match.saved
                          ? "border-primary/40 bg-primary/10 text-primary"
                          : "border-border text-muted-foreground hover:bg-accent",
                      )}
                    >
                      <Bookmark className={cn("size-3.5", match.saved && "fill-current")} />
                    </button>
                    {NEXT_STAGE[stage] && (
                      <button
                        type="button"
                        aria-label={`Advance ${match.candidate.name} to ${NEXT_LABEL[stage]}`}
                        title={`Advance to ${NEXT_LABEL[stage]}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          const target = NEXT_STAGE[stage];
                          if (target) moveTo(match.id, target);
                        }}
                        className="flex size-7 shrink-0 items-center justify-center rounded-lg border border-border bg-background text-muted-foreground transition-colors hover:border-primary/40 hover:bg-primary/5 hover:text-primary"
                      >
                        <ChevronRight className="size-4" />
                      </button>
                    )}
                  </div>
                );
              })}
              {items.length === 0 && (
                <p className="px-1 py-6 text-center text-xs text-muted-foreground">
                  {total === 0
                    ? "Drag a card here, or tap the → on a card to advance it"
                    : "No candidates match your filters"}
                </p>
              )}
            </div>
          </div>
        );
      })}
      </div>
    </div>
  );
}
