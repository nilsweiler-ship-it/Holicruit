import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createOpening } from "@/lib/actions/hm";
import { Button } from "@/components/ui/button";

const inputClass =
  "rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30";
const labelClass = "text-xs font-semibold uppercase tracking-wide text-muted-foreground";

/** Post a role — creates an opening and runs matching to fill the pipeline. */
export default function NewRolePage() {
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
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Post a role</h1>
      </header>

      <form action={createOpening} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1.5">
          <span className={labelClass}>Title</span>
          <input name="title" required className={inputClass} placeholder="Senior Frontend Engineer" />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className={labelClass}>Company name</span>
          <input name="companyName" required className={inputClass} placeholder="Acme Inc." />
        </label>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-1.5">
            <span className={labelClass}>Location</span>
            <input name="location" className={inputClass} placeholder="Remote · EU" />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className={labelClass}>Industry</span>
            <input name="industry" className={inputClass} placeholder="SaaS" />
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
          <input name="requiredHard" className={inputClass} placeholder="React, TypeScript, GraphQL" />
          <span className="text-xs text-muted-foreground">comma-separated</span>
        </label>

        <label className="flex flex-col gap-1.5">
          <span className={labelClass}>Required soft skills</span>
          <input name="requiredSoft" className={inputClass} placeholder="Communication, Ownership" />
          <span className="text-xs text-muted-foreground">comma-separated</span>
        </label>

        <div className="flex">
          <Button type="submit">Post role &amp; run matching</Button>
        </div>
      </form>
    </div>
  );
}
