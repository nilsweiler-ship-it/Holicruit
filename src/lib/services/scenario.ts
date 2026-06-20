/**
 * ScenarioAssessmentService — the seam to the (separate) soft-skill scenario
 * assessment. Soft-skill scores come from this objective, scenario-based test —
 * never from candidate self-rating. The assessment is universal: the situations
 * are domain-agnostic, so it works the same for a nurse, a salesperson, or an
 * engineer.
 */

import type { SoftSkillScore } from "../types";
import type { ScenarioQuestion, ScenarioResult } from "../scenario/types";
import { SOFT_DIMENSIONS } from "../scenario/types";
import { CANDIDATE_WORLDS, DEFAULT_CANDIDATE_ID } from "../fixtures";
import { SCENARIO_QUESTIONS } from "../fixtures/scenarios";

export interface ScenarioAssessmentService {
  /** Scenario-derived soft-skill scores for a candidate. */
  getSoftSkillScores(candidateId: string): Promise<SoftSkillScore[]>;
  /** Whether the candidate has completed the scenario. */
  isComplete(candidateId: string): Promise<boolean>;
  /** Approximate length of the assessment, in minutes (for CTA copy). */
  estimatedMinutes(): number;
  /** The situational-judgment questions. */
  getQuestions(): Promise<ScenarioQuestion[]>;
  /** Score a set of answers (questionId → optionId) into soft-skill levels. */
  score(answers: Record<string, string>): Promise<ScenarioResult>;
}

const worldOf = (candidateId: string) =>
  CANDIDATE_WORLDS[candidateId] ?? CANDIDATE_WORLDS[DEFAULT_CANDIDATE_ID];

class MockScenarioAssessmentService implements ScenarioAssessmentService {
  async getSoftSkillScores(candidateId: string): Promise<SoftSkillScore[]> {
    return worldOf(candidateId).profile.softSkills;
  }

  async isComplete(candidateId: string): Promise<boolean> {
    return worldOf(candidateId).profile.scenarioCompleted;
  }

  estimatedMinutes(): number {
    return 8;
  }

  async getQuestions(): Promise<ScenarioQuestion[]> {
    return SCENARIO_QUESTIONS;
  }

  async score(answers: Record<string, string>): Promise<ScenarioResult> {
    // For each dimension: earned points / max available across all questions → 0–100.
    const earned: Record<string, number> = {};
    const max: Record<string, number> = {};
    for (const dim of SOFT_DIMENSIONS) {
      earned[dim] = 0;
      max[dim] = 0;
    }

    for (const q of SCENARIO_QUESTIONS) {
      // Max each dimension could earn on this question (best option for it).
      for (const dim of SOFT_DIMENSIONS) {
        const best = Math.max(0, ...q.options.map((o) => o.weights[dim] ?? 0));
        max[dim] += best;
      }
      const chosen = q.options.find((o) => o.id === answers[q.id]);
      if (chosen) {
        for (const dim of SOFT_DIMENSIONS) earned[dim] += chosen.weights[dim] ?? 0;
      }
    }

    const scores = SOFT_DIMENSIONS.map((dim) => ({
      name: dim,
      level: max[dim] > 0 ? Math.round((earned[dim] / max[dim]) * 100) : 0,
    }));
    return { scores };
  }
}

export const scenarioService: ScenarioAssessmentService = new MockScenarioAssessmentService();
