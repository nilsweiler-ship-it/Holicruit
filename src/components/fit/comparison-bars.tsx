import type { BarComparison } from "@/lib/fit/types";
import { isAboveBar } from "@/lib/fit/types";
import { cn } from "@/lib/utils";

/**
 * The Growth Report's core primitive: a two-bar "You vs. Role bar" comparison.
 * The role's required bar uses a distinct hatched fill so the comparison is
 * unmistakable at a glance. When the candidate is at or above the bar, the
 * "You" bar turns the success color (a strength).
 */
export function ComparisonBars({
  comparison,
  className,
}: {
  comparison: BarComparison;
  className?: string;
}) {
  const above = isAboveBar(comparison);

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <Bar
        rowLabel="You"
        value={comparison.you}
        fillClassName={above ? "bg-success" : "bg-primary"}
        valueClassName={above ? "text-success" : "text-foreground"}
      />
      <Bar rowLabel="Role bar" value={comparison.roleBar} hatched />
    </div>
  );
}

function Bar({
  rowLabel,
  value,
  fillClassName,
  valueClassName,
  hatched = false,
}: {
  rowLabel: string;
  value: number;
  fillClassName?: string;
  valueClassName?: string;
  hatched?: boolean;
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="w-16 shrink-0 text-xs font-medium text-muted-foreground">{rowLabel}</span>
      <div className="relative h-3 flex-1 overflow-hidden rounded-full bg-muted">
        <div
          className={cn(
            "absolute inset-y-0 left-0 rounded-full",
            hatched ? "bg-hatch border-r border-muted-foreground/40" : fillClassName,
          )}
          style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
          role="img"
          aria-label={`${rowLabel} ${value} out of 100`}
        />
      </div>
      <span className={cn("w-8 shrink-0 text-right text-sm font-semibold tabular-nums", valueClassName)}>
        {value}
      </span>
    </div>
  );
}
