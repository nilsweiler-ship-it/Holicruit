"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { ArrowLeftRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { PlanBadge } from "@/components/billing/plan-badge";

interface NavItem {
  title: string;
  href: string;
}

const navItems: Record<string, NavItem[]> = {
  CANDIDATE: [
    { title: "Dashboard", href: "/dashboard/candidate" },
    { title: "My Profile", href: "/dashboard/candidate/profile" },
    { title: "Matches", href: "/dashboard/candidate/matches" },
    { title: "Progress", href: "/dashboard/candidate/progress" },
    { title: "Messages", href: "/dashboard/messages" },
  ],
  HIRING_MANAGER: [
    { title: "Dashboard", href: "/dashboard/hiring-manager" },
    { title: "Roles", href: "/dashboard/hiring-manager/roles" },
    { title: "Contracts", href: "/dashboard/hiring-manager/contracts" },
    { title: "Team & Talent", href: "/dashboard/hiring-manager/team" },
    { title: "Messages", href: "/dashboard/messages" },
  ],
  HEADHUNTER: [
    { title: "Dashboard", href: "/dashboard/headhunter" },
    { title: "Browse Roles", href: "/dashboard/headhunter/roles" },
    { title: "Submissions", href: "/dashboard/headhunter/submissions" },
    { title: "Placements", href: "/dashboard/headhunter/placements" },
    { title: "Messages", href: "/dashboard/messages" },
  ],
  ADMIN: [
    { title: "Dashboard", href: "/dashboard/admin" },
    { title: "Users", href: "/dashboard/admin/users" },
    { title: "Roles", href: "/dashboard/admin/roles" },
    { title: "Pricing", href: "/dashboard/admin/pricing" },
  ],
};

export function Sidebar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [plan, setPlan] = useState<string | null>(null);

  useEffect(() => {
    if (
      session?.user?.role === "HIRING_MANAGER" ||
      session?.user?.role === "HEADHUNTER"
    ) {
      fetch("/api/billing/subscribe")
        .then((r) => r.json())
        .then((data) => {
          if (data.plan) setPlan(data.plan);
        })
        .catch(() => {});
    }
  }, [session?.user?.role]);

  if (!session?.user) return null;

  const items = navItems[session.user.role] || [];

  return (
    <>
      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="flex justify-around py-2">
          {items.slice(0, 5).map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center gap-0.5 px-2 py-1 text-[10px] font-medium transition-colors",
                  isActive ? "text-primary" : "text-muted-foreground"
                )}
              >
                <div
                  className={cn(
                    "h-1 w-5 rounded-full mb-0.5 transition-colors",
                    isActive ? "bg-primary" : "bg-transparent"
                  )}
                />
                {item.title}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-56 flex-col border-r bg-sidebar p-4">
        <div className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-3 px-3">
          {session.user.role.replace("_", " ")}
        </div>
        <nav className="flex flex-col gap-0.5 flex-1">
          {items.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )}
              >
                {item.title}
              </Link>
            );
          })}
        </nav>
        <div className="pt-4 border-t mt-4 flex flex-col gap-2">
          {session.user.role !== "ADMIN" && (
            <Link
              href="/dashboard"
              className="flex items-center gap-2 rounded-md px-3 py-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              <ArrowLeftRight className="h-3.5 w-3.5" />
              Switch hat
            </Link>
          )}
          {plan && <PlanBadge plan={plan} />}
        </div>
      </aside>
    </>
  );
}
