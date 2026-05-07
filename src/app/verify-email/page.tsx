import Link from "next/link";
import { prisma } from "@/lib/db";
import { consumeToken } from "@/lib/auth-tokens";

/**
 * /verify-email?token=...
 *
 * Server component that consumes the token directly (no client roundtrip).
 * Renders a success or error state and a CTA back into the app.
 *
 * Note: route handlers are also available at /api/auth/verify-email for
 * programmatic clients (e.g. a future native mobile app), but the email
 * link points here so users land on a styled page.
 */
export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  if (!token) {
    return (
      <Wrapper>
        <h1 className="text-2xl font-semibold">Missing verification link</h1>
        <p className="text-muted-foreground mt-2">
          The link you followed is incomplete. Try opening the original email
          again, or sign in and request a new verification email.
        </p>
        <CTA href="/login" label="Go to sign in" />
      </Wrapper>
    );
  }

  const result = await consumeToken(token, "VERIFY_EMAIL");

  if (!result.ok) {
    const explain: Record<string, string> = {
      expired: "This link has expired. Sign in and request a new one.",
      "already-used": "This link has already been used.",
      "race-already-used": "This link has already been used.",
      "wrong-purpose": "This link is invalid.",
      "not-found": "This link is invalid or has already been used.",
      "missing-token": "This link is incomplete.",
    };
    return (
      <Wrapper>
        <h1 className="text-2xl font-semibold">Couldn&apos;t verify</h1>
        <p className="text-muted-foreground mt-2">
          {explain[result.reason] ?? "Something went wrong verifying this link."}
        </p>
        <CTA href="/login" label="Go to sign in" />
      </Wrapper>
    );
  }

  await prisma.user.update({
    where: { id: result.userId },
    data: { emailVerifiedAt: new Date() },
  });

  // Redirect signed-in users to dashboard root; unauthenticated users see the
  // success state below and choose to log in.
  // (We don't have access to session here without auth() — the simplest UX is
  // a friendly success page with a CTA.)
  return (
    <Wrapper>
      <h1 className="text-2xl font-semibold">Email verified</h1>
      <p className="text-muted-foreground mt-2">
        Your email is confirmed. You can now access all Holicruit features.
      </p>
      <CTA href="/dashboard" label="Go to dashboard" />
    </Wrapper>
  );
}

function Wrapper({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto flex min-h-[80vh] max-w-md flex-col items-start justify-center px-6 py-12">
      {children}
    </div>
  );
}

function CTA({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="bg-primary text-primary-foreground mt-6 inline-flex items-center rounded-md px-4 py-2 text-sm font-medium"
    >
      {label}
    </Link>
  );
}
