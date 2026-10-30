"use client";

import { useEffect } from "react";
import "./globals.css";

/**
 * Last-resort boundary for failures in the root layout itself. It replaces the
 * whole document, so it renders its own <html>/<body> and avoids app components
 * (providers, fonts) that might be what failed.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <body className="antialiased">
        <main className="flex min-h-dvh items-center justify-center bg-background px-4 py-10 text-foreground">
          <div role="alert" className="flex w-full max-w-md flex-col gap-4 rounded-2xl border border-border bg-card p-6">
            <p className="font-serif text-2xl lowercase tracking-tight">holicruit</p>
            <h1 className="font-serif text-3xl tracking-tight">We hit a snag loading Holicruit</h1>
            <p className="text-sm text-muted-foreground">
              Nothing was lost. Please try again in a moment.
            </p>
            {error.digest && (
              <p className="text-xs text-muted-foreground">Reference: {error.digest}</p>
            )}
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => reset()}
                className="inline-flex h-9 items-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground"
              >
                Try again
              </button>
              {/* Plain <a>: a full reload is the point when the root layout failed. */}
              {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
              <a
                href="/"
                className="inline-flex h-9 items-center rounded-lg border border-border px-4 text-sm font-medium"
              >
                Back to home
              </a>
            </div>
          </div>
        </main>
      </body>
    </html>
  );
}
