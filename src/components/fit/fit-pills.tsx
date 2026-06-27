import { ArrowRight, BadgeCheck } from "lucide-react";
import type { FitObject } from "@/lib/fit/types";
import { cn } from "@/lib/utils";

/**
 * The fit triplet, as a row of small pills for match cards: `hard NN`,
 * `soft NN`, and a contextual third pill that is EITHER a positive
 * transparency signal (top-3 rank → coral) or a gap callout (`N gaps →`),
 * falling back to a verified badge. Keeps the hard/soft/verified|rank triplet
 * visible wherever a match is shown.
 */
export function FitPills({ fit, className }: { fit: FitObject; className?: string }) {
  return (
    <div className={cn("flex flex-wrap items-center gap-1.5", className)}>
      <ScorePill label="hard" value={fit.hardFit} />
      <ScorePill label="soft" value={fit.softFit} />
      <ContextPill fit={fit} />
    </div>
  );
}

function ScorePill({ label, value }: { label: string; value: number }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
      <span className="uppercase tracking-wide">{label}</span>
      <span className="font-semibold text-foreground">{value}</span>
    </span>
  );
}

/**
 * The third, contextual pill — surfaces a gap or the verified signal. We
 * deliberately do NOT show the candidate's rank ("top N"): hiring managers keep
 * the freedom to decide on judgement without having to justify skipping a
 * higher-ranked candidate.
 */
export function ContextPill({ fit }: { fit: FitObject }) {
  if (fit.gaps.length > 0) {
    const n = fit.gaps.length;
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-border px-2 py-0.5 text-xs font-medium text-muted-foreground">
        {n} gap{n > 1 ? "s" : ""}
        <ArrowRight className="size-3" />
      </span>
    );
  }

  if (fit.verified) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-success/15 px-2 py-0.5 text-xs font-semibold text-success">
        <BadgeCheck className="size-3" />
        verified
      </span>
    );
  }

  return null;
}
