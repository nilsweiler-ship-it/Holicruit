"use client";

import { useState, useTransition } from "react";
import { Check, Loader2, Scale } from "lucide-react";
import { requestHumanReview } from "@/lib/actions/review";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

/** Lets a candidate contest an outcome and ask for a human review (GDPR Art 22). */
export function RequestReview({ matchId }: { matchId: string }) {
  const [open, setOpen] = useState(false);
  const [note, setNote] = useState("");
  const [sent, setSent] = useState(false);
  const [pending, start] = useTransition();

  if (sent) {
    return (
      <section className="flex items-start gap-3 rounded-2xl border border-border bg-card p-5">
        <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-success/15 text-success">
          <Check className="size-4" />
        </span>
        <div className="text-sm">
          <p className="font-medium text-foreground">Review requested</p>
          <p className="text-muted-foreground">
            A person will review this decision. This is your right — automated scores never have the
            final say.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-5">
      <div className="flex items-start gap-3">
        <Scale className="mt-0.5 size-5 shrink-0 text-primary" />
        <div className="text-sm">
          <p className="font-medium text-foreground">Disagree with this outcome?</p>
          <p className="text-muted-foreground">
            You can ask a person to review it. A human always makes the final call.
          </p>
        </div>
      </div>

      {open ? (
        <div className="flex flex-col gap-2">
          <Textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={3}
            placeholder="Optional: anything you'd like the reviewer to consider…"
            className="resize-none"
          />
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              disabled={pending}
              onClick={() =>
                start(async () => {
                  const r = await requestHumanReview(matchId, note);
                  if (r.ok) setSent(true);
                })
              }
            >
              {pending ? <Loader2 className="size-4 animate-spin" /> : <Scale className="size-4" />}
              Submit review request
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <Button size="sm" variant="outline" className="self-start" onClick={() => setOpen(true)}>
          Request a human review
        </Button>
      )}
    </section>
  );
}
