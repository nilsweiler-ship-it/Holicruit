import Link from "next/link";
import { Coins, MapPin } from "lucide-react";
import type { TermsView } from "@/lib/terms";
import { TermsShareButton } from "./terms-share-button";

function money(r?: { min?: number; max?: number; currency: string }): string {
  if (!r) return "—";
  const k = (n?: number) => (n == null ? "?" : n >= 1000 ? `${Math.round(n / 1000)}k` : `${n}`);
  return `${r.currency}${k(r.min)}–${k(r.max)}`;
}

/**
 * Pay + location compatibility for one match. Shows a signal by default;
 * exact figures appear only when both sides opt to share.
 */
export function TermsFit({
  terms,
  matchId,
  side,
}: {
  terms: TermsView;
  matchId: string;
  side: "candidate" | "employer";
}) {
  const noPrefs = terms.salary === "unknown" && terms.location === "unknown";

  return (
    <section className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <Coins className="size-4 text-primary" />
          Terms fit
        </div>
        <span className={terms.compatible ? "text-sm font-medium text-success" : "text-sm font-medium text-[#C08a3e]"}>
          {terms.label}
        </span>
      </div>

      {(terms.roleMode || terms.roleRegion) && (
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
          {terms.roleMode && <span className="capitalize">{terms.roleMode}</span>}
          {terms.roleRegion && (
            <span className="flex items-center gap-1">
              <MapPin className="size-3.5" />
              {terms.roleRegion}
            </span>
          )}
        </div>
      )}

      {terms.revealed ? (
        <div className="flex flex-col gap-1 rounded-xl border border-border bg-background p-3 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Role band</span>
            <span className="font-medium text-foreground">{money(terms.roleBand)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Candidate expectation</span>
            <span className="font-medium text-foreground">{money(terms.candidateRange)}</span>
          </div>
        </div>
      ) : noPrefs && side === "candidate" ? (
        <p className="text-xs text-muted-foreground">
          Set your pay &amp; location expectations in{" "}
          <Link href="/settings/privacy" className="underline underline-offset-2 hover:text-foreground">
            Privacy &amp; data
          </Link>{" "}
          to see terms fit — they stay private.
        </p>
      ) : noPrefs && side === "employer" ? (
        <p className="text-xs text-muted-foreground">
          This candidate hasn&apos;t set pay/location expectations yet.
        </p>
      ) : terms.youShared ? (
        <p className="text-xs text-muted-foreground">
          You&apos;ve shared your figures — waiting for the other side to share back to compare.
        </p>
      ) : (
        <div className="flex flex-col gap-2">
          <p className="text-xs text-muted-foreground">
            {terms.theyShared
              ? "The other side shared their figures. Share yours to compare."
              : "Compatibility only. Share exact figures to compare — the other side sees yours only if they share too."}
          </p>
          <TermsShareButton matchId={matchId} side={side} />
        </div>
      )}
    </section>
  );
}
