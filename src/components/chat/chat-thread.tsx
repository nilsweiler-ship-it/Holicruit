"use client";

import { useMemo, useState, useTransition } from "react";
import { CalendarCheck, CalendarClock, CalendarPlus, Check, Send } from "lucide-react";
import { toast } from "sonner";
import type { ChatMessage, Person, ScheduledInterview } from "@/lib/types";
import { sendMessage, scheduleInterview } from "@/lib/actions/match";
import { PersonAvatar } from "@/components/people/person-avatar";
import { ScoreSheetButton } from "@/components/pipeline/score-sheet-button";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Slot = { label: string; iso: string };
const MEDIA = ["video", "phone", "onsite"] as const;

/** A few concrete upcoming slots (real datetimes, so they export to calendar). */
function genSlots(): Slot[] {
  const base = new Date();
  base.setSeconds(0, 0);
  const plan: [number, number, number][] = [
    [1, 10, 0],
    [2, 14, 0],
    [3, 9, 30],
  ];
  return plan.map(([d, h, m]) => {
    const dt = new Date(base);
    dt.setDate(dt.getDate() + d);
    dt.setHours(h, m, 0, 0);
    const label =
      dt.toLocaleDateString(undefined, { weekday: "short", day: "numeric", month: "short" }) +
      " · " +
      dt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    return { label, iso: dt.toISOString() };
  });
}

function icsFor(title: string, iso: string | undefined, medium: string): string {
  const fmt = (d: Date) => d.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
  const start = iso ? new Date(iso) : new Date();
  const end = new Date(start.getTime() + 45 * 60000);
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Holicruit//Scheduling//EN",
    "BEGIN:VEVENT",
    `UID:${Date.now()}@holicruit`,
    `DTSTAMP:${fmt(new Date())}`,
    `DTSTART:${fmt(start)}`,
    `DTEND:${fmt(end)}`,
    `SUMMARY:${title}`,
    `DESCRIPTION:Interview scheduled via Holicruit (${medium}).`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
}

function downloadIcs(filename: string, content: string) {
  const blob = new Blob([content], { type: "text/calendar" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * Interactive direct chat between two experts, persisted to the DB — including
 * on-platform scheduling (propose a real slot + medium, accept, add to
 * calendar). Keeping this here is the anti-bypass: the whole loop stays in-app.
 */
export function ChatThread({
  matchId,
  me,
  them,
  initialMessages,
  initialInterview,
}: {
  matchId: string;
  me: Person;
  them: Person;
  initialMessages: ChatMessage[];
  initialInterview?: ScheduledInterview;
}) {
  const slots = useMemo(() => genSlots(), []);
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [draft, setDraft] = useState("");
  const [counter, setCounter] = useState(1);
  const [interview, setInterview] = useState<ScheduledInterview | undefined>(initialInterview);
  const [medium, setMedium] = useState<string>("video");
  const [customWhen, setCustomWhen] = useState("");
  /** A slot the viewer proposed that the other side can still accept. */
  const [pending, setPending] = useState<{ slot: Slot; medium: string } | null>(null);
  const [, startTransition] = useTransition();

  const nextId = () => {
    const id = `local-${counter}`;
    setCounter((c) => c + 1);
    return id;
  };

  function persistMessage(fromName: string, text: string) {
    startTransition(() => {
      void sendMessage(matchId, fromName, text);
    });
  }

  function send() {
    const text = draft.trim();
    if (!text) return;
    setMessages((prev) => [...prev, { id: nextId(), fromId: me.id, text, ts: "now" }]);
    setDraft("");
    persistMessage(me.name, text);
  }

  function propose(slot: Slot, med: string) {
    const text = `Proposed: ${slot.label} · ${med}`;
    setMessages((prev) => [...prev, { id: nextId(), fromId: me.id, text, ts: "now" }]);
    setPending({ slot, medium: med });
    persistMessage(me.name, text);
  }

  function proposeCustom() {
    if (!customWhen) return;
    const dt = new Date(customWhen);
    if (Number.isNaN(dt.getTime())) return;
    const label =
      dt.toLocaleDateString(undefined, { weekday: "short", day: "numeric", month: "short" }) +
      " · " +
      dt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    propose({ label, iso: dt.toISOString() }, medium);
    setCustomWhen("");
  }

  function accept(p: { slot: Slot; medium: string }) {
    setInterview({ when: p.slot.label, whenAt: p.slot.iso, medium: p.medium, scoreSheetAttached: false });
    setPending(null);
    const text = `Accepted: ${p.slot.label} · ${p.medium}`;
    setMessages((prev) => [...prev, { id: nextId(), fromId: them.id, text, ts: "now" }]);
    persistMessage(them.name, text);
    startTransition(() => {
      void scheduleInterview(matchId, p.slot.label, p.medium, p.slot.iso);
    });
    toast(`Interview scheduled — ${p.slot.label} · ${p.medium}.`);
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
            {interview.when} · {interview.medium} — booked here, no scheduler email chain.
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                downloadIcs(
                  "holicruit-interview.ics",
                  icsFor(`Interview · ${them.name}`, interview.whenAt, interview.medium),
                )
              }
            >
              <CalendarPlus className="size-4" />
              Add to calendar
            </Button>
            <ScoreSheetButton matchId={matchId} />
            <button
              type="button"
              onClick={() => setInterview(undefined)}
              className="text-xs font-medium text-muted-foreground hover:text-foreground"
            >
              Reschedule
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-sm font-medium text-foreground">
              <CalendarClock className="size-4 text-primary" />
              Propose a time
            </div>
            <label className="flex items-center gap-1.5 text-xs text-muted-foreground">
              Medium
              <select
                value={medium}
                onChange={(e) => setMedium(e.target.value)}
                className="rounded-lg border border-border bg-background px-2 py-1 text-xs text-foreground outline-none focus:ring-2 focus:ring-primary/30"
              >
                {MEDIA.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <div className="flex flex-wrap gap-2">
            {slots.map((slot) => (
              <Button key={slot.iso} variant="outline" size="sm" onClick={() => propose(slot, medium)}>
                {slot.label}
              </Button>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <input
              type="datetime-local"
              value={customWhen}
              onChange={(e) => setCustomWhen(e.target.value)}
              className="rounded-lg border border-border bg-background px-2 py-1.5 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/30"
            />
            <Button variant="ghost" size="sm" onClick={proposeCustom} disabled={!customWhen}>
              Propose custom
            </Button>
          </div>
          {pending && (
            <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-accent px-3 py-2">
              <span className="text-sm text-muted-foreground">
                You proposed{" "}
                <span className="font-medium text-foreground">{pending.slot.label}</span> ·{" "}
                {pending.medium}
              </span>
              <Button size="sm" onClick={() => accept(pending)}>
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
