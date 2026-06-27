import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Wand2 } from "lucide-react";
import { importOpening } from "@/lib/actions/hm";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "Import a job ad · Holicruit" };

/**
 * Import a role from another platform: paste the job ad, the parser translates
 * the free text into the structured opening (title, skills, industry) and runs
 * matching against the candidate pool.
 */
export default function ImportRolePage() {
  return (
    <div className="flex max-w-2xl flex-col gap-6">
      <Link
        href="/hiring-manager/roles"
        className="inline-flex w-fit items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Back to roles
      </Link>

      <header className="flex flex-col gap-1">
        <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
          <Wand2 className="size-5 text-primary" />
          Import a job ad
        </h1>
        <p className="text-sm text-muted-foreground">
          Paste a job ad from any platform (LinkedIn, Indeed, your careers page…). We&apos;ll
          translate the description into a structured role — title, required hard &amp; soft
          skills, industry — and match it against candidates straight away.
        </p>
      </header>

      <form action={importOpening} className="flex flex-col gap-3">
        <textarea
          name="text"
          required
          rows={14}
          placeholder={"Paste the full job description here…\n\ne.g. \"Senior Frontend Engineer at Northwind — Berlin (hybrid). You'll work in React and TypeScript, own system design, and collaborate across teams. Strong communication required.\""}
          className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30"
        />
        <Button type="submit" className="self-start">
          <Wand2 className="size-4" />
          Import &amp; match
        </Button>
      </form>

      <p className="text-xs text-muted-foreground">
        Parsing currently uses keyword extraction against the shared skill taxonomy; it&apos;s
        behind a clean interface so it can be upgraded to an LLM-based parser (and URL
        connectors) without changing this flow.
      </p>
    </div>
  );
}
