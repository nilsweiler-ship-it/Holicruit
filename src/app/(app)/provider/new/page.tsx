import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createProgram } from "@/lib/actions/provider";
import { Button } from "@/components/ui/button";

const inputClass =
  "rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30";
const labelClass = "text-xs font-semibold uppercase tracking-wide text-muted-foreground";

/** Offer a program — publishes to the marketplace for candidates with the gap. */
export default function NewProgramPage() {
  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-2">
        <Link
          href="/provider"
          className="inline-flex w-fit items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Provider desk
        </Link>
        <h1 className="font-serif text-2xl tracking-tight text-foreground">Offer a program</h1>
      </header>

      <form action={createProgram} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1.5">
          <span className={labelClass}>Title</span>
          <input name="title" required className={inputClass} placeholder="Advanced React Patterns" />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className={labelClass}>Format</span>
          <input
            name="format"
            className={inputClass}
            placeholder="Online course · 4 weeks · cert"
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className={labelClass}>Credential</span>
          <input name="credential" className={inputClass} placeholder="Certificate of completion" />
          <span className="text-xs text-muted-foreground">optional</span>
        </label>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-1.5">
            <span className={labelClass}>Closes gap</span>
            <input name="closesGap" required className={inputClass} placeholder="React" />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className={labelClass}>Gap type</span>
            <select name="gapType" className={inputClass} defaultValue="hard">
              <option value="hard">Hard</option>
              <option value="soft">Soft</option>
            </select>
          </label>
        </div>

        <label className="flex flex-col gap-1.5">
          <span className={labelClass}>Tags</span>
          <input name="tags" className={inputClass} placeholder="frontend, react, hooks" />
          <span className="text-xs text-muted-foreground">comma-separated</span>
        </label>

        <div className="flex">
          <Button type="submit">Publish program</Button>
        </div>
      </form>
    </div>
  );
}
