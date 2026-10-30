"use server";

import { z } from "zod";
import bcrypt from "bcryptjs";
import { AuthError } from "next-auth";
import { prisma } from "@/lib/db";
import { signIn, signOut } from "@/lib/auth";
import { headers } from "next/headers";
import { clientIp, limiters, TOO_MANY_ATTEMPTS } from "@/lib/ratelimit";
import { demoLoginsEnabled, isDemoEmail } from "@/lib/demo";

export type AuthState = { error?: string } | null;

const HATS = ["candidate", "hiring_manager", "recruiter", "provider"] as const;

function initialsOf(name: string): string {
  const w = name.trim().split(/\s+/).filter(Boolean);
  if (!w.length) return "?";
  return ((w[0]?.[0] ?? "") + (w.length > 1 ? w[w.length - 1]?.[0] ?? "" : "")).toUpperCase();
}

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function loginAction(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) return { error: "Enter a valid email and password." };

  // Throttle failed attempts per account and per client IP (src/lib/ratelimit.ts).
  const emailKey = `login:${parsed.data.email.trim().toLowerCase()}`;
  const ipKey = `login-ip:${clientIp(await headers())}`;
  const { loginFailuresByEmail, loginFailuresByIp } = limiters;
  if (!loginFailuresByEmail.check(emailKey).allowed || !loginFailuresByIp.check(ipKey).allowed) {
    return { error: TOO_MANY_ATTEMPTS };
  }

  try {
    await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirectTo: "/select-role",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      // Per-account failures are counted inside authorize() (src/lib/auth.ts)
      // so direct posts to the credentials callback are throttled too.
      loginFailuresByIp.hit(ipKey);
      return { error: "Invalid email or password." };
    }
    throw error; // re-throw the NEXT_REDIRECT on success
  }
  return null;
}

const registerSchema = z.object({
  name: z.string().min(2, "Enter your name."),
  email: z.string().email("Enter a valid email."),
  password: z.string().min(8, "Password must be at least 8 characters."),
  hat: z.enum(HATS),
});

export async function registerAction(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const parsed = registerSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    hat: formData.get("hat") || "candidate",
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Check your details." };

  const { name, email, password, hat } = parsed.data;
  // The @holicruit.test domain is reserved for seeded demo personas.
  if (isDemoEmail(email)) return { error: "Please use your own email address." };
  if (formData.get("consent") !== "on") {
    return { error: "Please accept the Terms and Privacy Policy to continue." };
  }
  // Registration keeps an explicit "already exists" message (a neutral reply
  // needs email verification, which doesn't exist yet), so it's throttled per IP
  // instead: every attempt that reaches the lookup counts.
  const regKey = `register-ip:${clientIp(await headers())}`;
  if (!limiters.registrationsByIp.check(regKey).allowed) return { error: TOO_MANY_ATTEMPTS };
  limiters.registrationsByIp.hit(regKey);

  const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  if (existing) return { error: "An account with this email already exists." };

  const passwordHash = await bcrypt.hash(password, 10);
  const initials = initialsOf(name);

  await prisma.user.create({
    data: {
      email: email.toLowerCase(),
      passwordHash,
      name,
      initials,
      roles: JSON.stringify([hat]),
      consentAt: new Date(),
      ...(hat === "candidate"
        ? { candidate: { create: { headline: "New candidate", industry: "General", completeness: 20 } } }
        : {}),
      ...(hat === "provider"
        ? { provider: { create: { name, kind: "Course platform", headline: "New provider", initials } } }
        : {}),
    },
  });

  try {
    await signIn("credentials", { email, password, redirectTo: "/select-role" });
  } catch (error) {
    if (error instanceof AuthError) return { error: "Account created — please sign in." };
    throw error;
  }
  return null;
}

export async function signOutAction() {
  await signOut({ redirectTo: "/" });
}

/** The seeded demo personas offered on the login page — nothing else. */
const DEMO_EMAILS = new Set([
  "sam@holicruit.test",
  "aisha@holicruit.test",
  "diego@holicruit.test",
  "priya@holicruit.test",
  "jordan@holicruit.test",
  "fm@holicruit.test",
]);

// Demo logins follow the same explicit opt-in as the login page's demo
// buttons: on only when NEXT_PUBLIC_DEMO_LOGINS === "1" (see src/lib/demo.ts).

/**
 * One-click sign-in for the seeded demo accounts (all use password123). Refused
 * when demo logins are disabled, and only for the known demo emails — so it
 * can't be used to try password123 against real accounts.
 */
export async function demoLoginAction(email: string) {
  const target = typeof email === "string" ? email.trim().toLowerCase() : "";
  if (!demoLoginsEnabled() || !DEMO_EMAILS.has(target)) return;
  try {
    await signIn("credentials", { email: target, password: "password123", redirectTo: "/select-role" });
  } catch (error) {
    if (error instanceof AuthError) return;
    throw error;
  }
}
