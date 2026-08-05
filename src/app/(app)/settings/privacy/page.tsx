import type { Metadata } from "next";
import { Download, ShieldCheck, TriangleAlert, VenetianMask } from "lucide-react";
import { prisma } from "@/lib/db";
import { requireUser, getRole } from "@/lib/persona";
import { updatePrivacy, deleteMyAccount } from "@/lib/actions/privacy";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const metadata: Metadata = { title: "Privacy · Holicruit" };

export default async function PrivacySettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ delete?: string }>;
}) {
  const user = await requireUser();
  const role = await getRole();
  const [me, { delete: del }] = await Promise.all([
    prisma.user.findUnique({
      where: { id: user.id },
      select: { alias: true, anonymous: true },
    }),
    searchParams,
  ]);
  const isProvider = role === "provider";

  return (
    <div className="flex max-w-2xl flex-col gap-8">
      <header className="flex flex-col gap-1">
        <h1 className="font-serif flex items-center gap-2 text-3xl tracking-tight">
          <ShieldCheck className="size-6 text-primary" />
          Privacy &amp; data
        </h1>
        <p className="text-sm text-muted-foreground">
          Radical transparency is about your fit and evidence — never about forcing you to expose
          who you are. Control your identity and your data here.
        </p>
      </header>

      {/* Alias / anonymity — everyone except training providers */}
      {isProvider ? (
        <section className="rounded-2xl border border-border bg-card p-5 text-sm text-muted-foreground">
          <div className="mb-1 flex items-center gap-2 font-semibold text-foreground">
            <VenetianMask className="size-4 text-primary" />
            Working under an alias
          </div>
          Training providers appear under their real organisation name so candidates can trust the
          programs on offer — so anonymity isn&apos;t available for this account type.
        </section>
      ) : (
        <section className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-5">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <VenetianMask className="size-4 text-primary" />
              Work under an alias
            </div>
            <p className="text-sm text-muted-foreground">
              When this is on, the other side sees your alias and verified evidence — not your real
              name — until you explicitly choose to reveal yourself in a specific conversation.
            </p>
          </div>

          <form action={updatePrivacy} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="alias" className="text-sm font-medium text-foreground">
                Public alias
              </label>
              <Input
                id="alias"
                name="alias"
                defaultValue={me?.alias ?? ""}
                placeholder="e.g. Frontend Nomad, Candidate 7B…"
                maxLength={60}
              />
            </div>

            <label className="flex items-start gap-3 rounded-xl border border-border bg-background p-3">
              <input
                type="checkbox"
                name="anonymous"
                defaultChecked={me?.anonymous ?? false}
                className="mt-0.5 size-4 accent-[var(--primary)]"
              />
              <span className="text-sm">
                <span className="font-medium text-foreground">Present me anonymously by default</span>
                <span className="block text-muted-foreground">
                  Your real name and contact stay private until you reveal them per conversation.
                </span>
              </span>
            </label>

            <Button type="submit" className="self-start">
              Save privacy settings
            </Button>
          </form>
        </section>
      )}

      {/* Data export */}
      <section className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-5">
        <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <Download className="size-4 text-primary" />
          Export your data
        </div>
        <p className="text-sm text-muted-foreground">
          Download everything we hold about you as a JSON file (your password is never included).
        </p>
        <Button asChild variant="outline" className="self-start">
          <a href="/settings/privacy/export" download>
            <Download className="size-4" />
            Download my data
          </a>
        </Button>
      </section>

      {/* Delete account */}
      <section className="flex flex-col gap-3 rounded-2xl border border-destructive/30 bg-destructive/5 p-5">
        <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <TriangleAlert className="size-4 text-destructive" />
          Delete your account
        </div>
        <p className="text-sm text-muted-foreground">
          Permanently erases your account and all associated data (right to erasure). This cannot be
          undone. Type <span className="font-semibold text-foreground">DELETE</span> to confirm.
        </p>
        <form action={deleteMyAccount} className="flex flex-col gap-2 sm:flex-row">
          <Input
            name="confirm"
            required
            placeholder="Type DELETE"
            aria-label="Type DELETE to confirm"
            className="sm:max-w-40"
          />
          <Button type="submit" variant="destructive" className="shrink-0">
            Delete my account
          </Button>
        </form>
        {del === "confirm" && (
          <p className="text-sm text-destructive">Please type DELETE exactly to confirm.</p>
        )}
      </section>
    </div>
  );
}
