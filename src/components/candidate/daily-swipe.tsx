"use client";

import { useState } from "react";
import { Check, Heart, X } from "lucide-react";
import { toast } from "sonner";
import type { Match } from "@/lib/types";
import { cn } from "@/lib/utils";

const THRESHOLD = 90;

/**
 * 2.5 — Mobile daily matches. A swipeable card stack of a small curated set
 * (anti-firehose). Swipe right / "Interested" behaves like requesting an intro;
 * swipe left / "Pass" advances. The next card peeks behind the top one.
 */
export function DailySwipe({ matches }: { matches: Match[] }) {
  const [index, setIndex] = useState(0);
  const [dragX, setDragX] = useState(0);
  const [startX, setStartX] = useState<number | null>(null);

  const remaining = matches.slice(index);
  const done = remaining.length === 0;

  function decide(kind: "pass" | "interested") {
    const match = matches[index];
    if (!match) return;
    if (kind === "interested") {
      toast.success(`Interested — intro requested for ${match.opening.title}.`);
    } else {
      toast(`Passed on ${match.opening.title}.`);
    }
    setDragX(0);
    setStartX(null);
    setIndex((i) => i + 1);
  }

  function onPointerUp() {
    if (dragX > THRESHOLD) decide("interested");
    else if (dragX < -THRESHOLD) decide("pass");
    else {
      setDragX(0);
      setStartX(null);
    }
  }

  return (
    <div className="flex flex-col items-center gap-5">
      <div className="relative h-[420px] w-full max-w-[320px]">
        {done ? (
          <div className="flex h-full flex-col items-center justify-center gap-2 rounded-3xl border border-dashed border-border bg-card/60 p-6 text-center">
            <Check className="size-8 text-success" />
            <p className="font-semibold">You&apos;re all caught up</p>
            <p className="text-sm text-muted-foreground">
              Three a day, hand-picked. Come back tomorrow.
            </p>
          </div>
        ) : (
          remaining
            .slice(0, 2)
            .map((match, i) => {
              const isTop = i === 0;
              const rotate = isTop ? dragX / 22 : 0;
              return (
                <article
                  key={match.id}
                  className={cn(
                    "absolute inset-0 flex flex-col overflow-hidden rounded-3xl border border-border bg-card shadow-sm",
                    isTop ? "cursor-grab touch-none active:cursor-grabbing" : "pointer-events-none",
                  )}
                  style={{
                    transform: isTop
                      ? `translateX(${dragX}px) rotate(${rotate}deg)`
                      : "scale(0.95) translateY(12px)",
                    transition: startX === null ? "transform 0.25s ease" : "none",
                    zIndex: isTop ? 2 : 1,
                    opacity: isTop ? 1 : 0.7,
                  }}
                  onPointerDown={
                    isTop
                      ? (e) => {
                          setStartX(e.clientX);
                          e.currentTarget.setPointerCapture(e.pointerId);
                        }
                      : undefined
                  }
                  onPointerMove={
                    isTop ? (e) => startX !== null && setDragX(e.clientX - startX) : undefined
                  }
                  onPointerUp={isTop ? onPointerUp : undefined}
                >
                  {/* team photo placeholder */}
                  <div className="relative flex h-44 items-center justify-center bg-gradient-to-br from-secondary to-muted">
                    <span className="text-sm font-medium text-muted-foreground">
                      {match.opening.company.name}
                    </span>
                    {/* swipe intent hints */}
                    {isTop && dragX > 30 && (
                      <span className="absolute left-4 top-4 rounded-md border-2 border-success px-2 py-0.5 text-sm font-bold uppercase text-success">
                        Interested
                      </span>
                    )}
                    {isTop && dragX < -30 && (
                      <span className="absolute right-4 top-4 rounded-md border-2 border-muted-foreground px-2 py-0.5 text-sm font-bold uppercase text-muted-foreground">
                        Pass
                      </span>
                    )}
                  </div>
                  <div className="flex flex-1 flex-col gap-1 p-5">
                    <h3 className="text-lg font-bold tracking-tight">{match.opening.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {match.opening.company.name} · {match.opening.location}
                    </p>
                    <div className="mt-auto flex items-end justify-between">
                      <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        mutual fit
                      </span>
                      <span className="text-4xl font-bold tracking-tight text-primary">
                        {match.fit.mutualFit}
                        <span className="text-xl">%</span>
                      </span>
                    </div>
                  </div>
                </article>
              );
            })
            .reverse()
        )}
      </div>

      {!done && (
        <div className="flex items-center gap-6">
          <button
            type="button"
            onClick={() => decide("pass")}
            aria-label="Pass"
            className="flex size-14 items-center justify-center rounded-full border border-border bg-card text-muted-foreground transition-colors hover:bg-accent"
          >
            <X className="size-6" />
          </button>
          <button
            type="button"
            onClick={() => decide("interested")}
            aria-label="Interested"
            className="flex size-16 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm transition-transform hover:scale-105"
          >
            <Heart className="size-7" />
          </button>
        </div>
      )}

      {!done && <p className="text-sm text-muted-foreground">swipe for next ···</p>}
    </div>
  );
}
