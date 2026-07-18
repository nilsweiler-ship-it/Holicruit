import type { PersonalityDimension } from "@/lib/scenario/types";

/**
 * The Big Five (+ Integrity) profile, measured from the scenario assessment —
 * never self-rated. Ordered by predictive validity for job performance.
 */
export function PersonalityBars({
  traits,
}: {
  traits: { name: PersonalityDimension; level: number }[];
}) {
  return (
    <div className="flex flex-col gap-3">
      {traits.map((t) => (
        <div key={t.name} className="flex items-center gap-3">
          <span className="w-32 shrink-0 text-sm text-foreground sm:w-40">{t.name}</span>
          <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary"
              style={{ width: `${Math.max(0, Math.min(100, t.level))}%` }}
              role="img"
              aria-label={`${t.name} ${t.level} out of 100`}
            />
          </div>
          <span className="w-8 shrink-0 text-right text-sm font-semibold tabular-nums text-muted-foreground">
            {t.level}
          </span>
        </div>
      ))}
    </div>
  );
}
