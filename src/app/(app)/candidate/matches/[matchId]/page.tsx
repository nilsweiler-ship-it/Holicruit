import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowUpRight, Check, TriangleAlert } from "lucide-react";
import { matchingService } from "@/lib/services/matching";
import { getCandidateProfile } from "@/lib/services/profile";
import { MutualFit } from "@/components/fit/mutual-fit";
import { FitRadar, type RadarAxis } from "@/components/fit/fit-radar";
import { DirectLinePanel } from "@/components/match/direct-line-panel";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Match · Holicruit" };

function salaryLabel(min?: number, max?: number, currency = "€") {
  if (min == null || max == null) return null;
  const k = (n: number) => `${Math.round(n / 1000)}k`;
  return `${currency}${k(min)}–${k(max)}`;
}

/**
 * 2.3 — Candidate match detail & direct line. Full view of one match: a fit
 * breakdown (radar + evidence) and the direct line to the named hiring manager.
 */
export default async function MatchDetailPage({
  params,
}: {
  params: Promise<{ matchId: string }>;
}) {
  const { matchId } = await params;
  const match = await matchingService.getMatch(matchId);
  if (!match) notFound();

  const { opening, fit } = match;
  const profile = await getCandidateProfile(match.candidate.id);
  if (!profile) notFound();
  const salary = salaryLabel(opening.salaryMin, opening.salaryMax, opening.currency);

  // Evidence, derived from the candidate's skills vs. the role's bar.
  const verifiedMatched = profile.hardSkills
    .filter((s) => s.verified && opening.requiredHard.includes(s.name))
    .map((s) => s.name);
  const topSoft = [...profile.softSkills].sort((a, b) => b.level - a.level)[0];

  const strengths: string[] = [];
  if (verifiedMatched.length) strengths.push(`Strong: ${verifiedMatched.join(", ")} (verified)`);
  if (topSoft) strengths.push(`Strong: ${topSoft.name.toLowerCase()} (${topSoft.level})`);
  const stretches = fit.gaps.map((g) => `Stretch: ${g.skill}`);

  const radarAxes: RadarAxis[] = [
    { label: "Hard", value: fit.hardFit },
    { label: "Soft", value: fit.softFit },
    { label: "Verified", value: fit.verified ? 95 : 45 },
    ...profile.softSkills.slice(0, 3).map((s) => ({ label: s.name.slice(0, 4), value: s.level })),
  ];

  const isClosed = match.stage === "closed";

  return (
    <div className="flex flex-col gap-6">
      <Link
        href="/candidate/matches"
        className="text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        ← Back to matches
      </Link>

      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold tracking-tight">
            {opening.title} · {opening.company.name}
          </h1>
          <p className="text-sm text-muted-foreground">
            {opening.location}
            {salary && <> · {salary}</>}
          </p>
        </div>
        <MutualFit value={fit.mutualFit} size="lg" />
      </header>

      {/* Fit breakdown: radar + evidence */}
      <section className="grid gap-5 rounded-2xl border border-border bg-card p-5 sm:grid-cols-[auto_1fr] sm:items-center">
        <div className="flex justify-center">
          <FitRadar axes={radarAxes} />
        </div>
        <ul className="flex flex-col gap-2">
          {strengths.map((s) => (
            <EvidenceRow key={s} kind="strength" text={s} />
          ))}
          {stretches.map((s) => (
            <EvidenceRow key={s} kind="stretch" text={s} />
          ))}
        </ul>
      </section>

      {isClosed ? (
        <Link
          href={`/candidate/growth/${match.id}`}
          className="flex items-center justify-between rounded-2xl border border-primary/30 bg-primary/8 p-5 transition-colors hover:bg-primary/12"
        >
          <span className="font-semibold text-foreground">
            This match closed — see your growth report
          </span>
          <ArrowUpRight className="size-5 text-primary" />
        </Link>
      ) : (
        <DirectLinePanel manager={opening.hiringManager} matchId={match.id} initiallySaved={match.saved} />
      )}
    </div>
  );
}

function EvidenceRow({ kind, text }: { kind: "strength" | "stretch"; text: string }) {
  const strength = kind === "strength";
  return (
    <li className="flex items-start gap-2 text-sm">
      {strength ? (
        <Check className="mt-0.5 size-4 shrink-0 text-success" />
      ) : (
        <TriangleAlert className="mt-0.5 size-4 shrink-0 text-primary" />
      )}
      <span className={cn(strength ? "text-foreground" : "text-muted-foreground")}>{text}</span>
    </li>
  );
}
