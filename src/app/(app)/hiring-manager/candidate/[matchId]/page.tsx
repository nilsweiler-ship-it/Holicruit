import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ChevronRight, FileText, Handshake, Wrench } from "lucide-react";
import { matchingService } from "@/lib/services/matching";
import { THREADS } from "@/lib/fixtures";
import { ScoreTiles } from "@/components/fit/score-tiles";
import { MutualFit } from "@/components/fit/mutual-fit";
import { PersonAvatar } from "@/components/people/person-avatar";
import { Button } from "@/components/ui/button";
import { PassFeedback } from "@/components/pipeline/pass-feedback";

const EVIDENCE = [
  { icon: Wrench, label: "Skill scenario score + recording" },
  { icon: Handshake, label: "2 peer endorsements (verified)" },
  { icon: FileText, label: "Portfolio & work samples" },
];

/**
 * 3.2 Candidate deep-dive — evidence-first profile for one match, with the
 * direct-chat and pass-with-feedback actions.
 */
export default async function CandidatePage({
  params,
}: {
  params: Promise<{ matchId: string }>;
}) {
  const { matchId } = await params;
  const match = await matchingService.getMatch(matchId);
  if (!match) notFound();

  const threadId =
    THREADS.find((t) => t.matchId === match.id)?.id ?? THREADS[0]?.id;

  return (
    <div className="flex flex-col gap-6">
      <Link
        href="/hiring-manager/pipeline"
        className="inline-flex w-fit items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Back to pipeline
      </Link>

      <header className="flex items-center justify-between gap-4 rounded-2xl border border-border bg-card p-5">
        <div className="flex items-center gap-4">
          <PersonAvatar person={match.candidate} size={56} />
          <div className="min-w-0">
            <h1 className="text-xl font-bold tracking-tight text-foreground">
              {match.candidate.name}
            </h1>
            <p className="truncate text-sm text-muted-foreground">{match.candidate.headline}</p>
          </div>
        </div>
        <MutualFit value={match.fit.mutualFit} size="lg" />
      </header>

      <ScoreTiles fit={match.fit} />

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Evidence, not claims
        </h2>
        <div className="flex flex-col gap-2">
          {EVIDENCE.map(({ icon: Icon, label }) => (
            <button
              key={label}
              type="button"
              className="flex cursor-pointer items-center gap-3 rounded-2xl border border-border bg-card p-4 text-left transition-colors hover:bg-accent"
            >
              <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground">
                <Icon className="size-4" />
              </span>
              <span className="flex-1 text-sm font-medium text-foreground">{label}</span>
              <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
            </button>
          ))}
        </div>
      </section>

      <div className="flex flex-wrap items-center gap-3">
        <Button asChild>
          <Link href={`/hiring-manager/chat/${threadId}`}>Open direct chat</Link>
        </Button>
        <PassFeedback match={match} />
      </div>
    </div>
  );
}
