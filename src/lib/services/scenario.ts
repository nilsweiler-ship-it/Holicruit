/**
 * ScenarioAssessmentService — soft-skill scores read from the DB; the
 * (universal, domain-agnostic) question bank and scoring stay in code.
 */

import type { SoftSkillScore } from "../types";
import type { ScenarioQuestion, ScenarioResult } from "../scenario/types";
import { SOFT_DIMENSIONS } from "../scenario/types";
import { prisma } from "../db";
import { SCENARIO_QUESTIONS } from "../fixtures/scenarios";

export interface ScenarioAssessmentService {
  getSoftSkillScores(candidateId: string): Promise<SoftSkillScore[]>;
  isComplete(candidateId: string): Promise<boolean>;
  estimatedMinutes(): number;
  getQuestions(): Promise<ScenarioQuestion[]>;
  score(answers: Record<string, string>): Promise<ScenarioResult>;
}

class DbScenarioAssessmentService implements ScenarioAssessmentService {
  async getSoftSkillScores(candidateId: string): Promise<SoftSkillScore[]> {
    const rows = await prisma.softSkillScore.findMany({
      where: { profileId: candidateId },
      select: { name: true, level: true },
    });
    // Preserve the canonical dimension order.
    return SOFT_DIMENSIONS.map((name) => rows.find((r) => r.name === name) ?? { name, level: 0 });
  }

  async isComplete(candidateId: string): Promise<boolean> {
    const p = await prisma.candidateProfile.findUnique({
      where: { id: candidateId },
      select: { scenarioCompleted: true },
    });
    return p?.scenarioCompleted ?? false;
  }

  estimatedMinutes(): number {
    return 8;
  }

  async getQuestions(): Promise<ScenarioQuestion[]> {
    return SCENARIO_QUESTIONS;
  }

  async score(answers: Record<string, string>): Promise<ScenarioResult> {
    const earned: Record<string, number> = {};
    const max: Record<string, number> = {};
    for (const dim of SOFT_DIMENSIONS) {
      earned[dim] = 0;
      max[dim] = 0;
    }
    for (const q of SCENARIO_QUESTIONS) {
      for (const dim of SOFT_DIMENSIONS) {
        max[dim] += Math.max(0, ...q.options.map((o) => o.weights[dim] ?? 0));
      }
      const chosen = q.options.find((o) => o.id === answers[q.id]);
      if (chosen) for (const dim of SOFT_DIMENSIONS) earned[dim] += chosen.weights[dim] ?? 0;
    }
    return {
      scores: SOFT_DIMENSIONS.map((name) => ({
        name,
        level: max[name] > 0 ? Math.round((earned[name] / max[name]) * 100) : 0,
      })),
    };
  }
}

export const scenarioService: ScenarioAssessmentService = new DbScenarioAssessmentService();
