"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export interface SubNavItem {
  label: string;
  href: string;
}

/**
 * A slim, role-scoped tab bar. Highlights the item whose href best matches the
 * current path.
 */
export function SubNav({ items }: { items: SubNavItem[] }) {
  const pathname = usePathname();
  const activeHref = [...items]
    .sort((a, b) => b.href.length - a.href.length)
    .find((i) => pathname === i.href || pathname.startsWith(`${i.href}/`))?.href;

  return (
    <nav className="flex items-center gap-1 overflow-x-auto border-b border-border">
      {items.map((item) => {
        const active = item.href === activeHref;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "-mb-px whitespace-nowrap border-b-2 px-3 py-2 text-sm font-medium transition-colors",
              active
                ? "border-primary text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground",
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
