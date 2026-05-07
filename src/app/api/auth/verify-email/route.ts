import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { consumeToken, mintToken } from "@/lib/auth-tokens";
import { sendVerifyEmail } from "@/lib/email";
import { env } from "@/lib/env";
import { auth } from "@/lib/auth";

/**
 * GET /api/auth/verify-email?token=...
 *
 * Confirms a verification link clicked from email. Marks the user verified
 * and returns a small JSON payload — the UI page at /verify-email handles
 * redirecting/displaying success.
 */
const querySchema = z.object({
  token: z.string().min(1),
});

export async function GET(req: Request) {
  const url = new URL(req.url);
  const parsed = querySchema.safeParse({ token: url.searchParams.get("token") });
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: "Missing token" },
      { status: 400 }
    );
  }

  const result = await consumeToken(parsed.data.token, "VERIFY_EMAIL");
  if (!result.ok) {
    return NextResponse.json(
      { ok: false, error: result.reason },
      { status: 400 }
    );
  }

  await prisma.user.update({
    where: { id: result.userId },
    data: { emailVerifiedAt: new Date() },
  });

  return NextResponse.json({ ok: true });
}

/**
 * POST /api/auth/verify-email/resend
 *
 * Re-sends the verification email for the currently-logged-in user.
 * Used by the "Resend verification email" banner button (Day 4 work).
 */
export async function POST() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json(
      { ok: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, email: true, name: true, emailVerifiedAt: true },
  });
  if (!user) {
    return NextResponse.json(
      { ok: false, error: "Not found" },
      { status: 404 }
    );
  }
  if (user.emailVerifiedAt) {
    return NextResponse.json({ ok: true, alreadyVerified: true });
  }

  const token = await mintToken(user.id, "VERIFY_EMAIL");
  const verifyUrl = `${env.NEXT_PUBLIC_APP_URL}/verify-email?token=${encodeURIComponent(token)}`;
  const sendResult = await sendVerifyEmail({
    to: user.email,
    name: user.name,
    verifyUrl,
  });

  if (!sendResult.ok) {
    return NextResponse.json(
      { ok: false, error: sendResult.reason ?? "Failed to send" },
      { status: 502 }
    );
  }

  return NextResponse.json({ ok: true });
}
