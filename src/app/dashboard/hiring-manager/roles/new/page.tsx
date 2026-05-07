import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { RoleForm } from "@/components/roles/role-form";

export default async function NewRolePage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "HIRING_MANAGER")
    redirect("/login");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Create New Role</h1>
        <p className="text-muted-foreground">
          Define requirements and scoring criteria for a new position
        </p>
      </div>
      <RoleForm />
    </div>
  );
}
