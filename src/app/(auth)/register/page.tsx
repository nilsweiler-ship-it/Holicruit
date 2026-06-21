import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { Wordmark } from "@/components/brand/wordmark";
import { RegisterForm } from "@/components/auth/register-form";

export const metadata: Metadata = { title: "Create your account · Holicruit" };

function planToHat(plan?: string): string {
  if (plan?.startsWith("hm-")) return "hiring_manager";
  if (plan?.startsWith("provider-")) return "provider";
  return "candidate";
}

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ plan?: string }>;
}) {
  if (await auth()) redirect("/select-role");
  const { plan } = await searchParams;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col items-center gap-2 text-center">
        <Wordmark href="/" className="text-2xl" />
        <p className="text-muted-foreground">Create your account</p>
      </div>
      <RegisterForm defaultHat={planToHat(plan)} />
      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-primary hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
