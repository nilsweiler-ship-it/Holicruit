"use client";

import { useTransition } from "react";
import { FileCheck2 } from "lucide-react";
import { toast } from "sonner";
import { attachScoreSheet } from "@/lib/actions/match";
import { Button } from "@/components/ui/button";

/** Attaches a structured score sheet to the scheduled interview (persisted). */
export function ScoreSheetButton({ matchId }: { matchId?: string }) {
  const [pending, startTransition] = useTransition();
  return (
    <Button
      variant="outline"
      disabled={pending}
      onClick={() => {
        if (matchId) startTransition(() => void attachScoreSheet(matchId));
        toast("Structured score sheet attached to the interview.");
      }}
    >
      <FileCheck2 className="size-4" />
      Add structured score sheet
    </Button>
  );
}
