/**
 * Email facade.
 *
 * Use `sendEmail()` for transactional sends. Templates live in `./templates`.
 * If RESEND_API_KEY is not configured, calls log to console and resolve
 * cleanly — that way local dev doesn't crash on registration.
 */

import { env } from "@/lib/env";
import { getResendClient, isEmailEnabled } from "./client";
import {
  verifyEmailTemplate,
  resetPasswordTemplate,
  type RenderedEmail,
} from "./templates";

interface SendEmailArgs {
  to: string;
  rendered: RenderedEmail;
  /** Optional reply-to override (defaults to env.EMAIL_FROM). */
  replyTo?: string;
}

export async function sendEmail({
  to,
  rendered,
  replyTo,
}: SendEmailArgs): Promise<{ ok: boolean; id?: string; reason?: string }> {
  if (!isEmailEnabled()) {
    // Dev-mode fallback: log instead of throwing so flows can be tested.
    // eslint-disable-next-line no-console
    console.warn(
      `[email] RESEND_API_KEY not set — would send "${rendered.subject}" to ${to}.\nLink content:\n${rendered.text}`,
    );
    return { ok: true, reason: "email-disabled-dev" };
  }

  try {
    const client = getResendClient();
    const result = await client.emails.send({
      from: env.EMAIL_FROM,
      to,
      subject: rendered.subject,
      html: rendered.html,
      text: rendered.text,
      ...(replyTo ? { replyTo } : {}),
    });

    if (result.error) {
      // eslint-disable-next-line no-console
      console.error("[email] Resend API error:", result.error);
      return { ok: false, reason: result.error.message };
    }

    return { ok: true, id: result.data?.id };
  } catch (err) {
    // Never let an email failure take down the request.
    // eslint-disable-next-line no-console
    console.error("[email] send failed:", err);
    return {
      ok: false,
      reason: err instanceof Error ? err.message : "unknown",
    };
  }
}

// ── Convenience wrappers per email type ────────────────────────────────────

export function sendVerifyEmail(args: {
  to: string;
  name: string;
  verifyUrl: string;
}) {
  return sendEmail({
    to: args.to,
    rendered: verifyEmailTemplate({
      name: args.name,
      verifyUrl: args.verifyUrl,
    }),
  });
}

export function sendResetPasswordEmail(args: {
  to: string;
  name: string;
  resetUrl: string;
}) {
  return sendEmail({
    to: args.to,
    rendered: resetPasswordTemplate({
      name: args.name,
      resetUrl: args.resetUrl,
    }),
  });
}
