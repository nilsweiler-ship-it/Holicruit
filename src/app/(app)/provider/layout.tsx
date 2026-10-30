import { requireHat } from "@/lib/access";

/** Guard: provider-only area (redirects other hats to role selection). */
export default async function ProviderLayout({ children }: { children: React.ReactNode }) {
  await requireHat("provider");
  return <>{children}</>;
}
