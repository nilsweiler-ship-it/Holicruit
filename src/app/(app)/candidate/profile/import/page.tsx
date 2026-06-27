import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Wand2 } from "lucide-react";
import { importProfileSkills } from "@/lib/actions/candidate";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "Import your skills · Holicruit" };

/**
 * Translate free text (a CV, a profile, a job you've done) into the candidate's
 * structured profile — extracting the hard skills the matching engine uses.
 */
export default function ImportProfilePage() {
  return (
    <div className="flex max-w-2xl flex-col gap-6">
      <Link
        href="/candidate/profile"
        className="inline-flex w-fit items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Back to profile
      </Link>

      <header className="flex flex-col gap-1">
        <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
          <Wand2 className="size-5 text-primary" />
          Import your skills
        </h1>
        <p className="text-sm text-muted-foreground">
          Paste your CV, a profile, or a description of work you&apos;ve done. We&apos;ll extract
          the skills into your profile — then re-run matching. Verification is still earned via
          peer endorsements.
        </p>
      </header>

      <form action={importProfileSkills} className="flex flex-col gap-3">
        <textarea
          name="text"
          required
          rows={14}
          placeholder={"Paste your CV or experience here…\n\ne.g. \"6 years building React + TypeScript apps, system design, testing. Strong communication and ownership.\""}
          className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30"
        />
        <Button type="submit" className="self-start">
          <Wand2 className="size-4" />
          Extract skills
        </Button>
      </form>
    </div>
  );
}
