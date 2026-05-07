import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const roleRedirects: Record<string, string> = {
    CANDIDATE: "/dashboard/candidate",
    HIRING_MANAGER: "/dashboard/hiring-manager",
    HEADHUNTER: "/dashboard/headhunter",
  };

  redirect(roleRedirects[session.user.role] || "/login");
}
