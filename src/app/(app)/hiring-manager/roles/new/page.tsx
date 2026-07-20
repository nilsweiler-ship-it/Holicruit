import Link from "next/link";
import { ArrowLeft, Wand2 } from "lucide-react";
import { createOpening } from "@/lib/actions/hm";
import { requireUser } from "@/lib/persona";
import { getActivePlan } from "@/lib/services/billing";
import { CalibrationFields } from "@/components/pipeline/calibration-fields";
import { LockedFeature } from "@/components/billing/locked-feature";
import { Button } from "@/components/ui/button";

const inputClass =
  "rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30";
const labelClass = "text-xs font-semibold uppercase tracking-wide text-muted-foreground";

/**
 * Post a role — also the review step for an imported job ad: when reached from
 * the importer, the fields arrive prefilled with the parsed "translation" for
 * the hiring manager to review and edit before it goes live.
 */
export default async function NewRolePage({
  searchParams,
}: {
  searchParams: Promise<{
    title?: string;
    companyName?: string;
    location?: string;
    industry?: string;
    requiredHard?: string;
    requiredSoft?: string;
    imported?: string;
  }>;
}) {
  const sp = await searchParams;
  const imported = sp.imported === "1";
  const user = await requireUser();
  const { plan } = await getActivePlan(user.id, "hiring_manager");

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-2">
        <Link
          href="/hiring-manager/roles"
          className="inline-flex w-fit items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Roles
        </Link>
        <h1 className="font-serif text-2xl tracking-tight text-foreground">
          {imported ? "Review the imported role" : "Post a role"}
        </h1>
      </header>

      {imported && (
        <div className="flex items-start gap-3 rounded-2xl border border-primary/30 bg-primary/8 p-4">
          <Wand2 className="mt-0.5 size-5 shrink-0 text-primary" />
          <p className="text-sm text-muted-foreground">
            We translated the job ad into the fields below — check the skills and details, edit
            anything that&apos;s off, then post. Matching runs on the version you confirm.
          </p>
        </div>
      )}

      <form action={createOpening} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1.5">
          <span className={labelClass}>Title</span>
          <input name="title" required defaultValue={sp.title} className={inputClass} placeholder="Senior Frontend Engineer" />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className={labelClass}>Company name</span>
          <input name="companyName" required defaultValue={sp.companyName} className={inputClass} placeholder="Acme Inc." />
        </label>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-1.5">
            <span className={labelClass}>Location</span>
            <input name="location" defaultValue={sp.location} className={inputClass} placeholder="Remote · EU" />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className={labelClass}>Industry</span>
            <input name="industry" defaultValue={sp.industry} className={inputClass} placeholder="SaaS" />
          </label>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <label className="flex flex-col gap-1.5">
            <span className={labelClass}>Salary min</span>
            <input name="salaryMin" type="number" className={inputClass} placeholder="60000" />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className={labelClass}>Salary max</span>
            <input name="salaryMax" type="number" className={inputClass} placeholder="90000" />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className={labelClass}>Currency</span>
            <input name="currency" className={inputClass} placeholder="€" defaultValue="€" />
          </label>
        </div>

        <label className="flex flex-col gap-1.5">
          <span className={labelClass}>Required hard skills</span>
          <input name="requiredHard" defaultValue={sp.requiredHard} className={inputClass} placeholder="React, TypeScript, GraphQL" />
          <span className="text-xs text-muted-foreground">comma-separated</span>
        </label>

        <label className="flex flex-col gap-1.5">
          <span className={labelClass}>Required soft skills</span>
          <input name="requiredSoft" defaultValue={sp.requiredSoft} className={inputClass} placeholder="Communication, Ownership" />
          <span className="text-xs text-muted-foreground">comma-separated</span>
        </label>

        {plan.calibration ? (
          <CalibrationFields />
        ) : (
          <LockedFeature
            title="Custom role calibration"
            tier="Team"
            blurb="Weight hard vs. soft skills and set the pass bar for this role, so matching optimizes for what a great hire actually looks like on your team."
            learnMoreHref="/hiring-manager/features/calibration"
          />
        )}

        <div className="flex">
          <Button type="submit">{imported ? "Confirm & post role" : "Post role & run matching"}</Button>
        </div>
      </form>
    </div>
  );
}
