"use client";

import Link from "next/link";
import { Progress } from "@/components/ui/progress";

interface UsageIndicatorProps {
  label: string;
  current: number;
  limit: number; // -1 = unlimited
  upgradeUrl?: string;
}

export function UsageIndicator({ label, current, limit, upgradeUrl }: UsageIndicatorProps) {
  const isUnlimited = limit === -1;
  const percentage = isUnlimited ? 0 : Math.min((current / limit) * 100, 100);
  const isWarning = !isUnlimited && percentage >= 80;
  const isAtLimit = !isUnlimited && current >= limit;

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className="flex items-center gap-2">
          <span
            className={
              isAtLimit
                ? "text-destructive font-medium"
                : isWarning
                  ? "text-usage-warning font-medium"
                  : ""
            }
          >
            {current} of {isUnlimited ? "Unlimited" : limit}
          </span>
          {isAtLimit && upgradeUrl && (
            <Link
              href={upgradeUrl}
              className="text-xs text-tier-pro underline hover:no-underline"
            >
              Upgrade
            </Link>
          )}
        </span>
      </div>
      {!isUnlimited && (
        <Progress
          value={percentage}
          className={
            isAtLimit
              ? "[&>[data-slot=progress-indicator]]:bg-destructive"
              : isWarning
                ? "[&>[data-slot=progress-indicator]]:bg-usage-warning"
                : ""
          }
        />
      )}
    </div>
  );
}
