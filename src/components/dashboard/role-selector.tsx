"use client";

import { useRouter } from "next/navigation";
import { User, Briefcase, Target, ChevronRight } from "lucide-react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";

interface RoleOption {
  role: string;
  label: string;
  subtitle: string;
  description: string;
  icon: React.ElementType;
  href: string;
}

const roleOptions: RoleOption[] = [
  {
    role: "CANDIDATE",
    label: "I'm looking",
    subtitle: "Candidate",
    description: "Find roles & grow my profile",
    icon: User,
    href: "/dashboard/candidate",
  },
  {
    role: "HIRING_MANAGER",
    label: "I'm hiring",
    subtitle: "Hiring Manager",
    description: "Meet candidates for my team",
    icon: Briefcase,
    href: "/dashboard/hiring-manager",
  },
  {
    role: "HEADHUNTER",
    label: "I connect people",
    subtitle: "Recruiter",
    description: "Facilitate matches, earn on outcomes",
    icon: Target,
    href: "/dashboard/headhunter",
  },
];

export function RoleSelector({ userRole }: { userRole: string }) {
  const router = useRouter();

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="items-center pb-2 text-center">
          <div className="text-3xl font-extrabold tracking-tight text-primary">
            holicruit
          </div>
          <p className="mt-3 text-base text-muted-foreground">
            Who are you here as today?
          </p>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 pt-2">
          {roleOptions.map((option) => {
            const Icon = option.icon;

            return (
              <button
                key={option.role}
                onClick={() => router.push(option.href)}
                className="group flex w-full items-center gap-4 rounded-xl border-2 border-border bg-card p-5 text-left transition-all hover:border-primary/40 hover:bg-primary/5 hover:shadow-sm active:scale-[0.98] cursor-pointer"
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary/15">
                  <Icon className="h-5 w-5" />
                </div>
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
                <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground/50 transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
              </button>
            );
          })}
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
