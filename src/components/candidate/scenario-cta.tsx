"use client";

import { ArrowRight, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

/**
 * Launches the soft-skill scenario assessment. The assessment itself
 * (questions, scoring) is a separate system — here we only launch it; results
 * would flow back in to update the soft-skill bars and completeness ring.
 */
export function ScenarioCta({ minutes, completed }: { minutes: number; completed: boolean }) {
  return (
    <Button
      size="lg"
      className="self-start"
      onClick={() =>
        toast("Launching the skill scenario…", {
          description: `~${minutes} minutes · your results update your soft-skill bars automatically.`,
          icon: <Sparkles className="size-4" />,
        })
      }
    >
      {completed ? "Retake the" : "Take the"} {minutes}-min skill scenario
      <ArrowRight className="size-4" />
    </Button>
  );
}
