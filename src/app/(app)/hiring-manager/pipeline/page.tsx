import { Zap } from "lucide-react";
import { matchingService } from "@/lib/services/matching";
import { getActiveHmOpeningId } from "@/lib/persona";
import { HmPipelineBoard } from "@/components/pipeline/hm-pipeline-board";

/**
 * 3.1 Pipeline — the hiring manager's view of one opening's candidates,
 * grouped into advanceable stages.
 */
export default async function PipelinePage() {
  const openingId = await getActiveHmOpeningId();
  const pipeline = openingId
    ? await matchingService.getPipeline(openingId)
    : { new: [], talking: [], offer: [], closed: [] };
  const opening =
    pipeline.talking[0]?.opening ??
    pipeline.new[0]?.opening ??
    pipeline.offer[0]?.opening ??
    null;

  const total = pipeline.new.length + pipeline.talking.length + pipeline.offer.length;

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          {opening?.title ?? "Pipeline"}
        </h1>
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
