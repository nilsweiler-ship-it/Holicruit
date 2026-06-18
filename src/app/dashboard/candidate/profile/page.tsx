import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { ProfileForm } from "@/components/candidates/profile-form";
import type { Skill } from "@/types";

export default async function CandidateProfilePage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "CANDIDATE") redirect("/login");

  let profile = await prisma.candidateProfile.findUnique({
    where: { userId: session.user.id },
    include: { user: true },
  });

  if (!profile) {
    profile = await prisma.candidateProfile.create({
      data: { userId: session.user.id },
      include: { user: true },
    });
  }

  const skills: Skill[] = JSON.parse(profile.skills || "[]");
  const experience = JSON.parse(profile.experience || "[]");
  const education = JSON.parse(profile.education || "[]");

  // Compute profile completeness: 5 fields, each worth 20%
  let filled = 0;
  if (profile.bio && profile.bio.trim().length > 0) filled++;
  if (skills.length > 0) filled++;
  if (experience.length > 0) filled++;
  if (education.length > 0) filled++;
  if (profile.resumeUrl) filled++;
  const completeness = filled * 20;

  // Separate skills into hard and soft
  const hardSkills = skills.filter(
    (s) => !s.category || s.category === "hard" || s.category === "HARD"
  );
  const softSkills = skills.filter(
    (s) => s.category === "soft" || s.category === "SOFT"
  );

  return (
    <div className="space-y-8">
      <ProfileForm
        userName={profile.user.name ?? "Candidate"}
        profile={{
          bio: profile.bio,
          resumeUrl: profile.resumeUrl,
          skills: profile.skills,
          experience: profile.experience,
          education: profile.education,
          visibility: profile.visibility,
        }}
        completeness={completeness}
        hardSkills={hardSkills}
        softSkills={softSkills}
      />
    </div>
  );
}
