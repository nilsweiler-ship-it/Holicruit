"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Briefcase, ChevronDown, GraduationCap, Repeat, Target, User } from "lucide-react";
import type { RoleHat } from "@/lib/types";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const HATS: { hat: RoleHat; label: string; href: string; icon: React.ElementType }[] = [
  { hat: "candidate", label: "Candidate", href: "/candidate/matches", icon: User },
  { hat: "hiring_manager", label: "Hiring Manager", href: "/hiring-manager/pipeline", icon: Briefcase },
  { hat: "recruiter", label: "Recruiter", href: "/recruiter", icon: Target },
  { hat: "provider", label: "Training Provider", href: "/provider", icon: GraduationCap },
];

function hatFromPath(pathname: string): RoleHat {
  if (pathname.startsWith("/hiring-manager")) return "hiring_manager";
  if (pathname.startsWith("/recruiter")) return "recruiter";
  if (pathname.startsWith("/provider")) return "provider";
  return "candidate";
}

/**
 * Persistent control to change the active "hat" — one account, many roles.
 * Re-routes to that role's home dashboard; "Switch hats…" re-opens the full
 * role selector (1.0).
 */
export function HatSwitcher() {
  const pathname = usePathname();
  const router = useRouter();
  const current = HATS.find((h) => h.hat === hatFromPath(pathname)) ?? HATS[0];
  const Icon = current.icon;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-sm font-medium transition-colors hover:bg-accent">
        <Icon className="size-4 text-primary" />
        <span>{current.label}</span>
        <ChevronDown className="size-3.5 text-muted-foreground" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="text-xs text-muted-foreground">
          Acting as
        </DropdownMenuLabel>
        {HATS.map((h) => {
          const HIcon = h.icon;
          return (
            <DropdownMenuItem key={h.hat} asChild>
              <Link href={h.href} className="cursor-pointer gap-2">
                <HIcon className="size-4" />
                {h.label}
                {h.hat === current.hat && (
                  <span className="ml-auto text-xs text-primary">active</span>
                )}
              </Link>
            </DropdownMenuItem>
          );
        })}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => router.push("/select-role")} className="cursor-pointer gap-2">
          <Repeat className="size-4" />
          Switch hats…
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
