"use client";

import { useState } from "react";
import { SlidersHorizontal } from "lucide-react";

/**
 * Custom role calibration (Team+). Lets the HM weight hard vs. soft skills and
 * set the pass bar for this role, so matching optimizes for their definition of
 * a great hire. Emits `hardWeight` and `passBar`; soft weight is derived.
 */
export function CalibrationFields({
  defaultHard = 60,
  defaultBar = 60,
}: {
  defaultHard?: number;
  defaultBar?: number;
}) {
  const [hard, setHard] = useState(defaultHard);
  const [bar, setBar] = useState(defaultBar);
  const soft = 100 - hard;

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-primary/25 bg-primary/5 p-4">
      <div className="flex items-center gap-2">
        <SlidersHorizontal className="size-4 text-primary" />
        <span className="text-sm font-semibold text-foreground">Role calibration</span>
        <span className="rounded-full bg-primary px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary-foreground">
          Team
        </span>
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium text-foreground">Hard vs. soft weighting</span>
          <span className="tabular-nums text-muted-foreground">
            {hard}% hard · {soft}% soft
          </span>
        </div>
        <input
          type="range"
          name="hardWeight"
          min={0}
          max={100}
          step={5}
          value={hard}
          onChange={(e) => setHard(Number(e.target.value))}
          className="w-full accent-primary"
          aria-label="Hard skill weight"
        />
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium text-foreground">Pass bar (min. mutual fit)</span>
          <span className="tabular-nums text-muted-foreground">{bar}</span>
        </div>
        <input
          type="range"
          name="passBar"
          min={0}
          max={100}
          step={1}
          value={bar}
          onChange={(e) => setBar(Number(e.target.value))}
          className="w-full accent-primary"
          aria-label="Pass bar"
        />
      </div>

      <p className="text-xs text-muted-foreground">
        Matching optimizes for this balance and only surfaces candidates who clear your bar.
      </p>
    </div>
  );
}
