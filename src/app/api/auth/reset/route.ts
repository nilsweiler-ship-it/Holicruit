import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { consumeToken } from "@/lib/auth-tokens";

/**
 * POST /api/auth/reset
 *
 * Consumes a reset token + new password. On success, hashes the new password,
 * writes it, and invalidates any other live tokens for this user.
 */
const schema = z.object({
  token: z.string().min(1),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export async function POST(req: Request) {
  let payload: z.infer<typeof schema>;
  try {
    payload = schema.parse(await req.json());
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { ok: false, error: err.issues[0]?.message ?? "Invalid input" },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { ok: false, error: "Invalid input" },
      { status: 400 }
    );
  }

  const result = await consumeToken(payload.token, "RESET_PASSWORD");
  if (!result.ok) {
    return NextResponse.json(
      { ok: false, error: result.reason },
      { status: 400 }
    );
  }

  const passwordHash = await bcrypt.hash(payload.password, 10);

  await prisma.user.update({
    where: { id: result.userId },
    data: { passwordHash },
  });

  // Invalidate any other live tokens for this user (defense in depth — a
  // password change should kill all in-flight reset/verify links).
  await prisma.authToken.updateMany({
    where: { userId: result.userId, consumedAt: null },
    data: { consumedAt: new Date() },
  });

  return NextResponse.json({ ok: true });
}
