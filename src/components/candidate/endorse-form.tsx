"use client";

import { useState, useTransition } from "react";
import { CheckCircle2, Loader2, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { giveEndorsement } from "@/lib/actions/candidate";
import { ENDORSEMENT_RELATIONSHIPS, type EndorsementRelationship } from "@/lib/integrity/endorsement-shared";
import { Button } from "@/components/ui/button";

/**
 * The "give" side of peer endorsement — a signed-in peer follows a signed link
 * and vouches for a candidate's skill. Success is shown only after the server
 * action has recorded it; every refusal (expired link, self-endorsement,
 * duplicate) is shown as-is.
 */
export function EndorseForm({
  token,
  candidateName,
  skill,
}: {
  token: string;
  candidateName: string;
  skill: string;
}) {
  const [relationship, setRelationship] = useState<EndorsementRelationship | null>(null);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  if (done) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-success/40 bg-success/8 p-8 text-center">
        <CheckCircle2 className="size-10 text-success" />
        <h2 className="text-lg font-semibold">Endorsement recorded</h2>
        <p className="text-sm text-muted-foreground">
          Thank you. Your endorsement of <span className="font-medium text-foreground">{skill}</span> is now
          on {candidateName}&apos;s profile.
        </p>
      </div>
    );
  }

  function submit() {
    if (!relationship) return;
    setError(null);
    startTransition(async () => {
      try {
        const res = await giveEndorsement({ token, relationship });
        if (res.ok) {
          setDone(true);
          toast.success(`You endorsed ${candidateName} for ${skill}.`);
        } else {
          setError(res.error);
        }
      } catch {
        setError("Something went wrong — your endorsement wasn't saved. Please try again.");
      }
    });
  }

  return (
    <div className="flex flex-col gap-5 rounded-2xl border border-border bg-card p-6">
      <div className="flex items-center gap-2 text-sm font-medium text-success">
        <ShieldCheck className="size-4" />
        Peer endorsement
      </div>
      <p className="text-sm text-muted-foreground">
        How do you know {candidateName}? This is attached to your endorsement.
      </p>
      <div className="flex flex-wrap gap-2">
        {ENDORSEMENT_RELATIONSHIPS.map((r) => (
          <button
            key={r}
            type="button"
            onClick={() => setRelationship(r)}
            aria-pressed={relationship === r}
            className={
              "rounded-full border px-3 py-1.5 text-sm font-medium transition-colors " +
              (relationship === r
                ? "border-primary bg-primary/10 text-primary"
                : "border-border text-muted-foreground hover:bg-accent")
            }
          >
            {r}
          </button>
        ))}
      </div>
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
      <Button disabled={!relationship || pending} className="self-start" onClick={submit}>
        {pending ? <Loader2 className="size-4 animate-spin" /> : <ShieldCheck className="size-4" />}
        Endorse {skill}
      </Button>
    </div>
  );
}
