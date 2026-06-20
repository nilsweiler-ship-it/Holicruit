"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import type { Match } from "@/lib/types";
import { FEEDBACK_DRAFTS } from "@/lib/fixtures";

/** Build a short draft from the match when no pre-authored one exists. */
function synthesizeDraft(match: Match): string {
  const { hardFit, softFit, gaps } = match.fit;
  const name = match.candidate.name.split(" ")[0] ?? match.candidate.name;
  const gap = gaps[0];
  const hardVsSoft =
    hardFit >= softFit
      ? `Your hard skills (${hardFit}) read strongest against our role bar; soft skills came in at ${softFit}.`
      : `Your soft skills (${softFit}) read strongest against our role bar; hard skills came in at ${hardFit}.`;
  const gapLine = gap
    ? ` Where it was close: ${gap.skill} (${gap.type}) — close that one gap and you'd clear the bar here next time.`
    : " It was genuinely close — strong across the board.";
  return (
    `Hi ${name} — thank you for the conversation. ${hardVsSoft}${gapLine}` +
    " Full breakdown in your Growth Report."
  );
}

/**
 * Pass + feedback action. Opens a dialog with the auto-drafted (editable)
 * feedback body. Sending generates the candidate's Growth Report.
 */
export function PassFeedback({ match }: { match: Match }) {
  const draft = FEEDBACK_DRAFTS.find((d) => d.matchId === match.id);
  const [open, setOpen] = useState(false);
  const [body, setBody] = useState(draft?.body ?? synthesizeDraft(match));

  function handleSend() {
    setOpen(false);
    toast.success(`Feedback sent — ${match.candidate.name}'s growth report generated.`);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Pass + feedback</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Pass with feedback</DialogTitle>
          <DialogDescription>
            Auto-drafted from the fit breakdown. Review, edit, and send in one click.
          </DialogDescription>
        </DialogHeader>

        <Textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={8}
          className="resize-none"
          aria-label="Feedback draft"
        />

        <p className="text-xs text-muted-foreground">
          On send, this generates the candidate&apos;s Growth Report — rejection is never silent.
        </p>

        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSend}>Send feedback</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
