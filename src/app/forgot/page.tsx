import { ForgotForm } from "@/components/auth/forgot-form";
import Link from "next/link";

export default function ForgotPage() {
  return (
    <div className="mx-auto flex min-h-[80vh] max-w-md flex-col items-center justify-center px-6 py-12">
      <ForgotForm />
      <p className="text-muted-foreground mt-6 text-sm">
        Remembered it?{" "}
        <Link href="/login" className="underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
