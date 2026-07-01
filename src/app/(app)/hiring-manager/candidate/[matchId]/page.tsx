import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ChevronRight, FileText, Handshake, Wrench } from "lucide-react";
import { matchingService } from "@/lib/services/matching";
import { ScoreTiles } from "@/components/fit/score-tiles";
import { MutualFit } from "@/components/fit/mutual-fit";
import { PersonAvatar } from "@/components/people/person-avatar";
import { Button } from "@/components/ui/button";
import { PassFeedback } from "@/components/pipeline/pass-feedback";
import { LockedFeature } from "@/components/billing/locked-feature";
import { ScoreSheetForm } from "@/components/pipeline/score-sheet-form";
import { NotesForm } from "@/components/pipeline/notes-form";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/persona";
import { getActivePlan } from "@/lib/services/billing";
import { recommendationLabel, type CriterionScore } from "@/lib/scoresheet";

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

  const userId = (await requireUser()).id;
  const { plan } = await getActivePlan(userId, "hiring_manager");

  const [sheets, notes] = await Promise.all([
    plan.scoreSheets
      ? prisma.scoreSheet.findMany({ where: { matchId: match.id }, orderBy: { createdAt: "desc" } })
      : Promise.resolve([]),
    plan.pipelineTools
      ? prisma.pipelineNote.findMany({ where: { matchId: match.id }, orderBy: { createdAt: "desc" } })
      : Promise.resolve([]),
  ]);

  const formatDate = (d: Date) =>
    new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  const STRONG = new Set(["strong_yes", "yes"]);

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
          <Link href={`/hiring-manager/chat/${match.id}`}>Open direct chat</Link>
        </Button>
        <PassFeedback match={match} matchId={match.id} />
      </div>

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Structured score sheet
        </h2>
        {plan.scoreSheets ? (
          <>
            <ScoreSheetForm matchId={match.id} />
            {sheets.length > 0 && (
              <div className="flex flex-col gap-3">
                {sheets.map((sheet) => {
                  const ratings = JSON.parse(sheet.ratings) as CriterionScore[];
                  const strong = STRONG.has(sheet.recommendation);
                  return (
                    <div
                      key={sheet.id}
                      className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-5"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-foreground">
                            {sheet.author}
                          </span>
                          <span className="text-sm text-muted-foreground">·</span>
                          <span className="text-sm text-muted-foreground">{sheet.overall}/5</span>
                          <span
                            className={
                              strong
                                ? "rounded-full bg-success/15 px-2 py-0.5 text-xs font-semibold text-success"
                                : "rounded-full bg-muted px-2 py-0.5 text-xs font-semibold text-muted-foreground"
                            }
                          >
                            {recommendationLabel(sheet.recommendation)}
                          </span>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {formatDate(sheet.createdAt)}
                        </span>
                      </div>
                      <dl className="flex flex-col gap-1.5">
                        {ratings.map((r) => (
                          <div
                            key={r.criterion}
                            className="flex items-center justify-between gap-3 text-sm"
                          >
                            <dt className="text-muted-foreground">{r.criterion}</dt>
                            <dd className="font-medium text-foreground">{r.score}/5</dd>
                          </div>
                        ))}
                      </dl>
                      {sheet.notes && (
                        <p className="text-sm text-muted-foreground">{sheet.notes}</p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </>
        ) : (
          <LockedFeature
            title="Structured score sheets"
            tier="Team"
            blurb="Evaluate every candidate against the same criteria — consistent, defensible decisions, rolled into your analytics."
            learnMoreHref="/hiring-manager/features/score-sheets"
          />
        )}
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Notes
        </h2>
        {plan.pipelineTools ? (
          <>
            <NotesForm matchId={match.id} />
            {notes.length > 0 && (
              <div className="flex flex-col gap-3">
                {notes.map((note) => (
                  <div
                    key={note.id}
                    className="flex flex-col gap-2 rounded-2xl border border-border bg-card p-5"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-sm font-semibold text-foreground">{note.author}</span>
                      <span className="text-xs text-muted-foreground">
                        {formatDate(note.createdAt)}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">{note.body}</p>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          <LockedFeature
            title="Candidate notes"
            tier="Team"
            blurb="Keep private notes and context on every candidate, so your team stays aligned."
            learnMoreHref="/hiring-manager/features/pipeline"
          />
        )}
      </section>
    </div>
  );
}
