import Link from "next/link";
import { Lock } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Reusable locked-feature teaser. Shown in place of a premium feature when the
 * account's plan doesn't include it — drives the upgrade.
 */
export function LockedFeature({
  title,
  tier,
  blurb,
  learnMoreHref,
}: {
  title: string;
  tier: "Team" | "Scale";
  blurb: string;
  learnMoreHref: string;
}) {
  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-dashed border-border bg-card p-5">
      <div className="flex items-center gap-3">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground">
          <Lock className="size-4" />
        </span>
        <div className="flex items-center gap-2">
          <h3 className="text-base font-semibold text-foreground">{title}</h3>
          <span className="rounded-full bg-primary px-2 py-0.5 text-xs font-semibold text-primary-foreground">
            {tier}
          </span>
        </div>
      </div>

      <p className="text-sm text-muted-foreground">{blurb}</p>

      <div className="flex flex-wrap items-center gap-3">
        <Button asChild>
          <Link href="/hiring-manager/billing">Upgrade to {tier}</Link>
        </Button>
        <Link
          href={learnMoreHref}
          className="text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          Learn more
        </Link>
      </div>
    </div>
  );
}
