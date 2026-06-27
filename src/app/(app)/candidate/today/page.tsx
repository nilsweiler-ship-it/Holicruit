import type { Metadata } from "next";
import { matchingService } from "@/lib/services/matching";
import { marketplaceService } from "@/lib/services/marketplace";
import { getActiveCandidateId } from "@/lib/persona";
import { DailySwipe, type DailyItem } from "@/components/candidate/daily-swipe";

export const metadata: Metadata = { title: "Today's matches · Holicruit" };

/**
 * 2.5 — Mobile daily matches. A small, curated daily set triaged as a swipeable
 * card stack. Deliberately limited (~3) — anti-firehose.
 */
export default async function TodayPage() {
  const candidateId = await getActiveCandidateId();
  const [daily, programs] = await Promise.all([
    matchingService.getDailyMatches(candidateId),
    marketplaceService.getRecommendedPrograms(candidateId, 2),
  ]);

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
      {items.length > 0 ? (
        <DailySwipe items={items} />
      ) : (
        <p className="rounded-2xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
          No picks yet — build your profile and take the scenario to get matched.
        </p>
      )}
    </div>
  );
}
