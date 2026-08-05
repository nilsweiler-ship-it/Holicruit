/**
 * Direct-chat threads, DB-backed. People are name-keyed (the hiring manager on
 * an opening is a named person, not necessarily a user row), so a message is
 * "outgoing" when its fromId matches the viewer's name.
 */
import type { ChatMessage, Person, ScheduledInterview } from "../types";
import { prisma } from "../db";
import { personIdentity, employerIdentity } from "../identity";

export interface ThreadView {
  threadId: string;
  me: Person;
  them: Person;
  messages: ChatMessage[];
  interview?: ScheduledInterview;
}

function fmtTime(d: Date): string {
  return d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
}

export async function getOrCreateThread(matchId: string): Promise<string> {
  const existing = await prisma.thread.findUnique({ where: { matchId }, select: { id: true } });
  if (existing) return existing.id;
  const created = await prisma.thread.create({ data: { matchId } });
  return created.id;
}

/** Build the thread view for a viewer ("candidate" or "manager"). */
export async function getThreadView(
  matchId: string,
  viewer: "candidate" | "manager",
): Promise<ThreadView | null> {
  const match = await prisma.match.findUnique({
    where: { id: matchId },
    include: {
      candidate: {
        include: { user: { select: { name: true, initials: true, alias: true, anonymous: true } } },
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
          company: { select: { name: true } },
        },
      },
      thread: { include: { messages: { orderBy: { createdAt: "asc" } }, interview: true } },
    },
  });
  if (!match) return null;

  // Mask each side unless the viewer is that side or it has explicitly revealed.
  const candId = personIdentity(
    match.candidate.user,
    viewer === "candidate" || match.candidateRevealed,
  );
  const emp = employerIdentity(
    {
      companyName: match.opening.company.name,
      companyConfidential: match.opening.companyConfidential,
      companyAlias: match.opening.companyAlias,
      hmName: match.opening.hiringManagerName,
      hmInitials: match.opening.hiringManagerInitials,
      hmHeadline: match.opening.hiringManagerHeadline,
      hmAnonymous: match.opening.hmAnonymous,
      hmAlias: match.opening.hiringManagerAlias,
    },
    viewer === "manager" || match.employerRevealed,
  );

  const candidate: Person = {
    id: candId.name,
    name: candId.name,
    headline: match.candidate.headline,
    initials: candId.initials,
  };
  const manager: Person = {
    id: emp.hmName,
    name: emp.hmName,
    headline: emp.hmHeadline,
    initials: emp.hmInitials,
  };

  const me = viewer === "candidate" ? candidate : manager;
  const them = viewer === "candidate" ? manager : candidate;

  const messages: ChatMessage[] = (match.thread?.messages ?? []).map((m) => ({
    id: m.id,
    fromId: m.fromName,
    text: m.text,
    ts: fmtTime(m.createdAt),
  }));

  const interview: ScheduledInterview | undefined = match.thread?.interview
    ? {
        when: match.thread.interview.whenText,
        whenAt: match.thread.interview.whenAt?.toISOString(),
        medium: match.thread.interview.medium,
        scoreSheetAttached: match.thread.interview.scoreSheetAttached,
      }
    : undefined;

  return { threadId: match.thread?.id ?? "", me, them, messages, interview };
}
