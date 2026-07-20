import type { Metadata } from "next";
import Link from "next/link";
import { matchingService } from "@/lib/services/matching";
import { getActiveCandidateId } from "@/lib/persona";
import { getCandidateOnboarding } from "@/lib/services/onboarding";
import { MatchCard } from "@/components/match/match-card";
import { OnboardingCurriculum } from "@/components/layout/onboarding-curriculum";

export const metadata: Metadata = { title: "Your matches · Holicruit" };

/**
 * 2.2 — Candidate match dashboard. A ranked list of mutual matches; fit is
 * broken into hard/soft sub-scores and the candidate sees their own ranking.
 */
export default async function CandidateMatchesPage() {
  const candidateId = await getActiveCandidateId();
  const matches = await matchingService.getCandidateMatches(candidateId);
  const closed = await matchingService.getClosedMatches(candidateId);
  const onboarding = await getCandidateOnboarding(candidateId);

  return (
    <div className="flex flex-col gap-6">
      <OnboardingCurriculum onboarding={onboarding} storageKey="holicruit-onb-candidate" />

      <header className="flex flex-col gap-1">
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <h1 className="font-serif text-2xl tracking-tight">Your matches</h1>
          <span className="text-sm text-muted-foreground">ranked by mutual fit</span>
        </div>
        <p className="text-sm text-muted-foreground">
          Both sides opted in. No cold applications.
        </p>
      </header>

      {matches.length > 0 ? (
        <>
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
        </>
      ) : (
        <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-border bg-card/40 px-6 py-12 text-center">
          <div>
            <p className="font-medium text-foreground">No matches yet</p>
            <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">
              Matching is opt-in on both sides. Build out your profile and take the
              scenario assessment so we can match you on the whole picture — not a keyword scan.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2">
            <Link
              href="/candidate/profile"
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
            >
              Complete your profile
            </Link>
            <Link
              href="/candidate/profile/scenario"
              className="rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium transition-colors hover:bg-accent"
            >
              Take the scenario
            </Link>
          </div>
        </div>
      )}

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
