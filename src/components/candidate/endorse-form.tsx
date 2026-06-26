"use client";

import { useState, useTransition } from "react";
import { CheckCircle2, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { giveEndorsement } from "@/lib/actions/candidate";
import { Button } from "@/components/ui/button";

const RELATIONSHIPS = ["Manager", "Teammate", "Mentor", "Client / stakeholder", "Other"];

/**
 * The "give" side of peer endorsement — a peer follows a shared link and
 * vouches for a candidate's skill. On submit, the candidate's skill becomes
 * verified (mocked).
 */
export function EndorseForm({
  candidateId,
  candidateName,
  skill,
}: {
  candidateId: string;
  candidateName: string;
  skill: string;
}) {
  const [relationship, setRelationship] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [pending, startTransition] = useTransition();

  if (done) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-success/40 bg-success/8 p-8 text-center">
        <CheckCircle2 className="size-10 text-success" />
        <h2 className="text-lg font-semibold">Endorsement recorded</h2>
        <p className="text-sm text-muted-foreground">
          Thank you. <span className="font-medium text-foreground">{skill}</span> now carries your
          verification on {candidateName}&apos;s profile.
        </p>
      </div>
    );
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
        {RELATIONSHIPS.map((r) => (
          <button
            key={r}
            type="button"
            onClick={() => setRelationship(r)}
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
      <Button
        disabled={!relationship || pending}
        className="self-start"
        onClick={() => {
          if (candidateId && relationship) {
            startTransition(() => void giveEndorsement({ candidateId, skill, relationship }));
          }
          setDone(true);
          toast.success(`You endorsed ${candidateName} for ${skill}.`);
        }}
      >
        <ShieldCheck className="size-4" />
        Endorse {skill}
      </Button>
    </div>
  );
}
