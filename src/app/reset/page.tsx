import Link from "next/link";
import { ResetForm } from "@/components/auth/reset-form";

/**
 * /reset?token=...
 *
 * Server component renders the form with the token baked in. Token is only
 * verified on submit (POST /api/auth/reset). We deliberately don't pre-validate
 * here — that would burn the token if a user opened the link without intent.
 */
export default async function ResetPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  if (!token) {
    return (
      <div className="mx-auto flex min-h-[80vh] max-w-md flex-col items-center justify-center px-6 py-12">
        <h1 className="text-xl font-semibold">Reset link incomplete</h1>
        <p className="text-muted-foreground mt-2">
          The reset link is missing its token. Open it from your email again, or{" "}
          <Link href="/forgot" className="underline">
            request a new one
          </Link>
          .
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-[80vh] max-w-md flex-col items-center justify-center px-6 py-12">
      <ResetForm token={token} />
    </div>
  );
}
