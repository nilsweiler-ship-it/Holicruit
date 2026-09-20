"use client";

import Link from "next/link";
import { useActionState } from "react";
import { registerAction, type AuthState } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";

const inputCls =
  "rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30";

const HATS = [
  { value: "candidate", label: "Candidate — find roles & grow my profile" },
  { value: "hiring_manager", label: "Hiring Manager — meet candidates for my team" },
  { value: "recruiter", label: "Recruiter — facilitate matches, earn on outcomes" },
  { value: "provider", label: "Training Provider — offer programs that close gaps" },
];

export function RegisterForm({ defaultHat = "candidate" }: { defaultHat?: string }) {
  const [state, action, pending] = useActionState<AuthState, FormData>(registerAction, null);

  return (
    <form action={action} className="flex flex-col gap-3">
      <input name="name" type="text" placeholder="Your name" required className={inputCls} />
      <input name="email" type="email" placeholder="you@example.com" required className={inputCls} />
      <input
        name="password"
        type="password"
        placeholder="Password (min 8 characters)"
        required
        minLength={8}
        className={inputCls}
      />
      <label className="flex flex-col gap-1 text-sm">
        <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          I&apos;m joining as
        </span>
        <select name="hat" defaultValue={defaultHat} className={inputCls}>
          {HATS.map((h) => (
            <option key={h.value} value={h.value}>
              {h.label}
            </option>
          ))}
        </select>
      </label>
      <label className="flex items-start gap-2 text-xs text-muted-foreground">
        <input type="checkbox" name="consent" required className="mt-0.5 size-4 accent-[var(--primary)]" />
        <span>
          I agree to the{" "}
          <Link href="/terms" target="_blank" className="underline underline-offset-2 hover:text-foreground">
            Terms
          </Link>{" "}
          and{" "}
          <Link href="/privacy" target="_blank" className="underline underline-offset-2 hover:text-foreground">
            Privacy Policy
          </Link>
          , and I understand Holicruit uses automated assessments to help measure fit, with a person
          making the final hiring decision.
        </span>
      </label>
      {state?.error && <p className="text-sm text-destructive">{state.error}</p>}
      <Button type="submit" disabled={pending}>
        {pending ? "Creating account…" : "Create account"}
      </Button>
    </form>
  );
}
