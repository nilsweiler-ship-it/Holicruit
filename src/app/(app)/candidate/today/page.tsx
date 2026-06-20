import type { Metadata } from "next";
import { matchingService } from "@/lib/services/matching";
import { getActiveCandidateId } from "@/lib/persona";
import { DailySwipe } from "@/components/candidate/daily-swipe";

export const metadata: Metadata = { title: "Today's matches · Holicruit" };

/**
 * 2.5 — Mobile daily matches. A small, curated daily set triaged as a swipeable
 * card stack. Deliberately limited (~3) — anti-firehose.
 */
export default async function TodayPage() {
  const daily = await matchingService.getDailyMatches(await getActiveCandidateId());

  return (
    <div className="mx-auto flex max-w-md flex-col gap-6">
      <header className="flex flex-col gap-1 text-center">
        <h1 className="text-2xl font-bold tracking-tight">Today&apos;s {daily.length} — hand-picked</h1>
        <p className="text-sm text-muted-foreground">Both sides opted in. Swipe to triage.</p>
      </header>
      <DailySwipe matches={daily} />
    </div>
  );
}
