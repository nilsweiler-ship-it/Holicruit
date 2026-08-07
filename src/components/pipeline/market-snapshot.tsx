import { Users, TrendingUp, Target, ArrowRight } from "lucide-react";
import type { RoleMarketSnapshot } from "@/lib/services/marketsnapshot";

/**
 * The honest talent landscape for a role — real counts from the pool, plus
 * blind "one skill away" previews. Turns an empty pipeline into useful signal.
 */
export function MarketSnapshot({ snapshot }: { snapshot: RoleMarketSnapshot }) {
  const { considered, aboveBar, nearCount, bands, commonGaps, nearMisses, passBar } = snapshot;
  const maxBand = Math.max(1, ...bands.map((b) => b.count));

  return (
    <section className="flex flex-col gap-5 rounded-2xl border border-border bg-card p-5">
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <Users className="size-4 text-primary" />
          Talent landscape for this role
        </div>
        <p className="text-sm text-muted-foreground">
          A live, honest read of the pool — measured against your pass bar of {passBar}. Identities
          stay private until someone clears your bar and opts in.
        </p>
      </div>

      {/* Headline stats */}
      <div className="grid grid-cols-3 gap-3">
        <Stat value={aboveBar} label="clear your bar" tone="primary" />
        <Stat value={nearCount} label="one skill away" tone="amber" />
        <Stat value={considered} label="in this space" tone="muted" />
      </div>

      {/* Band histogram */}
      <div className="flex flex-col gap-2">
        {bands.map((b) => (
          <div key={b.label} className="flex items-center gap-3">
            <span className="w-28 shrink-0 text-xs text-muted-foreground">{b.label}</span>
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary/70"
                style={{ width: `${Math.round((b.count / maxBand) * 100)}%` }}
              />
            </div>
            <span className="w-6 shrink-0 text-right text-xs tabular-nums text-foreground">
              {b.count}
            </span>
          </div>
        ))}
      </div>

      {/* One skill away — blind previews */}
      {nearMisses.length > 0 && (
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <TrendingUp className="size-4 text-primary" />
            One skill from your bar
          </div>
          <ul className="flex flex-col gap-2">
            {nearMisses.map((n) => (
              <li
                key={n.candidateId}
                className="flex flex-wrap items-center gap-x-3 gap-y-1 rounded-xl border border-border bg-background p-3 text-sm"
              >
                <span className="font-medium text-foreground">Candidate · {n.headline}</span>
                <span className="text-muted-foreground">{n.industry}</span>
                <span className="ml-auto flex items-center gap-1.5 text-muted-foreground">
                  <span className="tabular-nums">fit {n.mutualFit}</span>
                  <ArrowRight className="size-3.5" />
                  <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                    add {n.unlockSkill} → {n.projectedFit}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Common gaps */}
      {commonGaps.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            <Target className="size-3.5" />
            Most common gaps
          </span>
          {commonGaps.map((g) => (
            <span
              key={g.skill}
              className="rounded-full border border-border bg-muted px-2.5 py-0.5 text-xs text-foreground"
            >
              {g.skill} · {g.count}
            </span>
          ))}
        </div>
      )}
    </section>
  );
}

function Stat({
  value,
  label,
  tone,
}: {
  value: number;
  label: string;
  tone: "primary" | "amber" | "muted";
}) {
  const color =
    tone === "primary" ? "text-primary" : tone === "amber" ? "text-[#C08a3e]" : "text-foreground";
  return (
    <div className="flex flex-col gap-0.5 rounded-xl border border-border bg-background p-3">
      <span className={`font-serif text-3xl leading-none tracking-tight ${color}`}>{value}</span>
      <span className="text-xs text-muted-foreground">{label}</span>
    </div>
  );
}
