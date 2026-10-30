import type { Metadata } from "next";
import Link from "next/link";
import { Compass } from "lucide-react";
import { Wordmark } from "@/components/brand/wordmark";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "Page not available · Holicruit" };

/**
 * Branded 404. Also what people see when they open a match, role or report that
 * isn't theirs — deliberately the same page, so we never confirm that someone
 * else's record exists.
 */
export default function NotFound() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-background px-4 py-10">
      <div className="flex w-full max-w-md flex-col gap-6">
        <Wordmark href="/" />
        <div className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-6">
          <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Compass className="size-5" aria-hidden />
          </span>
          <div className="flex flex-col gap-1">
            <h1 className="font-serif text-3xl tracking-tight text-foreground">
              Nothing to see here
            </h1>
            <p className="text-sm text-muted-foreground">
              This page doesn&apos;t exist, has moved, or isn&apos;t shared with your account. If
              someone sent you a link, check you&apos;re signed in with the right account.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button asChild>
              <Link href="/select-role">Back to your home</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/">Holicruit homepage</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
