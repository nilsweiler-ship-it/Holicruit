"use client";

import { useTransition } from "react";
import { Eye, Loader2 } from "lucide-react";
import { shareTermsAsCandidate, shareTermsAsEmployer } from "@/lib/actions/privacy";
import { Button } from "@/components/ui/button";

/** Opt to share your exact pay/location figures for this match (the other side
 *  sees them only if they share too). */
export function TermsShareButton({
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
      className="self-start"
      disabled={pending}
      onClick={() =>
        start(async () => {
          if (side === "candidate") await shareTermsAsCandidate(matchId);
          else await shareTermsAsEmployer(matchId);
        })
      }
    >
      {pending ? <Loader2 className="size-4 animate-spin" /> : <Eye className="size-4" />}
      Share exact figures
    </Button>
  );
}
