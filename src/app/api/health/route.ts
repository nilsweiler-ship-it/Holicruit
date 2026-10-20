import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

/**
 * Deploy verification endpoint. CI polls this after a push to main until the
 * running commit matches, then runs the production smoke suite against it.
 * Exposes nothing sensitive: commit SHA, DB reachability, server time.
 */
export async function GET() {
  let db = "ok";
  try {
    await prisma.$queryRaw`SELECT 1`;
  } catch {
    db = "unreachable";
  }
  return NextResponse.json(
    {
      ok: db === "ok",
      commit: process.env.RAILWAY_GIT_COMMIT_SHA ?? process.env.GIT_COMMIT_SHA ?? null,
      db,
      time: new Date().toISOString(),
    },
    { status: db === "ok" ? 200 : 503, headers: { "cache-control": "no-store" } },
  );
}
