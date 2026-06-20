import { CircleAlert, CircleCheck } from "lucide-react";
import type { GrowthPanel as GrowthPanelData } from "@/lib/fit/types";
import { ComparisonBars } from "@/components/fit/comparison-bars";
import { cn } from "@/lib/utils";

/**
 * One panel of the Growth Report — a "You vs. Role bar" comparison plus the
 * callout that makes the verdict legible at a glance: a specific gap (below
 * bar) or a strength (above bar, in the success color).
 */
export function GrowthPanel({ panel, className }: { panel: GrowthPanelData; className?: string }) {
  return (
    <section className={cn("flex flex-col gap-4 rounded-2xl border border-border bg-card p-5", className)}>
      <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
        {panel.comparison.label}
      </h2>

      <ComparisonBars comparison={panel.comparison} />

      {panel.aboveBar ? (
        <p className="flex items-center gap-2 rounded-lg bg-success/10 px-3 py-2 text-sm font-medium text-success">
          <CircleCheck className="size-4 shrink-0" />
          {panel.note}
        </p>
      ) : (
        <p className="flex items-center gap-2 rounded-lg bg-accent px-3 py-2 text-sm font-medium text-accent-foreground">
          <CircleAlert className="size-4 shrink-0" />
          <span>
            Gap: <span className="font-semibold">{panel.gap?.skill}</span>
          </span>
        </p>
      )}
    </section>
  );
}
