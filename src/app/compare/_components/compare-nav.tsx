"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const links = [
  { href: "/compare", label: "Overview" },
  { href: "/compare/hiring-managers", label: "Hiring Managers" },
  { href: "/compare/headhunters", label: "Headhunters" },
  { href: "/compare/candidates", label: "Candidates" },
];

export function CompareNav() {
  const pathname = usePathname();

  return (
    <nav className="border-b bg-muted/30">
      <div className="mx-auto max-w-5xl px-4 flex gap-6 h-10 items-center text-sm overflow-x-auto">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "whitespace-nowrap text-muted-foreground hover:text-foreground transition-colors",
              pathname === link.href && "text-foreground font-medium"
            )}
          >
            {link.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
