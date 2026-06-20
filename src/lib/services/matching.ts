/**
 * MatchingService — the seam between this UI and the (separate) matching engine.
 *
 * The UI only ever consumes this interface. The real engine is a different
 * service; here it is backed by fixtures. Methods are async on purpose so the
 * mock and a future networked implementation are interchangeable.
 */

import type { GrowthReport, SkillGap } from "../fit/types";
import type { Match, PipelineStage } from "../types";
import {
  CANDIDATE_MATCHES,
  CLOSED_MATCH,
  DAILY_MATCH_IDS,
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

const ALL_MATCHES: Match[] = [...CANDIDATE_MATCHES, CLOSED_MATCH, ...PIPELINE_MATCHES];

const EMPTY_PIPELINE: Record<PipelineStage, Match[]> = { new: [], talking: [], offer: [], closed: [] };

class MockMatchingService implements MatchingService {
  async getCandidateMatches(): Promise<Match[]> {
    return [...CANDIDATE_MATCHES].sort((a, b) => b.fit.mutualFit - a.fit.mutualFit);
  }

  async getDailyMatches(): Promise<Match[]> {
    return DAILY_MATCH_IDS.map((id) => CANDIDATE_MATCHES.find((m) => m.id === id)).filter(
      (m): m is Match => Boolean(m),
    );
  }

  async getClosedMatches(): Promise<Match[]> {
    return [CLOSED_MATCH];
  }

  async getMatch(matchId: string): Promise<Match | null> {
    return ALL_MATCHES.find((m) => m.id === matchId) ?? null;
  }

  async getPipeline(openingId: string): Promise<Record<PipelineStage, Match[]>> {
    const grouped: Record<PipelineStage, Match[]> = { new: [], talking: [], offer: [], closed: [] };
    for (const m of PIPELINE_MATCHES) {
      if (m.opening.id === openingId) grouped[m.stage].push(m);
    }
    // Rank each column by mutualFit desc.
    (Object.keys(grouped) as PipelineStage[]).forEach((s) =>
      grouped[s].sort((a, b) => b.fit.mutualFit - a.fit.mutualFit),
    );
    return PIPELINE_MATCHES.some((m) => m.opening.id === openingId) ? grouped : EMPTY_PIPELINE;
  }

  async getGrowthReport(matchId: string): Promise<GrowthReport | null> {
    return GROWTH_REPORTS.find((r) => r.matchId === matchId) ?? null;
  }

  async rolesClearedIfGapClosed(gap: SkillGap): Promise<number> {
    const report = GROWTH_REPORTS.find((r) => r.primaryGap.skill === gap.skill);
    if (report) return report.rolesClearedIfClosed;
    // Fallback heuristic for arbitrary gaps: count programs that close it.
    return PROGRAMS.filter((p) => p.closesGap === gap.skill).length;
  }
}

export const matchingService: MatchingService = new MockMatchingService();
