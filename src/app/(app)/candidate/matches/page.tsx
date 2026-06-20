import type { Metadata } from "next";
import Link from "next/link";
import { matchingService } from "@/lib/services/matching";
import { getActiveCandidateId } from "@/lib/persona";
import { MatchCard } from "@/components/match/match-card";

export const metadata: Metadata = { title: "Your matches · Holicruit" };

/**
 * 2.2 — Candidate match dashboard. A ranked list of mutual matches; fit is
 * broken into hard/soft sub-scores and the candidate sees their own ranking.
 */
export default async function CandidateMatchesPage() {
  const candidateId = await getActiveCandidateId();
  const matches = await matchingService.getCandidateMatches(candidateId);
  const closed = await matchingService.getClosedMatches(candidateId);

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <h1 className="text-2xl font-bold tracking-tight">Your matches</h1>
          <span className="text-sm text-muted-foreground">ranked by mutual fit</span>
        </div>
        <p className="text-sm text-muted-foreground">
          Both sides opted in. No cold applications.
        </p>
      </header>

      <ol className="flex flex-col gap-3">
        {matches.map((match) => (
          <li key={match.id}>
            <MatchCard match={match} />
          </li>
        ))}
      </ol>

      <p className="text-center text-sm text-muted-foreground">
        Showing your top {matches.length}. New matches surface daily — never a firehose.
      </p>

      {closed.length > 0 && (
        <section className="flex flex-col gap-3 border-t border-border pt-6">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Recently closed
          </h2>
          <ul className="flex flex-col gap-3">
            {closed.map((match) => (
              <li key={match.id}>
                <Link
                  href={`/candidate/growth/${match.id}`}
                  className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-card/60 p-4 transition-colors hover:border-primary/40 hover:bg-accent/40"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium text-foreground">
                      {match.opening.title} · {match.opening.company.name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Not selected — see exactly why, and how to close the gap.
                    </p>
                  </div>
                  <span className="shrink-0 text-sm font-medium text-primary">Growth report →</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
