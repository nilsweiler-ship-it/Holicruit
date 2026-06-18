import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { RoleSelector } from "@/components/dashboard/role-selector";

const roleRedirects: Record<string, string> = {
  CANDIDATE: "/dashboard/candidate",
  HIRING_MANAGER: "/dashboard/hiring-manager",
  HEADHUNTER: "/dashboard/headhunter",
  ADMIN: "/dashboard/admin",
};

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  // Admin always goes straight to admin dashboard
  if (session.user.role === "ADMIN") {
    redirect(roleRedirects.ADMIN);
  }

  return <RoleSelector userRole={session.user.role} />;
}
