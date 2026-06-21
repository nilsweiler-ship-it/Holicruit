"use server";

import { z } from "zod";
import bcrypt from "bcryptjs";
import { AuthError } from "next-auth";
import { prisma } from "@/lib/db";
import { signIn, signOut } from "@/lib/auth";

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

  try {
    await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirectTo: "/select-role",
    });
  } catch (error) {
    if (error instanceof AuthError) return { error: "Invalid email or password." };
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

/** One-click sign-in for the seeded demo accounts (all use password123). */
export async function demoLoginAction(email: string) {
  try {
    await signIn("credentials", { email, password: "password123", redirectTo: "/select-role" });
  } catch (error) {
    if (error instanceof AuthError) return;
    throw error;
  }
}
