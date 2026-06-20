import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { Match } from "@/lib/types";
import { MutualFit } from "@/components/fit/mutual-fit";
import { FitPills } from "@/components/fit/fit-pills";
import { CompanyMark } from "@/components/people/person-avatar";
import { cn } from "@/lib/utils";

/**
 * Candidate-side match card (2.2). Left: company mark + role + company·location.
 * Right: the headline mutualFit. Bottom strip: the hard/soft/context triplet.
 * The whole card links to the match detail (2.3).
 */
export function MatchCard({ match, className }: { match: Match; className?: string }) {
  const { opening, fit } = match;

  return (
    <Link
      href={`/candidate/matches/${match.id}`}
      className={cn(
        "group flex flex-col gap-3 rounded-2xl border border-border bg-card p-4 transition-colors hover:border-primary/40 hover:bg-accent/40",
        className,
      )}
    >
      <div className="flex items-start gap-3">
        <CompanyMark name={opening.company.name} size={44} />
        <div className="min-w-0 flex-1">
          <h3 className="truncate font-semibold text-foreground">{opening.title}</h3>
          <p className="truncate text-sm text-muted-foreground">
            {opening.company.name} · {opening.location}
          </p>
        </div>
        <MutualFit value={fit.mutualFit} size="md" />
      </div>
      <div className="flex items-center justify-between">
        <FitPills fit={fit} />
        <ChevronRight className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
      </div>
    </Link>
  );
}
