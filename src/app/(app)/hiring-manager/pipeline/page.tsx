import Link from "next/link";
import { Plus, Zap, Radar, UploadCloud } from "lucide-react";
import { matchingService } from "@/lib/services/matching";
import { getRoleMarketSnapshot } from "@/lib/services/marketsnapshot";
import { getActiveHmOpeningId, requireUser } from "@/lib/persona";
import { getHmOnboarding } from "@/lib/services/onboarding";
import { OnboardingCurriculum } from "@/components/layout/onboarding-curriculum";
import { HmPipelineBoard } from "@/components/pipeline/hm-pipeline-board";
import { MarketSnapshot } from "@/components/pipeline/market-snapshot";
import { PriorityBadge } from "@/components/pipeline/priority-badge";
import { Button } from "@/components/ui/button";

/**
 * 3.1 Pipeline — the hiring manager's view of one opening's candidates,
 * grouped into advanceable stages. The opening can be selected via the
 * `opening` search param (from the Roles list), otherwise the active one.
 */
export default async function PipelinePage({
  searchParams,
}: {
  searchParams: Promise<{ opening?: string }>;
}) {
  const { opening: openingParam } = await searchParams;
  const openingId = openingParam ?? (await getActiveHmOpeningId());
  const user = await requireUser();
  const onboarding = await getHmOnboarding(user.id);

  if (!openingId) {
    return (
      <div className="flex flex-col gap-6">
        <OnboardingCurriculum onboarding={onboarding} storageKey="holicruit-onb-hm" />
        <div className="flex flex-col items-center gap-4 rounded-2xl border border-border bg-card p-10 text-center">
          <p className="text-sm text-muted-foreground">No roles yet — post one.</p>
          <Button asChild>
            <Link href="/hiring-manager/roles/new">
              <Plus className="size-4" />
              Post a role
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  const [pipeline, snapshot] = await Promise.all([
    matchingService.getPipeline(openingId),
    getRoleMarketSnapshot(openingId),
  ]);
  const opening =
    pipeline.talking[0]?.opening ??
    pipeline.new[0]?.opening ??
    pipeline.offer[0]?.opening ??
    null;

  const total = pipeline.new.length + pipeline.talking.length + pipeline.offer.length;
  const title = opening?.title ?? snapshot?.roleTitle ?? "Pipeline";
  const companyName = opening?.company.name ?? snapshot?.companyName ?? "";

  return (
    <div className="flex flex-col gap-6">
      <OnboardingCurriculum onboarding={onboarding} storageKey="holicruit-onb-hm" />

      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <h1 className="font-serif text-3xl tracking-tight text-foreground">{title}</h1>
            {opening?.priority && <PriorityBadge />}
          </div>
          <p className="text-sm text-muted-foreground">
            {companyName}
            {opening?.company.location ? ` · ${opening.company.location}` : ""}
            {" — "}
            <span className="font-medium text-foreground">{total} matched</span>
          </p>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link href={`/hiring-manager/roles/${openingId}/import-candidates`}>
            <UploadCloud className="size-4" />
            Import candidates
          </Link>
        </Button>
      </header>

      {total === 0 ? (
        <div className="flex items-start gap-3 rounded-2xl border border-primary/25 bg-primary/5 p-5">
          <Radar className="mt-0.5 size-5 shrink-0 text-primary" />
          <div className="text-sm">
            <p className="font-medium text-foreground">This role is live and listening.</p>
            <p className="text-muted-foreground">
              No one clears your bar just yet — but the market is closer than a blank screen suggests.
              Here&apos;s the honest landscape, and we&apos;ll surface candidates the moment they
              qualify and opt in.
            </p>
          </div>
        </div>
      ) : (
        <HmPipelineBoard newCol={pipeline.new} talking={pipeline.talking} offer={pipeline.offer} />
      )}

      {snapshot && <MarketSnapshot snapshot={snapshot} />}

      {total > 0 && (
        <div className="flex items-center gap-3 rounded-2xl border border-border bg-accent p-4 text-sm text-accent-foreground">
          <Zap className="size-5 shrink-0 text-primary" />
          <p>Auto-feedback drafted for everyone you pass — review &amp; send in one click.</p>
        </div>
      )}
    </div>
  );
}
