import { requireHat } from "@/lib/access";

/** Guard: recruiter-only area (redirects other hats to role selection). */
export default async function RecruiterLayout({ children }: { children: React.ReactNode }) {
  await requireHat("recruiter");
  return <>{children}</>;
}
