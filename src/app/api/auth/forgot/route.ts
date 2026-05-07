import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { mintToken } from "@/lib/auth-tokens";
import { sendResetPasswordEmail } from "@/lib/email";
import { env } from "@/lib/env";

/**
 * POST /api/auth/forgot
 *
 * Initiates a password reset. Always returns 200 with a generic message —
 * we never disclose whether the email exists, to avoid account enumeration.
 *
 * If the email is registered, we mint a single-use token and email a reset
 * link. Otherwise we silently no-op.
 */
const schema = z.object({
  email: z.string().email(),
});

export async function POST(req: Request) {
  let payload: z.infer<typeof schema>;
  try {
    payload = schema.parse(await req.json());
  } catch {
    // Validation error: still return generic 200 to avoid enumerating valid
    // email shapes. The client UI is the same either way.
    return NextResponse.json({ ok: true });
  }

  const user = await prisma.user.findUnique({
    where: { email: payload.email },
    select: { id: true, email: true, name: true },
  });

  if (user) {
    try {
      const token = await mintToken(user.id, "RESET_PASSWORD");
      const resetUrl = `${env.NEXT_PUBLIC_APP_URL}/reset?token=${encodeURIComponent(token)}`;
      await sendResetPasswordEmail({
        to: user.email,
        name: user.name,
        resetUrl,
      });
    } catch (err) {
      // Log but don't surface — generic 200 either way.
      // eslint-disable-next-line no-console
      console.error("Failed to send reset email:", err);
    }
  }

  return NextResponse.json({ ok: true });
}
