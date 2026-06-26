"use client";

import { useMemo, useState, useTransition } from "react";
import { BadgeCheck, Clock, ExternalLink, Plus, ShieldCheck, UserCheck } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import type { Endorsement, HardSkill } from "@/lib/types";
import { addSkill, giveEndorsement } from "@/lib/actions/candidate";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Status = "verified" | "pending" | "plain";
interface ChipState {
  name: string;
  status: Status;
}

/**
 * Hard-skill chips with the peer-endorsement flow. Verification is *earned* — a
 * plain chip can request a peer endorsement (→ pending), and when a peer
 * endorses (the give side lives at /candidate/endorse/[skill]) it becomes
 * verified. Verified chips show who vouched.
 */
export function SkillChips({
  initial,
  endorsements,
  candidateId,
}: {
  initial: HardSkill[];
  endorsements: Endorsement[];
  candidateId: string;
}) {
  const [skills, setSkills] = useState<ChipState[]>(
    initial.map((s) => ({ name: s.name, status: s.verified ? "verified" : "plain" })),
  );
  const [active, setActive] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState("");
  const [, startTransition] = useTransition();

  const activeChip = skills.find((s) => s.name === active) ?? null;
  const activeEndorsers = useMemo(
    () => (active ? endorsements.filter((e) => e.skill === active) : []),
    [active, endorsements],
  );

  function setStatus(name: string, status: Status) {
    setSkills((prev) => prev.map((s) => (s.name === name ? { ...s, status } : s)));
  }

  function commitAdd() {
    const name = draft.trim();
    if (name && !skills.some((s) => s.name.toLowerCase() === name.toLowerCase())) {
      setSkills((prev) => [...prev, { name, status: "plain" }]);
      startTransition(() => addSkill(name));
    }
    setDraft("");
    setAdding(false);
  }

  return (
    <>
      <div className="flex flex-wrap items-center gap-2">
        {skills.map((s) => (
          <button
            key={s.name}
            type="button"
            onClick={() => setActive(s.name)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium transition-colors",
              s.status === "verified" && "bg-success/12 text-success ring-1 ring-success/30 hover:bg-success/20",
              s.status === "pending" && "bg-muted text-muted-foreground ring-1 ring-border hover:bg-accent",
              s.status === "plain" && "bg-muted text-foreground hover:bg-accent",
            )}
          >
            {s.status === "verified" && <BadgeCheck className="size-3.5" />}
            {s.status === "pending" && <Clock className="size-3.5" />}
            {s.name}
            {s.status === "pending" && <span className="text-xs">· pending</span>}
          </button>
        ))}

        {adding ? (
          <input
            autoFocus
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={commitAdd}
            onKeyDown={(e) => {
              if (e.key === "Enter") commitAdd();
              if (e.key === "Escape") {
                setDraft("");
                setAdding(false);
              }
            }}
            placeholder="Skill name…"
            className="w-32 rounded-full border border-primary/40 bg-background px-3 py-1 text-sm outline-none focus:ring-2 focus:ring-primary/30"
          />
        ) : (
          <button
            type="button"
            onClick={() => setAdding(true)}
            className="inline-flex items-center gap-1 rounded-full border border-dashed border-border px-3 py-1 text-sm font-medium text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground"
          >
            <Plus className="size-3.5" />
            add
          </button>
        )}
      </div>

      <Dialog open={active !== null} onOpenChange={(o) => !o && setActive(null)}>
        <DialogContent className="sm:max-w-md">
          {activeChip?.status === "verified" ? (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <ShieldCheck className="size-5 text-success" />
                  {activeChip.name} · verified
                </DialogTitle>
                <DialogDescription>Earned through peer endorsements — not self-rated.</DialogDescription>
              </DialogHeader>
              <ul className="flex flex-col gap-3 py-1">
                {(activeEndorsers.length ? activeEndorsers : GENERIC_ENDORSERS).map((e) => (
                  <li key={e.id} className="flex items-center gap-3">
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-secondary text-sm font-semibold text-secondary-foreground">
                      {e.endorserInitials}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{e.endorserName}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {e.endorserHeadline} · {e.relationship}
                      </p>
                    </div>
                    <UserCheck className="ml-auto size-4 shrink-0 text-success" />
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle>Verify {activeChip?.name}</DialogTitle>
                <DialogDescription>
                  {activeChip?.status === "pending"
                    ? "Endorsement requested. Share your link with a peer who's seen this skill."
                    : "Ask a peer who's seen this skill to vouch for it. Earned verification beats a self-rating."}
                </DialogDescription>
              </DialogHeader>

              <div className="flex flex-col gap-2 rounded-lg border border-border bg-muted/40 p-3 text-sm">
                <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Endorsement link
                </span>
                <Link
                  href={`/endorse/${encodeURIComponent(activeChip?.name ?? "")}`}
                  className="inline-flex items-center gap-1 truncate text-primary hover:underline"
                >
                  holicruit.app/endorse/{activeChip?.name}
                  <ExternalLink className="size-3.5 shrink-0" />
                </Link>
              </div>

              <DialogFooter className="gap-2 sm:gap-2">
                {activeChip?.status !== "pending" && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      if (activeChip) setStatus(activeChip.name, "pending");
                      toast("Endorsement requested", { description: "We'll notify you when a peer vouches." });
                    }}
                  >
                    Request endorsement
                  </Button>
                )}
                <Button
                  onClick={() => {
                    if (activeChip) {
                      setStatus(activeChip.name, "verified");
                      const skill = activeChip.name;
                      startTransition(() =>
                        giveEndorsement({ candidateId, skill, relationship: "Peer" }),
                      );
                    }
                    toast.success(`${activeChip?.name} verified`, {
                      description: "A peer endorsed you — this skill now carries verification.",
                    });
                    setActive(null);
                  }}
                >
                  <UserCheck className="size-4" />
                  Simulate a peer endorsement
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

const GENERIC_ENDORSERS: Endorsement[] = [
  {
    id: "generic-1",
    skill: "",
    endorserName: "A verified peer",
    endorserInitials: "✓",
    endorserHeadline: "Worked with you",
    relationship: "Peer",
  },
];
