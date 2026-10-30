/**
 * ScenarioAssessmentService — soft-skill scores read from the DB; the
 * (universal, domain-agnostic) question bank and scoring stay in code.
 */

import type { SoftSkillScore } from "../types";
import type { ScenarioQuestion, ScenarioResult, PersonalityDimension } from "../scenario/types";
import { SOFT_DIMENSIONS, PERSONALITY_DIMENSIONS } from "../scenario/types";
import { prisma } from "../db";
import { SCENARIO_QUESTIONS } from "../fixtures/scenarios";
import { scoreScenario } from "../integrity/scenario-scoring";

export type PersonalityProfile = { name: PersonalityDimension; level: number }[];

export interface ScenarioAssessmentService {
  getSoftSkillScores(candidateId: string): Promise<SoftSkillScore[]>;
  getPersonalityProfile(candidateId: string): Promise<PersonalityProfile | null>;
  isComplete(candidateId: string): Promise<boolean>;
  estimatedMinutes(): number;
  /** The full bank WITH loadings — server-only; send `toPublicQuestions(...)` to the browser. */
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

  async getPersonalityProfile(candidateId: string): Promise<PersonalityProfile | null> {
    const p = await prisma.candidateProfile.findUnique({
      where: { id: candidateId },
      select: { traitProfile: true },
    });
    if (!p?.traitProfile) return null;
    try {
      const parsed = JSON.parse(p.traitProfile) as Record<string, number>;
      return PERSONALITY_DIMENSIONS.map((name) => ({ name, level: parsed[name] ?? 0 }));
    } catch {
      return null;
    }
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

  /**
   * Score a submission. Throws InvalidScenarioAnswers unless every question has
   * exactly one valid option id — a partial or bogus submission is rejected,
   * never stored as an all-zero profile. See integrity/scenario-scoring.ts.
   */
  async score(answers: Record<string, string>): Promise<ScenarioResult> {
    return scoreScenario(SCENARIO_QUESTIONS, answers);
  }
}

export const scenarioService: ScenarioAssessmentService = new DbScenarioAssessmentService();
