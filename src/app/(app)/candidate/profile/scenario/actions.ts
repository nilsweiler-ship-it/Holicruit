"use server";

import { scenarioService } from "@/lib/services/scenario";

export async function scoreScenario(answers: Record<string, string>) {
  return scenarioService.score(answers);
}
