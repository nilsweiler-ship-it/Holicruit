import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Target } from "lucide-react";
import { matchingService } from "@/lib/services/matching";
import { GrowthPanel } from "@/components/match/growth-panel";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "Growth report · Holicruit" };

/**
 * 2.4 — Growth Report ★. Auto-generated for every rejection. Explains exactly
 * why the candidate wasn't selected (You vs. Role bar, hard and soft) and
 * routes the identified gap into the upskilling marketplace.
 */
export default async function GrowthReportPage({
  params,
}: {
  params: Promise<{ matchId: string }>;
}) {
  const { matchId } = await params;
  const report = await matchingService.getGrowthReport(matchId);
  if (!report) notFound();

  const gapHref = `/candidate/growth-paths?gap=${encodeURIComponent(report.primaryGap.skill)}`;

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight">Not this time — here&apos;s exactly why</h1>
        <p className="text-sm text-muted-foreground">
          {report.roleTitle} · {report.company} ·{" "}
          <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium uppercase tracking-wide">
            closed
          </span>
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2">
        <GrowthPanel panel={report.hard} />
        <GrowthPanel panel={report.soft} />
      </div>

      {/* Close-the-gap CTA — the flywheel into the marketplace (5.1) */}
      <section className="flex flex-col gap-4 rounded-2xl border border-primary/30 bg-primary/8 p-5">
        <div className="flex items-start gap-3">
          <Target className="mt-0.5 size-5 shrink-0 text-primary" />
          <div className="flex flex-col gap-1">
            <h2 className="font-semibold text-foreground">
              Close the one gap → re-match next time
            </h2>
            <p className="text-sm text-muted-foreground">
              {report.matchingProgramCount} short program
              {report.matchingProgramCount > 1 ? "s" : ""} match{" "}
              <span className="font-medium text-foreground">
                &ldquo;{report.primaryGap.skill}&rdquo;
              </span>
              . Finish one and you&apos;d clear the bar for{" "}
              <span className="font-semibold text-foreground">
                {report.rolesClearedIfClosed} open roles
              </span>{" "}
              you&apos;ve matched with.
            </p>
          </div>
        </div>
        <Button asChild className="self-start">
          <Link href={gapHref}>
            See growth paths
            <ArrowRight className="size-4" />
          </Link>
        </Button>
      </section>
    </div>
  );
}
