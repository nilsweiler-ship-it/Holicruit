"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Launches the soft-skill scenario assessment. Navigates to the interactive
 * scenario runner; results flow back to update the soft-skill bars and
 * completeness ring.
 */
export function ScenarioCta({ minutes, completed }: { minutes: number; completed: boolean }) {
  return (
    <Button asChild size="lg" className="self-start">
      <Link href="/candidate/profile/scenario">
        {completed ? "Retake the" : "Take the"} {minutes}-min skill scenario
        <ArrowRight className="size-4" />
      </Link>
    </Button>
  );
}
