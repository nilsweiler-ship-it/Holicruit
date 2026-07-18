"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Check, Loader2 } from "lucide-react";
import type { ScenarioQuestion, ScenarioResult } from "@/lib/scenario/types";
import { submitScenario } from "@/lib/actions/candidate";
import { SoftSkillBars } from "@/components/candidate/soft-skill-bars";
import { PersonalityBars } from "@/components/candidate/personality-bars";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/** Shuffle a copy of an array (Fisher–Yates). */
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
}

/**
 * Client stepper that walks a candidate through the soft-skill scenario one
 * question at a time, then scores the collected answers via a server action and
 * shows the scenario-measured soft-skill profile.
 */
export function ScenarioRunner({ questions }: { questions: ScenarioQuestion[] }) {
  // Shuffle option order once per session so position never cues an answer.
  const shuffled = useMemo(
    () => questions.map((q) => ({ ...q, options: shuffle(q.options) })),
    [questions],
  );
  const total = shuffled.length;
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [result, setResult] = useState<ScenarioResult | null>(null);
  const [isScoring, startScoring] = useTransition();

  const answeredCount = Object.keys(answers).length;
  const progress = total > 0 ? Math.round((answeredCount / total) * 100) : 0;
  const question = shuffled[index];

  function submit(allAnswers: Record<string, string>) {
    startScoring(async () => {
      const res = await submitScenario(allAnswers);
      setResult(res);
    });
  }

  function select(optionId: string) {
    const next = { ...answers, [question.id]: optionId };
    setAnswers(next);
    if (index < total - 1) {
      setIndex((i) => i + 1);
    } else {
      submit(next);
    }
  }

  // --- Scoring / results state ---
  if (isScoring) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-border bg-card p-10 text-center">
        <Loader2 className="size-6 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Scoring your scenario…</p>
      </div>
    );
  }

  if (result) {
    return (
      <div className="flex flex-col gap-5 rounded-2xl border border-primary/30 bg-primary/8 p-5">
        <div className="flex flex-col gap-1">
          <h2 className="text-lg font-bold tracking-tight">Your soft-skill profile</h2>
          <p className="text-sm text-muted-foreground">
            These now update your profile bars —{" "}
            <span className="font-medium text-foreground">
              scenario-measured, not self-rated
            </span>
            .
          </p>
        </div>
        <SoftSkillBars scores={result.scores} />

        <div className="flex flex-col gap-1 border-t border-primary/20 pt-4">
          <div className="flex items-baseline justify-between gap-2">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Personality
            </h3>
            <span className="text-xs text-muted-foreground">Big Five + Integrity</span>
          </div>
          <p className="text-sm text-muted-foreground">
            Your choices, mapped to the scientifically validated Big Five model.
          </p>
        </div>
        <PersonalityBars traits={result.traits} />

        <Button asChild size="lg" className="self-start">
          <Link href="/candidate/profile">
            Back to profile
            <ArrowRight className="size-4" />
          </Link>
        </Button>
      </div>
    );
  }

  // --- Question state ---
  const selected = answers[question.id];

  return (
    <div className="flex flex-col gap-6">
      {/* Progress */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium text-foreground">
            Question {index + 1} of {total}
          </span>
          <span className="text-muted-foreground tabular-nums">{progress}%</span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary transition-all"
            style={{ width: `${progress}%` }}
            role="progressbar"
            aria-valuenow={progress}
            aria-valuemin={0}
            aria-valuemax={100}
          />
        </div>
      </div>

      {/* Question */}
      <div className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-5">
        <p className="text-base font-medium text-foreground">{question.prompt}</p>
        <div className="flex flex-col gap-3">
          {question.options.map((option) => {
            const isSelected = selected === option.id;
            return (
              <button
                key={option.id}
                type="button"
                onClick={() => select(option.id)}
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
                <span className="flex-1">{option.text}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          onClick={() => setIndex((i) => Math.max(0, i - 1))}
          disabled={index === 0}
        >
          <ArrowLeft className="size-4" />
          Back
        </Button>
      </div>
    </div>
  );
}
