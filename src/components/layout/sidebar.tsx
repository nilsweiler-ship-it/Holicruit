"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
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
  ],
  HIRING_MANAGER: [
    { title: "Dashboard", href: "/dashboard/hiring-manager" },
    { title: "Roles", href: "/dashboard/hiring-manager/roles" },
    { title: "Billing", href: "/dashboard/hiring-manager/billing" },
  ],
  HEADHUNTER: [
    { title: "Dashboard", href: "/dashboard/headhunter" },
    { title: "Browse Roles", href: "/dashboard/headhunter/roles" },
    { title: "Submissions", href: "/dashboard/headhunter/submissions" },
    { title: "Billing", href: "/dashboard/headhunter/billing" },
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
    <aside className="hidden md:flex w-56 flex-col border-r bg-muted/40 p-4">
      <nav className="flex flex-col gap-1 flex-1">
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
              pathname === item.href
                ? "bg-accent text-accent-foreground"
                : "text-muted-foreground"
            )}
          >
            {item.title}
          </Link>
        ))}
      </nav>
      {plan && (
        <div className="pt-4 border-t mt-4">
          <PlanBadge plan={plan} />
        </div>
      )}
    </aside>
  );
}
