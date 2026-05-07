import Link from "next/link";
import { RegisterForm } from "@/components/auth/register-form";

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <p className="text-2xl font-bold tracking-tight">
            Holi<span className="text-primary">cruit</span>
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Create your account
          </p>
        </div>
        <RegisterForm />
        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/login" className="underline hover:text-primary">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
