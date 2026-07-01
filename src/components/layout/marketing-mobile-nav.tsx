"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";

/**
 * Compact mobile menu for the marketing header. Shows below the `md` breakpoint,
 * where the inline nav links are hidden.
 */
export function MarketingMobileNav() {
  const [open, setOpen] = useState(false);

  return (
    <div className="md:hidden">
      <button
        type="button"
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="flex size-9 items-center justify-center rounded-lg border border-border bg-card text-foreground transition-colors hover:bg-accent"
      >
        {open ? <X className="size-5" /> : <Menu className="size-5" />}
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 top-16 z-30 bg-foreground/20"
            onClick={() => setOpen(false)}
          />
          <nav className="absolute left-0 right-0 top-16 z-40 border-b border-border bg-background p-4 shadow-sm">
            <ul className="flex flex-col gap-1 text-sm font-medium">
              <li>
                <Link
                  href="/#how"
                  onClick={() => setOpen(false)}
                  className="block rounded-lg px-3 py-2 text-foreground transition-colors hover:bg-accent"
                >
                  How it works
                </Link>
              </li>
              <li>
                <Link
                  href="/pricing"
                  onClick={() => setOpen(false)}
                  className="block rounded-lg px-3 py-2 text-foreground transition-colors hover:bg-accent"
                >
                  Pricing
                </Link>
              </li>
            </ul>
          </nav>
        </>
      )}
    </div>
  );
}
