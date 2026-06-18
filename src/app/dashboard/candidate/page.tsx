import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function CandidateDashboard() {
  const session = await auth();
  if (!session?.user || session.user.role !== "CANDIDATE") redirect("/login");
  redirect("/dashboard/candidate/matches");
}
