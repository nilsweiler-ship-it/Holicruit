-- AlterTable
ALTER TABLE "CandidateProfile" ADD COLUMN     "claimed" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "inviteToken" TEXT,
ADD COLUMN     "invitedByUserId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "CandidateProfile_inviteToken_key" ON "CandidateProfile"("inviteToken");

