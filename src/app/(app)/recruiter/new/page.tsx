import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createIntro } from "@/lib/actions/recruiter";
import { Button } from "@/components/ui/button";

const inputClass =
  "rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30";
const labelClass = "text-xs font-semibold uppercase tracking-wide text-muted-foreground";

/** Log an introduction — a candidate→role intro the recruiter is facilitating. */
export default function NewIntroPage() {
  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-2">
        <Link
          href="/recruiter"
          className="inline-flex w-fit items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Recruiter desk
        </Link>
        <h1 className="font-serif text-2xl tracking-tight text-foreground">Log an introduction</h1>
      </header>

      <form action={createIntro} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1.5">
          <span className={labelClass}>Candidate name</span>
          <input name="candidateName" required className={inputClass} placeholder="Jordan Lee" />
        </label>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-1.5">
            <span className={labelClass}>Role title</span>
            <input name="roleTitle" required className={inputClass} placeholder="Backend Engineer" />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className={labelClass}>Company</span>
            <input name="company" required className={inputClass} placeholder="Acme Inc." />
          </label>
        </div>

        <label className="flex flex-col gap-1.5">
          <span className={labelClass}>Value note</span>
          <textarea
            name="valueNote"
            rows={3}
            className={inputClass}
            placeholder="Why this intro is a strong fit…"
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className={labelClass}>Stage</span>
          <select name="stage" className={inputClass} defaultValue="talking">
            <option value="talking">Talking</option>
            <option value="interview">Interview</option>
            <option value="offer">Offer</option>
            <option value="hired">Hired</option>
          </select>
        </label>

        <div className="flex">
          <Button type="submit">Log intro</Button>
        </div>
      </form>
    </div>
  );
}
