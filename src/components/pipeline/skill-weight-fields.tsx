"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

type Level = "essential" | "important" | "bonus";
const LEVELS: { key: Level; label: string }[] = [
  { key: "essential", label: "Essential" },
  { key: "important", label: "Important" },
  { key: "bonus", label: "Bonus" },
];

/**
 * Per-skill importance (Team+). The HM rates each required skill Essential /
 * Important / Bonus; matching weights each skill accordingly and treats a
 * missing Essential as a bigger gap. Emits a hidden `skillWeights` JSON field.
 */
export function SkillWeightFields({
  hardSkills,
  softSkills,
  defaultWeights = {},
}: {
  hardSkills: string[];
  softSkills: string[];
  defaultWeights?: Record<string, string>;
}) {
  const all = [
    ...hardSkills.map((s) => ({ skill: s, kind: "hard" as const })),
    ...softSkills.map((s) => ({ skill: s, kind: "soft" as const })),
  ];
  const [weights, setWeights] = useState<Record<string, Level>>(() => {
    const w: Record<string, Level> = {};
    for (const { skill } of all) {
      const d = defaultWeights[skill];
      w[skill] = d === "essential" || d === "bonus" ? d : "important";
    }
    return w;
  });

  if (all.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-border p-3 text-sm text-muted-foreground">
        No required skills on this role yet — add some when editing the role to weight them.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-foreground">Skill importance</span>
        <span className="text-xs text-muted-foreground">weights the match, per skill</span>
      </div>
      <input type="hidden" name="skillWeights" value={JSON.stringify(weights)} />
      <ul className="flex flex-col divide-y divide-border">
        {all.map(({ skill, kind }) => (
          <li key={`${kind}-${skill}`} className="flex flex-wrap items-center justify-between gap-2 py-2">
            <span className="text-sm text-foreground">
              {skill}
              <span className="ml-2 text-[10px] uppercase tracking-wide text-muted-foreground">{kind}</span>
            </span>
            <div className="flex overflow-hidden rounded-lg border border-border">
              {LEVELS.map((lvl) => {
                const active = weights[skill] === lvl.key;
                return (
                  <button
                    key={lvl.key}
                    type="button"
                    onClick={() => setWeights((w) => ({ ...w, [skill]: lvl.key }))}
                    className={cn(
                      "px-2.5 py-1 text-xs font-medium transition-colors",
                      active
                        ? "bg-primary text-primary-foreground"
                        : "bg-background text-muted-foreground hover:bg-accent",
                    )}
                  >
                    {lvl.label}
                  </button>
                );
              })}
            </div>
          </li>
        ))}
      </ul>
      <p className="text-xs text-muted-foreground">
        Essential skills weigh most; a missing Essential is flagged as a major gap.
      </p>
    </div>
  );
}
