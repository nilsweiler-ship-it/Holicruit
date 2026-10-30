"use client";

import { useEffect } from "react";
import Link from "next/link";
import { RefreshCw, TriangleAlert } from "lucide-react";
import { Wordmark } from "@/components/brand/wordmark";
import { Button } from "@/components/ui/button";

/**
 * Branded error boundary for every route below the root layout. Shows a calm
 * message and a retry — never the raw error text, which can carry internals.
 */
export default function ErrorPage({
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
    <div className="flex min-h-[60dvh] items-center justify-center bg-background px-4 py-10">
      <div className="flex w-full max-w-md flex-col gap-6">
        <Wordmark href="/" />
        <div role="alert" className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-6">
          <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <TriangleAlert className="size-5" aria-hidden />
          </span>
          <div className="flex flex-col gap-1">
            <h1 className="font-serif text-3xl tracking-tight text-foreground">
              Something went wrong on our side
            </h1>
            <p className="text-sm text-muted-foreground">
              Nothing you did — and nothing was lost. Try again, or head back home and pick up where
              you left off.
            </p>
            {error.digest && (
              <p className="text-xs text-muted-foreground">Reference: {error.digest}</p>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => reset()}>
              <RefreshCw className="size-4" aria-hidden />
              Try again
            </Button>
            <Button asChild variant="outline">
              <Link href="/select-role">Back to your home</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
