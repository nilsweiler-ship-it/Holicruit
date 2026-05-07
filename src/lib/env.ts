/**
 * Centralised environment configuration.
 *
 * Validates required env vars at module-load time and exposes a typed `env`
 * object. In production we throw on missing/invalid values; in development we
 * log a warning and fall back to safe-ish defaults so a fresh checkout still
 * boots before someone runs `cp .env.example .env`.
 *
 * Importing `env` from "@/lib/env" guarantees the validation has run.
 */

import { z } from "zod";

const isProd = process.env.NODE_ENV === "production";

/**
 * Schema for every server-side environment variable used in the app.
 * Add new variables here — code that reads `process.env.X` directly is a smell.
 */
const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),

  // Database
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  DATABASE_AUTH_TOKEN: z.string().optional().default(""),

  // Auth
  NEXTAUTH_SECRET: z
    .string()
    .min(
      32,
      "NEXTAUTH_SECRET must be at least 32 characters. Generate with: openssl rand -base64 32",
    ),
  NEXTAUTH_URL: z.string().url("NEXTAUTH_URL must be a valid URL"),

  // AI
  ANTHROPIC_API_KEY: z.string().min(1, "ANTHROPIC_API_KEY is required"),

  // Email
  RESEND_API_KEY: z.string().min(1, "RESEND_API_KEY is required").optional(),
  EMAIL_FROM: z
    .string()
    .min(1)
    .default("Holicruit <onboarding@resend.dev>"),

  // Public
  NEXT_PUBLIC_APP_URL: z.string().url().default("http://localhost:3000"),
});

/**
 * In production, every required key must be present.
 * In development, RESEND_API_KEY and ANTHROPIC_API_KEY are tolerated as missing
 * (so the app still boots without them; calling code must handle absence).
 */
const devSchema = envSchema.extend({
  ANTHROPIC_API_KEY: z.string().optional().default(""),
  RESEND_API_KEY: z.string().optional().default(""),
  // Soften secret length requirement in dev.
  NEXTAUTH_SECRET: z.string().min(1).default("dev-secret-change-me"),
});

const schema = isProd ? envSchema : devSchema;

const parsed = schema.safeParse(process.env);

if (!parsed.success) {
  const issues = parsed.error.issues
    .map((i) => `  - ${i.path.join(".")}: ${i.message}`)
    .join("\n");

  if (isProd) {
    // Hard fail: build/runtime should not start with a broken env.
    throw new Error(
      `Invalid environment configuration:\n${issues}\n\nSee .env.example for the full list of required variables.`,
    );
  }

  // Dev: warn loudly but keep running.
  // eslint-disable-next-line no-console
  console.warn(
    `\n⚠️  Environment validation issues (dev mode, continuing anyway):\n${issues}\n`,
  );
}

/**
 * Typed, validated environment.
 * Use `env.X` instead of `process.env.X` everywhere in app code.
 */
export const env = parsed.success
  ? parsed.data
  : (process.env as unknown as z.infer<typeof envSchema>);

export type Env = typeof env;
