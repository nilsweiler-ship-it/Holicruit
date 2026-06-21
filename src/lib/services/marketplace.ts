/**
 * MarketplaceService — programs read from the DB; the aggregate gap-demand
 * analytics stays a static fixture (it's a cross-tenant rollup, not per-row).
 */

import type { GapDemand, Program, ProviderStats } from "../types";
import { prisma } from "../db";
import { GAP_DEMAND, PROVIDER_STATS } from "../fixtures";

export interface MarketplaceService {
  getProgramsForGap(skill: string): Promise<Program[]>;
  getProviderPrograms(providerId: string): Promise<Program[]>;
  getGapDemand(): Promise<GapDemand[]>;
  getProviderStats(providerId: string): Promise<ProviderStats>;
}

const programInclude = { provider: { select: { name: true, kind: true } } } as const;

type ProgramRow = {
  id: string;
  providerId: string;
  title: string;
  format: string;
  credential: string | null;
  tags: string;
  closesGap: string;
  gapType: string;
  sponsored: boolean;
  enrollments: number;
  completions: number;
  reMatches: number;
  provider: { name: string; kind: string };
};

function toProgram(r: ProgramRow): Program {
  return {
    id: r.id,
    providerId: r.providerId,
    provider: r.provider.name,
    providerKind: r.provider.kind as Program["providerKind"],
    title: r.title,
    format: r.format,
    credential: r.credential ?? undefined,
    tags: JSON.parse(r.tags) as string[],
    closesGap: r.closesGap,
    gapType: r.gapType as Program["gapType"],
    sponsored: r.sponsored,
    enrollments: r.enrollments,
    completions: r.completions,
    reMatches: r.reMatches,
  };
}

class DbMarketplaceService implements MarketplaceService {
  async getProgramsForGap(skill: string): Promise<Program[]> {
    const rows = await prisma.program.findMany({
      where: { closesGap: skill },
      include: programInclude,
      orderBy: [{ sponsored: "desc" }, { reMatches: "desc" }],
    });
    return rows.map(toProgram);
  }

  async getProviderPrograms(providerId: string): Promise<Program[]> {
    const rows = await prisma.program.findMany({ where: { providerId }, include: programInclude });
    return rows.map(toProgram);
  }

  async getGapDemand(): Promise<GapDemand[]> {
    return [...GAP_DEMAND].sort((a, b) => b.candidatesWithGap - a.candidatesWithGap);
  }

  async getProviderStats(providerId: string): Promise<ProviderStats> {
    const programs = await prisma.program.findMany({
      where: { providerId },
      select: { enrollments: true, completions: true, reMatches: true },
    });
    return {
      activePrograms: programs.length,
      learnersEnrolled: programs.reduce((n, p) => n + p.enrollments, 0),
      gapsClosed: programs.reduce((n, p) => n + p.completions, 0),
      reMatchesGenerated: programs.reduce((n, p) => n + p.reMatches, 0),
      revenue: PROVIDER_STATS.revenue,
      currency: PROVIDER_STATS.currency,
    };
  }
}

export const marketplaceService: MarketplaceService = new DbMarketplaceService();
