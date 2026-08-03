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
