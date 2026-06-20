"use client";

import { useState } from "react";
import { CalendarCheck, CalendarClock, Check, Send } from "lucide-react";
import { toast } from "sonner";
import type { ChatMessage, Person, ScheduledInterview } from "@/lib/types";
import { PersonAvatar } from "@/components/people/person-avatar";
import { ScoreSheetButton } from "@/components/pipeline/score-sheet-button";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/** Preset slots offered by the inline "Propose a time" control. */
const SLOTS = ["Tomorrow · 10:00", "Thu · 14:00", "Fri · 09:30"];

/**
 * Interactive direct chat between two experts. All state is local/mocked: sends
 * append outgoing bubbles, proposing a slot posts a proposal the other side can
 * accept, and accepting locks in the scheduled-interview panel.
 */
export function ChatThread({
  me,
  them,
  initialMessages,
  initialInterview,
}: {
  me: Person;
  them: Person;
  initialMessages: ChatMessage[];
  initialInterview?: ScheduledInterview;
}) {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [draft, setDraft] = useState("");
  const [counter, setCounter] = useState(1);
  const [interview, setInterview] = useState<ScheduledInterview | undefined>(initialInterview);
  /** A slot the viewer proposed that the other side can still accept. */
  const [pendingSlot, setPendingSlot] = useState<string | null>(null);

  const nextId = () => {
    const id = `local-${counter}`;
    setCounter((c) => c + 1);
    return id;
  };

  function send() {
    const text = draft.trim();
    if (!text) return;
    setMessages((prev) => [...prev, { id: nextId(), fromId: me.id, text, ts: "now" }]);
    setDraft("");
  }

  function propose(slot: string) {
    setMessages((prev) => [
      ...prev,
      { id: nextId(), fromId: me.id, text: `Proposed: ${slot} · video`, ts: "now" },
    ]);
    setPendingSlot(slot);
  }

  function accept(slot: string) {
    setInterview({ when: slot, medium: "video", scoreSheetAttached: false });
    setPendingSlot(null);
    setMessages((prev) => [
      ...prev,
      { id: nextId(), fromId: them.id, text: `Accepted: ${slot} · video`, ts: "now" },
    ]);
    toast(`Interview scheduled — ${slot} · video.`);
  }

  return (
    <div className="flex flex-col gap-6">
      <header className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4">
        <PersonAvatar person={me} size={36} />
        <PersonAvatar person={them} size={36} className="-ml-4" />
        <div className="min-w-0">
          <p className="text-sm font-semibold text-foreground">
            You ({me.name}) ↔ {them.name}
          </p>
          <p className="text-xs text-muted-foreground">Direct line — no recruiter relay</p>
        </div>
      </header>

      <div className="flex max-h-[28rem] flex-col gap-3 overflow-y-auto pr-1">
        {messages.map((msg) => {
          const outgoing = msg.fromId === me.id;
          return (
            <div
              key={msg.id}
              className={cn("flex flex-col gap-1", outgoing ? "items-end" : "items-start")}
            >
              <div
                className={cn(
                  "max-w-[78%] rounded-2xl px-4 py-2.5 text-sm",
                  outgoing ? "bg-primary text-primary-foreground" : "bg-muted text-foreground",
                )}
              >
                {msg.text}
              </div>
              <span className="px-1 text-xs text-muted-foreground">{msg.ts}</span>
            </div>
          );
        })}
      </div>

      {interview ? (
        <div className="flex flex-col gap-3 rounded-2xl border border-primary/30 bg-primary/8 p-5">
          <div className="flex items-center gap-2">
            <CalendarCheck className="size-5 text-primary" />
            <h2 className="text-sm font-semibold text-foreground">Interview scheduled</h2>
          </div>
          <p className="text-sm text-muted-foreground">
            {interview.when} · {interview.medium} — no back-and-forth, no scheduler email chain.
          </p>
          <div>
            <ScoreSheetButton />
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4">
          <div className="flex items-center gap-2 text-sm font-medium text-foreground">
            <CalendarClock className="size-4 text-primary" />
            Propose a time
          </div>
          <div className="flex flex-wrap gap-2">
            {SLOTS.map((slot) => (
              <Button
                key={slot}
                variant="outline"
                size="sm"
                onClick={() => propose(slot)}
              >
                {slot}
              </Button>
            ))}
          </div>
          {pendingSlot && (
            <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-accent px-3 py-2">
              <span className="text-sm text-muted-foreground">
                You proposed <span className="font-medium text-foreground">{pendingSlot}</span> · video
              </span>
              <Button size="sm" onClick={() => accept(pendingSlot)}>
                <Check className="size-4" />
                Accept ({them.name.split(" ")[0]})
              </Button>
            </div>
          )}
        </div>
      )}

      <form
        className="flex items-center gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          send();
        }}
      >
        <input
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder={`Message ${them.name.split(" ")[0]}…`}
          className="h-10 flex-1 rounded-2xl border border-border bg-card px-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
        />
        <Button type="submit" disabled={!draft.trim()}>
          <Send className="size-4" />
          Send
        </Button>
      </form>
    </div>
  );
}
