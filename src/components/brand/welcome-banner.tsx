"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Sparkles, X } from "lucide-react";

/**
 * First-visit welcome for trial users. Explains this is a live demo and points
 * to the one-click accounts. Dismissible; stays hidden after that.
 */
export function WelcomeBanner() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    let dismissed = false;
    try {
      dismissed = localStorage.getItem("holicruit-welcome") === "1";
    } catch {
      /* ignore */
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time hydration read
    setShow(!dismissed);
  }, []);

  function dismiss() {
    setShow(false);
    try {
      localStorage.setItem("holicruit-welcome", "1");
    } catch {
      /* ignore */
    }
  }

  if (!show) return null;

  return (
    <div className="border-b border-primary/20 bg-primary/8">
      <div className="mx-auto flex w-full max-w-6xl items-center gap-3 px-4 py-2.5 sm:px-6">
        <Sparkles className="hidden size-4 shrink-0 text-primary sm:block" />
        <p className="flex-1 text-sm text-foreground">
          <span className="font-semibold">Welcome — this is a live demo.</span>{" "}
          <span className="text-muted-foreground">
            Jump straight in with a ready-made account (no signup):
          </span>{" "}
          <Link href="/login" className="font-medium text-primary hover:underline">
            explore the demo →
          </Link>
        </p>
        <button
          type="button"
          onClick={dismiss}
          aria-label="Dismiss"
          className="rounded-lg p-1 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        >
          <X className="size-4" />
        </button>
      </div>
    </div>
  );
}
