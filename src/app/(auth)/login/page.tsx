import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { getCurrentUser } from "@/lib/persona";
import { Wordmark } from "@/components/brand/wordmark";
import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = { title: "Sign in · Holicruit" };

const NOTICES: Record<string, string> = {
  claimed: "Your profile is claimed. Sign in with your email and the password you just set.",
  deleted: "Your account and its data have been deleted. Thanks for trying Holicruit.",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ claimed?: string | string[]; deleted?: string | string[] }>;
}) {
  // Use the DB-backed check (not just a decodable token) so a stale session
  // pointing to a deleted user doesn't bounce between /login and /select-role.
  if (await getCurrentUser()) redirect("/select-role");
  const { claimed, deleted } = await searchParams;
  const notice = deleted === "1" ? NOTICES.deleted : claimed === "1" ? NOTICES.claimed : null;
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col items-center gap-2 text-center">
        <Wordmark href="/" className="text-2xl" />
        <p className="text-muted-foreground">Welcome back</p>
      </div>
      {notice && (
        <div
          role="status"
          className="flex items-start gap-2 rounded-xl border border-primary/30 bg-primary/8 p-3 text-sm text-foreground"
        >
          <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
          <p>{notice}</p>
        </div>
      )}
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
