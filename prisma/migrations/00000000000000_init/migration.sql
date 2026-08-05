-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "initials" TEXT NOT NULL,
    "roles" TEXT NOT NULL DEFAULT '["candidate"]',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductFeedback" (
    "id" TEXT NOT NULL,
    "message" TEXT NOT NULL DEFAULT '',
    "sentiment" TEXT,
    "path" TEXT,
    "role" TEXT,
    "userId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProductFeedback_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CandidateProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "headline" TEXT NOT NULL,
    "industry" TEXT NOT NULL,
    "completeness" INTEGER NOT NULL DEFAULT 40,
    "scenarioCompleted" BOOLEAN NOT NULL DEFAULT false,
    "traitProfile" TEXT,
    "avatarUrl" TEXT,

    CONSTRAINT "CandidateProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HardSkill" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "assessedScore" INTEGER,

    CONSTRAINT "HardSkill_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SoftSkillScore" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "level" INTEGER NOT NULL,

    CONSTRAINT "SoftSkillScore_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Endorsement" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "skill" TEXT NOT NULL,
    "endorserName" TEXT NOT NULL,
    "endorserInitials" TEXT NOT NULL,
    "endorserHeadline" TEXT NOT NULL,
    "relationship" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Endorsement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ScenarioResult" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "scores" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ScenarioResult_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Company" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,

    CONSTRAINT "Company_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Opening" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "industry" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "salaryMin" INTEGER,
    "salaryMax" INTEGER,
    "currency" TEXT NOT NULL DEFAULT '€',
    "hiringManagerName" TEXT NOT NULL,
    "hiringManagerHeadline" TEXT NOT NULL,
    "hiringManagerInitials" TEXT NOT NULL,
    "requiredHard" TEXT NOT NULL DEFAULT '[]',
    "requiredSoft" TEXT NOT NULL DEFAULT '[]',
    "priority" BOOLEAN NOT NULL DEFAULT false,
    "hardWeight" INTEGER NOT NULL DEFAULT 60,
    "softWeight" INTEGER NOT NULL DEFAULT 40,
    "passBar" INTEGER NOT NULL DEFAULT 60,
    "skillWeights" TEXT NOT NULL DEFAULT '{}',
    "quiz" TEXT,

    CONSTRAINT "Opening_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Match" (
    "id" TEXT NOT NULL,
    "candidateId" TEXT NOT NULL,
    "openingId" TEXT NOT NULL,
    "hardFit" INTEGER NOT NULL,
    "softFit" INTEGER NOT NULL,
    "mutualFit" INTEGER NOT NULL,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "gaps" TEXT NOT NULL DEFAULT '[]',
    "candidateRank" INTEGER,
    "poolSize" INTEGER,
    "stage" TEXT NOT NULL DEFAULT 'new',
    "stageChangedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "candidateOptIn" BOOLEAN NOT NULL DEFAULT false,
    "managerOptIn" BOOLEAN NOT NULL DEFAULT false,
    "saved" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Match_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Thread" (
    "id" TEXT NOT NULL,
    "matchId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Thread_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Message" (
    "id" TEXT NOT NULL,
    "threadId" TEXT NOT NULL,
    "fromUserId" TEXT,
    "fromName" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Interview" (
    "id" TEXT NOT NULL,
    "threadId" TEXT NOT NULL,
    "whenText" TEXT NOT NULL,
    "whenAt" TIMESTAMP(3),
    "medium" TEXT NOT NULL DEFAULT 'video',
    "scoreSheetAttached" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Interview_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GrowthReport" (
    "id" TEXT NOT NULL,
    "matchId" TEXT NOT NULL,
    "roleTitle" TEXT NOT NULL,
    "company" TEXT NOT NULL,
    "hardYou" INTEGER NOT NULL,
    "hardBar" INTEGER NOT NULL,
    "softYou" INTEGER NOT NULL,
    "softBar" INTEGER NOT NULL,
    "primaryGapSkill" TEXT NOT NULL,
    "primaryGapType" TEXT NOT NULL,
    "rolesClearedIfClosed" INTEGER NOT NULL,
    "matchingProgramCount" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GrowthReport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FeedbackDraft" (
    "id" TEXT NOT NULL,
    "matchId" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "sent" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FeedbackDraft_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ScoreSheet" (
    "id" TEXT NOT NULL,
    "matchId" TEXT NOT NULL,
    "author" TEXT NOT NULL,
    "ratings" TEXT NOT NULL DEFAULT '[]',
    "overall" INTEGER NOT NULL DEFAULT 3,
    "recommendation" TEXT NOT NULL DEFAULT 'yes',
    "notes" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ScoreSheet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PipelineNote" (
    "id" TEXT NOT NULL,
    "matchId" TEXT NOT NULL,
    "author" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PipelineNote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RecruiterIntro" (
    "id" TEXT NOT NULL,
    "recruiterId" TEXT NOT NULL,
    "candidateName" TEXT NOT NULL,
    "roleTitle" TEXT NOT NULL,
    "company" TEXT NOT NULL,
    "valueNote" TEXT NOT NULL,
    "stage" TEXT NOT NULL DEFAULT 'talking',

    CONSTRAINT "RecruiterIntro_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Provider" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "headline" TEXT NOT NULL,
    "initials" TEXT NOT NULL,

    CONSTRAINT "Provider_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Program" (
    "id" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "format" TEXT NOT NULL,
    "credential" TEXT,
    "tags" TEXT NOT NULL DEFAULT '[]',
    "closesGap" TEXT NOT NULL,
    "gapType" TEXT NOT NULL,
    "sponsored" BOOLEAN NOT NULL DEFAULT false,
    "enrollments" INTEGER NOT NULL DEFAULT 0,
    "completions" INTEGER NOT NULL DEFAULT 0,
    "reMatches" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Program_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Enrollment" (
    "id" TEXT NOT NULL,
    "programId" TEXT NOT NULL,
    "candidateId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'enrolled',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Enrollment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Subscription" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "hat" TEXT NOT NULL,
    "plan" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "stripeCustomerId" TEXT,
    "stripeSubscriptionId" TEXT,
    "currentPeriodEnd" TIMESTAMP(3),

    CONSTRAINT "Subscription_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "ProductFeedback_createdAt_idx" ON "ProductFeedback"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "CandidateProfile_userId_key" ON "CandidateProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "HardSkill_profileId_name_key" ON "HardSkill"("profileId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "SoftSkillScore_profileId_name_key" ON "SoftSkillScore"("profileId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "Match_candidateId_openingId_key" ON "Match"("candidateId", "openingId");

-- CreateIndex
CREATE UNIQUE INDEX "Thread_matchId_key" ON "Thread"("matchId");

-- CreateIndex
CREATE UNIQUE INDEX "Interview_threadId_key" ON "Interview"("threadId");

-- CreateIndex
CREATE UNIQUE INDEX "GrowthReport_matchId_key" ON "GrowthReport"("matchId");

-- CreateIndex
CREATE UNIQUE INDEX "FeedbackDraft_matchId_key" ON "FeedbackDraft"("matchId");

-- CreateIndex
CREATE UNIQUE INDEX "Provider_userId_key" ON "Provider"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Enrollment_programId_candidateId_key" ON "Enrollment"("programId", "candidateId");

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_userId_hat_key" ON "Subscription"("userId", "hat");

-- AddForeignKey
ALTER TABLE "ProductFeedback" ADD CONSTRAINT "ProductFeedback_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CandidateProfile" ADD CONSTRAINT "CandidateProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HardSkill" ADD CONSTRAINT "HardSkill_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "CandidateProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SoftSkillScore" ADD CONSTRAINT "SoftSkillScore_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "CandidateProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Endorsement" ADD CONSTRAINT "Endorsement_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "CandidateProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScenarioResult" ADD CONSTRAINT "ScenarioResult_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "CandidateProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Company" ADD CONSTRAINT "Company_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Opening" ADD CONSTRAINT "Opening_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "CandidateProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_openingId_fkey" FOREIGN KEY ("openingId") REFERENCES "Opening"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Thread" ADD CONSTRAINT "Thread_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "Match"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_threadId_fkey" FOREIGN KEY ("threadId") REFERENCES "Thread"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_fromUserId_fkey" FOREIGN KEY ("fromUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Interview" ADD CONSTRAINT "Interview_threadId_fkey" FOREIGN KEY ("threadId") REFERENCES "Thread"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GrowthReport" ADD CONSTRAINT "GrowthReport_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "Match"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FeedbackDraft" ADD CONSTRAINT "FeedbackDraft_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "Match"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScoreSheet" ADD CONSTRAINT "ScoreSheet_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "Match"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PipelineNote" ADD CONSTRAINT "PipelineNote_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "Match"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecruiterIntro" ADD CONSTRAINT "RecruiterIntro_recruiterId_fkey" FOREIGN KEY ("recruiterId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Provider" ADD CONSTRAINT "Provider_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Program" ADD CONSTRAINT "Program_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "Provider"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Enrollment" ADD CONSTRAINT "Enrollment_programId_fkey" FOREIGN KEY ("programId") REFERENCES "Program"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Enrollment" ADD CONSTRAINT "Enrollment_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "CandidateProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

