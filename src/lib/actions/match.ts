"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { AccessDenied, assertMatchAccess } from "@/lib/access";
import {
  findPendingProposal,
  formatProposal,
  getOrCreateThread,
  INTERVIEW_MEDIA,
  senderDisplayName,
  type ChatSide,
} from "@/lib/services/thread";

const matchIdSchema = z.string().min(1).max(64);
const messageSchema = z.string().max(4000);
const slotLabelSchema = z
  .string()
  .trim()
  .min(1)
  .max(60)
  .regex(/^[^\r\n⟨⟩]+$/);
const isoSchema = z
  .string()
  .max(40)
  .refine((s) => !Number.isNaN(new Date(s).getTime()), "invalid date");
const mediumSchema = z.enum(INTERVIEW_MEDIA);

function revalidateThread(matchId: string) {
  revalidatePath(`/candidate/chat/${matchId}`);
  revalidatePath(`/hiring-manager/chat/${matchId}`);
}

/** Store one chat message authored by the session user on `side`. */
async function postAs(matchId: string, userId: string, side: ChatSide, text: string): Promise<void> {
  const threadId = await getOrCreateThread(matchId);
  const fromName = await senderDisplayName(matchId, side);
  await prisma.message.create({ data: { threadId, fromUserId: userId, fromName, text } });
}

/** Candidate requests an intro → opt in and ensure a thread exists. */
export async function requestIntro(matchId: string): Promise<void> {
  const id = matchIdSchema.parse(matchId);
  await assertMatchAccess(id, "candidate");
  await prisma.match.update({ where: { id }, data: { candidateOptIn: true } });
  await getOrCreateThread(id);
  revalidatePath(`/candidate/matches/${id}`);
  revalidatePath(`/candidate/chat/${id}`);
}

/** Candidate bookmarks / un-bookmarks a match. */
export async function saveMatch(matchId: string, saved: boolean): Promise<void> {
  const id = matchIdSchema.parse(matchId);
  const value = z.boolean().parse(saved);
  await assertMatchAccess(id, "candidate");
  await prisma.match.update({ where: { id }, data: { saved: value } });
  revalidatePath(`/candidate/matches/${id}`);
}

/**
 * Append a message to a match's thread. The author is the session user; the
 * stored display label is their identity as the counterparty sees it.
 */
export async function sendMessage(matchId: string, text: string): Promise<void> {
  const id = matchIdSchema.parse(matchId);
  const clean = messageSchema.parse(text).trim();
  if (!clean) return;
  const { user, side } = await assertMatchAccess(id);
  await postAs(id, user.id, side, clean);
  revalidateThread(id);
}

/** Propose an interview slot in the thread (either side). */
export async function proposeInterview(
  matchId: string,
  slot: { label: string; iso?: string },
  medium: string,
): Promise<void> {
  const id = matchIdSchema.parse(matchId);
  const label = slotLabelSchema.parse(slot?.label);
  const iso = slot?.iso === undefined ? undefined : new Date(isoSchema.parse(slot.iso)).toISOString();
  const med = mediumSchema.parse(medium);
  const { user, side } = await assertMatchAccess(id);
  await postAs(id, user.id, side, formatProposal(label, med, iso));
  revalidateThread(id);
}

/**
 * Accept the latest open proposal. Only the counterparty of whoever proposed
 * it may accept; the slot comes from the stored proposal, not the client.
 */
export async function acceptInterview(matchId: string): Promise<{ when: string; whenAt?: string; medium: string }> {
  const id = matchIdSchema.parse(matchId);
  const { user, side } = await assertMatchAccess(id);
  const threadId = await getOrCreateThread(id);
  const pending = await findPendingProposal(threadId);
  if (!pending) throw new Error("There is no open proposal to accept.");
  if (pending.fromUserId === user.id) throw new AccessDenied("You can't accept your own proposal.");

  const whenAt = pending.iso ? new Date(pending.iso) : null;
  const validAt = whenAt && !Number.isNaN(whenAt.getTime()) ? whenAt : null;
  await postAs(id, user.id, side, `Accepted: ${pending.label} · ${pending.medium}`);
  await prisma.interview.upsert({
    where: { threadId },
    update: { whenText: pending.label, medium: pending.medium, whenAt: validAt },
    create: { threadId, whenText: pending.label, medium: pending.medium, whenAt: validAt },
  });
  revalidateThread(id);
  return { when: pending.label, whenAt: validAt?.toISOString(), medium: pending.medium };
}

/**
 * Directly set (or reschedule) the interview — hiring-manager side only, e.g.
 * after agreeing a time outside the proposal flow. Candidates go through
 * propose/accept so neither side can book unilaterally on the other's behalf.
 */
export async function scheduleInterview(
  matchId: string,
  whenText: string,
  medium = "video",
  whenISO?: string,
): Promise<void> {
  const id = matchIdSchema.parse(matchId);
  const label = slotLabelSchema.parse(whenText);
  const med = mediumSchema.parse(medium);
  const iso = whenISO === undefined ? undefined : isoSchema.parse(whenISO);
  await assertMatchAccess(id, "manager");
  const threadId = await getOrCreateThread(id);
  const validAt = iso ? new Date(iso) : null;
  await prisma.interview.upsert({
    where: { threadId },
    update: { whenText: label, medium: med, whenAt: validAt },
    create: { threadId, whenText: label, medium: med, whenAt: validAt },
  });
  revalidateThread(id);
}

/** Attach the structured score sheet to the interview (hiring manager). */
export async function attachScoreSheet(matchId: string): Promise<void> {
  const id = matchIdSchema.parse(matchId);
  await assertMatchAccess(id, "manager");
  const thread = await prisma.thread.findUnique({ where: { matchId: id }, select: { interview: true } });
  if (thread?.interview) {
    await prisma.interview.update({
      where: { id: thread.interview.id },
      data: { scoreSheetAttached: true },
    });
    revalidatePath(`/hiring-manager/chat/${id}`);
  }
}
