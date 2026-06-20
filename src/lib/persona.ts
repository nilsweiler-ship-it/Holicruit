/**
 * Active candidate persona resolution. The candidate flow ships three demo
 * personas across industries (Software / Healthcare / Sales); the active one is
 * held in a cookie so a reviewer can see the same screens for any of them.
 *
 * Server-only (uses next/headers). The cookie NAME is duplicated as a literal in
 * the client switcher to avoid pulling this module into client bundles.
 */

import { cookies } from "next/headers";
import type { CandidateWorld } from "./types";
import { CANDIDATE_WORLDS, DEFAULT_CANDIDATE_ID } from "./fixtures";

export const PERSONA_COOKIE = "hc_persona";

export async function getActiveCandidateId(): Promise<string> {
  const store = await cookies();
  const id = store.get(PERSONA_COOKIE)?.value;
  return id && CANDIDATE_WORLDS[id] ? id : DEFAULT_CANDIDATE_ID;
}

export async function getActiveWorld(): Promise<CandidateWorld> {
  return CANDIDATE_WORLDS[await getActiveCandidateId()];
}
