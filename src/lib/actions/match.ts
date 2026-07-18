"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { getOrCreateThread } from "@/lib/services/thread";

/** Candidate requests an intro → opt in and ensure a thread exists. */
export async function requestIntro(matchId: string): Promise<void> {
  await prisma.match.update({ where: { id: matchId }, data: { candidateOptIn: true } });
  await getOrCreateThread(matchId);
  revalidatePath(`/candidate/matches/${matchId}`);
  revalidatePath(`/candidate/chat/${matchId}`);
}

/** Bookmark / un-bookmark a match. */
export async function saveMatch(matchId: string, saved: boolean): Promise<void> {
  await prisma.match.update({ where: { id: matchId }, data: { saved } });
  revalidatePath(`/candidate/matches/${matchId}`);
}

/** Append a message to a match's thread (creating the thread if needed). */
export async function sendMessage(matchId: string, senderName: string, text: string): Promise<void> {
  const clean = text.trim();
  if (!clean) return;
  const threadId = await getOrCreateThread(matchId);
  await prisma.message.create({ data: { threadId, fromName: senderName, text: clean } });
  revalidatePath(`/candidate/chat/${matchId}`);
  revalidatePath(`/hiring-manager/chat/${matchId}`);
}

/** Schedule (or reschedule) the interview on a match's thread. */
export async function scheduleInterview(
  matchId: string,
  whenText: string,
  medium = "video",
  whenISO?: string,
): Promise<void> {
  const threadId = await getOrCreateThread(matchId);
  const whenAt = whenISO ? new Date(whenISO) : null;
  const validAt = whenAt && !Number.isNaN(whenAt.getTime()) ? whenAt : null;
  await prisma.interview.upsert({
    where: { threadId },
    update: { whenText, medium, whenAt: validAt },
    create: { threadId, whenText, medium, whenAt: validAt },
  });
  revalidatePath(`/candidate/chat/${matchId}`);
  revalidatePath(`/hiring-manager/chat/${matchId}`);
}

/** Attach the structured score sheet to the interview. */
export async function attachScoreSheet(matchId: string): Promise<void> {
  const thread = await prisma.thread.findUnique({ where: { matchId }, select: { interview: true } });
  if (thread?.interview) {
    await prisma.interview.update({
      where: { id: thread.interview.id },
      data: { scoreSheetAttached: true },
    });
    revalidatePath(`/hiring-manager/chat/${matchId}`);
  }
}
