/**
 * MatchingService — the seam between this UI and the (separate) matching engine.
 *
 * The UI only ever consumes this interface. Backed by per-persona fixture
 * "worlds" so the same screens work across industries. Methods are async so the
 * mock and a future networked implementation are interchangeable.
 */

import type { GrowthReport, SkillGap } from "../fit/types";
import type { Match, PipelineStage } from "../types";
import {
  CANDIDATE_WORLDS,
  DEFAULT_CANDIDATE_ID,
  GROWTH_REPORTS,
  PIPELINE_MATCHES,
  PROGRAMS,
} from "../fixtures";

export interface MatchingService {
  /** Candidate-side matches, ranked by mutualFit descending. */
  getCandidateMatches(candidateId: string): Promise<Match[]>;
  /** A small curated daily set for the mobile swipe view. */
  getDailyMatches(candidateId: string): Promise<Match[]>;
  /** Closed (decided) matches — each has a growth report. */
  getClosedMatches(candidateId: string): Promise<Match[]>;
  /** A single match by id (candidate- or manager-side). */
  getMatch(matchId: string): Promise<Match | null>;
  /** A role's pipeline, candidates grouped by stage. */
  getPipeline(openingId: string): Promise<Record<PipelineStage, Match[]>>;
  /** The growth report for a closed match, if one exists. */
  getGrowthReport(matchId: string): Promise<GrowthReport | null>;
  /** How many open roles the candidate would clear if a gap were closed. */
  rolesClearedIfGapClosed(gap: SkillGap): Promise<number>;
}

const worldOf = (candidateId: string) =>
  CANDIDATE_WORLDS[candidateId] ?? CANDIDATE_WORLDS[DEFAULT_CANDIDATE_ID];

/** Every match across all personas + the pipeline — for id lookups. */
const ALL_MATCHES: Match[] = [
  ...Object.values(CANDIDATE_WORLDS).flatMap((w) => [...w.matches, ...w.closed]),
  ...PIPELINE_MATCHES,
];

const EMPTY_PIPELINE: Record<PipelineStage, Match[]> = { new: [], talking: [], offer: [], closed: [] };

class MockMatchingService implements MatchingService {
  async getCandidateMatches(candidateId: string): Promise<Match[]> {
    return [...worldOf(candidateId).matches].sort((a, b) => b.fit.mutualFit - a.fit.mutualFit);
  }

  async getDailyMatches(candidateId: string): Promise<Match[]> {
    const world = worldOf(candidateId);
    return world.dailyIds
      .map((id) => world.matches.find((m) => m.id === id))
      .filter((m): m is Match => Boolean(m));
  }

  async getClosedMatches(candidateId: string): Promise<Match[]> {
    return worldOf(candidateId).closed;
  }

  async getMatch(matchId: string): Promise<Match | null> {
    return ALL_MATCHES.find((m) => m.id === matchId) ?? null;
  }

  async getPipeline(openingId: string): Promise<Record<PipelineStage, Match[]>> {
    if (!PIPELINE_MATCHES.some((m) => m.opening.id === openingId)) return EMPTY_PIPELINE;
    const grouped: Record<PipelineStage, Match[]> = { new: [], talking: [], offer: [], closed: [] };
    for (const m of PIPELINE_MATCHES) {
      if (m.opening.id === openingId) grouped[m.stage].push(m);
    }
    (Object.keys(grouped) as PipelineStage[]).forEach((s) =>
      grouped[s].sort((a, b) => b.fit.mutualFit - a.fit.mutualFit),
    );
    return grouped;
  }

  async getGrowthReport(matchId: string): Promise<GrowthReport | null> {
    return GROWTH_REPORTS.find((r) => r.matchId === matchId) ?? null;
  }

  async rolesClearedIfGapClosed(gap: SkillGap): Promise<number> {
    const report = GROWTH_REPORTS.find((r) => r.primaryGap.skill === gap.skill);
    if (report) return report.rolesClearedIfClosed;
    return PROGRAMS.filter((p) => p.closesGap === gap.skill).length;
  }
}

export const matchingService: MatchingService = new MockMatchingService();
