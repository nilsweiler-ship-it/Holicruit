import type { Metadata } from "next";
import Link from "next/link";
import { BookOpen, GraduationCap, HandCoins, Megaphone, Plus, Repeat, Users } from "lucide-react";
import { marketplaceService } from "@/lib/services/marketplace";
import { getActiveProvider } from "@/lib/persona";
import { PersonAvatar } from "@/components/people/person-avatar";
import { PromoteButton } from "@/components/provider/promote-button";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Provider desk · Holicruit" };

/**
 * Fourth-party provider desk. A training/education provider offers and promotes
 * programs that close candidates' measured skill gaps ("stretch"). They target
 * aggregate gap demand and earn on the transparency loop (gap → learning →
 * re-match).
 */
export default async function ProviderDeskPage() {
  const provider = await getActiveProvider();
  const [stats, demand, programs] = await Promise.all([
    marketplaceService.getProviderStats(provider.id),
    marketplaceService.getGapDemand(),
    marketplaceService.getProviderPrograms(provider.id),
  ]);

  const money = (n: number) =>
    `${stats.currency}${n >= 1000 ? `${(n / 1000).toFixed(n % 1000 === 0 ? 0 : 1)}k` : n}`;

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <header className="flex items-center gap-3">
        <PersonAvatar person={provider} size={48} />
        <div>
          <h1 className="text-xl font-bold tracking-tight">{provider.name}</h1>
          <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <GraduationCap className="size-4" />
            {provider.kind} · provider desk
          </p>
        </div>
        <Button asChild className="ml-auto">
          <Link href="/provider/new">
            <Plus className="size-4" />
            Offer a program
          </Link>
        </Button>
      </header>

      {/* Stat tiles */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatTile icon={BookOpen} label="Active programs" value={String(stats.activePrograms)} />
        <StatTile
          icon={Users}
          label="Learners enrolled"
          value={stats.learnersEnrolled.toLocaleString()}
        />
        <StatTile
          icon={Repeat}
          label="Re-matches generated"
          value={stats.reMatchesGenerated.toLocaleString()}
          emphasized
        />
        <StatTile icon={HandCoins} label="Earned" value={money(stats.revenue)} emphasized />
      </div>

      {/* Gaps in demand — the targeting workflow */}
      <section className="flex flex-col gap-3">
        <div className="flex items-baseline justify-between gap-2">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Gaps in demand
          </h2>
          <span className="text-xs text-muted-foreground">aggregate · anonymized</span>
        </div>
        <ul className="flex flex-col gap-2">
          {demand.map((d) => {
            const uncovered = d.programsOffered === 0;
            return (
              <li
                key={d.skill}
                className={cn(
                  "flex flex-wrap items-center gap-x-3 gap-y-2 rounded-2xl border bg-card p-4",
                  uncovered ? "border-primary/40" : "border-border",
                )}
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-foreground">{d.skill}</span>
                    <span className="rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                      {d.type}
                    </span>
                    {uncovered && (
                      <span className="rounded-full bg-primary/12 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary">
                        open lane
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {d.candidatesWithGap} candidates · {d.rolesBlocked} roles blocked ·{" "}
                    {d.programsOffered} program{d.programsOffered === 1 ? "" : "s"} offered
                  </p>
                </div>
                <PromoteButton
                  gap={d.skill}
                  isNew={uncovered}
                  variant={uncovered ? "default" : "outline"}
                />
              </li>
            );
          })}
        </ul>
      </section>

      {/* Provider's own catalog */}
      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Your programs
        </h2>
        <ul className="flex flex-col gap-2">
          {programs.map((p) => (
            <li
              key={p.id}
              className="flex flex-wrap items-center gap-x-4 gap-y-2 rounded-2xl border border-border bg-card p-4"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-foreground">{p.title}</span>
                  {p.sponsored && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-primary/12 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary">
                      <Megaphone className="size-3" />
                      Promoted
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  closes <span className="font-medium text-foreground">{p.closesGap}</span> ·{" "}
                  {p.enrollments.toLocaleString()} enrolled · {p.completions.toLocaleString()} completed ·{" "}
                  {p.reMatches.toLocaleString()} re-matched
                </p>
              </div>
              {!p.sponsored && (
                <PromoteButton gap={p.closesGap} label="Boost" variant="ghost" programId={p.id} />
              )}
            </li>
          ))}
        </ul>
      </section>

      {/* Footer banner */}
      <div className="flex items-center gap-3 rounded-2xl bg-accent p-4 text-sm text-accent-foreground">
        <HandCoins className="size-5 shrink-0" />
        <p>
          You earn on outcomes too — when a learner closes their measured gap and re-matches,
          everyone wins. Programs are ranked by that track record, not ad spend.
        </p>
      </div>
    </div>
  );
}

function StatTile({
  icon: Icon,
  label,
  value,
  emphasized = false,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  emphasized?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-1 rounded-2xl border p-4",
        emphasized ? "border-primary/30 bg-primary/8" : "border-border bg-card",
      )}
    >
      <Icon className={cn("size-4", emphasized ? "text-primary" : "text-muted-foreground")} />
      <span
        className={cn(
          "mt-1 text-2xl font-bold tracking-tight",
          emphasized ? "text-primary" : "text-foreground",
        )}
      >
        {value}
      </span>
      <span className="text-xs text-muted-foreground">{label}</span>
    </div>
  );
}
