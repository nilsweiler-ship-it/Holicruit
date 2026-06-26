"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { ArrowRight, Bookmark, BookmarkCheck, Check, MessageCircle, Radio } from "lucide-react";
import { toast } from "sonner";
import type { Person } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { requestIntro, saveMatch } from "@/lib/actions/match";

/**
 * The emphasized "Direct line" panel (2.3). Names the actual hiring manager —
 * the person the candidate would work with, no recruiter relay. "Request intro"
 * opens a request the manager can accept (→ a direct chat thread); "Save"
 * bookmarks the match. Both are mocked here.
 */
export function DirectLinePanel({
  manager,
  matchId,
  initiallySaved = false,
}: {
  manager: Person;
  matchId: string;
  initiallySaved?: boolean;
}) {
  const [requested, setRequested] = useState(false);
  const [saved, setSaved] = useState(initiallySaved);
  const [, startTransition] = useTransition();

  const firstName = manager.name.split(" ")[0];

  return (
    <section className="flex flex-col gap-4 rounded-2xl border border-primary/30 bg-primary/8 p-5">
      <div className="flex items-start gap-3">
        <Radio className="mt-0.5 size-5 shrink-0 text-primary" />
        <div className="flex flex-col gap-1">
          <h2 className="font-semibold text-foreground">Direct line to the hiring manager</h2>
          <p className="text-sm text-muted-foreground">
            You&apos;ll talk to <span className="font-medium text-foreground">{firstName}</span>,{" "}
            {manager.headline.split(",")[0]} — the person you&apos;d actually work with. No recruiter
            relay.
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Button
          disabled={requested}
          onClick={() => {
            setRequested(true);
            startTransition(() => requestIntro(matchId));
            toast.success(`Intro requested — ${firstName} will be notified.`);
          }}
        >
          {requested ? (
            <>
              <Check className="size-4" />
              Intro requested
            </>
          ) : (
            <>
              Request intro
              <ArrowRight className="size-4" />
            </>
          )}
        </Button>
        <Button
          variant="outline"
          onClick={() => {
            const nextSaved = !saved;
            setSaved(nextSaved);
            startTransition(() => saveMatch(matchId, nextSaved));
            toast(saved ? "Removed from saved" : "Saved");
          }}
        >
          {saved ? <BookmarkCheck className="size-4" /> : <Bookmark className="size-4" />}
          {saved ? "Saved" : "Save"}
        </Button>
        {requested && (
          <Button asChild variant="secondary">
            <Link href={`/candidate/chat/${matchId}`}>
              <MessageCircle className="size-4" />
              Open direct chat
            </Link>
          </Button>
        )}
      </div>
    </section>
  );
}
