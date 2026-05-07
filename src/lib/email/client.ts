/**
 * Resend client (lazy + memoised).
 *
 * The Resend SDK is happy to be instantiated at import time, but in dev we may
 * not have an API key set yet, and we want the rest of the app to keep
 * booting. So we instantiate on first use and surface a clear error if email
 * is invoked without configuration.
 */

import { Resend } from "resend";
import { env } from "@/lib/env";

let cached: Resend | null = null;

export function getResendClient(): Resend {
  if (cached) return cached;
  if (!env.RESEND_API_KEY) {
    throw new Error(
      "RESEND_API_KEY is not set. Email cannot be sent. Either configure Resend (see .env.example) or guard email calls with `isEmailEnabled()`.",
    );
  }
  cached = new Resend(env.RESEND_API_KEY);
  return cached;
}

export function isEmailEnabled(): boolean {
  return Boolean(env.RESEND_API_KEY);
}
