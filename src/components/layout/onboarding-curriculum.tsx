"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Check, ChevronRight, GraduationCap, X } from "lucide-react";
import type { Onboarding } from "@/lib/services/onboarding";
import { cn } from "@/lib/utils";

/**
 * Guided onboarding curriculum — a dismissible "getting started" checklist with
 * a short lesson per step. Hides itself once every step is complete.
 */
export function OnboardingCurriculum({
  onboarding,
  storageKey,
}: {
  onboarding: Onboarding;
  storageKey: string;
}) {
  const total = onboarding.steps.length;
  const done = onboarding.completed;
  const allDone = done >= total;

  const [dismissed, setDismissed] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let isDismissed = false;
    try {
      isDismissed = localStorage.getItem(storageKey) === "1";
    } catch {
      /* ignore */
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time hydration read of localStorage
    setDismissed(isDismissed);
    setReady(true);
  }, [storageKey]);

  function dismiss() {
    setDismissed(true);
    try {
      localStorage.setItem(storageKey, "1");
    } catch {
      /* ignore */
    }
  }

  if (!ready || dismissed || allDone) return null;

  const pct = Math.round((done / total) * 100);

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-primary/25 bg-primary/5 p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="flex size-8 items-center justify-center rounded-xl bg-primary/12 text-primary">
            <GraduationCap className="size-4" />
          </span>
          <div>
            <h2 className="text-base font-semibold text-foreground">{onboarding.title}</h2>
            <p className="text-sm text-muted-foreground">{onboarding.intro}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={dismiss}
          aria-label="Dismiss"
          className="rounded-lg p-1 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        >
          <X className="size-4" />
        </button>
      </div>

      <div className="flex items-center gap-3">
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
          <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${pct}%` }} />
        </div>
        <span className="shrink-0 text-xs font-medium tabular-nums text-muted-foreground">
          {done}/{total}
        </span>
      </div>

      <ol className="flex flex-col gap-1.5">
        {onboarding.steps.map((step) => (
          <li key={step.id}>
            <Link
              href={step.href}
              className={cn(
                "flex items-center gap-3 rounded-xl border p-3 transition-colors",
                step.done
                  ? "border-transparent bg-transparent"
                  : "border-border bg-card hover:border-primary/40 hover:bg-accent",
              )}
            >
              <span
                className={cn(
                  "flex size-6 shrink-0 items-center justify-center rounded-full border text-xs font-semibold",
                  step.done
                    ? "border-success bg-success text-white"
                    : "border-border text-muted-foreground",
                )}
              >
                {step.done ? <Check className="size-3.5" /> : null}
              </span>
              <div className="min-w-0 flex-1">
                <p
                  className={cn(
                    "text-sm font-medium",
                    step.done ? "text-muted-foreground line-through" : "text-foreground",
                  )}
                >
                  {step.label}
                </p>
                {!step.done && <p className="text-xs text-muted-foreground">{step.why}</p>}
              </div>
              {!step.done && (
                <span className="flex shrink-0 items-center gap-1 text-xs font-medium text-primary">
                  {step.cta}
                  <ChevronRight className="size-3.5" />
                </span>
              )}
            </Link>
          </li>
        ))}
      </ol>
    </div>
  );
}
