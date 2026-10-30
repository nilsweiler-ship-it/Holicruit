/**
 * Direct-chat threads, DB-backed.
 *
 * Identity rules (the alias / confidential-role promise depends on these):
 * - A message's author is `fromUserId`, always taken from the session on the
 *   server — never from the client.
 * - `fromName` is only a display label frozen at send time, and it is the
 *   sender's identity *as the counterparty sees it* (alias / "Hiring team" when
 *   masked). It is never used to decide who sent what.
 * - The client only ever gets `fromId: "me" | "them"` — no user ids, no stored
 *   names, no emails of the other side.
 */
import type { ChatMessage, Person, ScheduledInterview } from "../types";
import { prisma } from "../db";
import { personIdentity, employerIdentity } from "../identity";

export type ChatSide = "candidate" | "manager";

export interface PendingProposal {
  /** Display label of the proposed slot, e.g. "Tue 3 Nov · 10:00". */
  label: string;
  /** ISO start time, when the slot was concrete. */
  iso?: string;
  medium: string;
  /** True when the viewer proposed it (so only the other side may accept). */
  mine: boolean;
}

export interface ThreadView {
  threadId: string;
  me: Person;
  them: Person;
  messages: ChatMessage[];
  interview?: ScheduledInterview;
  /** Latest unanswered interview proposal, if any. */
  pendingProposal?: PendingProposal;
}

export const INTERVIEW_MEDIA = ["video", "phone", "onsite"] as const;
export type InterviewMedium = (typeof INTERVIEW_MEDIA)[number];

// Proposal / acceptance messages are ordinary chat messages with a fixed shape:
//   "Proposed: <label> · <medium>"   optionally followed by " ⟨<iso>⟩" (hidden in the UI)
//   "Accepted: <label> · <medium>"
const PROPOSAL_RE = /^Proposed: (.+) · (video|phone|onsite)(?: ⟨([0-9T:.\-+Z]+)⟩)?$/;
const ACCEPT_RE = /^Accepted: /;

export function formatProposal(label: string, medium: InterviewMedium, iso?: string): string {
  return `Proposed: ${label} · ${medium}${iso ? ` ⟨${iso}⟩` : ""}`;
}

export function parseProposal(text: string): { label: string; medium: InterviewMedium; iso?: string } | null {
  const m = PROPOSAL_RE.exec(text);
  if (!m) return null;
  return { label: m[1]!, medium: m[2] as InterviewMedium, iso: m[3] || undefined };
}

/** What the UI shows for a message (strips the machine-readable slot time). */
function displayText(text: string): string {
  const p = parseProposal(text);
  return p ? `Proposed: ${p.label} · ${p.medium}` : text;
}

function fmtTime(d: Date): string {
  return d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", timeZone: "Europe/Zurich" });
}

export async function getOrCreateThread(matchId: string): Promise<string> {
  const existing = await prisma.thread.findUnique({ where: { matchId }, select: { id: true } });
  if (existing) return existing.id;
  const created = await prisma.thread.create({ data: { matchId } });
  return created.id;
}

const identitySelect = {
  candidateRevealed: true,
  employerRevealed: true,
  candidate: {
    select: {
      userId: true,
      headline: true,
      user: { select: { name: true, initials: true, alias: true, anonymous: true } },
    },
  },
  opening: {
    select: {
      hiringManagerName: true,
      hiringManagerInitials: true,
      hiringManagerHeadline: true,
      hmAnonymous: true,
      hiringManagerAlias: true,
      companyConfidential: true,
      companyAlias: true,
      title: true,
      company: { select: { name: true, ownerId: true } },
    },
  },
} as const;

type IdentityRow = {
  candidateRevealed: boolean;
  employerRevealed: boolean;
  candidate: {
    userId: string;
    headline: string;
    user: { name: string; initials: string; alias: string | null; anonymous: boolean };
  };
  opening: {
    hiringManagerName: string;
    hiringManagerInitials: string;
    hiringManagerHeadline: string;
    hmAnonymous: boolean;
    hiringManagerAlias: string | null;
    companyConfidential: boolean;
    companyAlias: string | null;
    company: { name: string; ownerId: string };
  };
};

/** Both sides' identities; each masked unless `revealTo` is that side or it revealed. */
function identities(m: IdentityRow, viewer: ChatSide | "counterparty-of-candidate" | "counterparty-of-manager") {
  const candidateSeesSelf = viewer === "candidate";
  const managerSeesSelf = viewer === "manager";
  const cand = personIdentity(m.candidate.user, candidateSeesSelf || m.candidateRevealed);
  const emp = employerIdentity(
    {
      companyName: m.opening.company.name,
      companyConfidential: m.opening.companyConfidential,
      companyAlias: m.opening.companyAlias,
      hmName: m.opening.hiringManagerName,
      hmInitials: m.opening.hiringManagerInitials,
      hmHeadline: m.opening.hiringManagerHeadline,
      hmAnonymous: m.opening.hmAnonymous,
      hmAlias: m.opening.hiringManagerAlias,
    },
    managerSeesSelf || m.employerRevealed,
  );
  return { cand, emp };
}

/**
 * The label to store as `fromName` for a message sent by `side`: the sender's
 * identity as the *other* side currently sees it (masked unless revealed).
 */
export async function senderDisplayName(matchId: string, side: ChatSide): Promise<string> {
  const m = (await prisma.match.findUnique({ where: { id: matchId }, select: identitySelect })) as IdentityRow | null;
  if (!m) return side === "candidate" ? "Candidate" : "Hiring team";
  const { cand, emp } = identities(m, side === "candidate" ? "counterparty-of-candidate" : "counterparty-of-manager");
  return side === "candidate" ? cand.name : emp.hmName;
}

/**
 * The newest unanswered interview proposal in a thread, with who made it.
 * Only proposals with a known author (fromUserId) count — legacy rows can't be
 * attributed, so they can't be accepted either.
 */
export async function findPendingProposal(
  threadId: string,
): Promise<{ label: string; medium: InterviewMedium; iso?: string; fromUserId: string } | null> {
  const recent = await prisma.message.findMany({
    where: { threadId, OR: [{ text: { startsWith: "Proposed: " } }, { text: { startsWith: "Accepted: " } }] },
    orderBy: { createdAt: "desc" },
    take: 1,
    select: { text: true, fromUserId: true },
  });
  const last = recent[0];
  if (!last || ACCEPT_RE.test(last.text) || !last.fromUserId) return null;
  const p = parseProposal(last.text);
  return p ? { ...p, fromUserId: last.fromUserId } : null;
}

/**
 * Build the thread view for `viewerUserId`, who must already have been checked
 * (requireMatchAccess) to be on `viewer`'s side of the match.
 */
export async function getThreadView(
  matchId: string,
  viewer: ChatSide,
  viewerUserId: string,
): Promise<ThreadView | null> {
  const match = await prisma.match.findUnique({
    where: { id: matchId },
    select: {
      ...identitySelect,
      thread: {
        select: {
          id: true,
          messages: {
            orderBy: { createdAt: "asc" },
            select: { id: true, fromUserId: true, fromName: true, text: true, createdAt: true },
          },
          interview: true,
        },
      },
    },
  });
  if (!match) return null;

  // Mask each side unless the viewer is that side or it has explicitly revealed.
  const { cand: candId, emp } = identities(match as IdentityRow, viewer);

  // Person.id is the side ("candidate" | "manager"), never a user id.
  const candidate: Person = {
    id: "candidate",
    name: candId.name,
    headline: match.candidate.headline,
    initials: candId.initials,
  };
  const manager: Person = {
    id: "manager",
    name: emp.hmName,
    headline: emp.hmHeadline,
    initials: emp.hmInitials,
  };

  const me = viewer === "candidate" ? candidate : manager;
  const them = viewer === "candidate" ? manager : candidate;

  // Legacy rows (no fromUserId) stored a display name, sometimes the sender's
  // *real* name. Attribute them by comparing with every name the viewer's own
  // side may have used; the name itself never reaches the client.
  const myUserIds = new Set<string>([viewerUserId]);
  const myLegacyNames = new Set<string>();
  if (viewer === "candidate") {
    myUserIds.add(match.candidate.userId);
    myLegacyNames.add(match.candidate.user.name);
    myLegacyNames.add(personIdentity(match.candidate.user, false).name);
  } else {
    myUserIds.add(match.opening.company.ownerId);
    myLegacyNames.add(match.opening.hiringManagerName);
    myLegacyNames.add(emp.hmName);
    myLegacyNames.add(identities(match as IdentityRow, "counterparty-of-manager").emp.hmName);
  }

  const messages: ChatMessage[] = (match.thread?.messages ?? []).map((m) => {
    const mine = m.fromUserId ? myUserIds.has(m.fromUserId) : myLegacyNames.has(m.fromName);
    return {
      id: m.id,
      fromId: mine ? "me" : "them",
      text: displayText(m.text),
      ts: fmtTime(m.createdAt),
    };
  });

  const interview: ScheduledInterview | undefined = match.thread?.interview
    ? {
        when: match.thread.interview.whenText,
        whenAt: match.thread.interview.whenAt?.toISOString(),
        medium: match.thread.interview.medium,
        scoreSheetAttached: match.thread.interview.scoreSheetAttached,
      }
    : undefined;

  let pendingProposal: PendingProposal | undefined;
  if (match.thread) {
    const p = await findPendingProposal(match.thread.id);
    if (p) pendingProposal = { label: p.label, iso: p.iso, medium: p.medium, mine: myUserIds.has(p.fromUserId) };
  }

  return { threadId: match.thread?.id ?? "", me, them, messages, interview, pendingProposal };
}
