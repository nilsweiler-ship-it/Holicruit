import Link from "next/link";
import { Plus, Zap } from "lucide-react";
import { matchingService } from "@/lib/services/matching";
import { getActiveHmOpeningId, requireUser } from "@/lib/persona";
import { getHmOnboarding } from "@/lib/services/onboarding";
import { OnboardingCurriculum } from "@/components/layout/onboarding-curriculum";
import { HmPipelineBoard } from "@/components/pipeline/hm-pipeline-board";
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

  const pipeline = await matchingService.getPipeline(openingId);
  const opening =
    pipeline.talking[0]?.opening ??
    pipeline.new[0]?.opening ??
    pipeline.offer[0]?.opening ??
    null;

  const total = pipeline.new.length + pipeline.talking.length + pipeline.offer.length;

  return (
    <div className="flex flex-col gap-6">
      <OnboardingCurriculum onboarding={onboarding} storageKey="holicruit-onb-hm" />

      <header className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            {opening?.title ?? "Pipeline"}
          </h1>
          {opening?.priority && <PriorityBadge />}
        </div>
        <p className="text-sm text-muted-foreground">
          {opening?.company.name}
          {opening?.company.location ? ` · ${opening.company.location}` : ""}
          {" — "}
          <span className="font-medium text-foreground">{total} matched</span>
        </p>
      </header>

      <HmPipelineBoard
        newCol={pipeline.new}
        talking={pipeline.talking}
        offer={pipeline.offer}
      />

      <div className="flex items-center gap-3 rounded-2xl border border-border bg-accent p-4 text-sm text-accent-foreground">
        <Zap className="size-5 shrink-0 text-primary" />
        <p>Auto-feedback drafted for everyone you pass — review &amp; send in one click.</p>
      </div>
    </div>
  );
}
