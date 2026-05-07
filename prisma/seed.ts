import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import bcrypt from "bcryptjs";

const adapter = new PrismaLibSql({ url: "file:dev.db" });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding database...");

  // Clean existing data
  await prisma.subscription.deleteMany();
  await prisma.skillGap.deleteMany();
  await prisma.application.deleteMany();
  await prisma.candidateProfile.deleteMany();
  await prisma.headhunterProfile.deleteMany();
  await prisma.jobRole.deleteMany();
  await prisma.user.deleteMany();
  await prisma.company.deleteMany();

  const hash = await bcrypt.hash("password123", 10);

  // Companies
  const acme = await prisma.company.create({
    data: { name: "Acme Corp", industry: "Technology" },
  });
  const globex = await prisma.company.create({
    data: { name: "Globex Industries", industry: "Finance" },
  });

  // Hiring Managers
  const hm1 = await prisma.user.create({
    data: {
      name: "Sarah Johnson",
      email: "sarah@acme.com",
      passwordHash: hash,
      role: "HIRING_MANAGER",
      companyId: acme.id,
    },
  });
  const hm2 = await prisma.user.create({
    data: {
      name: "Mike Chen",
      email: "mike@globex.com",
      passwordHash: hash,
      role: "HIRING_MANAGER",
      companyId: globex.id,
    },
  });

  // Headhunters
  const hh1 = await prisma.user.create({
    data: {
      name: "Alex Rivera",
      email: "alex@headhunt.com",
      passwordHash: hash,
      role: "HEADHUNTER",
    },
  });
  const hhProfile1 = await prisma.headhunterProfile.create({
    data: {
      userId: hh1.id,
      domainSpecializations: JSON.stringify(["Technology", "Engineering"]),
    },
  });

  const hh2 = await prisma.user.create({
    data: {
      name: "Jordan Lee",
      email: "jordan@recruit.co",
      passwordHash: hash,
      role: "HEADHUNTER",
    },
  });
  const hhProfile2 = await prisma.headhunterProfile.create({
    data: {
      userId: hh2.id,
      domainSpecializations: JSON.stringify(["Finance", "Data"]),
    },
  });

  const hh3 = await prisma.user.create({
    data: {
      name: "Casey Morgan",
      email: "casey@talent.io",
      passwordHash: hash,
      role: "HEADHUNTER",
    },
  });
  const hhProfile3 = await prisma.headhunterProfile.create({
    data: {
      userId: hh3.id,
      domainSpecializations: JSON.stringify(["Product", "Design"]),
    },
  });

  // Subscriptions
  // Acme Corp -> Professional
  await prisma.subscription.create({
    data: {
      companyId: acme.id,
      plan: "PROFESSIONAL",
      status: "ACTIVE",
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  });
  // Globex -> Starter (Free)
  await prisma.subscription.create({
    data: {
      companyId: globex.id,
      plan: "STARTER",
      status: "ACTIVE",
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  });
  // Alex (HH) -> Pro
  await prisma.subscription.create({
    data: {
      headhunterProfileId: hhProfile1.id,
      plan: "PRO",
      status: "ACTIVE",
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  });
  // Jordan (HH) -> Free
  await prisma.subscription.create({
    data: {
      headhunterProfileId: hhProfile2.id,
      plan: "FREE",
      status: "ACTIVE",
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  });
  // Casey (HH) -> Free
  await prisma.subscription.create({
    data: {
      headhunterProfileId: hhProfile3.id,
      plan: "FREE",
      status: "ACTIVE",
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  });

  // Candidates
  const candidateData = [
    {
      name: "Emily Zhang",
      email: "emily@example.com",
      bio: "Full-stack developer with 6 years of experience in React and Node.js",
      skills: [
        { name: "React", level: 5, category: "hard" },
        { name: "TypeScript", level: 4, category: "hard" },
        { name: "Node.js", level: 4, category: "hard" },
        { name: "PostgreSQL", level: 3, category: "hard" },
        { name: "AWS", level: 3, category: "hard" },
        { name: "Communication", level: 4, category: "soft" },
        { name: "Teamwork", level: 5, category: "soft" },
      ],
      experience: [
        { title: "Senior Developer", company: "TechCo", years: 3, description: "Led frontend team" },
        { title: "Developer", company: "StartupInc", years: 3, description: "Full-stack development" },
      ],
      education: [{ degree: "Bachelor of Computer Science", institution: "MIT", year: 2018 }],
    },
    {
      name: "James Park",
      email: "james@example.com",
      bio: "Data engineer specializing in large-scale data pipelines",
      skills: [
        { name: "Python", level: 5, category: "hard" },
        { name: "SQL", level: 5, category: "hard" },
        { name: "Spark", level: 4, category: "hard" },
        { name: "Airflow", level: 4, category: "hard" },
        { name: "AWS", level: 4, category: "hard" },
        { name: "Problem Solving", level: 5, category: "soft" },
        { name: "Leadership", level: 3, category: "soft" },
      ],
      experience: [
        { title: "Senior Data Engineer", company: "DataCorp", years: 4, description: "Built ETL pipelines" },
        { title: "Data Analyst", company: "AnalyticsCo", years: 2, description: "Data analysis" },
      ],
      education: [{ degree: "Master of Data Science", institution: "Stanford", year: 2017 }],
    },
    {
      name: "Sophia Martinez",
      email: "sophia@example.com",
      bio: "UX designer with a passion for accessible, user-centered products",
      skills: [
        { name: "Figma", level: 5, category: "hard" },
        { name: "User Research", level: 4, category: "hard" },
        { name: "Prototyping", level: 4, category: "hard" },
        { name: "CSS", level: 3, category: "hard" },
        { name: "Empathy", level: 5, category: "soft" },
        { name: "Communication", level: 5, category: "soft" },
      ],
      experience: [
        { title: "Lead UX Designer", company: "DesignStudio", years: 5, description: "Led UX team" },
      ],
      education: [{ degree: "Bachelor of Design", institution: "RISD", year: 2019 }],
    },
    {
      name: "David Kim",
      email: "david@example.com",
      bio: "Backend developer focused on microservices and cloud architecture",
      skills: [
        { name: "Go", level: 4, category: "hard" },
        { name: "Docker", level: 4, category: "hard" },
        { name: "Kubernetes", level: 3, category: "hard" },
        { name: "gRPC", level: 3, category: "hard" },
        { name: "PostgreSQL", level: 4, category: "hard" },
        { name: "Teamwork", level: 4, category: "soft" },
        { name: "Problem Solving", level: 4, category: "soft" },
      ],
      experience: [
        { title: "Backend Engineer", company: "CloudCo", years: 4, description: "Microservices" },
        { title: "Junior Developer", company: "WebDev", years: 2, description: "Web development" },
      ],
      education: [{ degree: "Bachelor of Computer Engineering", institution: "UC Berkeley", year: 2018 }],
    },
    {
      name: "Olivia Brown",
      email: "olivia@example.com",
      bio: "Product manager with technical background and startup experience",
      skills: [
        { name: "Product Strategy", level: 5, category: "hard" },
        { name: "Agile", level: 4, category: "hard" },
        { name: "SQL", level: 3, category: "hard" },
        { name: "Analytics", level: 4, category: "hard" },
        { name: "Leadership", level: 5, category: "soft" },
        { name: "Communication", level: 5, category: "soft" },
        { name: "Negotiation", level: 4, category: "soft" },
      ],
      experience: [
        { title: "Senior PM", company: "ProductCo", years: 3, description: "Led product team" },
        { title: "PM", company: "StartupXYZ", years: 3, description: "Product ownership" },
      ],
      education: [{ degree: "MBA", institution: "Harvard Business School", year: 2020 }],
    },
    {
      name: "Liam Wilson",
      email: "liam@example.com",
      bio: "Junior developer eager to learn and grow in React ecosystem",
      skills: [
        { name: "React", level: 2, category: "hard" },
        { name: "JavaScript", level: 3, category: "hard" },
        { name: "HTML/CSS", level: 3, category: "hard" },
        { name: "Teamwork", level: 4, category: "soft" },
        { name: "Communication", level: 3, category: "soft" },
      ],
      experience: [
        { title: "Intern", company: "WebAgency", years: 1, description: "Frontend development" },
      ],
      education: [{ degree: "Bachelor of IT", institution: "State University", year: 2024 }],
    },
    {
      name: "Ava Thompson",
      email: "ava@example.com",
      bio: "DevOps engineer with deep AWS and infrastructure experience",
      skills: [
        { name: "AWS", level: 5, category: "hard" },
        { name: "Terraform", level: 5, category: "hard" },
        { name: "Docker", level: 5, category: "hard" },
        { name: "Kubernetes", level: 4, category: "hard" },
        { name: "Python", level: 3, category: "hard" },
        { name: "Problem Solving", level: 5, category: "soft" },
        { name: "Communication", level: 4, category: "soft" },
      ],
      experience: [
        { title: "Senior DevOps", company: "InfraCo", years: 5, description: "Cloud infrastructure" },
        { title: "SysAdmin", company: "TechOrg", years: 3, description: "System administration" },
      ],
      education: [{ degree: "Bachelor of Computer Science", institution: "Georgia Tech", year: 2016 }],
    },
    {
      name: "Noah Anderson",
      email: "noah@example.com",
      bio: "Machine learning engineer focused on NLP and recommendation systems",
      skills: [
        { name: "Python", level: 5, category: "hard" },
        { name: "TensorFlow", level: 4, category: "hard" },
        { name: "NLP", level: 4, category: "hard" },
        { name: "SQL", level: 3, category: "hard" },
        { name: "Research", level: 4, category: "soft" },
        { name: "Problem Solving", level: 5, category: "soft" },
      ],
      experience: [
        { title: "ML Engineer", company: "AICorp", years: 3, description: "NLP models" },
        { title: "Research Assistant", company: "University Lab", years: 2, description: "ML research" },
      ],
      education: [{ degree: "PhD in Computer Science", institution: "CMU", year: 2021 }],
    },
    {
      name: "Mia Garcia",
      email: "mia@example.com",
      bio: "Frontend specialist with accessibility expertise",
      skills: [
        { name: "React", level: 4, category: "hard" },
        { name: "TypeScript", level: 4, category: "hard" },
        { name: "Accessibility", level: 5, category: "hard" },
        { name: "CSS", level: 5, category: "hard" },
        { name: "Empathy", level: 5, category: "soft" },
        { name: "Mentoring", level: 4, category: "soft" },
      ],
      experience: [
        { title: "Frontend Lead", company: "A11yCo", years: 4, description: "Led accessibility initiative" },
        { title: "Frontend Dev", company: "WebShop", years: 3, description: "Frontend development" },
      ],
      education: [{ degree: "Bachelor of Software Engineering", institution: "University of Michigan", year: 2017 }],
    },
    {
      name: "Ethan Davis",
      email: "ethan@example.com",
      bio: "Full-stack developer with strong React and Python skills",
      skills: [
        { name: "React", level: 4, category: "hard" },
        { name: "Python", level: 4, category: "hard" },
        { name: "TypeScript", level: 3, category: "hard" },
        { name: "Django", level: 4, category: "hard" },
        { name: "PostgreSQL", level: 3, category: "hard" },
        { name: "Teamwork", level: 4, category: "soft" },
        { name: "Communication", level: 4, category: "soft" },
      ],
      experience: [
        { title: "Full-Stack Dev", company: "DevAgency", years: 4, description: "Full-stack projects" },
        { title: "Junior Dev", company: "SmallCo", years: 2, description: "Web development" },
      ],
      education: [{ degree: "Bachelor of Computer Science", institution: "UCLA", year: 2020 }],
    },
  ];

  const candidateProfiles = [];
  for (const c of candidateData) {
    const user = await prisma.user.create({
      data: {
        name: c.name,
        email: c.email,
        passwordHash: hash,
        role: "CANDIDATE",
      },
    });
    const profile = await prisma.candidateProfile.create({
      data: {
        userId: user.id,
        bio: c.bio,
        skills: JSON.stringify(c.skills),
        experience: JSON.stringify(c.experience),
        education: JSON.stringify(c.education),
      },
    });
    candidateProfiles.push(profile);
  }

  // Roles
  const roles = [
    {
      title: "Senior React Developer",
      description:
        "We are looking for a senior React developer to lead our frontend team. You will architect and implement complex UI components, mentor junior developers, and collaborate with design and backend teams.",
      hardSkills: [
        { name: "React", level: 5, required: true },
        { name: "TypeScript", level: 4, required: true },
        { name: "Node.js", level: 3, required: false },
        { name: "PostgreSQL", level: 2, required: false },
        { name: "AWS", level: 2, required: false },
      ],
      softSkills: [
        { name: "Communication", level: 4 },
        { name: "Teamwork", level: 4 },
        { name: "Leadership", level: 3 },
      ],
      weights: { hardSkills: 40, softSkills: 25, experience: 25, education: 10 },
      threshold: 70,
      companyId: acme.id,
      createdById: hm1.id,
      status: "PUBLISHED",
    },
    {
      title: "Data Engineer",
      description:
        "Join our data team to build robust data pipelines. Experience with Spark, Airflow, and cloud platforms is essential.",
      hardSkills: [
        { name: "Python", level: 4, required: true },
        { name: "SQL", level: 5, required: true },
        { name: "Spark", level: 4, required: true },
        { name: "Airflow", level: 3, required: false },
        { name: "AWS", level: 3, required: false },
      ],
      softSkills: [
        { name: "Problem Solving", level: 4 },
        { name: "Communication", level: 3 },
      ],
      weights: { hardSkills: 45, softSkills: 15, experience: 30, education: 10 },
      threshold: 65,
      companyId: globex.id,
      createdById: hm2.id,
      status: "PUBLISHED",
    },
    {
      title: "UX Designer",
      description:
        "Design delightful user experiences for our B2B SaaS platform. User research and prototyping skills are a must.",
      hardSkills: [
        { name: "Figma", level: 4, required: true },
        { name: "User Research", level: 4, required: true },
        { name: "Prototyping", level: 3, required: true },
        { name: "CSS", level: 2, required: false },
      ],
      softSkills: [
        { name: "Empathy", level: 5 },
        { name: "Communication", level: 4 },
      ],
      weights: { hardSkills: 35, softSkills: 30, experience: 25, education: 10 },
      threshold: 70,
      companyId: acme.id,
      createdById: hm1.id,
      status: "PUBLISHED",
    },
    {
      title: "DevOps Engineer",
      description:
        "Manage our cloud infrastructure and CI/CD pipelines. Deep AWS and container experience required.",
      hardSkills: [
        { name: "AWS", level: 5, required: true },
        { name: "Docker", level: 4, required: true },
        { name: "Kubernetes", level: 4, required: true },
        { name: "Terraform", level: 3, required: false },
        { name: "Python", level: 2, required: false },
      ],
      softSkills: [
        { name: "Problem Solving", level: 4 },
        { name: "Communication", level: 3 },
      ],
      weights: { hardSkills: 45, softSkills: 15, experience: 30, education: 10 },
      threshold: 75,
      companyId: globex.id,
      createdById: hm2.id,
      status: "PUBLISHED",
    },
    {
      title: "Product Manager",
      description:
        "Own the product roadmap for our core platform. Looking for someone with technical understanding and strong stakeholder management.",
      hardSkills: [
        { name: "Product Strategy", level: 4, required: true },
        { name: "Agile", level: 4, required: true },
        { name: "Analytics", level: 3, required: false },
        { name: "SQL", level: 2, required: false },
      ],
      softSkills: [
        { name: "Leadership", level: 5 },
        { name: "Communication", level: 5 },
        { name: "Negotiation", level: 4 },
      ],
      weights: { hardSkills: 30, softSkills: 35, experience: 25, education: 10 },
      threshold: 70,
      companyId: acme.id,
      createdById: hm1.id,
      status: "PUBLISHED",
      claimedById: hhProfile1.id,
    },
  ];

  const createdRoles = [];
  for (const r of roles) {
    const role = await prisma.jobRole.create({
      data: {
        title: r.title,
        description: r.description,
        hardSkills: JSON.stringify(r.hardSkills),
        softSkills: JSON.stringify(r.softSkills),
        weights: JSON.stringify(r.weights),
        threshold: r.threshold,
        companyId: r.companyId,
        createdById: r.createdById,
        status: r.status,
        claimedById: r.claimedById || null,
      },
    });
    createdRoles.push(role);
  }

  // Create applications with match scoring
  const { computeMatchScore } = await import("../src/lib/matching/engine");

  const applicationPairs = [
    { candidateIdx: 0, roleIdx: 0 }, // Emily -> Senior React Dev
    { candidateIdx: 0, roleIdx: 1 }, // Emily -> Data Engineer
    { candidateIdx: 1, roleIdx: 1 }, // James -> Data Engineer
    { candidateIdx: 2, roleIdx: 2 }, // Sophia -> UX Designer
    { candidateIdx: 3, roleIdx: 0 }, // David -> Senior React Dev
    { candidateIdx: 4, roleIdx: 4 }, // Olivia -> Product Manager (via HH)
    { candidateIdx: 5, roleIdx: 0 }, // Liam -> Senior React Dev
    { candidateIdx: 6, roleIdx: 3 }, // Ava -> DevOps
    { candidateIdx: 7, roleIdx: 1 }, // Noah -> Data Engineer
    { candidateIdx: 8, roleIdx: 0 }, // Mia -> Senior React Dev
    { candidateIdx: 8, roleIdx: 2 }, // Mia -> UX Designer
    { candidateIdx: 9, roleIdx: 0 }, // Ethan -> Senior React Dev
    { candidateIdx: 9, roleIdx: 1 }, // Ethan -> Data Engineer
    { candidateIdx: 1, roleIdx: 3 }, // James -> DevOps
    { candidateIdx: 3, roleIdx: 3 }, // David -> DevOps
    { candidateIdx: 4, roleIdx: 2 }, // Olivia -> UX Designer
    { candidateIdx: 5, roleIdx: 2 }, // Liam -> UX Designer
    { candidateIdx: 6, roleIdx: 1 }, // Ava -> Data Engineer
    { candidateIdx: 7, roleIdx: 4 }, // Noah -> Product Manager
    { candidateIdx: 2, roleIdx: 4 }, // Sophia -> Product Manager
  ];

  for (const pair of applicationPairs) {
    const candidate = candidateProfiles[pair.candidateIdx];
    const role = createdRoles[pair.roleIdx];

    const candidateSkills = JSON.parse(candidate.skills);
    const candidateExperience = JSON.parse(candidate.experience);
    const candidateEducation = JSON.parse(candidate.education);

    const result = computeMatchScore(
      { skills: candidateSkills, experience: candidateExperience, education: candidateEducation },
      {
        hardSkills: JSON.parse(role.hardSkills),
        softSkills: JSON.parse(role.softSkills),
        weights: JSON.parse(role.weights),
      }
    );

    const stage = result.overallScore >= role.threshold ? "SHORTLISTED" : "APPLIED";

    const isHHSubmission = pair.roleIdx === 4 && pair.candidateIdx === 4;

    const auditLog = [
      {
        timestamp: new Date().toISOString(),
        action: "Application created",
        actor: isHHSubmission ? "Alex Rivera" : "System",
        details: `Match score: ${result.overallScore}%`,
      },
      ...(stage === "SHORTLISTED"
        ? [
            {
              timestamp: new Date().toISOString(),
              action: "Auto-shortlisted",
              actor: "System",
              details: `Score ${result.overallScore}% >= threshold ${role.threshold}%`,
            },
          ]
        : []),
    ];

    const app = await prisma.application.create({
      data: {
        candidateId: candidate.id,
        roleId: role.id,
        headhunterId: isHHSubmission ? hhProfile1.id : null,
        matchScore: result.overallScore,
        scoreBreakdown: JSON.stringify(result.dimensions),
        stage,
        auditLog: JSON.stringify(auditLog),
      },
    });

    // Create skill gap records
    for (const gap of result.skillGaps) {
      await prisma.skillGap.create({
        data: {
          applicationId: app.id,
          skill: gap.skill,
          category: gap.category,
          currentLevel: gap.currentLevel,
          requiredLevel: gap.requiredLevel,
          status: gap.status,
          recommendations: JSON.stringify(gap.recommendations),
        },
      });
    }
  }

  console.log("Seed completed!");
  console.log(`Created: 2 companies, ${createdRoles.length} roles, ${candidateProfiles.length} candidates, 3 headhunters, ${applicationPairs.length} applications`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
