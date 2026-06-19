"use client";

import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { LogoMark } from "@/components/brand/logo";

interface RoleOption {
  role: string;
  label: string;
  subtitle: string;
  description: string;
  emoji: string;
  href: string;
}

const roleOptions: RoleOption[] = [
  {
    role: "CANDIDATE",
    label: "I'm looking",
    subtitle: "Candidate",
    description: "Find roles & grow my profile",
    emoji: "\u{1F464}",
    href: "/dashboard/candidate",
  },
  {
    role: "HIRING_MANAGER",
    label: "I'm hiring",
    subtitle: "Hiring Manager",
    description: "Meet candidates for my team",
    emoji: "\u{1F9D1}‍\u{1F4BC}",
    href: "/dashboard/hiring-manager",
  },
  {
    role: "HEADHUNTER",
    label: "I connect people",
    subtitle: "Recruiter",
    description: "Facilitate matches, earn on outcomes",
    emoji: "\u{1F3AF}",
    href: "/dashboard/headhunter",
  },
];

export function RoleSelector({ userRole }: { userRole: string }) {
  const router = useRouter();

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="items-center pb-2 text-center">
          <div className="flex items-center justify-center gap-3">
            <LogoMark size={40} />
            <span className="text-3xl font-extrabold tracking-tight">
              holicruit
            </span>
          </div>
          <p className="mt-3 text-base text-muted-foreground">
            Who are you here as today?
          </p>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 pt-2">
          {roleOptions.map((option) => (
            <button
              key={option.role}
              onClick={() => router.push(option.href)}
              className="group flex w-full items-center gap-4 rounded-xl border-2 bg-card p-5 text-left transition-all hover:border-foreground/80 hover:bg-primary/5 active:scale-[0.98] cursor-pointer"
            >
              <span className="text-2xl shrink-0">{option.emoji}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2">
                  <span className="text-base font-bold text-foreground">
                    {option.label}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    &mdash; {option.subtitle}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {option.description}
                </p>
              </div>
              <span className="text-muted-foreground/50 group-hover:text-foreground transition-colors">
                &rsaquo;
              </span>
            </button>
          ))}
        </CardContent>
        <CardFooter className="justify-center pt-1 pb-6">
          <p className="text-xs text-muted-foreground text-center">
            You can switch hats anytime &mdash; one account, many roles
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
