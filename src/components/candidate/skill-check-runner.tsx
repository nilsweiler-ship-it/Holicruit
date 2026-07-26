"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { ArrowRight, Check, Loader2, ShieldCheck } from "lucide-react";
import type { SkillCheckItem } from "@/lib/fixtures/skill-checks";
import { submitSkillCheck } from "@/lib/actions/candidate";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * Applied skill-check stepper. Presents work-sample/judgment items one at a
 * time, scores them server-side, and (if passed) verifies the skill.
 */
export function SkillCheckRunner({
  skill,
  items,
  openingId,
}: {
  skill: string;
  items: SkillCheckItem[];
  openingId?: string;
}) {
  const total = items.length;
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [result, setResult] = useState<{ score: number; passed: boolean } | null>(null);
  const [isScoring, startScoring] = useTransition();

  const item = items[index];
  const answered = Object.keys(answers).length;
  const progress = total > 0 ? Math.round((answered / total) * 100) : 0;

  function choose(optionId: string) {
    const next = { ...answers, [item.id]: optionId };
    setAnswers(next);
    if (index < total - 1) {
      setIndex((i) => i + 1);
    } else {
      startScoring(async () => setResult(await submitSkillCheck(skill, next, openingId)));
    }
  }

  if (isScoring) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-border bg-card p-10 text-center">
        <Loader2 className="size-6 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Scoring your applied answers…</p>
      </div>
    );
  }

  if (result) {
    return (
      <div className="flex flex-col gap-5 rounded-2xl border border-primary/30 bg-primary/8 p-6">
        <div className="flex items-center gap-3">
          <span
            className={cn(
              "flex size-11 items-center justify-center rounded-full",
              result.passed ? "bg-success/15 text-success" : "bg-muted text-muted-foreground",
            )}
          >
            <ShieldCheck className="size-6" />
          </span>
          <div>
            <h2 className="font-serif text-3xl tracking-tight">
              {result.passed ? `${skill} — verified` : `${skill} — not yet`}
            </h2>
            <p className="text-sm text-muted-foreground">
              Applied score: <span className="font-semibold text-foreground">{result.score}/100</span>
              {result.passed
                ? " — added to your profile as a verified skill."
                : " — keep practising; you can retake this anytime."}
            </p>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          This measured your judgment on realistic situations — not what you can look up. It now feeds
          your match fit.
        </p>
        <Button asChild size="lg" className="self-start">
          <Link href="/candidate/profile">
            Back to profile
            <ArrowRight className="size-4" />
          </Link>
        </Button>
      </div>
    );
  }

  const selected = answers[item.id];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium text-foreground">
            Item {index + 1} of {total}
          </span>
          <span className="tabular-nums text-muted-foreground">{progress}%</span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-muted">
          <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <div className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-5">
        <p className="text-base font-medium text-foreground">{item.prompt}</p>
        {item.note && <p className="-mt-2 text-sm text-muted-foreground">{item.note}</p>}
        <div className="flex flex-col gap-3">
          {item.options.map((opt) => {
            const isSelected = selected === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => choose(opt.id)}
                aria-pressed={isSelected}
                className={cn(
                  "flex w-full items-center gap-3 rounded-xl border border-border bg-card p-4 text-left text-sm transition-colors hover:bg-accent",
                  isSelected && "border-primary bg-primary/8 hover:bg-primary/8",
                )}
              >
                <span
                  className={cn(
                    "flex size-5 shrink-0 items-center justify-center rounded-full border border-border",
                    isSelected && "border-primary bg-primary text-primary-foreground",
                  )}
                >
                  {isSelected && <Check className="size-3.5" />}
                </span>
                <span className="flex-1">{opt.text}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
