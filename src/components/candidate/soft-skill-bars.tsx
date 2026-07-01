import type { SoftSkillScore } from "@/lib/types";

/**
 * Labelled horizontal bars for scenario-derived soft skills. These are NOT
 * self-rated — the copy must say so wherever they appear.
 */
export function SoftSkillBars({ scores }: { scores: SoftSkillScore[] }) {
  return (
    <div className="flex flex-col gap-3">
      {scores.map((s) => (
        <div key={s.name} className="flex items-center gap-3">
          <span className="w-24 shrink-0 text-sm text-foreground sm:w-32">{s.name}</span>
          <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary"
              style={{ width: `${Math.max(0, Math.min(100, s.level))}%` }}
              role="img"
              aria-label={`${s.name} ${s.level} out of 100`}
            />
          </div>
          <span className="w-8 shrink-0 text-right text-sm font-semibold tabular-nums text-muted-foreground">
            {s.level}
          </span>
        </div>
      ))}
    </div>
  );
}
