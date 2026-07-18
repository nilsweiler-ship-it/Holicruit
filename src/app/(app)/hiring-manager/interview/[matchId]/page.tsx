import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Sparkles } from "lucide-react";
import { matchingService } from "@/lib/services/matching";
import { scenarioService } from "@/lib/services/scenario";
import { getActivePlan } from "@/lib/services/billing";
import { generateInterviewGuide } from "@/lib/services/interviewkit";
import { requireUser } from "@/lib/persona";
import { LockedFeature } from "@/components/billing/locked-feature";

export const metadata: Metadata = { title: "Interview guide · Holicruit" };

/**
 * AI-generated structured interview guide (Team+) — tailored to the candidate's
 * gaps, the role's required skills, and the measured personality profile.
 */
export default async function InterviewGuidePage({
  params,
}: {
  params: Promise<{ matchId: string }>;
}) {
  const { matchId } = await params;
  const match = await matchingService.getMatch(matchId);
  if (!match) notFound();

  const user = await requireUser();
  const { plan } = await getActivePlan(user.id, "hiring_manager");

  const header = (
    <div className="flex flex-col gap-2">
      <Link
        href={`/hiring-manager/candidate/${matchId}`}
        className="inline-flex w-fit items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Back to candidate
      </Link>
      <div className="flex items-center gap-2">
        <Sparkles className="size-5 text-primary" />
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Interview guide</h1>
      </div>
    </div>
  );

  if (!plan.interviewKit) {
    return (
      <div className="flex flex-col gap-6">
        {header}
        <LockedFeature
          title="AI-generated interview guides"
          tier="Team"
          blurb="Generate a structured, role- and candidate-specific interview kit in one click — targeted questions, what to listen for, and the scorecard criterion each maps to. Stop writing interview scripts from scratch."
          learnMoreHref="/hiring-manager/features/interview-kit"
        />
      </div>
    );
  }

  const personality = await scenarioService.getPersonalityProfile(match.candidate.id);
  const guide = generateInterviewGuide(match, personality);

  return (
    <div className="flex flex-col gap-6">
      {header}
      <div className="flex flex-col gap-1 rounded-2xl border border-primary/25 bg-primary/5 p-4">
        <p className="text-sm">
          <span className="font-semibold text-foreground">{guide.candidateName}</span>
          <span className="text-muted-foreground"> · {guide.roleTitle}</span>
        </p>
        <p className="text-sm text-muted-foreground">
          Generated for this candidate — tuned to their gaps, the role&apos;s skills, and their
          measured profile. ~{guide.minutes} min. Edit freely before the interview.
        </p>
      </div>

      {guide.sections.map((section) => (
        <section key={section.title} className="flex flex-col gap-3">
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              {section.title}
            </h2>
            <p className="text-sm text-muted-foreground">{section.purpose}</p>
          </div>
          <ol className="flex flex-col gap-3">
            {section.items.map((item, i) => (
              <li key={i} className="rounded-2xl border border-border bg-card p-4">
                <p className="font-medium text-foreground">{item.question}</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  <span className="font-medium text-foreground">Listen for:</span> {item.listenFor}
                </p>
                <span className="mt-2 inline-flex rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                  Scores: {item.criterion}
                </span>
              </li>
            ))}
          </ol>
        </section>
      ))}

      <p className="text-xs text-muted-foreground">
        Structured, consistent questions reduce bias and make decisions defensible — every answer
        maps to your score sheet.
      </p>
    </div>
  );
}
