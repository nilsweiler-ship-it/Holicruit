"use client";

import { useState, useTransition } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { MessageSquarePlus, X, Check, Smile, Meh, Frown, Loader2, Send } from "lucide-react";
import { submitProductFeedback } from "@/lib/actions/feedback";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

const SENTIMENTS = [
  { id: "great", label: "Love it", Icon: Smile },
  { id: "ok", label: "It's OK", Icon: Meh },
  { id: "bad", label: "Needs work", Icon: Frown },
] as const;

/**
 * Always-available, low-barrier feedback. A floating button opens a small panel
 * that leads with our pledge, then asks for a one-tap reaction and an optional
 * note. Every submission lands in the in-app feedback inbox.
 */
export function FeedbackWidget() {
  const [open, setOpen] = useState(false);
  const [sentiment, setSentiment] = useState<string | null>(null);
  const [text, setText] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSending, startSending] = useTransition();
  const pathname = usePathname();

  const canSend = Boolean(sentiment) || text.trim().length > 0;

  function reset() {
    setSentiment(null);
    setText("");
    setSent(false);
    setError(null);
  }

  function close() {
    setOpen(false);
    // Let the panel finish closing before clearing, so it doesn't flash.
    setTimeout(reset, 200);
  }

  function send() {
    if (!canSend || isSending) return;
    setError(null);
    startSending(async () => {
      const res = await submitProductFeedback({
        message: text,
        sentiment: sentiment ?? undefined,
        path: pathname,
      });
      if (res.ok) setSent(true);
      else setError(res.error);
    });
  }

  return (
    <>
      {/* Launcher */}
      <button
        type="button"
        onClick={() => (open ? close() : setOpen(true))}
        aria-label="Share feedback"
        className="fixed bottom-5 right-5 z-40 inline-flex items-center gap-2 rounded-full bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-transform hover:scale-[1.03] active:scale-95"
      >
        {open ? <X className="size-5" /> : <MessageSquarePlus className="size-5" />}
        <span className="hidden sm:inline">{open ? "Close" : "Feedback"}</span>
      </button>

      {open && (
        <>
          {/* Click-away layer (transparent — this stays low-barrier, not a modal) */}
          <div className="fixed inset-0 z-30" onClick={close} aria-hidden />

          <div
            role="dialog"
            aria-label="Share feedback"
            className="fixed bottom-20 right-5 z-40 flex w-[calc(100vw-2.5rem)] max-w-sm flex-col gap-4 rounded-2xl border border-border bg-card p-5 shadow-2xl"
          >
            {sent ? (
              <div className="flex flex-col items-center gap-3 py-4 text-center">
                <span className="flex size-11 items-center justify-center rounded-full bg-success/15 text-success">
                  <Check className="size-6" />
                </span>
                <div>
                  <h2 className="font-serif text-2xl tracking-tight">Thank you</h2>
                  <p className="text-sm text-muted-foreground">
                    That goes straight to the team. It genuinely shapes what we build next.
                  </p>
                </div>
                <Button variant="outline" size="sm" onClick={close}>
                  Done
                </Button>
              </div>
            ) : (
              <>
                <div className="flex flex-col gap-1">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-primary">
                    Our pledge
                  </p>
                  <h2 className="font-serif text-xl leading-snug tracking-tight text-foreground">
                    We&apos;re building the best hiring tool there is — openly, and with you.
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    A bug, a rough edge, an idea — anything. It all helps.
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {SENTIMENTS.map(({ id, label, Icon }) => {
                    const active = sentiment === id;
                    return (
                      <button
                        key={id}
                        type="button"
                        onClick={() => setSentiment(active ? null : id)}
                        aria-pressed={active}
                        className={cn(
                          "flex flex-col items-center gap-1.5 rounded-xl border border-border bg-background px-2 py-3 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent",
                          active && "border-primary bg-primary/8 text-foreground",
                        )}
                      >
                        <Icon className={cn("size-6", active && "text-primary")} />
                        {label}
                      </button>
                    );
                  })}
                </div>

                <Textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  rows={3}
                  placeholder="Tell us more (optional)…"
                  className="resize-none"
                />

                {error && <p className="text-sm text-primary">{error}</p>}

                <div className="flex items-center justify-between gap-3">
                  <Link
                    href="/feedback"
                    onClick={close}
                    className="text-xs text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
                  >
                    See feedback
                  </Link>
                  <Button onClick={send} disabled={!canSend || isSending} size="sm">
                    {isSending ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <Send className="size-4" />
                    )}
                    Send
                  </Button>
                </div>
              </>
            )}
          </div>
        </>
      )}
    </>
  );
}
