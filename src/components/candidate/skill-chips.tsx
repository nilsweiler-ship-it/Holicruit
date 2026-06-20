"use client";

import { useState } from "react";
import { BadgeCheck, Plus } from "lucide-react";
import type { HardSkill } from "@/lib/types";
import { cn } from "@/lib/utils";

/**
 * Hard-skill chips for the profile builder. Verified chips (peer endorsement,
 * scenario, work samples) are visually distinct from self-added ones.
 * Verification is *earned*, never user-toggled — so the inline "+ add" creates
 * a plain (unverified) chip.
 */
export function SkillChips({ initial }: { initial: HardSkill[] }) {
  const [skills, setSkills] = useState<HardSkill[]>(initial);
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState("");

  function commit() {
    const name = draft.trim();
    if (name && !skills.some((s) => s.name.toLowerCase() === name.toLowerCase())) {
      setSkills((prev) => [...prev, { name, verified: false }]);
    }
    setDraft("");
    setAdding(false);
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {skills.map((s) => (
        <span
          key={s.name}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium",
            s.verified
              ? "bg-success/12 text-success ring-1 ring-success/30"
              : "bg-muted text-foreground",
          )}
        >
          {s.verified && <BadgeCheck className="size-3.5" />}
          {s.name}
        </span>
      ))}

      {adding ? (
        <input
          autoFocus
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => {
            if (e.key === "Enter") commit();
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
  );
}
