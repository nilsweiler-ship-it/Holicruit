import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  ClipboardCheck,
  KanbanSquare,
  LineChart,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";

type Tier = "Team" | "Scale";

interface Benefit {
  icon: LucideIcon;
  line: string;
}

interface Feature {
  tier: Tier;
  icon: LucideIcon;
  title: string;
  lead: string;
  benefits: Benefit[];
  preview: React.ReactNode;
}

const FEATURES: Record<string, Feature> = {
  "score-sheets": {
    tier: "Team",
    icon: ClipboardCheck,
    title: "Score every candidate the same way.",
    lead: "Consistent, criteria-based scoring means defensible decisions — and every rating rolls straight into your analytics.",
    benefits: [
      { icon: ClipboardCheck, line: "Same criteria across interviewers" },
      { icon: ClipboardCheck, line: "One-click recommendation (strong yes → strong no)" },
      { icon: LineChart, line: "Feeds the candidate record & analytics" },
    ],
    preview: <ScoreSheetPreview />,
  },
  pipeline: {
    tier: "Team",
    icon: KanbanSquare,
    title: "Run your whole pipeline in one place.",
    lead: "Private notes, time-in-stage so nothing stalls, and drag-to-advance — your whole team working from one board.",
    benefits: [
      { icon: KanbanSquare, line: "Private notes & context per candidate" },
      { icon: Zap, line: "Time-in-stage flags stalled candidates" },
      { icon: ClipboardCheck, line: "Team stays aligned" },
    ],
    preview: <PipelinePreview />,
  },
  analytics: {
    tier: "Scale",
    icon: LineChart,
    title: "See what your hiring is actually doing.",
    lead: "Funnel, conversion, average scorecards, blocking gaps and where people stall — across every role.",
    benefits: [
      { icon: LineChart, line: "Funnel & offer conversion" },
      { icon: ClipboardCheck, line: "Avg score & top blocking gaps" },
      { icon: Zap, line: "Catch stalled candidates early" },
    ],
    preview: <FunnelPreview />,
  },
  priority: {
    tier: "Scale",
    icon: Zap,
    title: "Your roles, seen first.",
    lead: "Priority roles cast a wider net and surface ahead of standard roles — more qualified candidates, faster fills.",
    benefits: [
      { icon: Zap, line: "Wider matching net" },
      { icon: LineChart, line: "Surfaced before standard roles" },
      { icon: ClipboardCheck, line: "Fill critical roles faster" },
    ],
    preview: <PriorityPreview />,
  },
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ feature: string }>;
}): Promise<Metadata> {
  const { feature } = await params;
  const f = FEATURES[feature];
  return { title: f ? `${f.title} · Holicruit` : "Feature · Holicruit" };
}

export default async function FeaturePage({
  params,
}: {
  params: Promise<{ feature: string }>;
}) {
  const { feature } = await params;
  const f = FEATURES[feature];
  if (!f) notFound();

  const Icon = f.icon;

  return (
    <div className="flex flex-col gap-6">
      <Link
        href="/hiring-manager/billing"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" aria-hidden />
        Back to billing
      </Link>

      <header className="flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <span className="flex size-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Icon className="size-5" aria-hidden />
          </span>
          <span className="inline-flex items-center rounded-full border border-primary/30 bg-primary/8 px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-primary">
            {f.tier}
          </span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">{f.title}</h1>
        <p className="max-w-2xl text-base text-muted-foreground">{f.lead}</p>
      </header>

      <section className="grid gap-4 sm:grid-cols-3">
        {f.benefits.map((b) => {
          const BIcon = b.icon;
          return (
            <div
              key={b.line}
              className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-5"
            >
              <span className="flex size-9 items-center justify-center rounded-xl bg-accent text-primary">
                <BIcon className="size-4.5" aria-hidden />
              </span>
              <p className="text-sm font-medium text-foreground">{b.line}</p>
            </div>
          );
        })}
      </section>

      <section className="rounded-2xl border border-border bg-card p-5">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Preview
        </h2>
        {f.preview}
      </section>

      <div>
        <Button asChild>
          <Link href="/hiring-manager/billing">Upgrade to {f.tier}</Link>
        </Button>
      </div>
    </div>
  );
}

/* -- Visual mocks ------------------------------------------------------- */

function ScoreSheetPreview() {
  const rows = [
    { label: "Technical depth", score: 4 },
    { label: "Communication", score: 5 },
    { label: "Ownership", score: 3 },
  ];
  return (
    <div className="max-w-sm rounded-xl border border-border bg-background p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        Score sheet · Alex Rivera
      </p>
      <div className="mt-3 flex flex-col gap-2.5">
        {rows.map((r) => (
          <div key={r.label} className="flex items-center justify-between gap-3">
            <span className="text-sm text-foreground">{r.label}</span>
            <div className="flex gap-0.5">
              {[1, 2, 3, 4, 5].map((n) => (
                <span
                  key={n}
                  className={
                    n <= r.score
                      ? "size-2.5 rounded-full bg-primary"
                      : "size-2.5 rounded-full bg-muted"
                  }
                />
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
        <span className="text-xs text-muted-foreground">Recommendation</span>
        <span className="rounded-full bg-success/12 px-2.5 py-1 text-xs font-semibold text-success">
          Strong yes
        </span>
      </div>
    </div>
  );
}

function PipelinePreview() {
  const notes = [
    { name: "Alex Rivera", note: "Great systems answer. Loop scheduled.", stage: "Talking · 2d" },
    { name: "Priya Shah", note: "Waiting on take-home review.", stage: "Talking · 9d", stalled: true },
    { name: "Sam Okoro", note: "Offer drafted, sending today.", stage: "Offer · 1d" },
  ];
  return (
    <div className="flex max-w-md flex-col gap-2.5">
      {notes.map((n) => (
        <div
          key={n.name}
          className="flex items-start justify-between gap-3 rounded-xl border border-border bg-background p-3"
        >
          <div className="min-w-0">
            <p className="text-sm font-semibold text-foreground">{n.name}</p>
            <p className="mt-0.5 truncate text-xs text-muted-foreground">{n.note}</p>
          </div>
          <span
            className={
              n.stalled
                ? "shrink-0 rounded-full border border-primary/30 bg-primary/8 px-2 py-0.5 text-[10px] font-semibold text-primary"
                : "shrink-0 rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground"
            }
          >
            {n.stage}
          </span>
        </div>
      ))}
    </div>
  );
}

function FunnelPreview() {
  const stages = [
    { label: "New", count: 38 },
    { label: "Talking", count: 27 },
    { label: "Offer", count: 11 },
    { label: "Closed", count: 8 },
  ];
  const max = Math.max(...stages.map((s) => s.count));
  return (
    <div className="flex max-w-md flex-col gap-3">
      {stages.map((s) => (
        <div key={s.label} className="flex items-center gap-3">
          <span className="w-16 shrink-0 text-sm font-medium text-foreground">{s.label}</span>
          <div className="h-6 flex-1 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary"
              style={{ width: `${Math.round((s.count / max) * 100)}%` }}
            />
          </div>
          <span className="w-8 shrink-0 text-right text-sm font-semibold tabular-nums text-foreground">
            {s.count}
          </span>
        </div>
      ))}
    </div>
  );
}

function PriorityPreview() {
  return (
    <div className="flex max-w-md flex-col gap-2.5">
      <div className="flex items-center justify-between gap-3 rounded-xl border border-primary/30 bg-primary/8 p-3">
        <div>
          <p className="text-sm font-semibold text-foreground">Staff Backend Engineer</p>
          <p className="mt-0.5 text-xs text-muted-foreground">Wider net · surfaced first</p>
        </div>
        <span className="inline-flex items-center gap-1 rounded-full bg-primary px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-primary-foreground">
          <Zap className="size-3" aria-hidden />
          Priority
        </span>
      </div>
      <div className="flex items-center justify-between gap-3 rounded-xl border border-border bg-background p-3 opacity-70">
        <div>
          <p className="text-sm font-semibold text-foreground">Support Specialist</p>
          <p className="mt-0.5 text-xs text-muted-foreground">Standard role</p>
        </div>
        <span className="rounded-full bg-muted px-2.5 py-1 text-[10px] font-medium text-muted-foreground">
          Standard
        </span>
      </div>
    </div>
  );
}
