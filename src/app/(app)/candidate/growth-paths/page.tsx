import type { Metadata } from "next";
import Link from "next/link";
import { Target } from "lucide-react";
import { marketplaceService } from "@/lib/services/marketplace";
import { matchingService } from "@/lib/services/matching";
import { ProgramCard } from "@/components/market/program-card";

export const metadata: Metadata = { title: "Growth paths · Holicruit" };

const DEFAULT_GAP = "TypeScript at scale";

/**
 * 5.1 — Upskilling marketplace (roadmap / design-complete). Turns the gap
 * identified in the Growth Report into targeted learning. Programs are offered
 * and promoted by fourth-party training providers, filtered/ranked by the
 * candidate's gap. Completing one updates the profile and re-runs matching.
 */
export default async function GrowthPathsPage({
  searchParams,
}: {
  searchParams: Promise<{ gap?: string }>;
}) {
  const { gap: gapParam } = await searchParams;
  const gap = gapParam || DEFAULT_GAP;

  const programs = await marketplaceService.getProgramsForGap(gap);
  const gapType = programs[0]?.gapType ?? "hard";
  const rolesCleared = await matchingService.rolesClearedIfGapClosed({
    skill: gap,
    type: gapType,
    severity: "moderate",
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-2">
        <Link
          href="/candidate/matches"
          className="text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          ← Back
        </Link>
        <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Roadmap
        </span>
      </div>

      {/* Gap context banner */}
      <header className="flex items-start gap-3 rounded-2xl border border-primary/30 bg-primary/8 p-5">
        <Target className="mt-0.5 size-5 shrink-0 text-primary" />
        <div>
          <h1 className="text-lg font-bold tracking-tight">
            Your gap: {gap}
          </h1>
          <p className="text-sm text-muted-foreground">
            Closing it clears the bar for{" "}
            <span className="font-semibold text-foreground">{rolesCleared} open roles</span> you&apos;ve
            matched with.
          </p>
        </div>
      </header>

      {programs.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {programs.map((p) => (
            <ProgramCard key={p.id} program={p} rolesCleared={rolesCleared} />
          ))}
        </div>
      ) : (
        <p className="rounded-2xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
          No programs cover this gap yet — providers are notified of demand like yours.
        </p>
      )}

      <p className="text-center text-xs text-muted-foreground">
        Roadmap feature — designed, not yet built. Education providers are partners and a future
        revenue line. Completing a program updates your profile and re-runs matching automatically.
      </p>
    </div>
  );
}
