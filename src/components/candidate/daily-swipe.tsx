"use client";

import { useRef, useState, useTransition } from "react";
import { Check, GraduationCap, Heart, Plus, Sparkles, X } from "lucide-react";
import { toast } from "sonner";
import type { Match, Program } from "@/lib/types";
import { requestIntro } from "@/lib/actions/match";
import { cn } from "@/lib/utils";

export type DailyItem =
  | { kind: "match"; match: Match }
  | { kind: "program"; program: Program };

const THRESHOLD = 80;

/**
 * 2.5 — Today: a swipeable stack mixing curated job matches and trainings that
 * would close the candidate's gaps. Swipe (or tap) right = interested, left =
 * pass. Drag is pointer-based with capture, so it works on mouse, trackpad and
 * touch.
 */
export function DailySwipe({ items }: { items: DailyItem[] }) {
  const [index, setIndex] = useState(0);
  const [dragX, setDragX] = useState(0);
  const [dragging, setDragging] = useState(false);
  const startX = useRef<number | null>(null);
  const [, startTransition] = useTransition();

  const remaining = items.slice(index);
  const top = remaining[0];
  const behind = remaining[1];
  const done = !top;

  function decide(dir: "yes" | "pass") {
    const item = items[index];
    if (item) {
      if (dir === "yes") {
        if (item.kind === "match") {
          startTransition(() => void requestIntro(item.match.id));
          toast.success(`Interested — intro requested for ${item.match.opening.title}.`);
        } else {
          toast.success(`Saved "${item.program.title}" to your growth plan.`);
        }
      } else {
        toast(item.kind === "match" ? `Passed on ${item.match.opening.title}.` : "Dismissed a training.");
      }
    }
    startX.current = null;
    setDragX(0);
    setDragging(false);
    setIndex((i) => i + 1);
  }

  function onPointerDown(e: React.PointerEvent) {
    startX.current = e.clientX;
    setDragging(true);
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  }
  function onPointerMove(e: React.PointerEvent) {
    if (startX.current === null) return;
    setDragX(e.clientX - startX.current);
  }
  function onPointerUp() {
    if (dragX > THRESHOLD) decide("yes");
    else if (dragX < -THRESHOLD) decide("pass");
    else {
      startX.current = null;
      setDragX(0);
      setDragging(false);
    }
  }

  return (
    <div className="flex flex-col items-center gap-5">
      <div className="relative h-[440px] w-full max-w-[330px]">
        {done ? (
          <div className="flex h-full flex-col items-center justify-center gap-2 rounded-3xl border border-dashed border-border bg-card/60 p-6 text-center">
            <Check className="size-8 text-success" />
            <p className="font-semibold">You&apos;re all caught up</p>
            <p className="text-sm text-muted-foreground">
              A handful a day — jobs and trainings, hand-picked. Come back tomorrow.
            </p>
          </div>
        ) : (
          <>
            {behind && (
              <article
                className="absolute inset-0 overflow-hidden rounded-3xl border border-border bg-card opacity-70"
                style={{ transform: "scale(0.95) translateY(14px)" }}
              >
                <CardBody item={behind} />
              </article>
            )}
            <article
              className="absolute inset-0 cursor-grab touch-none overflow-hidden rounded-3xl border border-border bg-card shadow-sm active:cursor-grabbing"
              style={{
                transform: `translateX(${dragX}px) rotate(${dragX / 24}deg)`,
                transition: dragging ? "none" : "transform 0.25s ease",
              }}
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              onPointerCancel={onPointerUp}
            >
              <CardBody item={top} dragX={dragX} />
            </article>
          </>
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
            onClick={() => decide("yes")}
            aria-label={top.kind === "match" ? "Interested" : "Save training"}
            className="flex size-16 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm transition-transform hover:scale-105"
          >
            {top.kind === "match" ? <Heart className="size-7" /> : <Plus className="size-7" />}
          </button>
        </div>
      )}

      {!done && <p className="text-sm text-muted-foreground">swipe, or use the buttons ···</p>}
    </div>
  );
}

function CardBody({ item, dragX = 0 }: { item: DailyItem; dragX?: number }) {
  return (
    <div className="flex h-full flex-col">
      {/* hero / placeholder */}
      <div
        className={cn(
          "relative flex h-44 items-center justify-center",
          item.kind === "match"
            ? "bg-gradient-to-br from-secondary to-muted"
            : "bg-gradient-to-br from-success/20 to-muted",
        )}
      >
        {item.kind === "match" ? (
          <span className="text-sm font-medium text-muted-foreground">{item.match.opening.company.name}</span>
        ) : (
          <span className="inline-flex items-center gap-1.5 text-sm font-medium text-success">
            <GraduationCap className="size-4" />
            Training
          </span>
        )}
        {dragX > 28 && (
          <span className="absolute left-4 top-4 rounded-md border-2 border-success px-2 py-0.5 text-sm font-bold uppercase text-success">
            {item.kind === "match" ? "Interested" : "Save"}
          </span>
        )}
        {dragX < -28 && (
          <span className="absolute right-4 top-4 rounded-md border-2 border-muted-foreground px-2 py-0.5 text-sm font-bold uppercase text-muted-foreground">
            Pass
          </span>
        )}
      </div>

      {item.kind === "match" ? (
        <div className="flex flex-1 flex-col gap-1 p-5">
          <h3 className="text-lg font-bold tracking-tight">{item.match.opening.title}</h3>
          <p className="text-sm text-muted-foreground">
            {item.match.opening.company.name} · {item.match.opening.location}
          </p>
          <div className="mt-auto flex items-end justify-between">
            <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">mutual fit</span>
            <span className="text-4xl font-bold tracking-tight text-primary">
              {item.match.fit.mutualFit}
              <span className="text-xl">%</span>
            </span>
          </div>
        </div>
      ) : (
        <div className="flex flex-1 flex-col gap-1 p-5">
          <span className="inline-flex w-fit items-center gap-1 rounded-full bg-success/12 px-2 py-0.5 text-xs font-semibold text-success">
            <Sparkles className="size-3" />
            Closes a gap
          </span>
          <h3 className="mt-1 text-lg font-bold tracking-tight">{item.program.title}</h3>
          <p className="text-sm text-muted-foreground">
            {item.program.provider} · {item.program.format}
          </p>
          <p className="mt-auto text-sm">
            <span className="text-muted-foreground">Closes </span>
            <span className="font-semibold text-foreground">{item.program.closesGap}</span>
          </p>
        </div>
      )}
    </div>
  );
}
