import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { ProfileForm } from "@/components/candidates/profile-form";

export default async function CandidateProfilePage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "CANDIDATE") redirect("/login");

  let profile = await prisma.candidateProfile.findUnique({
    where: { userId: session.user.id },
  });

  if (!profile) {
    profile = await prisma.candidateProfile.create({
      data: { userId: session.user.id },
    });
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">My Profile</h1>
        <p className="text-muted-foreground">
          Build your profile to get matched with relevant roles
        </p>
      </div>
      <ProfileForm
        profile={{
          bio: profile.bio,
          resumeUrl: profile.resumeUrl,
          skills: profile.skills,
          experience: profile.experience,
          education: profile.education,
          visibility: profile.visibility,
        }}
      />
    </div>
  );
}
