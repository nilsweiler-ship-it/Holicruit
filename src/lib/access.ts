/**
 * Access control — the single place that decides who may read or change what.
 *
 * Server actions are public POST endpoints and `[matchId]` / `?opening=` pages
 * are reachable by anyone who knows (or guesses) an id, so EVERY action and
 * every id-taking page must call one of these before touching data. The UI
 * hiding a button is not a permission check.
 *
 * Failure mode: actions throw (the client sees a generic error, nothing is
 * written); pages call notFound() so the existence of other people's records
 * isn't confirmed.
 */
import { notFound, redirect } from "next/navigation";
import { prisma } from "./db";
import { requireUser } from "./persona";

export type Hat = "candidate" | "hiring_manager" | "recruiter" | "provider";
export type MatchSide = "candidate" | "manager";

export class AccessDenied extends Error {
  constructor(msg = "Not allowed") {
    super(msg);
    this.name = "AccessDenied";
  }
}

function parseRoles(raw: string): string[] {
  try {
    const v = JSON.parse(raw);
    return Array.isArray(v) ? v.map(String) : [];
  } catch {
    return [];
  }
}

/** Logged-in user who holds `hat`; otherwise redirect to role selection. */
export async function requireHat(hat: Hat) {
  const user = await requireUser();
  if (!parseRoles(user.roles).includes(hat)) redirect("/select-role");
  return user;
}

/** Same check for server actions: throws instead of redirecting. */
export async function assertHat(hat: Hat) {
  const user = await requireUser();
  if (!parseRoles(user.roles).includes(hat)) throw new AccessDenied();
  return user;
}

/**
 * Which side of a match the current user is on, or null if neither.
 * Candidate side = owns the candidate profile; manager side = owns the
 * company that owns the opening.
 */
async function sideOf(userId: string, matchId: string): Promise<MatchSide | null> {
  if (typeof matchId !== "string" || !matchId) return null;
  const m = await prisma.match.findUnique({
    where: { id: matchId },
    select: {
      candidate: { select: { userId: true } },
      opening: { select: { company: { select: { ownerId: true } } } },
    },
  });
  if (!m) return null;
  if (m.opening.company.ownerId === userId) return "manager";
  if (m.candidate.userId === userId) return "candidate";
  return null;
}

/** Action guard: caller must be on `side` of the match (or either side if omitted). */
export async function assertMatchAccess(matchId: string, side?: MatchSide) {
  const user = await requireUser();
  const s = await sideOf(user.id, matchId);
  if (!s || (side && s !== side)) throw new AccessDenied();
  return { user, side: s };
}

/** Page guard: same as assertMatchAccess but 404s. */
export async function requireMatchAccess(matchId: string, side?: MatchSide) {
  const user = await requireUser();
  const s = await sideOf(user.id, matchId);
  if (!s || (side && s !== side)) notFound();
  return { user, side: s };
}

async function ownsOpening(userId: string, openingId: string): Promise<boolean> {
  if (typeof openingId !== "string" || !openingId) return false;
  const o = await prisma.opening.findFirst({
    where: { id: openingId, company: { ownerId: userId } },
    select: { id: true },
  });
  return !!o;
}

/** Action guard: caller owns the opening. */
export async function assertOpeningOwner(openingId: string) {
  const user = await requireUser();
  if (!(await ownsOpening(user.id, openingId))) throw new AccessDenied();
  return user;
}

/** Page guard: caller owns the opening, else 404. */
export async function requireOpeningOwner(openingId: string) {
  const user = await requireUser();
  if (!(await ownsOpening(user.id, openingId))) notFound();
  return user;
}

/** Action guard: caller's provider owns the program. */
export async function assertProgramOwner(programId: string) {
  const user = await assertHat("provider");
  const p = await prisma.program.findFirst({
    where: { id: String(programId), provider: { userId: user.id } },
    select: { id: true },
  });
  if (!p) throw new AccessDenied();
  return user;
}

/** Safe in-app redirect target: a single leading slash, no scheme, no `//`. */
export function safeRedirectPath(raw: unknown, fallback = "/"): string {
  const s = String(raw ?? "");
  if (!/^\/(?![/\\])/.test(s)) return fallback;
  if (/[\r\n]/.test(s)) return fallback;
  return s;
}

/**
 * Page guard for the employer side of a match: the caller wears the hiring
 * manager hat AND owns the company that owns the match's opening. Anyone else
 * (including the candidate on that match) gets a 404.
 */
export async function requireManagerMatch(matchId: unknown) {
  const user = await requireHat("hiring_manager");
  if ((await sideOf(user.id, String(matchId ?? ""))) !== "manager") notFound();
  return user;
}

/** Page guard for the candidate side of a match: the caller owns the candidate profile. */
export async function requireCandidateMatch(matchId: unknown) {
  const user = await requireUser();
  if ((await sideOf(user.id, String(matchId ?? ""))) !== "candidate") notFound();
  return user;
}

/**
 * Page guard for HM opening pages: hiring-manager hat + owns the opening.
 * Rejects non-string ids (e.g. a repeated `?opening=a&opening=b`) with a 404.
 */
export async function requireHmOpening(openingId: unknown) {
  const user = await requireHat("hiring_manager");
  if (typeof openingId !== "string" || !(await ownsOpening(user.id, openingId))) notFound();
  return user;
}
