/**
 * MarketplaceService — the seam to the upskilling marketplace, where
 * fourth-party training providers offer/promote programs that close candidate
 * skill gaps. Consumed candidate-side (programs for my gap) and provider-side
 * (gap demand, my catalog, my stats). Mocked over fixtures.
 */

import type { GapDemand, Program, ProviderStats } from "../types";
import { GAP_DEMAND, PROGRAMS, PROVIDER_STATS } from "../fixtures";

export interface MarketplaceService {
  /** Programs that close a given gap — sponsored first, then by re-match track
   *  record. Candidate-facing (routed from the Growth Report). */
  getProgramsForGap(skill: string): Promise<Program[]>;
  /** A provider's own catalog. */
  getProviderPrograms(providerId: string): Promise<Program[]>;
  /** Aggregate gap demand providers can target ("stretch" gaps). */
  getGapDemand(): Promise<GapDemand[]>;
  /** A provider's headline stats. */
  getProviderStats(providerId: string): Promise<ProviderStats>;
}

class MockMarketplaceService implements MarketplaceService {
  async getProgramsForGap(skill: string): Promise<Program[]> {
    return PROGRAMS.filter((p) => p.closesGap === skill).sort(
      (a, b) => Number(b.sponsored) - Number(a.sponsored) || b.reMatches - a.reMatches,
    );
  }

  async getProviderPrograms(providerId: string): Promise<Program[]> {
    return PROGRAMS.filter((p) => p.providerId === providerId);
  }

  async getGapDemand(): Promise<GapDemand[]> {
    return [...GAP_DEMAND].sort((a, b) => b.candidatesWithGap - a.candidatesWithGap);
  }

  async getProviderStats(): Promise<ProviderStats> {
    return PROVIDER_STATS;
  }
}

export const marketplaceService: MarketplaceService = new MockMarketplaceService();
