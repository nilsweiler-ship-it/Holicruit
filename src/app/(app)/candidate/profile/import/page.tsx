import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Wand2 } from "lucide-react";
import { ImportReview } from "@/components/candidate/import-review";

export const metadata: Metadata = { title: "Import your skills · Holicruit" };

/**
 * Translate free text (a CV, a profile, a job you've done) into the candidate's
 * structured profile — extract, review, then confirm the skills to add.
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
          Paste your CV, a profile, or a description of work you&apos;ve done. We&apos;ll extract the
          skills — you review and pick which to add, then matching re-runs.
        </p>
      </header>

      <ImportReview />
    </div>
  );
}
