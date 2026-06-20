import { cn } from "@/lib/utils";

/**
 * The headline `mutualFit` number shown to both sides of a match.
 */
export function MutualFit({
  value,
  size = "md",
  className,
}: {
  value: number;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const sizes = {
    sm: { num: "text-2xl", pct: "text-sm", label: "text-[10px]" },
    md: { num: "text-4xl", pct: "text-lg", label: "text-xs" },
    lg: { num: "text-6xl", pct: "text-2xl", label: "text-sm" },
  }[size];

  return (
    <div className={cn("flex flex-col items-end leading-none", className)}>
      <div className="flex items-baseline gap-0.5 font-bold tracking-tight text-primary">
        <span className={sizes.num} aria-label={`Mutual fit ${value} percent`}>
          {value}
        </span>
        <span className={cn(sizes.pct, "font-semibold")}>%</span>
      </div>
      <span className={cn(sizes.label, "font-medium uppercase tracking-wide text-muted-foreground")}>
        mutual fit
      </span>
    </div>
  );
}
