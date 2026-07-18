import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  ClipboardCheck,
  GraduationCap,
  KanbanSquare,
  LineChart,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Users,
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
  "interview-kit": {
    tier: "Team",
    icon: Sparkles,
    title: "Interview guides, generated in one click.",
    lead: "For every candidate, get a structured interview kit tuned to their gaps, the role's required skills, and their measured personality — questions, what to listen for, and the scorecard criterion each maps to. Stop writing interview scripts from scratch, and interview everyone consistently.",
    benefits: [
      { icon: Sparkles, line: "Tailored to each candidate & role" },
      { icon: ClipboardCheck, line: "Maps every question to your scorecard" },
      { icon: ShieldCheck, line: "Consistent, bias-reducing, defensible" },
    ],
    preview: <InterviewKitPreview />,
  },
  "talent-pool": {
    tier: "Team",
    icon: Sparkles,
    title: "The silver medalists you already earned.",
    lead: "Every strong candidate you pass on stays warm — tied to the exact gap that cost them the role. When that gap becomes closeable, they resurface ready for an honest re-match. Only Holicruit can build this pipeline, because every rejection produces a structured Growth Report.",
    benefits: [
      { icon: Sparkles, line: "Auto-nurtured against a named gap" },
      { icon: Zap, line: "Alerted when they're ready to re-match" },
      { icon: Users, line: "A warm pipeline no ATS has" },
    ],
    preview: <TalentPoolPreview />,
  },
  calibration: {
    tier: "Team",
    icon: SlidersHorizontal,
    title: "Calibrate the bar to what actually works.",
    lead: "Set the bar for each role and weight hard vs. soft to match what success really looks like on your team — so matching optimizes for your definition of a great hire, not a generic one.",
    benefits: [
      { icon: SlidersHorizontal, line: "Weight hard vs. soft per role" },
      { icon: ClipboardCheck, line: "Set your own pass bar" },
      { icon: LineChart, line: "Sharper, role-specific matching" },
    ],
    preview: <CalibrationPreview />,
  },
  "decision-intelligence": {
    tier: "Team",
    icon: Users,
    title: "Decide as a team, not a single opinion.",
    lead: "Every interviewer's structured score rolls into one consensus view — with an agreement signal that surfaces where the panel disagrees, so decisions are fair and defensible.",
    benefits: [
      { icon: Users, line: "All interviewers on one scorecard" },
      { icon: LineChart, line: "Consensus & agreement signal" },
      { icon: ShieldCheck, line: "Fairer, defensible decisions" },
    ],
    preview: <DecisionIntelPreview />,
  },
  assessments: {
    tier: "Scale",
    icon: GraduationCap,
    title: "Assessments tuned to your roles.",
    lead: "Go beyond the universal scenario assessment with company-specific situational judgment tailored to your context — measuring the exact soft skills that predict success in your teams.",
    benefits: [
      { icon: GraduationCap, line: "Company-specific scenarios" },
      { icon: ShieldCheck, line: "Objective, never self-rated" },
      { icon: LineChart, line: "Predictive of on-the-job success" },
    ],
    preview: <AssessmentsPreview />,
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

function InterviewKitPreview() {
  const items = [
    { q: "Tell me about a time GraphQL was central to a project. What was hard?", listen: "First-hand depth, trade-offs", crit: "Technical" },
    { q: "Our model flagged limited signal on system design — describe hands-on experience.", listen: "Whether the gap is real or unmeasured", crit: "Technical" },
    { q: "Give a specific example where ownership made the difference.", listen: "STAR story, own actions, result", crit: "Ownership" },
  ];
  return (
    <div className="flex max-w-md flex-col gap-2.5">
      {items.map((it) => (
        <div key={it.q} className="rounded-xl border border-border bg-background p-3">
          <p className="text-sm font-medium text-foreground">{it.q}</p>
          <p className="mt-1 text-xs text-muted-foreground">Listen for: {it.listen}</p>
          <span className="mt-1.5 inline-flex rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
            Scores: {it.crit}
          </span>
        </div>
      ))}
    </div>
  );
}

function TalentPoolPreview() {
  const rows = [
    { name: "Sam Okoro", gap: "Stakeholder influence", ready: true, note: "180 learners closed it" },
    { name: "Aisha Bello", gap: "Care coordination at scale", ready: true, note: "94 learners closed it" },
    { name: "Diego Marín", gap: "Enterprise discovery", ready: false, note: "Nurturing" },
  ];
  return (
    <div className="flex max-w-md flex-col gap-2.5">
      {rows.map((r) => (
        <div
          key={r.name}
          className="flex items-center justify-between gap-3 rounded-xl border border-border bg-background p-3"
        >
          <div className="min-w-0">
            <p className="text-sm font-semibold text-foreground">{r.name}</p>
            <p className="mt-0.5 truncate text-xs text-muted-foreground">
              Gap: {r.gap} · {r.note}
            </p>
          </div>
          <span
            className={
              r.ready
                ? "inline-flex shrink-0 items-center gap-1 rounded-full bg-primary/12 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary"
                : "shrink-0 rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground"
            }
          >
            {r.ready ? "Ready to re-match" : "Nurturing"}
          </span>
        </div>
      ))}
    </div>
  );
}

function CalibrationPreview() {
  return (
    <div className="max-w-sm rounded-xl border border-border bg-background p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        Senior Product Engineer · calibration
      </p>
      <div className="mt-3 flex flex-col gap-3">
        <div>
          <div className="flex justify-between text-sm">
            <span className="text-foreground">Hard skills</span>
            <span className="font-semibold text-foreground">60%</span>
          </div>
          <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-muted">
            <div className="h-full rounded-full bg-primary" style={{ width: "60%" }} />
          </div>
        </div>
        <div>
          <div className="flex justify-between text-sm">
            <span className="text-foreground">Soft skills</span>
            <span className="font-semibold text-foreground">40%</span>
          </div>
          <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-muted">
            <div className="h-full rounded-full bg-primary" style={{ width: "40%" }} />
          </div>
        </div>
      </div>
      <div className="mt-4 flex items-center justify-between border-t border-border pt-3 text-sm">
        <span className="text-muted-foreground">Pass bar</span>
        <span className="font-semibold text-foreground">Mutual fit ≥ 72</span>
      </div>
    </div>
  );
}

function DecisionIntelPreview() {
  const scores = [
    { who: "You", rec: "Strong yes", val: 5 },
    { who: "Priya", rec: "Yes", val: 4 },
    { who: "Marcus", rec: "Yes", val: 4 },
  ];
  return (
    <div className="max-w-sm rounded-xl border border-border bg-background p-4">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Panel · Alex Rivera
        </p>
        <span className="rounded-full bg-success/12 px-2 py-0.5 text-[10px] font-semibold text-success">
          High agreement
        </span>
      </div>
      <div className="mt-3 flex flex-col gap-2">
        {scores.map((s) => (
          <div key={s.who} className="flex items-center justify-between gap-3">
            <span className="text-sm text-foreground">{s.who}</span>
            <div className="flex items-center gap-2">
              <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((n) => (
                  <span
                    key={n}
                    className={n <= s.val ? "size-2.5 rounded-full bg-primary" : "size-2.5 rounded-full bg-muted"}
                  />
                ))}
              </div>
              <span className="w-20 text-right text-xs text-muted-foreground">{s.rec}</span>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 flex items-center justify-between border-t border-border pt-3 text-sm">
        <span className="text-muted-foreground">Consensus</span>
        <span className="font-semibold text-foreground">4.3 / 5 · Yes</span>
      </div>
    </div>
  );
}

function AssessmentsPreview() {
  return (
    <div className="max-w-sm rounded-xl border border-border bg-background p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        Company scenario · your context
      </p>
      <p className="mt-2 text-sm text-foreground">
        &ldquo;A key customer escalates during a release freeze. Your call?&rdquo;
      </p>
      <div className="mt-3 flex flex-col gap-1.5">
        {["Escalate to eng lead, hold the freeze", "Ship a targeted hotfix", "Buy time with the customer"].map((o, i) => (
          <div
            key={o}
            className={
              i === 1
                ? "rounded-lg border border-primary/40 bg-primary/8 px-3 py-1.5 text-xs font-medium text-foreground"
                : "rounded-lg border border-border px-3 py-1.5 text-xs text-muted-foreground"
            }
          >
            {o}
          </div>
        ))}
      </div>
      <p className="mt-3 text-[11px] text-muted-foreground">Measures judgment — never a self-rating.</p>
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
