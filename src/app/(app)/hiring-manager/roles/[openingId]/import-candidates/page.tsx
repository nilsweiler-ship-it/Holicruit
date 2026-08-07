import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, UploadCloud, MailPlus } from "lucide-react";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/persona";
import { importCandidates } from "@/lib/actions/invites";
import { CopyLink } from "@/components/pipeline/copy-link";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "Import candidates · Holicruit" };

export default async function ImportCandidatesPage({
  params,
  searchParams,
}: {
  params: Promise<{ openingId: string }>;
  searchParams: Promise<{ added?: string; skipped?: string }>;
}) {
  const { openingId } = await params;
  const { added, skipped } = await searchParams;
  const user = await requireUser();
  const opening = await prisma.opening.findUnique({
    where: { id: openingId },
    select: { title: true, company: { select: { ownerId: true } } },
  });
  if (!opening || opening.company.ownerId !== user.id) notFound();

  const pending = await prisma.candidateProfile.findMany({
    where: { invitedByUserId: user.id, claimed: false },
    select: { id: true, headline: true, inviteToken: true, user: { select: { name: true } } },
    orderBy: { id: "desc" },
  });
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "";

  return (
    <div className="flex max-w-2xl flex-col gap-6">
      <Link
        href={`/hiring-manager/pipeline?opening=${openingId}`}
        className="inline-flex w-fit items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Back to pipeline
      </Link>

      <header className="flex flex-col gap-1">
        <h1 className="font-serif flex items-center gap-2 text-3xl tracking-tight">
          <UploadCloud className="size-6 text-primary" />
          Import your candidates
        </h1>
        <p className="text-sm text-muted-foreground">
          Bring people you already know into <span className="font-medium text-foreground">{opening.title}</span>.
          They&apos;re scored on the model and stay private to you — each gets an invite to claim their
          profile, verify their skills, and control their own visibility.
        </p>
      </header>

      {added !== undefined && (
        <div className="rounded-2xl border border-primary/30 bg-primary/8 p-4 text-sm text-foreground">
          Imported <span className="font-semibold">{added}</span> candidate{added === "1" ? "" : "s"}.
          {Number(skipped) > 0 && (
            <span className="text-muted-foreground">
              {" "}
              {skipped} skipped (missing email, or already a Holicruit member).
            </span>
          )}
        </div>
      )}

      <section className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-5">
        <form action={importCandidates.bind(null, openingId)} className="flex flex-col gap-3">
          <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Paste your list — one per line
          </label>
          <textarea
            name="candidates"
            required
            rows={8}
            placeholder={"Jane Doe, jane@example.com, React, TypeScript, System design\nSam Ortiz, sam@example.com, Node.js, PostgreSQL"}
            className="rounded-lg border border-border bg-background px-3 py-2 font-mono text-xs outline-none focus:ring-2 focus:ring-primary/30"
          />
          <p className="text-xs text-muted-foreground">
            Format: <span className="font-mono">Name, email, skill, skill, …</span>. Skills are treated
            as unverified until the candidate proves them — honest by default.
          </p>
          <Button type="submit" className="self-start">
            <UploadCloud className="size-4" />
            Import &amp; score
          </Button>
        </form>
      </section>

      {pending.length > 0 && (
        <section className="flex flex-col gap-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <MailPlus className="size-4 text-primary" />
            Pending invites ({pending.length})
          </div>
          <p className="text-sm text-muted-foreground">
            Share each link with the person so they can claim their profile. Until then they&apos;re
            visible only to you and can&apos;t be contacted.
          </p>
          <ul className="flex flex-col gap-3">
            {pending.map((p) => (
              <li key={p.id} className="flex flex-col gap-2 rounded-2xl border border-border bg-card p-4">
                <div className="text-sm">
                  <span className="font-medium text-foreground">{p.user.name}</span>
                  <span className="text-muted-foreground"> · {p.headline}</span>
                </div>
                {p.inviteToken && <CopyLink url={`${base}/claim/${p.inviteToken}`} />}
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
