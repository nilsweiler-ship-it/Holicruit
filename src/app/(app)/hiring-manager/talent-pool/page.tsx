import type { Metadata } from "next";
import Link from "next/link";
import { Bookmark, Sparkles, Users } from "lucide-react";
import { getActivePlan } from "@/lib/services/billing";
import { getTalentPool } from "@/lib/services/talentpool";
import { reopenForReMatch, toggleSaved } from "@/lib/actions/hm";
import { requireUser } from "@/lib/persona";
import { PersonAvatar } from "@/components/people/person-avatar";
import { LockedFeature } from "@/components/billing/locked-feature";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Talent pool · Holicruit" };

type Filter = "all" | "ready" | "saved";

const FILTERS: { key: Filter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "ready", label: "Ready to re-match" },
  { key: "saved", label: "Saved" },
];

/**
 * Silver-medalist talent pool (Team+). Strong candidates a team passed on stay
 * nurtured against the gap that cost them the role; when the market shows the
 * gap is closeable they surface as "ready to re-match".
 */
export default async function TalentPoolPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>;
}) {
  const user = await requireUser();
  const { plan } = await getActivePlan(user.id, "hiring_manager");

  if (!plan.talentPool) {
    return (
      <div className="flex flex-col gap-6">
        <Header />
        <LockedFeature
          title="Silver-medalist talent pool"
          tier="Team"
          blurb="Every strong candidate you pass on stays warm — tied to the exact gap that cost them the role. When that gap becomes closeable, they resurface here, ready for an honest re-match. It's a pipeline only Holicruit can build."
          learnMoreHref="/hiring-manager/features/talent-pool"
        />
      </div>
    );
  }

  const pool = await getTalentPool(user.id);
  const { filter } = await searchParams;
  const active: Filter = filter === "ready" || filter === "saved" ? filter : "all";
  const list = pool.candidates.filter((c) =>
    active === "ready" ? c.status === "ready" : active === "saved" ? c.saved : true,
  );

  return (
    <div className="flex flex-col gap-6">
      <Header />

      {pool.total === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-border bg-card/40 px-6 py-12 text-center">
          <Users className="size-6 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            No silver medalists yet. As you pass on strong candidates, they&apos;ll be
            nurtured here against the gap that cost them the role.
          </p>
        </div>
      ) : (
        <>
          <div className="flex flex-wrap gap-2">
            {FILTERS.map((f) => {
              const count = f.key === "ready" ? pool.ready : f.key === "saved" ? pool.saved : pool.total;
              return (
                <Link
                  key={f.key}
                  href={f.key === "all" ? "/hiring-manager/talent-pool" : `/hiring-manager/talent-pool?filter=${f.key}`}
                  className={cn(
                    "rounded-full border px-3 py-1.5 text-sm font-medium transition-colors",
                    active === f.key
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border bg-card text-muted-foreground hover:bg-accent",
                  )}
                >
                  {f.label} · {count}
                </Link>
              );
            })}
          </div>

          {active === "all" && pool.ready > 0 && (
            <div className="flex items-center gap-3 rounded-2xl border border-primary/30 bg-primary/8 p-4 text-sm">
              <Sparkles className="size-5 shrink-0 text-primary" />
              <p className="text-foreground">
                <span className="font-semibold">{pool.ready}</span>{" "}
                {pool.ready === 1 ? "candidate has" : "candidates have"} a gap that&apos;s now
                closeable — reach back out while they&apos;re warm.
              </p>
            </div>
          )}

          {list.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-border bg-card/40 px-6 py-10 text-center text-sm text-muted-foreground">
              {active === "saved" ? "No saved candidates yet — tap the bookmark on anyone worth keeping." : "None in this view."}
            </p>
          ) : (
          <ul className="flex flex-col gap-3">
            {list.map((c) => (
              <li
                key={c.matchId}
                className="flex flex-wrap items-center gap-x-4 gap-y-3 rounded-2xl border border-border bg-card p-4"
              >
                <PersonAvatar person={{ name: c.name, initials: c.initials }} size={44} />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold text-foreground">{c.name}</p>
                    {c.status === "ready" ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-primary/12 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary">
                        <Sparkles className="size-3" />
                        Ready to re-match
                      </span>
                    ) : (
                      <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                        Nurturing
                      </span>
                    )}
                  </div>
                  <p className="truncate text-sm text-muted-foreground">
                    Passed on {c.roleTitle} · {c.company}
                    {c.gapSkill ? (
                      <>
                        {" — gap: "}
                        <span className="font-medium text-foreground">{c.gapSkill}</span>
                        {c.status === "ready" && c.completionsForGap > 0 && (
                          <>
                            {" · "}
                            {c.completionsForGap.toLocaleString()} learners have closed it
                          </>
                        )}
                      </>
                    ) : null}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <form action={toggleSaved.bind(null, c.matchId)}>
                    <button
                      type="submit"
                      aria-label={c.saved ? "Remove from saved" : "Save candidate"}
                      title={c.saved ? "Saved" : "Save candidate"}
                      className={cn(
                        "flex size-9 items-center justify-center rounded-lg border transition-colors",
                        c.saved
                          ? "border-primary/40 bg-primary/10 text-primary"
                          : "border-border text-muted-foreground hover:bg-accent",
                      )}
                    >
                      <Bookmark className={cn("size-4", c.saved && "fill-current")} />
                    </button>
                  </form>
                  <div className="text-right">
                    <p className="text-base font-bold tabular-nums text-primary">{c.mutualFit}</p>
                    <p className="text-[10px] uppercase tracking-wide text-muted-foreground">mutual fit</p>
                  </div>
                  {c.status === "ready" ? (
                    <form action={reopenForReMatch.bind(null, c.matchId)}>
                      <button
                        type="submit"
                        className="rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
                      >
                        Invite to re-match
                      </button>
                    </form>
                  ) : (
                    <Link
                      href={`/hiring-manager/candidate/${c.matchId}`}
                      className="rounded-lg border border-border bg-card px-3 py-2 text-sm font-medium transition-colors hover:bg-accent"
                    >
                      View
                    </Link>
                  )}
                </div>
              </li>
            ))}
          </ul>
          )}
        </>
      )}
    </div>
  );
}

function Header() {
  return (
    <header className="flex flex-col gap-1">
      <h1 className="text-2xl font-bold tracking-tight text-foreground">Talent pool</h1>
      <p className="text-sm text-muted-foreground">
        Strong candidates you passed on — kept warm against the gap that cost them the role.
      </p>
    </header>
  );
}
