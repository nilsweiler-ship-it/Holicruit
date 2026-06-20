/**
 * ScenarioAssessmentService — the seam to the (separate) soft-skill scenario
 * assessment. Soft-skill scores come from this objective, scenario-based test —
 * never from candidate self-rating. The profile screen only *launches* it and
 * displays results.
 */

import type { SoftSkillScore } from "../types";
import { CURRENT_CANDIDATE } from "../fixtures";

export interface ScenarioAssessmentService {
  /** Scenario-derived soft-skill scores for a candidate. */
  getSoftSkillScores(candidateId: string): Promise<SoftSkillScore[]>;
  /** Whether the candidate has completed the scenario. */
  isComplete(candidateId: string): Promise<boolean>;
  /** Approximate length of the assessment, in minutes (for CTA copy). */
  estimatedMinutes(): number;
}

class MockScenarioAssessmentService implements ScenarioAssessmentService {
  async getSoftSkillScores(): Promise<SoftSkillScore[]> {
    return CURRENT_CANDIDATE.softSkills;
  }

  async isComplete(): Promise<boolean> {
    return CURRENT_CANDIDATE.scenarioCompleted;
  }

  estimatedMinutes(): number {
    return 8;
  }
}

export const scenarioService: ScenarioAssessmentService = new MockScenarioAssessmentService();
