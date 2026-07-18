import type { Metadata } from "next";
import Link from "next/link";
import { Lock } from "lucide-react";
import { getHiringAnalytics, type HiringAnalytics } from "@/lib/services/analytics";
import { getActivePlan } from "@/lib/services/billing";
import { requireUser } from "@/lib/persona";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Analytics · Holicruit" };

/** Believable stand-in shown, visually locked, to teams not yet on Scale. */
const SAMPLE: HiringAnalytics = {
  roles: 6,
  matched: 84,
  funnel: { new: 38, talking: 27, offer: 11, closed: 8 },
  offerRate: 13,
  avgScore: 3.8,
  scoreSheetCount: 42,
  topGaps: [
    { skill: "System design", count: 14 },
    { skill: "Kubernetes", count: 9 },
    { skill: "Go", count: 7 },
    { skill: "GraphQL", count: 5 },
    { skill: "Leadership", count: 4 },
  ],
  stalledTalking: 5,
  offerAvgFit: 86,
  silverMedalists: 12,
  reviewedShare: 78,
  panelAgreement: 84,
};

export default async function HiringAnalyticsPage() {
  const user = await requireUser();
  const { plan } = await getActivePlan(user.id, "hiring_manager");

  if (plan.analytics) {
    const a = await getHiringAnalytics(user.id);
    return (
      <div className="flex flex-col gap-6">
        <Header />
        <Dashboard a={a} />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <Header />
      <div className="relative">
        <div aria-hidden className="pointer-events-none select-none opacity-25 blur-md">
          <Dashboard a={SAMPLE} />
        </div>
        <div className="absolute inset-0 flex items-center justify-center p-4">
          <div className="flex max-w-sm flex-col items-center gap-4 rounded-2xl border border-border bg-card p-6 text-center shadow-lg">
            <span className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Lock className="size-5" aria-hidden />
            </span>
            <div className="flex flex-col gap-1.5">
              <h2 className="text-lg font-semibold text-foreground">Unlock hiring analytics</h2>
              <p className="text-sm text-muted-foreground">
                Quality-of-hire, fairness &amp; consistency, funnel conversion, and the gaps
                blocking your roles — across every role.
              </p>
            </div>
            <Button asChild className="w-full">
              <Link href="/hiring-manager/billing">Upgrade to Scale</Link>
            </Button>
            <Link
              href="/hiring-manager/features/analytics"
              className="text-sm font-medium text-primary hover:underline"
            >
              Learn more
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function Header() {
  return (
    <header className="flex flex-col gap-1">
      <h1 className="text-2xl font-bold tracking-tight text-foreground">Hiring analytics</h1>
      <p className="text-sm text-muted-foreground">
        Your funnel, conversion and blocking gaps across every role.
      </p>
    </header>
  );
}

function Dashboard({ a }: { a: HiringAnalytics }) {
  return (
    <div className="flex flex-col gap-6">
      <section className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        <Stat label="Roles" value={a.roles} />
        <Stat label="Matched" value={a.matched} />
        <Stat label="Offer rate" value={`${a.offerRate}%`} emphasis />
        <Stat
          label="Avg score"
          value={a.avgScore === null ? "—" : `${a.avgScore}/5`}
          hint={`${a.scoreSheetCount} score sheet${a.scoreSheetCount === 1 ? "" : "s"}`}
        />
        <Stat label="Stalled in talking" value={a.stalledTalking} />
      </section>

      <QualityAndFairness a={a} />

      <Funnel funnel={a.funnel} />

      <TopGaps gaps={a.topGaps} />
    </div>
  );
}

function QualityAndFairness({ a }: { a: HiringAnalytics }) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <section className="rounded-2xl border border-border bg-card p-5">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Quality of hire
        </h2>
        <div className="mt-4 grid grid-cols-2 gap-4">
          <Stat
            label="Avg fit at offer"
            value={a.offerAvgFit === null ? "—" : a.offerAvgFit}
            hint="mutual fit of offered candidates"
            emphasis
          />
          <Stat
            label="Silver medalists"
            value={a.silverMedalists}
            hint="strong passes kept warm"
          />
        </div>
        <p className="mt-4 text-xs text-muted-foreground">
          Higher fit at offer predicts stronger on-the-job success — the lever against the
          ~30%-of-salary cost of a bad hire.
        </p>
      </section>

      <section className="rounded-2xl border border-border bg-card p-5">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Fairness &amp; consistency
        </h2>
        <div className="mt-4 grid grid-cols-2 gap-4">
          <Stat
            label="Reviewed on a scorecard"
            value={`${a.reviewedShare}%`}
            hint="active candidates with structured scoring"
          />
          <Stat
            label="Panel agreement"
            value={a.panelAgreement === null ? "—" : `${a.panelAgreement}%`}
            hint="raters within one point"
            emphasis
          />
        </div>
        <p className="mt-4 text-xs text-muted-foreground">
          Consistent, multi-rater scoring makes decisions defensible and reduces single-decider bias.
        </p>
      </section>
    </div>
  );
}

function Stat({
  label,
  value,
  hint,
  emphasis,
}: {
  label: string;
  value: string | number;
  hint?: string;
  emphasis?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border p-5",
        emphasis ? "border-primary/30 bg-primary/8" : "border-border bg-card",
      )}
    >
      <p
        className={cn(
          "text-3xl font-bold tracking-tight",
          emphasis ? "text-primary" : "text-foreground",
        )}
      >
        {value}
      </p>
      <p className="mt-1 text-sm text-muted-foreground">{label}</p>
      {hint && <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

const FUNNEL_STAGES: { key: keyof HiringAnalytics["funnel"]; label: string }[] = [
  { key: "new", label: "New" },
  { key: "talking", label: "Talking" },
  { key: "offer", label: "Offer" },
  { key: "closed", label: "Closed" },
];

function Funnel({ funnel }: { funnel: HiringAnalytics["funnel"] }) {
  const max = Math.max(1, ...FUNNEL_STAGES.map((s) => funnel[s.key]));
  return (
    <section className="rounded-2xl border border-border bg-card p-5">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
        Pipeline funnel
      </h2>
      <div className="mt-4 flex flex-col gap-3">
        {FUNNEL_STAGES.map((s) => {
          const count = funnel[s.key];
          return (
            <div key={s.key} className="flex items-center gap-3">
              <span className="w-16 shrink-0 text-sm font-medium text-foreground">{s.label}</span>
              <div className="h-6 flex-1 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary"
                  style={{ width: `${Math.round((count / max) * 100)}%` }}
                />
              </div>
              <span className="w-8 shrink-0 text-right text-sm font-semibold tabular-nums text-foreground">
                {count}
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function TopGaps({ gaps }: { gaps: HiringAnalytics["topGaps"] }) {
  return (
    <section className="rounded-2xl border border-border bg-card p-5">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
        Top gaps blocking your candidates
      </h2>
      {gaps.length === 0 ? (
        <p className="mt-4 text-sm text-muted-foreground">No blocking gaps yet.</p>
      ) : (
        <ul className="mt-4 flex flex-col divide-y divide-border">
          {gaps.map((g) => (
            <li key={g.skill} className="flex items-center justify-between py-2.5 text-sm">
              <span className="font-medium text-foreground">{g.skill}</span>
              <span className="tabular-nums text-muted-foreground">{g.count}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
