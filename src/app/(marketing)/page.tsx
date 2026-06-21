import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  Briefcase,
  GraduationCap,
  Handshake,
  LineChart,
  ScanSearch,
  ShieldCheck,
  Sparkles,
  Target,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Holicruit — Recruiting that tells you the truth",
  description:
    "Holistic, opt-in recruiting built on radical transparency. Every candidate sees their fit, the gap that cost them the role, and a path to close it. No black box, no silent rejections.",
};

const FEATURES = [
  {
    icon: ScanSearch,
    title: "The fit model",
    body: "Hard fit, soft fit, and mutual fit — measured against the role's actual bar. Soft skills come from an objective scenario assessment, never a self-rating. You always see your own rank.",
  },
  {
    icon: LineChart,
    title: "The Growth Report",
    body: "Rejection is never silent. See exactly where you stood, the specific gap that cost you the role, and a concrete path to close it. No black box.",
  },
  {
    icon: ShieldCheck,
    title: "Opt-in matching",
    body: "No cold applications and no spray-and-pray. You're only matched when there's real two-sided fit — and you decide who sees your profile.",
  },
  {
    icon: Sparkles,
    title: "Verified, across industries",
    body: "Endorsed skills and assessed scenarios travel with you — in Software, Healthcare, Sales, Finance, Education, and beyond.",
  },
];

const HATS = [
  {
    icon: User,
    role: "Candidate",
    prop: "See your true fit, close the gap, and get matched on merit — always free.",
  },
  {
    icon: Briefcase,
    role: "Hiring Manager",
    prop: "Meet every candidate scored against your bar, with honest auto-feedback built in.",
  },
  {
    icon: Target,
    role: "Recruiter",
    prop: "Facilitate matches and get paid on outcomes — success fees only, no retainers.",
  },
  {
    icon: GraduationCap,
    role: "Training Provider",
    prop: "Reach candidates with the exact gaps your programs close, ranked by real outcomes.",
  },
];

export default function MarketingHomePage() {
  return (
    <>
      {/* Hero */}
      <section className="mx-auto w-full max-w-5xl px-4 pt-20 pb-16 text-center sm:px-6 sm:pt-28">
        <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
          <Handshake className="size-3.5 text-primary" />
          Opt-in matching · no cold applications
        </span>
        <h1 className="mt-6 text-balance text-4xl font-extrabold tracking-tight sm:text-6xl">
          Recruiting that tells you the truth.
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-balance text-lg text-muted-foreground sm:text-xl">
          Holicruit shows every candidate exactly where they stood, the gap that
          cost them the role, and a path to close it. One account, four hats, and
          a fit model built on radical transparency.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button asChild size="lg">
            <Link href="/register">
              Get started
              <ArrowRight className="size-4" />
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="/select-role">Explore the demo</Link>
          </Button>
        </div>
      </section>

      {/* Credibility strip */}
      <section className="border-y border-border bg-card">
        <div className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6">
          <p className="text-center text-sm font-medium tracking-wide text-muted-foreground">
            Works across Software · Healthcare · Sales · Finance · Education
          </p>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="mx-auto w-full max-w-6xl scroll-mt-20 px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            How it works
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            The fit model is the core primitive. Everything you see is derived
            from it — and nothing is hidden from you.
          </p>
        </div>

        <div className="mt-12 grid gap-5 sm:grid-cols-2">
          {FEATURES.map((f) => {
            const Icon = f.icon;
            return (
              <div
                key={f.title}
                className="rounded-2xl border border-border bg-card p-6"
              >
                <span className="flex size-11 items-center justify-center rounded-xl bg-primary/12 text-primary">
                  <Icon className="size-5" />
                </span>
                <h3 className="mt-4 text-lg font-semibold">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {f.body}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* For everyone — four hats */}
      <section className="border-t border-border bg-card">
        <div className="mx-auto w-full max-w-6xl px-4 py-20 sm:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              One account, four hats
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Holicruit serves every side of hiring. Switch hats anytime — your
              verified profile follows you.
            </p>
          </div>

          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {HATS.map((h) => {
              const Icon = h.icon;
              return (
                <div
                  key={h.role}
                  className="rounded-2xl border border-border bg-background p-6"
                >
                  <span className="flex size-11 items-center justify-center rounded-xl bg-primary/12 text-primary">
                    <Icon className="size-5" />
                  </span>
                  <h3 className="mt-4 font-semibold">{h.role}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {h.prop}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Growth Report highlight band */}
      <section className="mx-auto w-full max-w-6xl px-4 py-20 sm:px-6">
        <div className="overflow-hidden rounded-2xl border border-border bg-card p-8 sm:p-12">
          <div className="grid items-center gap-10 lg:grid-cols-2">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full bg-primary/12 px-3 py-1 text-xs font-semibold text-primary">
                <LineChart className="size-3.5" />
                The Growth Report
              </span>
              <h2 className="mt-4 text-3xl font-bold tracking-tight">
                Rejection is never silent.
              </h2>
              <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
                When a role doesn&apos;t work out, you get more than a
                form-letter &ldquo;no.&rdquo; You see your hard and soft
                sub-scores against the role&apos;s bar, the single gap that made
                the difference, and the programs that close it. Transparency
                isn&apos;t a feature here — it&apos;s the whole point.
              </p>
              <div className="mt-6">
                <Button asChild variant="outline">
                  <Link href="/select-role">
                    See a sample report
                    <ArrowRight className="size-4" />
                  </Link>
                </Button>
              </div>
            </div>

            <div className="space-y-4">
              {[
                { label: "Hard fit", you: 82, bar: 75, ok: true },
                { label: "Soft fit (assessed)", you: 61, bar: 70, ok: false },
                { label: "Mutual fit", you: 88, bar: 60, ok: true },
              ].map((row) => (
                <div key={row.label} className="rounded-xl border border-border bg-background p-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{row.label}</span>
                    <span
                      className={
                        row.ok
                          ? "font-semibold text-success"
                          : "font-semibold text-primary"
                      }
                    >
                      You {row.you} · bar {row.bar}
                    </span>
                  </div>
                  <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className={
                        row.ok ? "h-full rounded-full bg-success" : "h-full rounded-full bg-primary"
                      }
                      style={{ width: `${row.you}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA band */}
      <section className="border-t border-border bg-foreground text-background">
        <div className="mx-auto w-full max-w-5xl px-4 py-20 text-center sm:px-6">
          <h2 className="text-balance text-3xl font-bold tracking-tight sm:text-4xl">
            Know exactly where you stand.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-balance text-lg text-background/70">
            Join Holicruit and get matched on merit — with honest feedback at
            every step.
          </p>
          <div className="mt-8">
            <Button asChild size="lg" variant="secondary">
              <Link href="/register">
                Get started
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
