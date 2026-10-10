import type { Metadata } from "next";
import { MessageSquare, Smile, Meh, Frown } from "lucide-react";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/persona";

export const metadata: Metadata = { title: "Feedback · Holicruit" };

/** Accounts allowed to see everyone's feedback. Comma-separated env override. */
const ADMIN_EMAILS = (process.env.ADMIN_EMAILS ?? "nils.weiler@gmail.com")
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

const SENTIMENT: Record<string, { label: string; Icon: typeof Smile; cls: string }> = {
  great: { label: "Love it", Icon: Smile, cls: "text-success" },
  ok: { label: "It's OK", Icon: Meh, cls: "text-muted-foreground" },
  bad: { label: "Needs work", Icon: Frown, cls: "text-primary" },
};

const ROLE_LABEL: Record<string, string> = {
  candidate: "Candidate",
  hiring_manager: "Hiring Manager",
  recruiter: "Recruiter",
  provider: "Training Provider",
};

const fmt = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
});

export default async function FeedbackInboxPage() {
  const user = await requireUser();
  const isAdmin = ADMIN_EMAILS.includes((user.email ?? "").toLowerCase());

  const items = await prisma.productFeedback.findMany({
    where: isAdmin ? {} : { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 200,
    include: { user: { select: { name: true, email: true } } },
  });
  const leads = isAdmin
    ? await prisma.lead.findMany({ orderBy: { createdAt: "desc" }, take: 100 })
    : [];
  // Sign-up visibility: real accounts only (exclude seeded demo accounts).
  const signups = isAdmin
    ? await prisma.user.findMany({
        where: { email: { not: { endsWith: "@holicruit.test" } } },
        orderBy: { createdAt: "desc" },
        take: 50,
        select: { id: true, name: true, email: true, roles: true, createdAt: true, consentAt: true },
      })
    : [];
  const signupTotal = isAdmin
    ? await prisma.user.count({ where: { email: { not: { endsWith: "@holicruit.test" } } } })
    : 0;
  const roleOf = (roles: string) => {
    try {
      return ROLE_LABEL[(JSON.parse(roles) as string[])[0] ?? ""] ?? "—";
    } catch {
      return "—";
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h1 className="font-serif text-3xl tracking-tight text-foreground">
          {isAdmin ? "Feedback inbox" : "Your feedback"}
        </h1>
        <p className="text-sm text-muted-foreground">
          {isAdmin
            ? "Everything people have shared, newest first. This is the pledge in action — read it, act on it."
            : "The feedback you've shared with us. Thank you — it shapes what we build next."}
        </p>
      </header>

      {isAdmin && (
        <section className="flex flex-col gap-3">
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Sign-ups
            </h2>
            <span className="font-serif text-3xl leading-none tracking-tight text-primary">{signupTotal}</span>
            <span className="text-sm text-muted-foreground">real accounts (demo accounts excluded)</span>
          </div>
          {signups.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-border p-6 text-sm text-muted-foreground">
              No real sign-ups yet. When someone registers via the site, they&apos;ll appear here with their
              role and date.
            </p>
          ) : (
            <ul className="divide-y divide-border rounded-2xl border border-border bg-card">
              {signups.map((u) => (
                <li key={u.id} className="flex flex-wrap items-center gap-2 px-4 py-2.5 text-sm">
                  <span className="font-medium text-foreground">{u.name}</span>
                  <span className="text-muted-foreground">· {u.email}</span>
                  <span className="rounded-full bg-muted px-2 py-0.5 text-xs">{roleOf(u.roles)}</span>
                  {!u.consentAt && (
                    <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">imported / unclaimed</span>
                  )}
                  <span className="ml-auto text-xs tabular-nums text-muted-foreground">{fmt.format(u.createdAt)}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      {isAdmin && leads.length > 0 && (
        <section className="flex flex-col gap-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Inbound leads ({leads.length})
          </h2>
          <ul className="flex flex-col gap-3">
            {leads.map((l) => (
              <li key={l.id} className="flex flex-col gap-1 rounded-2xl border border-primary/30 bg-primary/5 p-4 text-sm">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-medium text-foreground">{l.name}</span>
                  <span className="text-muted-foreground">· {l.email}</span>
                  {l.company && <span className="text-muted-foreground">· {l.company}</span>}
                  <span className="rounded-full bg-muted px-2 py-0.5 text-xs">
                    {l.source === "sales" ? `Contact sales · ${l.plan ?? ""}` : "Talk to us"}
                  </span>
                  <span className="ml-auto text-xs tabular-nums text-muted-foreground">{fmt.format(l.createdAt)}</span>
                </div>
                {l.message && <p className="text-foreground">{l.message}</p>}
              </li>
            ))}
          </ul>
        </section>
      )}

      {items.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border p-12 text-center">
          <MessageSquare className="size-7 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            No feedback yet. Use the Feedback button in the corner to add the first.
          </p>
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {items.map((f) => {
            const s = f.sentiment ? SENTIMENT[f.sentiment] : null;
            return (
              <li key={f.id} className="flex flex-col gap-2 rounded-2xl border border-border bg-card p-4">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  {s && (
                    <span className={`inline-flex items-center gap-1 font-medium ${s.cls}`}>
                      <s.Icon className="size-4" />
                      {s.label}
                    </span>
                  )}
                  {f.role && (
                    <span className="rounded-full bg-muted px-2 py-0.5">
                      {ROLE_LABEL[f.role] ?? f.role}
                    </span>
                  )}
                  <span className="ml-auto tabular-nums">{fmt.format(f.createdAt)}</span>
                </div>

                {f.message && <p className="text-sm text-foreground">{f.message}</p>}

                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  {isAdmin && (
                    <span>{f.user ? `${f.user.name} · ${f.user.email}` : "Anonymous"}</span>
                  )}
                  {f.path && <span className="ml-auto font-mono opacity-70">{f.path}</span>}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
