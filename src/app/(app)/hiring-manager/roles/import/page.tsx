import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Link2, Wand2 } from "lucide-react";
import { importOpening, importOpeningFromUrl } from "@/lib/actions/hm";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "Import a job ad · Holicruit" };

const ERRORS: Record<string, string> = {
  url: "That doesn't look like a valid web address. Check the link and try again.",
  fetch: "We couldn't open that page. Some job boards block automated access — paste the text below instead.",
  empty: "That page didn't return readable text (it may load its content with JavaScript). Paste the description below instead.",
};

/**
 * Import a role from another platform — by URL (we fetch and parse the page) or
 * by pasting the text. Either way, the parser translates it into a structured
 * opening and runs matching.
 */
export default async function ImportRolePage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

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
        <h1 className="font-serif flex items-center gap-2 text-2xl tracking-tight">
          <Wand2 className="size-5 text-primary" />
          Import a job ad
        </h1>
        <p className="text-sm text-muted-foreground">
          Paste a link to a posting (your careers page, LinkedIn, Indeed…) or its text. We&apos;ll
          translate it into a structured role — title, required hard &amp; soft skills, industry —
          and match it against candidates straight away.
        </p>
      </header>

      {error && ERRORS[error] && (
        <div className="rounded-2xl border border-primary/30 bg-primary/8 p-4 text-sm text-foreground">
          {ERRORS[error]}
        </div>
      )}

      {/* Import from URL */}
      <section className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-5">
        <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <Link2 className="size-4 text-primary" />
          Import from a link
        </div>
        <form action={importOpeningFromUrl} className="flex flex-col gap-2 sm:flex-row">
          <input
            name="url"
            type="url"
            required
            placeholder="https://company.com/careers/senior-frontend-engineer"
            className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30"
          />
          <Button type="submit" className="shrink-0">
            <Wand2 className="size-4" />
            Fetch &amp; parse
          </Button>
        </form>
        <p className="text-xs text-muted-foreground">
          We fetch the page and read its text. Sites that render entirely in the browser (some big
          job boards) may not be readable — use paste below if a link doesn&apos;t work.
        </p>
      </section>

      {/* Or paste the text */}
      <section className="flex flex-col gap-3">
        <div className="text-sm font-semibold text-foreground">Or paste the text</div>
        <form action={importOpening} className="flex flex-col gap-3">
          <textarea
            name="text"
            required
            rows={12}
            placeholder={"Paste the full job description here…\n\ne.g. \"Senior Frontend Engineer at Northwind — Berlin (hybrid). You'll work in React and TypeScript, own system design, and collaborate across teams. Strong communication required.\""}
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30"
          />
          <Button type="submit" variant="outline" className="self-start">
            <Wand2 className="size-4" />
            Import &amp; match
          </Button>
        </form>
      </section>
    </div>
  );
}
