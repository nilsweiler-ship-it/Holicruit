"use client";

import { useRouter } from "next/navigation";
import { User, Briefcase, Target } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";

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
    <div className="flex min-h-[60vh] items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader className="items-center text-center">
          <div className="text-2xl font-bold tracking-tight text-primary">
            holicruit
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            Who are you here as today?
          </p>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {roleOptions.map((option) => {
            const isActive = option.role === userRole;
            const Icon = option.icon;

            return (
              <button
                key={option.role}
                disabled={!isActive}
                onClick={() => router.push(option.href)}
                className={cn(
                  "flex w-full items-center gap-4 rounded-lg border p-4 text-left transition-colors",
                  isActive
                    ? "border-primary/30 bg-primary/5 hover:bg-primary/10 cursor-pointer"
                    : "border-muted bg-muted/30 opacity-50 cursor-not-allowed"
                )}
              >
                <div
                  className={cn(
                    "flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        "text-sm font-semibold",
                        isActive ? "text-foreground" : "text-muted-foreground"
                      )}
                    >
                      {option.label}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      &mdash; {option.subtitle}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {option.description}
                  </p>
                </div>
                {!isActive && (
                  <span className="shrink-0 rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                    Soon
                  </span>
                )}
              </button>
            );
          })}
        </CardContent>
        <CardFooter className="justify-center">
          <p className="text-xs text-muted-foreground text-center">
            You can switch hats anytime &mdash; one account, many roles
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
