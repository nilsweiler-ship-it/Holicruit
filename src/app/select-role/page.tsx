import { redirect } from "next/navigation";
import { requireUser, getRole } from "@/lib/persona";

const HOME: Record<string, string> = {
  candidate: "/candidate/matches",
  hiring_manager: "/hiring-manager/pipeline",
  recruiter: "/recruiter",
  provider: "/provider",
};

/**
 * Post-login entry point. One account = one role, so this just routes to the
 * account's home (no hat picker).
 */
export default async function SelectRolePage() {
  await requireUser();
  const role = await getRole();
  redirect(HOME[role] ?? "/candidate/matches");
}
