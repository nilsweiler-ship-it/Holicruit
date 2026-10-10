import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Coins, ShieldCheck } from "lucide-react";
import { prisma } from "@/lib/db";
import { getActiveCandidateId } from "@/lib/persona";
import { updateWorkPrefs } from "@/lib/actions/privacy";
import { parseModes } from "@/lib/terms";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const metadata: Metadata = { title: "Your must-haves · Holicruit" };

/**
 * Required onboarding step: pay, location, and work-mode expectations. These
 * are must-haves for matching — hard incompatibilities are filtered out — and
 * stay confidential (employers see compatibility only).
 */
export default async function ExpectationsPage() {
  const candidateId = await getActiveCandidateId();
  const prefs = await prisma.candidateProfile.findUnique({
    where: { id: candidateId },
    select: {
      expectedSalaryMin: true,
      expectedSalaryMax: true,
      salaryCurrency: true,
      workModes: true,
      locationPref: true,
    },
  });
  const modes = parseModes(prefs?.workModes);

  return (
    <div className="flex max-w-2xl flex-col gap-6">
      <Link
        href="/candidate/matches"
        className="inline-flex w-fit items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Back
      </Link>

      <header className="flex flex-col gap-1">
        <h1 className="font-serif flex items-center gap-2 text-3xl tracking-tight">
          <Coins className="size-6 text-primary" />
          Your must-haves
        </h1>
        <p className="text-sm text-muted-foreground">
          Pay, location, and how you want to work. We use these to show you only roles that fit
          your life — a role that can&apos;t meet them won&apos;t surface at all.
        </p>
      </header>

      <div className="flex items-start gap-3 rounded-2xl border border-border bg-card p-4 text-sm">
        <ShieldCheck className="mt-0.5 size-5 shrink-0 text-primary" />
        <p className="text-muted-foreground">
          <span className="font-medium text-foreground">Confidential by design.</span> Employers
          never see your numbers — only whether a role is compatible. Exact figures are shared only
          if you and an employer both choose to, on a specific match.
        </p>
      </div>

      <form action={updateWorkPrefs} className="flex flex-col gap-5 rounded-2xl border border-border bg-card p-5">
        <input type="hidden" name="redirectTo" value="/candidate/matches" />

        <div className="flex flex-col gap-2">
          <span className="text-sm font-semibold text-foreground">Pay</span>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-medium text-muted-foreground">Minimum (per year)</span>
              <Input name="expectedSalaryMin" type="number" required min={1} defaultValue={prefs?.expectedSalaryMin ?? ""} placeholder="85000" />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-medium text-muted-foreground">Ideal</span>
              <Input name="expectedSalaryMax" type="number" defaultValue={prefs?.expectedSalaryMax ?? ""} placeholder="110000" />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-medium text-muted-foreground">Currency</span>
              <Input name="salaryCurrency" defaultValue={prefs?.salaryCurrency ?? "€"} />
            </label>
          </div>
          <p className="text-xs text-muted-foreground">
            Your minimum is the floor a role must be able to meet. It&apos;s a must-have, not a negotiation
            opener.
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-sm font-semibold text-foreground">How you want to work</span>
          <div className="flex flex-wrap gap-2">
            {(["onsite", "hybrid", "remote"] as const).map((m) => (
              <label
                key={m}
                className="flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1.5 text-sm capitalize"
              >
                <input type="checkbox" name="workModes" value={m} defaultChecked={modes.includes(m)} className="size-4 accent-[var(--primary)]" />
                {m}
              </label>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">Tick everything you&apos;d genuinely accept. At least one is required.</p>
        </div>

        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-semibold text-foreground">Location</span>
          <Input name="locationPref" required defaultValue={prefs?.locationPref ?? ""} placeholder="e.g. Zürich, or Berlin / EU remote" />
          <span className="text-xs text-muted-foreground">
            Where you are, or where you&apos;d work from. Needed for on-site and hybrid roles.
          </span>
        </label>

        <Button type="submit" className="self-start">
          Save must-haves
        </Button>
      </form>
    </div>
  );
}
