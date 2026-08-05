"use client";

import { useTransition } from "react";
import { Eye, Loader2 } from "lucide-react";
import { revealMyIdentity, revealEmployer } from "@/lib/actions/privacy";
import { Button } from "@/components/ui/button";

/** Reveals the viewer's real identity to the counterparty for this match only. */
export function RevealButton({
  matchId,
  side,
}: {
  matchId: string;
  side: "candidate" | "employer";
}) {
  const [pending, start] = useTransition();
  return (
    <Button
      size="sm"
      variant="outline"
      disabled={pending}
      className="shrink-0"
      onClick={() =>
        start(async () => {
          if (side === "candidate") await revealMyIdentity(matchId);
          else await revealEmployer(matchId);
        })
      }
    >
      {pending ? <Loader2 className="size-4 animate-spin" /> : <Eye className="size-4" />}
      Reveal my identity
    </Button>
  );
}
