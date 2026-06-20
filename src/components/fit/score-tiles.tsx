import { BadgeCheck } from "lucide-react";
import type { FitObject } from "@/lib/fit/types";
import { cn } from "@/lib/utils";

/**
 * The fit triplet as three large tiles — Hard / Soft / Verified — for the
 * hiring-manager candidate deep-dive. The Verified tile is emphasized.
 */
export function ScoreTiles({ fit, className }: { fit: FitObject; className?: string }) {
  return (
    <div className={cn("grid grid-cols-3 gap-3", className)}>
      <Tile label="Hard" value={fit.hardFit} />
      <Tile label="Soft" value={fit.softFit} />
      <VerifiedTile verified={fit.verified} />
    </div>
  );
}

function Tile({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-card px-3 py-4">
      <span className="text-3xl font-bold tracking-tight text-foreground">{value}</span>
      <span className="mt-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </span>
    </div>
  );
}

function VerifiedTile({ verified }: { verified: boolean }) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-xl border px-3 py-4",
        verified ? "border-success/40 bg-success/10" : "border-border bg-card",
      )}
    >
      <BadgeCheck className={cn("size-7", verified ? "text-success" : "text-muted-foreground/50")} />
      <span
        className={cn(
          "mt-1 text-xs font-medium uppercase tracking-wide",
          verified ? "text-success" : "text-muted-foreground",
        )}
      >
        {verified ? "Verified" : "Unverified"}
      </span>
    </div>
  );
}
