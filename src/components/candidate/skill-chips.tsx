"use client";

import { useMemo, useState, useTransition } from "react";
import { BadgeCheck, Clock, Copy, Link2, Loader2, Plus, ShieldCheck, UserCheck } from "lucide-react";
import { toast } from "sonner";
import type { Endorsement, HardSkill } from "@/lib/types";
import { addSkill, requestEndorsementLink } from "@/lib/actions/candidate";
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
 * Hard-skill chips with the peer-endorsement flow. Verification is *earned* —
 * a plain chip gets a signed endorsement link (server-minted, names this
 * candidate + skill, valid 30 days) to share with a peer; when a signed-in peer
 * endorses at /endorse/<skill>?t=… the skill becomes verified. The candidate
 * can't endorse themselves. Verified chips show who vouched.
 */
export function SkillChips({
  initial,
  endorsements,
}: {
  initial: HardSkill[];
  endorsements: Endorsement[];
  /** Kept for call-site compatibility; links are minted server-side for the session's own profile. */
  candidateId?: string;
}) {
  const [skills, setSkills] = useState<ChipState[]>(
    initial.map((s) => ({ name: s.name, status: s.verified ? "verified" : "plain" })),
  );
  const [active, setActive] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState("");
  const [, startTransition] = useTransition();
  const [links, setLinks] = useState<Record<string, string>>({});
  const [linkPending, startLink] = useTransition();

  const activeChip = skills.find((s) => s.name === active) ?? null;
  const activeEndorsers = useMemo(
    () => (active ? endorsements.filter((e) => e.skill === active) : []),
    [active, endorsements],
  );

  function setStatus(name: string, status: Status) {
    setSkills((prev) => prev.map((s) => (s.name === name ? { ...s, status } : s)));
  }

  function getLink(name: string) {
    startLink(async () => {
      try {
        const res = await requestEndorsementLink(name);
        if (!res.ok) {
          toast.error(res.error);
          return;
        }
        // NEXT_PUBLIC_APP_URL gives an absolute link; otherwise use this origin.
        const url = /^https?:\/\//.test(res.url) ? res.url : `${window.location.origin}${res.url}`;
        setLinks((prev) => ({ ...prev, [name]: url }));
        setStatus(name, "pending");
      } catch {
        toast.error("Couldn't create a link right now. Please try again.");
      }
    });
  }

  async function copyLink(url: string) {
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Link copied", { description: "Send it to a peer who's seen this skill." });
    } catch {
      toast("Copy the link above and send it to a peer.");
    }
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
                <DialogDescription>
                  {activeEndorsers.length
                    ? "Earned through peer endorsements — not self-rated."
                    : "Verified through an applied skill check — not self-rated."}
                </DialogDescription>
              </DialogHeader>
              <ul className="flex flex-col gap-3 py-1">
                {activeEndorsers.map((e) => (
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

              {activeChip && links[activeChip.name] ? (
                <div className="flex flex-col gap-2 rounded-lg border border-border bg-muted/40 p-3 text-sm">
                  <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Your endorsement link · valid 30 days
                  </span>
                  <code className="break-all text-xs text-foreground">{links[activeChip.name]}</code>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  We&apos;ll create a private link that names you and this skill. Only a peer with their own
                  Holicruit account can endorse through it — you can&apos;t endorse yourself.
                </p>
              )}

              <DialogFooter className="gap-2 sm:gap-2">
                {activeChip && links[activeChip.name] ? (
                  <Button onClick={() => copyLink(links[activeChip.name]!)}>
                    <Copy className="size-4" />
                    Copy link
                  </Button>
                ) : (
                  <Button disabled={linkPending || !activeChip} onClick={() => activeChip && getLink(activeChip.name)}>
                    {linkPending ? <Loader2 className="size-4 animate-spin" /> : <Link2 className="size-4" />}
                    Get endorsement link
                  </Button>
                )}
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
