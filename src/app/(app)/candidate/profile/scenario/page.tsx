import type { Metadata } from "next";
import { scenarioService } from "@/lib/services/scenario";
import { ScenarioRunner } from "@/components/candidate/scenario-runner";

export const metadata: Metadata = { title: "Skill scenario · Holicruit" };

/**
 * Interactive soft-skill scenario assessment. Universal situational-judgment
 * questions — measures behavior, not field knowledge — that update the
 * candidate's scenario-derived soft-skill bars.
 */
export default async function ScenarioPage() {
  const questions = await scenarioService.getQuestions();

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h1 className="font-serif text-xl tracking-tight">Skill scenario</h1>
        <p className="text-sm text-muted-foreground">
          ~8 minutes · situational judgment · measures behavior, not field
          knowledge — the same test works in any industry
        </p>
      </header>

      <ScenarioRunner questions={questions} />
    </div>
  );
}
