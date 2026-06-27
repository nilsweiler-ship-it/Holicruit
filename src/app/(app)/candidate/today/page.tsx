import type { Metadata } from "next";
import Link from "next/link";
import { Sparkles, Wand2 } from "lucide-react";
import { matchingService } from "@/lib/services/matching";
import { marketplaceService } from "@/lib/services/marketplace";
import { getActiveCandidateId } from "@/lib/persona";
import { Button } from "@/components/ui/button";
import { DailySwipe, type DailyItem } from "@/components/candidate/daily-swipe";

export const metadata: Metadata = { title: "Today's matches · Holicruit" };

/**
 * 2.5 — Mobile daily matches. A small, curated daily set triaged as a swipeable
 * card stack. Deliberately limited (~3) — anti-firehose.
 */
export default async function TodayPage() {
  const candidateId = await getActiveCandidateId();
  const daily = await matchingService.getDailyMatches(candidateId);
  // Show more trainings while there are no job matches yet, so Today stays useful.
  const programs = await marketplaceService.getRecommendedPrograms(candidateId, daily.length ? 2 : 4);
  const noJobs = daily.length === 0;

  // Interleave job matches with gap-closing trainings.
  const items: DailyItem[] = [];
  const max = Math.max(daily.length, programs.length);
  for (let i = 0; i < max; i++) {
    if (daily[i]) items.push({ kind: "match", match: daily[i]! });
    if (programs[i]) items.push({ kind: "program", program: programs[i]! });
  }

  return (
    <div className="mx-auto flex max-w-md flex-col gap-6">
      <header className="flex flex-col gap-1 text-center">
        <h1 className="text-2xl font-bold tracking-tight">Today — hand-picked</h1>
        <p className="text-sm text-muted-foreground">
          {daily.length} job{daily.length === 1 ? "" : "s"} · {programs.length} training
          {programs.length === 1 ? "" : "s"} to close your gaps. Swipe to triage.
        </p>
      </header>

      {noJobs && (
        <div className="flex flex-col gap-3 rounded-2xl border border-primary/30 bg-primary/8 p-4 text-center">
          <p className="text-sm text-muted-foreground">
            No job matches yet — build your profile and we&apos;ll match you to open roles. In the
            meantime, here are trainings to grow with.
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            <Button asChild size="sm">
              <Link href="/candidate/profile/scenario">
                <Sparkles className="size-4" />
                Take the scenario
              </Link>
            </Button>
            <Button asChild size="sm" variant="outline">
              <Link href="/candidate/profile/import">
                <Wand2 className="size-4" />
                Import your skills
              </Link>
            </Button>
          </div>
        </div>
      )}

      {items.length > 0 && <DailySwipe items={items} />}
    </div>
  );
}
