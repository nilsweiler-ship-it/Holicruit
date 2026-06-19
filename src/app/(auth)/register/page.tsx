import Link from "next/link";
import { RegisterForm } from "@/components/auth/register-form";
import { LogoMark } from "@/components/brand/logo";

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md space-y-4">
        <div className="flex flex-col items-center gap-2 mb-2">
          <LogoMark size={48} />
          <span className="text-2xl font-bold tracking-tight">holicruit</span>
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
