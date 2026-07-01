import { Zap } from "lucide-react";

/** Marks a role matched with priority (Scale plan). */
export function PriorityBadge() {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-primary/12 px-2 py-0.5 text-xs font-semibold text-primary">
      <Zap className="size-3" />
      Priority
    </span>
  );
}
