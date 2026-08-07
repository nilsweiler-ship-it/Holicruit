import type { Metadata } from "next";
import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { prisma } from "@/lib/db";
import { claimProfile } from "@/lib/actions/invites";
import { Wordmark } from "@/components/brand/wordmark";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const metadata: Metadata = { title: "Claim your profile · Holicruit" };

const ERRORS: Record<string, string> = {
  short: "Password must be at least 8 characters.",
  invalid: "This invite link is no longer valid — it may already have been claimed.",
};

export default async function ClaimPage({
  params,
  searchParams,
}: {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { token } = await params;
  const { error } = await searchParams;

  const profile = await prisma.candidateProfile.findUnique({
    where: { inviteToken: token },
    select: { claimed: true, user: { select: { name: true } } },
  });
  const valid = profile && !profile.claimed;

  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col justify-center gap-6 px-4 py-10">
      <Wordmark href="/" />

      {!valid ? (
        <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-6">
          <h1 className="font-serif text-2xl tracking-tight">Invite not available</h1>
          <p className="text-sm text-muted-foreground">
            This link is no longer valid — it may already have been claimed. If you think this is a
            mistake, ask whoever invited you to re-send it.
          </p>
          <Button asChild variant="outline" className="self-start">
            <Link href="/login">Go to sign in</Link>
          </Button>
        </div>
      ) : (
        <div className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-6">
          <div className="flex flex-col gap-1">
            <h1 className="font-serif text-2xl tracking-tight">
              Welcome{profile?.user.name ? `, ${profile.user.name.split(" ")[0]}` : ""} 👋
            </h1>
            <p className="text-sm text-muted-foreground">
              Someone added you to a role on Holicruit. Set a password to claim your profile — then
              you control your visibility, can work under an alias, verify your skills, and get
              matched on merit.
            </p>
          </div>

          {error && ERRORS[error] && (
            <div className="rounded-xl border border-primary/30 bg-primary/8 p-3 text-sm text-foreground">
              {ERRORS[error]}
            </div>
          )}

          <form action={claimProfile.bind(null, token)} className="flex flex-col gap-3">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="password" className="text-sm font-medium text-foreground">
                Choose a password
              </label>
              <Input id="password" name="password" type="password" required minLength={8} placeholder="At least 8 characters" />
            </div>
            <Button type="submit">
              <ShieldCheck className="size-4" />
              Claim my profile
            </Button>
          </form>

          <p className="text-xs text-muted-foreground">
            By claiming, you take ownership of this profile. You can edit or delete it, export your
            data, or stay anonymous — all from Privacy &amp; data settings.
          </p>
        </div>
      )}
    </div>
  );
}
