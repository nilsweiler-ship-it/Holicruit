"use client";

import { useActionState } from "react";
import { loginAction, demoLoginAction, type AuthState } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";

const inputCls =
  "rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30";

const DEMO = [
  { label: "Candidate · Sam (Software)", email: "sam@holicruit.test" },
  { label: "Candidate · Aisha (Healthcare)", email: "aisha@holicruit.test" },
  { label: "Candidate · Diego (Sales)", email: "diego@holicruit.test" },
  { label: "Hiring Manager · Priya", email: "priya@holicruit.test" },
  { label: "Recruiter · Jordan", email: "jordan@holicruit.test" },
  { label: "Training Provider · Frontend Masters", email: "fm@holicruit.test" },
];

export function LoginForm() {
  const [state, action, pending] = useActionState<AuthState, FormData>(loginAction, null);

  return (
    <div className="flex flex-col gap-5">
      <form action={action} className="flex flex-col gap-3">
        <input name="email" type="email" placeholder="you@example.com" required className={inputCls} />
        <input name="password" type="password" placeholder="Password" required className={inputCls} />
        {state?.error && <p className="text-sm text-destructive">{state.error}</p>}
        <Button type="submit" disabled={pending}>
          {pending ? "Signing in…" : "Sign in"}
        </Button>
      </form>

      <div className="flex flex-col gap-2">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Or try a demo account
        </p>
        <div className="grid gap-1.5">
          {DEMO.map((d) => (
            <form key={d.email} action={demoLoginAction.bind(null, d.email)}>
              <button
                type="submit"
                className="w-full rounded-lg border border-border bg-card px-3 py-2 text-left text-sm transition-colors hover:bg-accent"
              >
                {d.label}
              </button>
            </form>
          ))}
        </div>
      </div>
    </div>
  );
}
