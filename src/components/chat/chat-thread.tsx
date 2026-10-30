"use client";

import { useMemo, useState, useTransition } from "react";
import { CalendarCheck, CalendarClock, CalendarPlus, Check, Send } from "lucide-react";
import { toast } from "sonner";
import type { ChatMessage, Person, ScheduledInterview } from "@/lib/types";
import type { PendingProposal } from "@/lib/services/thread";
import { acceptInterview, proposeInterview, sendMessage } from "@/lib/actions/match";
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
 * on-platform scheduling (propose a real slot + medium, the other side accepts,
 * add to calendar). Keeping this here is the anti-bypass: the whole loop stays
 * in-app.
 *
 * Identity: the server decides who sent what. Messages arrive as
 * `fromId: "me" | "them"`, and the actions never take a sender name.
 */
export function ChatThread({
  matchId,
  me,
  them,
  initialMessages,
  initialInterview,
  initialProposal,
  initialDraft = "",
}: {
  matchId: string;
  me: Person;
  them: Person;
  initialMessages: ChatMessage[];
  initialInterview?: ScheduledInterview;
  /** Latest unanswered proposal (from the server), if any. */
  initialProposal?: PendingProposal;
  /** Prefilled, unsent text for the composer (e.g. a suggested opener). */
  initialDraft?: string;
}) {
  const slots = useMemo(() => genSlots(), []);
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [draft, setDraft] = useState(initialDraft);
  const [counter, setCounter] = useState(1);
  const [interview, setInterview] = useState<ScheduledInterview | undefined>(initialInterview);
  const [medium, setMedium] = useState<string>("video");
  const [customWhen, setCustomWhen] = useState("");
  /** The open proposal and who made it. Only the non-proposer can accept. */
  const [pending, setPending] = useState<PendingProposal | null>(initialProposal ?? null);
  const [busy, startTransition] = useTransition();

  const nextId = () => {
    const id = `local-${counter}`;
    setCounter((c) => c + 1);
    return id;
  };

  function send() {
    const text = draft.trim();
    if (!text) return;
    const localId = nextId();
    setMessages((prev) => [...prev, { id: localId, fromId: "me", text, ts: "now" }]);
    setDraft("");
    startTransition(async () => {
      try {
        await sendMessage(matchId, text);
      } catch {
        setMessages((prev) => prev.filter((m) => m.id !== localId));
        setDraft(text);
        toast.error("Message not sent — please try again.");
      }
    });
  }

  function propose(slot: Slot, med: string) {
    const text = `Proposed: ${slot.label} · ${med}`;
    const localId = nextId();
    const prevPending = pending;
    setMessages((prev) => [...prev, { id: localId, fromId: "me", text, ts: "now" }]);
    setPending({ label: slot.label, iso: slot.iso, medium: med, mine: true });
    startTransition(async () => {
      try {
        await proposeInterview(matchId, slot, med);
      } catch {
        setMessages((prev) => prev.filter((m) => m.id !== localId));
        setPending(prevPending);
        toast.error("Couldn't send the proposal — please try again.");
      }
    });
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

  function accept() {
    if (!pending || pending.mine) return;
    startTransition(async () => {
      try {
        const booked = await acceptInterview(matchId);
        setInterview({ when: booked.when, whenAt: booked.whenAt, medium: booked.medium, scoreSheetAttached: false });
        setPending(null);
        setMessages((prev) => [
          ...prev,
          { id: nextId(), fromId: "me", text: `Accepted: ${booked.when} · ${booked.medium}`, ts: "now" },
        ]);
        toast(`Interview scheduled — ${booked.when} · ${booked.medium}.`);
      } catch {
        toast.error("Couldn't accept — the proposal may have changed. Reload and try again.");
      }
    });
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
        {messages.length === 0 && (
          <p className="rounded-2xl border border-dashed border-border px-4 py-6 text-center text-sm text-muted-foreground">
            No messages yet — say hello to {them.name}.
          </p>
        )}
        {messages.map((msg) => {
          const outgoing = msg.fromId === "me";
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

      {interview && !pending ? (
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
            {/* Score sheets are the hiring manager's tool (manager-only action). */}
            {me.id === "manager" && <ScoreSheetButton matchId={matchId} />}
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
                {pending.mine ? "You proposed" : `${them.name} proposed`}{" "}
                <span className="font-medium text-foreground">{pending.label}</span> · {pending.medium}
                {pending.mine ? " — waiting for them to accept." : ""}
              </span>
              {!pending.mine && (
                <Button size="sm" onClick={accept} disabled={busy}>
                  <Check className="size-4" />
                  Accept
                </Button>
              )}
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
          placeholder={`Message ${them.name}…`}
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
