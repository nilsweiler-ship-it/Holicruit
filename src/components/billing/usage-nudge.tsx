"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface UsageNudgeProps {
  label: string;
  current: number;
  limit: number;
  upgradeUrl: string;
}

export function UsageNudge({ label, current, limit, upgradeUrl }: UsageNudgeProps) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;
  if (limit === -1) return null;

  const percentage = (current / limit) * 100;
  if (percentage < 80) return null;

  const isAtLimit = current >= limit;

  return (
    <div
      className={`flex items-center justify-between rounded-lg border-l-4 p-3 text-sm ${
        isAtLimit
          ? "border-l-destructive bg-destructive/5"
          : "border-l-usage-warning bg-usage-warning-bg/50"
      }`}
    >
      <p>
        {isAtLimit ? (
          <>
            You&apos;ve used all {limit} {label.toLowerCase()}.{" "}
            <Link href={upgradeUrl} className="font-medium underline hover:no-underline">
              Upgrade your plan
            </Link>{" "}
            for more.
          </>
        ) : (
          <>
            You&apos;re using {current} of {limit} {label.toLowerCase()}.{" "}
            <Link href={upgradeUrl} className="font-medium underline hover:no-underline">
              Consider upgrading
            </Link>{" "}
            before you hit the limit.
          </>
        )}
      </p>
      <button
        type="button"
        onClick={() => setDismissed(true)}
        className="ml-4 text-muted-foreground hover:text-foreground shrink-0"
        aria-label="Dismiss"
      >
        &#10005;
      </button>
    </div>
  );
}
