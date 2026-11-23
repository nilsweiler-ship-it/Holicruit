"use client";

import { useState } from "react";
import { Check, Circle, Eye, EyeOff } from "lucide-react";
import { PASSWORD_MAX, PASSWORD_MIN, PASSWORD_RULES } from "@/lib/password";
import { cn } from "@/lib/utils";

const defaultInputCls =
  "w-full rounded-lg border border-border bg-background px-3 py-2 pr-10 text-sm outline-none focus:ring-2 focus:ring-primary/30";

/**
 * Password + confirmation with a live checklist. The server re-checks the
 * same rules (src/lib/password.ts); this only gives instant feedback.
 */
export function PasswordFields({
  label,
  inputClassName = defaultInputCls,
}: {
  label?: string;
  inputClassName?: string;
}) {
  const [pw, setPw] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const touched = pw.length > 0;
  const mismatch = confirm.length > 0 && confirm !== pw;

  return (
    <div className="flex flex-col gap-2">
      {label && (
        <label htmlFor="password" className="text-sm font-medium text-foreground">
          {label}
        </label>
      )}
      <div className="relative">
        <input
          id="password"
          name="password"
          type={show ? "text" : "password"}
          placeholder="Password"
          autoComplete="new-password"
          required
          minLength={PASSWORD_MIN}
          maxLength={PASSWORD_MAX}
          value={pw}
          onChange={(e) => setPw(e.target.value)}
          aria-describedby="password-rules"
          className={inputClassName}
        />
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          className="absolute inset-y-0 right-0 flex w-10 items-center justify-center text-muted-foreground hover:text-foreground"
          aria-label={show ? "Hide password" : "Show password"}
        >
          {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
        </button>
      </div>
      <input
        name="passwordConfirm"
        type={show ? "text" : "password"}
        placeholder="Repeat password"
        autoComplete="new-password"
        required
        maxLength={PASSWORD_MAX}
        value={confirm}
        onChange={(e) => setConfirm(e.target.value)}
        aria-invalid={mismatch}
        className={cn(inputClassName, mismatch && "border-destructive")}
      />
      <ul id="password-rules" className="grid grid-cols-1 gap-x-4 gap-y-1 text-xs sm:grid-cols-2">
        {PASSWORD_RULES.map((r) => {
          const ok = r.test(pw);
          return (
            <li
              key={r.id}
              className={cn("flex items-center gap-1.5", ok ? "text-foreground" : "text-muted-foreground")}
            >
              {ok ? (
                <Check className="size-3.5 text-primary" aria-hidden />
              ) : (
                <Circle className={cn("size-3", touched && "text-destructive/70")} aria-hidden />
              )}
              <span>{r.label}</span>
              <span className="sr-only">{ok ? "(done)" : "(missing)"}</span>
            </li>
          );
        })}
      </ul>
      {mismatch && <p className="text-xs text-destructive">The passwords don&apos;t match.</p>}
    </div>
  );
}
