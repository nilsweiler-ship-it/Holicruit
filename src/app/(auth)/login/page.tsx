import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/persona";
import { Wordmark } from "@/components/brand/wordmark";
import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = { title: "Sign in · Holicruit" };

export default async function LoginPage() {
  // Use the DB-backed check (not just a decodable token) so a stale session
  // pointing to a deleted user doesn't bounce between /login and /select-role.
  if (await getCurrentUser()) redirect("/select-role");
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col items-center gap-2 text-center">
        <Wordmark href="/" className="text-2xl" />
        <p className="text-muted-foreground">Welcome back</p>
      </div>
      <LoginForm />
      <p className="text-center text-sm text-muted-foreground">
        No account?{" "}
        <Link href="/register" className="font-medium text-primary hover:underline">
          Create one
        </Link>
      </p>
    </div>
  );
}
