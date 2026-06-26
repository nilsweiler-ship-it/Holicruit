import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Briefcase, GraduationCap, Plus, Repeat, Target, User } from "lucide-react";
import { requireUser, getHeldHats } from "@/lib/persona";
import { addHat, type Hat } from "@/lib/actions/account";
import { Wordmark } from "@/components/brand/wordmark";

export const metadata: Metadata = { title: "Your hats · Holicruit" };

const HATS: { hat: Hat; title: string; role: string; description: string; icon: React.ElementType; href: string }[] = [
  { hat: "candidate", title: "I'm looking", role: "Candidate", description: "Find roles & grow my profile", icon: User, href: "/candidate/matches" },
  { hat: "hiring_manager", title: "I'm hiring", role: "Hiring Manager", description: "Meet candidates for my team", icon: Briefcase, href: "/hiring-manager/pipeline" },
  { hat: "recruiter", title: "I connect people", role: "Recruiter", description: "Facilitate matches, earn on outcomes", icon: Target, href: "/recruiter" },
  { hat: "provider", title: "I train people", role: "Training Provider", description: "Offer programs that close candidates' gaps", icon: GraduationCap, href: "/provider" },
];

/**
 * 1.0 — Role selector / hat hub. Shows the hats this account already holds (open
 * them) and the ones it can add. One account, many hats.
 */
export default async function SelectRolePage() {
  await requireUser();
  const held = await getHeldHats();

  return (
    <div className="flex min-h-dvh items-center justify-center bg-background px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-6 flex flex-col items-center gap-3 text-center">
          <Wordmark href="/select-role" className="text-2xl" />
          <p className="text-muted-foreground">Which hat are you wearing?</p>
        </div>

        <div className="flex flex-col gap-3">
          {HATS.map((r) => {
            const Icon = r.icon;
            const has = held.includes(r.hat);
            return (
              <div
                key={r.hat}
                className="flex items-center gap-4 rounded-2xl border border-border bg-card p-4"
              >
                <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/12 text-primary">
                  <Icon className="size-5" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-semibold">
                    {r.title} — <span className="text-primary">{r.role}</span>
                  </span>
                  <span className="block text-sm text-muted-foreground">{r.description}</span>
                </span>
                {has ? (
                  <Link
                    href={r.href}
                    className="inline-flex shrink-0 items-center gap-1 rounded-lg bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                  >
                    Open
                    <ArrowRight className="size-4" />
                  </Link>
                ) : (
                  <form action={addHat.bind(null, r.hat)}>
                    <button
                      type="submit"
                      className="inline-flex shrink-0 items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground"
                    >
                      <Plus className="size-4" />
                      Add
                    </button>
                  </form>
                )}
              </div>
            );
          })}
        </div>

        <p className="mt-6 flex items-center justify-center gap-2 text-center text-sm text-muted-foreground">
          <Repeat className="size-4" />
          One account, many hats — add or switch anytime.
        </p>
      </div>
    </div>
  );
}
