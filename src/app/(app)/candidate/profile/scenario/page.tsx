import type { Metadata } from "next";
import Link from "next/link";
import { Clock } from "lucide-react";
import { scenarioService } from "@/lib/services/scenario";
import { requireHat } from "@/lib/access";
import { getActiveCandidateId } from "@/lib/persona";
import { prisma } from "@/lib/db";
import { toPublicQuestions } from "@/lib/integrity/scenario-scoring";
import { nextAttemptAt, SCENARIO_COOLDOWN_MS, SKILL_CHECK_ATTEMPT_PREFIX } from "@/lib/integrity/assessment-attempts";
import { ScenarioRunner } from "@/components/candidate/scenario-runner";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "Skill scenario · Holicruit" };

/**
 * Interactive soft-skill scenario assessment. Universal situational-judgment
 * questions — measures behavior, not field knowledge — that update the
 * candidate's scenario-derived soft-skill bars.
 *
 * The browser gets question/option text only: competency weights and trait
 * loadings stay on the server, option order is shuffled here per attempt
 * (seeded, so SSR and hydration agree), and `submitScenario` scores by id.
 */
export default async function ScenarioPage() {
  await requireHat("candidate");
  const candidateId = await getActiveCandidateId();
  const last = await prisma.scenarioResult.findFirst({
    where: { profileId: candidateId, NOT: { scores: { contains: SKILL_CHECK_ATTEMPT_PREFIX } } },
    orderBy: { createdAt: "desc" },
    select: { createdAt: true },
  });
  const retryAt = nextAttemptAt(last?.createdAt, SCENARIO_COOLDOWN_MS);
  const questions = await scenarioService.getQuestions();
  const seed = `${candidateId}:scenario:${last?.createdAt.toISOString() ?? "first"}`;

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h1 className="font-serif text-2xl tracking-tight">Skill scenario</h1>
        <p className="text-sm text-muted-foreground">
          ~8 minutes · situational judgment · measures behavior, not field
          knowledge — the same test works in any industry
        </p>
      </header>

      {retryAt ? (
        <div className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-6">
          <div className="flex items-center gap-2 text-sm font-medium text-foreground">
            <Clock className="size-4 text-muted-foreground" />
            You&apos;ve taken the scenario recently
          </div>
          <p className="text-sm text-muted-foreground">
            You can retake it after{" "}
            <time dateTime={retryAt.toISOString()} className="font-medium text-foreground">
              {retryAt.toLocaleDateString("en-GB", { dateStyle: "medium", timeZone: "UTC" })}
            </time>
            . Your current results stay on your profile until then.
          </p>
          <Button asChild variant="outline" className="self-start">
            <Link href="/candidate/profile">Back to profile</Link>
          </Button>
        </div>
      ) : (
        <ScenarioRunner questions={toPublicQuestions(questions, seed)} />
      )}
    </div>
  );
}
