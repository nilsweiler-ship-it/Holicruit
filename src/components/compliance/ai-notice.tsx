import Link from "next/link";
import { Info } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Transparency notice: Holicruit uses automated assessment. Surfaced on
 * candidate-facing decision surfaces to support GDPR Art 22 / EU AI Act
 * transparency. Not a substitute for a full privacy notice or DPIA.
 */
export function AiNotice({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex items-start gap-2 rounded-xl border border-border bg-muted/40 p-3 text-xs text-muted-foreground",
        className,
      )}
    >
      <Info className="mt-0.5 size-4 shrink-0 text-primary" />
      <span>
        Holicruit uses automated assessments to help measure fit. Scores support decisions — a
        person makes the final hiring call, you can always see the reasoning, and you can request a
        human review.{" "}
        <Link href="/privacy" className="underline underline-offset-2 hover:text-foreground">
          How it works &amp; your rights
        </Link>
        .
      </span>
    </div>
  );
}
