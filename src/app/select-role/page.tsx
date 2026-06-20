import type { Metadata } from "next";
import Link from "next/link";
import { Briefcase, ChevronRight, GraduationCap, Repeat, Target, User } from "lucide-react";
import { Wordmark } from "@/components/brand/wordmark";

export const metadata: Metadata = { title: "Who are you here as? · Holicruit" };

const ROLES = [
  {
    title: "I'm looking",
    role: "Candidate",
    description: "Find roles & grow my profile",
    icon: User,
    href: "/candidate/matches",
  },
  {
    title: "I'm hiring",
    role: "Hiring Manager",
    description: "Meet candidates for my team",
    icon: Briefcase,
    href: "/hiring-manager/pipeline",
  },
  {
    title: "I connect people",
    role: "Recruiter",
    description: "Facilitate matches, earn on outcomes",
    icon: Target,
    href: "/recruiter",
  },
  {
    title: "I train people",
    role: "Training Provider",
    description: "Offer programs that close candidates' gaps",
    icon: GraduationCap,
    href: "/provider",
  },
];

/**
 * 1.0 — Entry / role selector. The user picks which hat they're acting as.
 * Selecting a row routes to that role's home dashboard. One account, many roles.
 */
export default function SelectRolePage() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-background px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-6 flex flex-col items-center gap-3 text-center">
          <Wordmark href="/select-role" className="text-2xl" />
          <p className="text-muted-foreground">Who are you here as today?</p>
        </div>

        <div className="flex flex-col gap-3">
          {ROLES.map((r) => {
            const Icon = r.icon;
            return (
              <Link
                key={r.role}
                href={r.href}
                className="group flex items-center gap-4 rounded-2xl border border-border bg-card p-4 transition-colors hover:border-primary/50 hover:bg-accent/40"
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
                <ChevronRight className="size-5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
              </Link>
            );
          })}
        </div>

        <p className="mt-6 flex items-center justify-center gap-2 text-center text-sm text-muted-foreground">
          <Repeat className="size-4" />
          You can switch hats anytime — one account, many roles.
        </p>
      </div>
    </div>
  );
}
