import type { PersonalityDimension } from "@/lib/scenario/types";
import { traitBand, traitBarWidth } from "@/lib/integrity/traits";

/**
 * The Big Five (+ Integrity) profile, derived from the scenario assessment —
 * never self-rated. Shown as broad bands (Low / Moderate / High) with the bar
 * clamped to 5–95: six situational items support a tendency, not a precise or
 * absolute score, so no one is ever shown as "0" or "100" on a trait.
 */
export function PersonalityBars({
  traits,
}: {
  traits: { name: PersonalityDimension; level: number }[];
}) {
  return (
    <div className="flex flex-col gap-3">
      {traits.map((t) => {
        const band = traitBand(t.level);
        return (
          <div key={t.name} className="flex items-center gap-3">
            <span className="w-32 shrink-0 text-sm text-foreground sm:w-40">{t.name}</span>
            <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary/70"
                style={{ width: `${traitBarWidth(t.level)}%` }}
                role="img"
                aria-label={`${t.name}: ${band}`}
              />
            </div>
            <span className="w-20 shrink-0 text-right text-xs font-semibold text-muted-foreground">{band}</span>
          </div>
        );
      })}
    </div>
  );
}
