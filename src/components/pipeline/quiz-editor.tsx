"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import type { SkillCheckItem } from "@/lib/fixtures/skill-checks";

const SCORES = [
  { v: 10, label: "Strong" },
  { v: 5, label: "OK" },
  { v: 2, label: "Weak" },
];

const inputCls =
  "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30";

let uid = 0;
const nid = (p: string) => `${p}${Date.now()}${uid++}`;

/**
 * Role assessment editor (Scale). The HM edits applied, judgment-based items —
 * prompts and options graded Strong/OK/Weak. Emits a hidden `quiz` JSON field.
 */
export function QuizEditor({ initial }: { initial: SkillCheckItem[] }) {
  const [items, setItems] = useState<SkillCheckItem[]>(initial);

  const update = (fn: (draft: SkillCheckItem[]) => SkillCheckItem[]) =>
    setItems((prev) => fn(structuredClone(prev)));

  return (
    <div className="flex flex-col gap-4">
      <input type="hidden" name="quiz" value={JSON.stringify(items)} />

      {items.map((item, i) => (
        <div key={item.id} className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4">
          <div className="flex items-start justify-between gap-3">
            <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Item {i + 1}
            </span>
            <button
              type="button"
              onClick={() => update((d) => d.filter((_, k) => k !== i))}
              className="text-muted-foreground transition-colors hover:text-destructive"
              aria-label="Remove item"
            >
              <Trash2 className="size-4" />
            </button>
          </div>

          <textarea
            value={item.prompt}
            onChange={(e) => update((d) => { d[i]!.prompt = e.target.value; return d; })}
            rows={2}
            placeholder="A realistic, judgment-based situation…"
            className={inputCls}
          />

          <div className="flex flex-col gap-2">
            {item.options.map((opt, j) => (
              <div key={opt.id} className="flex items-center gap-2">
                <input
                  value={opt.text}
                  onChange={(e) => update((d) => { d[i]!.options[j]!.text = e.target.value; return d; })}
                  placeholder={`Option ${j + 1}`}
                  className={inputCls}
                />
                <select
                  value={SCORES.some((s) => s.v === opt.score) ? opt.score : 5}
                  onChange={(e) =>
                    update((d) => { d[i]!.options[j]!.score = Number(e.target.value); return d; })
                  }
                  className="shrink-0 rounded-lg border border-border bg-background px-2 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30"
                >
                  {SCORES.map((s) => (
                    <option key={s.v} value={s.v}>{s.label}</option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => update((d) => { d[i]!.options = d[i]!.options.filter((_, k) => k !== j); return d; })}
                  disabled={item.options.length <= 2}
                  className="shrink-0 text-muted-foreground transition-colors hover:text-destructive disabled:opacity-30"
                  aria-label="Remove option"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() =>
                update((d) => { d[i]!.options.push({ id: nid("o"), text: "", score: 5 }); return d; })
              }
              className="inline-flex w-fit items-center gap-1 text-xs font-medium text-primary hover:underline"
            >
              <Plus className="size-3.5" />
              Add option
            </button>
          </div>
        </div>
      ))}

      <button
        type="button"
        onClick={() =>
          update((d) => {
            d.push({
              id: nid("q"),
              prompt: "",
              options: [
                { id: nid("o"), text: "", score: 10 },
                { id: nid("o"), text: "", score: 5 },
                { id: nid("o"), text: "", score: 2 },
              ],
            });
            return d;
          })
        }
        className="inline-flex w-fit items-center gap-1.5 rounded-lg border border-dashed border-border px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary"
      >
        <Plus className="size-4" />
        Add item
      </button>
    </div>
  );
}
