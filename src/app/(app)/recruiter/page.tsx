import type { Metadata } from "next";
import { BadgeEuro, HandCoins, Star } from "lucide-react";
import { RECRUITER_INTROS } from "@/lib/fixtures";
import type { RecruiterIntro } from "@/lib/types";
import { PersonAvatar } from "@/components/people/person-avatar";

export const metadata: Metadata = { title: "Recruiter desk · Holicruit" };

/** First letters of the first and last word, uppercased. */
function initialsFromName(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "?";
  const first = words[0]!.charAt(0);
  const last = words.length > 1 ? words[words.length - 1]!.charAt(0) : "";
  return (first + last).toUpperCase();
}

function StagePill({ stage }: { stage: RecruiterIntro["stage"] }) {
  switch (stage) {
    case "talking":
      return (
        <span className="inline-flex items-center rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
          Talking
        </span>
      );
    case "interview":
      return (
        <span className="inline-flex items-center rounded-full bg-secondary px-2.5 py-1 text-xs font-medium text-secondary-foreground">
          Interview
        </span>
      );
    case "offer":
      return (
        <span className="inline-flex items-center gap-1 rounded-full border border-primary/30 bg-primary/8 px-2.5 py-1 text-xs font-semibold text-primary">
          <Star className="size-3.5" aria-hidden />
          Offer
        </span>
      );
    case "hired":
      return (
        <span className="inline-flex items-center rounded-full bg-success/12 px-2.5 py-1 text-xs font-semibold text-success">
          Hired
        </span>
      );
  }
}

/**
 * 4.1 — Recruiter desk. The recruiter is a facilitator paid on outcomes: stats
 * up top (with an emphasized earnings tile), the value-add intro list, and a
 * footer that reframes the commercial model (success fee, no retainers).
 */
export default async function RecruiterPage() {
  const activeIntros = RECRUITER_INTROS.length;
  const inInterview = RECRUITER_INTROS.filter((i) => i.stage === "interview").length;

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight">Recruiter desk</h1>
        <p className="text-sm text-muted-foreground">Facilitate matches. Paid on outcomes.</p>
      </header>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-border bg-card p-5">
          <p className="text-3xl font-bold tracking-tight">{activeIntros}</p>
          <p className="mt-1 text-sm text-muted-foreground">active intros</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-5">
          <p className="text-3xl font-bold tracking-tight">{inInterview}</p>
          <p className="mt-1 text-sm text-muted-foreground">in interview</p>
        </div>
        <div className="rounded-2xl border border-primary/30 bg-primary/8 p-5">
          <div className="flex items-center gap-2 text-primary">
            <BadgeEuro className="size-5" aria-hidden />
            <span className="text-xs font-semibold uppercase tracking-wide">Earned on hires</span>
          </div>
          <p className="mt-1 text-4xl font-extrabold tracking-tight text-primary">€8.4k</p>
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Where you add value
        </h2>
        <ul className="flex flex-col gap-3">
          {RECRUITER_INTROS.map((intro) => (
            <li
              key={intro.id}
              className="flex items-center gap-4 rounded-2xl border border-border bg-card p-4"
            >
              <PersonAvatar
                person={{ name: intro.candidateName, initials: initialsFromName(intro.candidateName) }}
                size={40}
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">
                  {intro.candidateName} → {intro.roleTitle} @ {intro.company}
                </p>
                <p className="mt-0.5 truncate text-sm text-muted-foreground">{intro.valueNote}</p>
              </div>
              <StagePill stage={intro.stage} />
            </li>
          ))}
        </ul>
      </section>

      <div className="flex items-center gap-3 rounded-2xl bg-accent p-4 text-accent-foreground">
        <HandCoins className="size-5 shrink-0" aria-hidden />
        <p className="text-sm font-medium">
          No retainers, no exclusivity. A success fee only when your intro gets hired.
        </p>
      </div>
    </div>
  );
}
