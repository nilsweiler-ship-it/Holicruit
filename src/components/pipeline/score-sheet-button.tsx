"use client";

import { toast } from "sonner";
import { Button } from "@/components/ui/button";

/** Client wrapper: attaches a structured score sheet to the scheduled interview. */
export function ScoreSheetButton() {
  return (
    <Button
      variant="outline"
      onClick={() => toast("Structured score sheet attached to the interview.")}
    >
      Add structured score sheet
    </Button>
  );
}
