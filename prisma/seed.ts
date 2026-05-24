import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import bcrypt from "bcryptjs";

const adapter = new PrismaLibSql({ url: "file:dev.db" });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding database...");

  // Clean existing data
  await prisma.contract.deleteMany();
  await prisma.placement.deleteMany();
  await prisma.milestoneCharge.deleteMany();
  await prisma.milestoneFee.deleteMany();
  await prisma.message.deleteMany();
  await prisma.skillSnapshot.deleteMany();
  await prisma.platformConfig.deleteMany();
  await prisma.subscription.deleteMany();
  await prisma.skillGap.deleteMany();
  await prisma.application.deleteMany();
  await prisma.candidateProfile.deleteMany();
  await prisma.headhunterProfile.deleteMany();
  await prisma.jobRole.deleteMany();
  await prisma.user.deleteMany();
  await prisma.company.deleteMany();

  // Create default platform config
  await prisma.platformConfig.create({ data: {} });

  const hash = await bcrypt.hash("password123", 10);

  // Admin user
  await prisma.user.create({
    data: { name: "Admin", email: "admin@holicruit.com", passwordHash: hash, role: "ADMIN" },
  });

  // Companies across domains
  const acme = await prisma.company.create({ data: { name: "Acme Tech", industry: "Technology" } });
  const globex = await prisma.company.create({ data: { name: "Globex Finance", industry: "Finance" } });
  const medica = await prisma.company.create({ data: { name: "MediCare Plus", industry: "Healthcare" } });
  const brandCo = await prisma.company.create({ data: { name: "BrandForce", industry: "Marketing & Advertising" } });
  const greenEng = await prisma.company.create({ data: { name: "GreenField Engineering", industry: "Engineering & Construction" } });
  const lexCorp = await prisma.company.create({ data: { name: "LexCorp Legal", industry: "Legal" } });

  // Hiring Managers
  const hm1 = await prisma.user.create({ data: { name: "Sarah Johnson", email: "sarah@acme.com", passwordHash: hash, role: "HIRING_MANAGER", companyId: acme.id } });
  const hm2 = await prisma.user.create({ data: { name: "Mike Chen", email: "mike@globex.com", passwordHash: hash, role: "HIRING_MANAGER", companyId: globex.id } });
  const hm3 = await prisma.user.create({ data: { name: "Dr. Lisa Park", email: "lisa@medicare.com", passwordHash: hash, role: "HIRING_MANAGER", companyId: medica.id } });
  const hm4 = await prisma.user.create({ data: { name: "Tom Bradley", email: "tom@brandforce.com", passwordHash: hash, role: "HIRING_MANAGER", companyId: brandCo.id } });
  const hm5 = await prisma.user.create({ data: { name: "Anna Schmidt", email: "anna@greenfield.com", passwordHash: hash, role: "HIRING_MANAGER", companyId: greenEng.id } });
  const hm6 = await prisma.user.create({ data: { name: "James Wright", email: "james@lexcorp.com", passwordHash: hash, role: "HIRING_MANAGER", companyId: lexCorp.id } });

  // Alias HM for easy testing
  await prisma.user.create({ data: { name: "Alice (HM alias)", email: "alice@example.com", passwordHash: hash, role: "HIRING_MANAGER", companyId: acme.id } });

  // Headhunters
  const hh1 = await prisma.user.create({ data: { name: "Alex Rivera", email: "alex@headhunt.com", passwordHash: hash, role: "HEADHUNTER" } });
  const hhProfile1 = await prisma.headhunterProfile.create({ data: { userId: hh1.id, domainSpecializations: JSON.stringify(["Technology", "Engineering"]) } });

  const hh2 = await prisma.user.create({ data: { name: "Jordan Lee", email: "jordan@recruit.co", passwordHash: hash, role: "HEADHUNTER" } });
  const hhProfile2 = await prisma.headhunterProfile.create({ data: { userId: hh2.id, domainSpecializations: JSON.stringify(["Finance", "Legal"]) } });

  const hh3 = await prisma.user.create({ data: { name: "Casey Morgan", email: "casey@talent.io", passwordHash: hash, role: "HEADHUNTER" } });
  const hhProfile3 = await prisma.headhunterProfile.create({ data: { userId: hh3.id, domainSpecializations: JSON.stringify(["Healthcare", "Marketing"]) } });

  // Subscriptions
  for (const companyId of [acme.id, globex.id, medica.id, brandCo.id, greenEng.id, lexCorp.id]) {
    await prisma.subscription.create({
      data: { companyId, plan: "PROFESSIONAL", status: "ACTIVE", currentPeriodStart: new Date(), currentPeriodEnd: new Date(Date.now() + 30 * 86400000) },
    });
  }
  for (const hhp of [hhProfile1, hhProfile2, hhProfile3]) {
    await prisma.subscription.create({
      data: { headhunterProfileId: hhp.id, plan: "PRO", status: "ACTIVE", currentPeriodStart: new Date(), currentPeriodEnd: new Date(Date.now() + 30 * 86400000) },
    });
  }

  // Candidates across domains
  const candidateData = [
    // Tech
    { name: "Emily Zhang", email: "emily@example.com", bio: "Full-stack developer with 6 years in React/Node.js", skills: [
      { name: "React", level: 5, category: "hard" }, { name: "TypeScript", level: 4, category: "hard" }, { name: "Node.js", level: 4, category: "hard" }, { name: "PostgreSQL", level: 3, category: "hard" }, { name: "AWS", level: 3, category: "hard" },
      { name: "Communication", level: 4, category: "soft" }, { name: "Teamwork", level: 5, category: "soft" }, { name: "Leadership", level: 3, category: "soft" },
    ], experience: [{ title: "Senior Developer", company: "TechCo", years: 3 }, { title: "Developer", company: "StartupInc", years: 3 }], education: [{ degree: "BSc Computer Science", institution: "MIT", year: 2018 }] },
    { name: "James Park", email: "james@example.com", bio: "Data engineer specializing in large-scale pipelines", skills: [
      { name: "Python", level: 5, category: "hard" }, { name: "SQL", level: 5, category: "hard" }, { name: "Spark", level: 4, category: "hard" }, { name: "Airflow", level: 4, category: "hard" }, { name: "AWS", level: 4, category: "hard" },
      { name: "Problem Solving", level: 5, category: "soft" }, { name: "Leadership", level: 3, category: "soft" }, { name: "Communication", level: 3, category: "soft" },
    ], experience: [{ title: "Senior Data Engineer", company: "DataCorp", years: 4 }], education: [{ degree: "MSc Data Science", institution: "Stanford", year: 2017 }] },
    { name: "Mia Garcia", email: "mia@example.com", bio: "Frontend specialist with accessibility expertise", skills: [
      { name: "React", level: 4, category: "hard" }, { name: "TypeScript", level: 4, category: "hard" }, { name: "Accessibility", level: 5, category: "hard" }, { name: "CSS", level: 5, category: "hard" },
      { name: "Empathy", level: 5, category: "soft" }, { name: "Mentoring", level: 4, category: "soft" }, { name: "Communication", level: 4, category: "soft" },
    ], experience: [{ title: "Frontend Lead", company: "A11yCo", years: 4 }], education: [{ degree: "BSc Software Engineering", institution: "U of Michigan", year: 2017 }] },
    { name: "Ava Thompson", email: "ava@example.com", bio: "DevOps engineer with deep AWS and infra experience", skills: [
      { name: "AWS", level: 5, category: "hard" }, { name: "Terraform", level: 5, category: "hard" }, { name: "Docker", level: 5, category: "hard" }, { name: "Kubernetes", level: 4, category: "hard" }, { name: "Python", level: 3, category: "hard" },
      { name: "Problem Solving", level: 5, category: "soft" }, { name: "Communication", level: 4, category: "soft" }, { name: "Teamwork", level: 4, category: "soft" },
    ], experience: [{ title: "Senior DevOps", company: "InfraCo", years: 5 }], education: [{ degree: "BSc Computer Science", institution: "Georgia Tech", year: 2016 }] },
    // Finance
    { name: "Robert Hayes", email: "robert@example.com", bio: "Financial analyst with CFA and risk modeling expertise", skills: [
      { name: "Financial Modeling", level: 5, category: "hard" }, { name: "Excel", level: 5, category: "hard" }, { name: "Python", level: 3, category: "hard" }, { name: "Bloomberg Terminal", level: 4, category: "hard" }, { name: "Risk Analysis", level: 4, category: "hard" },
      { name: "Analytical Thinking", level: 5, category: "soft" }, { name: "Attention to Detail", level: 5, category: "soft" }, { name: "Communication", level: 4, category: "soft" },
    ], experience: [{ title: "Senior Financial Analyst", company: "Goldman Sachs", years: 4 }], education: [{ degree: "MBA Finance", institution: "Wharton", year: 2019 }] },
    { name: "Nina Patel", email: "nina@example.com", bio: "Compliance officer specializing in AML and regulatory frameworks", skills: [
      { name: "AML/KYC", level: 5, category: "hard" }, { name: "Regulatory Compliance", level: 5, category: "hard" }, { name: "Risk Assessment", level: 4, category: "hard" }, { name: "SAR Filing", level: 4, category: "hard" },
      { name: "Attention to Detail", level: 5, category: "soft" }, { name: "Communication", level: 4, category: "soft" }, { name: "Integrity", level: 5, category: "soft" },
    ], experience: [{ title: "Compliance Manager", company: "HSBC", years: 6 }], education: [{ degree: "JD", institution: "NYU Law", year: 2016 }] },
    // Healthcare
    { name: "Dr. Maria Santos", email: "maria@example.com", bio: "Clinical research coordinator with GCP expertise", skills: [
      { name: "Clinical Trials", level: 5, category: "hard" }, { name: "GCP/ICH", level: 5, category: "hard" }, { name: "Data Collection", level: 4, category: "hard" }, { name: "SPSS", level: 3, category: "hard" }, { name: "Protocol Design", level: 4, category: "hard" },
      { name: "Empathy", level: 5, category: "soft" }, { name: "Attention to Detail", level: 5, category: "soft" }, { name: "Communication", level: 4, category: "soft" },
    ], experience: [{ title: "Clinical Research Coordinator", company: "Mayo Clinic", years: 5 }], education: [{ degree: "MD", institution: "Johns Hopkins", year: 2018 }] },
    { name: "Kevin O'Brien", email: "kevin@example.com", bio: "Healthcare IT specialist — EHR implementation and integration", skills: [
      { name: "EHR Systems", level: 5, category: "hard" }, { name: "HL7/FHIR", level: 4, category: "hard" }, { name: "SQL", level: 4, category: "hard" }, { name: "Project Management", level: 4, category: "hard" },
      { name: "Problem Solving", level: 4, category: "soft" }, { name: "Teamwork", level: 4, category: "soft" }, { name: "Communication", level: 5, category: "soft" },
    ], experience: [{ title: "Healthcare IT Lead", company: "Epic Systems", years: 6 }], education: [{ degree: "BSc Health Informatics", institution: "U of Wisconsin", year: 2015 }] },
    // Marketing
    { name: "Sophie Laurent", email: "sophie@example.com", bio: "Digital marketing strategist with brand building focus", skills: [
      { name: "Digital Marketing", level: 5, category: "hard" }, { name: "SEO/SEM", level: 4, category: "hard" }, { name: "Google Analytics", level: 5, category: "hard" }, { name: "Content Strategy", level: 4, category: "hard" }, { name: "Social Media", level: 4, category: "hard" },
      { name: "Creativity", level: 5, category: "soft" }, { name: "Communication", level: 5, category: "soft" }, { name: "Leadership", level: 3, category: "soft" },
    ], experience: [{ title: "Marketing Manager", company: "Ogilvy", years: 5 }], education: [{ degree: "BA Marketing", institution: "Northwestern", year: 2018 }] },
    { name: "Chris Nakamura", email: "chris@example.com", bio: "Graphic designer and brand identity specialist", skills: [
      { name: "Adobe Creative Suite", level: 5, category: "hard" }, { name: "Figma", level: 4, category: "hard" }, { name: "Brand Identity", level: 5, category: "hard" }, { name: "Typography", level: 4, category: "hard" },
      { name: "Creativity", level: 5, category: "soft" }, { name: "Attention to Detail", level: 5, category: "soft" }, { name: "Client Management", level: 4, category: "soft" },
    ], experience: [{ title: "Senior Designer", company: "Pentagram", years: 4 }], education: [{ degree: "BFA Graphic Design", institution: "RISD", year: 2019 }] },
    // Engineering & Construction
    { name: "Marcus Johnson", email: "marcus@example.com", bio: "Civil engineer specializing in sustainable infrastructure", skills: [
      { name: "AutoCAD", level: 5, category: "hard" }, { name: "Structural Analysis", level: 4, category: "hard" }, { name: "Project Management", level: 4, category: "hard" }, { name: "BIM/Revit", level: 4, category: "hard" }, { name: "Sustainability", level: 3, category: "hard" },
      { name: "Leadership", level: 4, category: "soft" }, { name: "Teamwork", level: 5, category: "soft" }, { name: "Problem Solving", level: 4, category: "soft" },
    ], experience: [{ title: "Senior Civil Engineer", company: "AECOM", years: 7 }], education: [{ degree: "MSc Civil Engineering", institution: "Georgia Tech", year: 2016 }] },
    // Legal
    { name: "Diana Reeves", email: "diana@example.com", bio: "Corporate lawyer with M&A and contract negotiation expertise", skills: [
      { name: "Contract Law", level: 5, category: "hard" }, { name: "M&A", level: 4, category: "hard" }, { name: "Due Diligence", level: 5, category: "hard" }, { name: "Legal Research", level: 4, category: "hard" },
      { name: "Negotiation", level: 5, category: "soft" }, { name: "Analytical Thinking", level: 5, category: "soft" }, { name: "Communication", level: 5, category: "soft" }, { name: "Integrity", level: 5, category: "soft" },
    ], experience: [{ title: "Senior Associate", company: "Skadden", years: 6 }], education: [{ degree: "JD", institution: "Yale Law", year: 2017 }] },
    // Product/UX
    { name: "Sophia Martinez", email: "sophia@example.com", bio: "UX designer passionate about accessible design", skills: [
      { name: "Figma", level: 5, category: "hard" }, { name: "User Research", level: 4, category: "hard" }, { name: "Prototyping", level: 4, category: "hard" }, { name: "CSS", level: 3, category: "hard" },
      { name: "Empathy", level: 5, category: "soft" }, { name: "Communication", level: 5, category: "soft" }, { name: "Creativity", level: 4, category: "soft" },
    ], experience: [{ title: "Lead UX Designer", company: "DesignStudio", years: 5 }], education: [{ degree: "BFA Design", institution: "RISD", year: 2019 }] },
    { name: "Olivia Brown", email: "olivia@example.com", bio: "Product manager with technical background and startup experience", skills: [
      { name: "Product Strategy", level: 5, category: "hard" }, { name: "Agile", level: 4, category: "hard" }, { name: "SQL", level: 3, category: "hard" }, { name: "Analytics", level: 4, category: "hard" },
      { name: "Leadership", level: 5, category: "soft" }, { name: "Communication", level: 5, category: "soft" }, { name: "Negotiation", level: 4, category: "soft" },
    ], experience: [{ title: "Senior PM", company: "ProductCo", years: 3 }], education: [{ degree: "MBA", institution: "HBS", year: 2020 }] },
    { name: "Liam Wilson", email: "liam@example.com", bio: "Junior developer eager to grow in React ecosystem", skills: [
      { name: "React", level: 2, category: "hard" }, { name: "JavaScript", level: 3, category: "hard" }, { name: "HTML/CSS", level: 3, category: "hard" },
      { name: "Teamwork", level: 4, category: "soft" }, { name: "Communication", level: 3, category: "soft" },
    ], experience: [{ title: "Intern", company: "WebAgency", years: 1 }], education: [{ degree: "BSc IT", institution: "State University", year: 2024 }] },
  ];

  const candidateProfiles = [];
  for (const c of candidateData) {
    const user = await prisma.user.create({ data: { name: c.name, email: c.email, passwordHash: hash, role: "CANDIDATE" } });
    const profile = await prisma.candidateProfile.create({
      data: { userId: user.id, bio: c.bio, skills: JSON.stringify(c.skills), experience: JSON.stringify(c.experience), education: JSON.stringify(c.education) },
    });
    candidateProfiles.push(profile);
  }

  // Roles across domains, types, and engagement models
  const roles = [
    // Tech - permanent
    { title: "Senior React Developer", description: "Lead our frontend team, architect complex UI components, mentor juniors.",
      hardSkills: [{ name: "React", level: 5, required: true }, { name: "TypeScript", level: 4, required: true }, { name: "Node.js", level: 3 }, { name: "PostgreSQL", level: 2 }, { name: "AWS", level: 2 }],
      softSkills: [{ name: "Communication", level: 4 }, { name: "Teamwork", level: 4 }, { name: "Leadership", level: 3 }],
      weights: { hardSkills: 40, softSkills: 25, experience: 25, education: 10 }, threshold: 70,
      companyId: acme.id, createdById: hm1.id, status: "PUBLISHED", roleType: "PERMANENT" },
    // Tech - contract
    { title: "Cloud Migration Specialist", description: "3-month engagement to migrate on-prem workloads to AWS. Hands-on Terraform and Docker work.",
      hardSkills: [{ name: "AWS", level: 5, required: true }, { name: "Terraform", level: 4, required: true }, { name: "Docker", level: 4, required: true }, { name: "Kubernetes", level: 3 }, { name: "Python", level: 2 }],
      softSkills: [{ name: "Problem Solving", level: 4 }, { name: "Communication", level: 3 }, { name: "Teamwork", level: 3 }],
      weights: { hardSkills: 50, softSkills: 15, experience: 30, education: 5 }, threshold: 70,
      companyId: acme.id, createdById: hm1.id, status: "PUBLISHED", roleType: "CONTRACT_SHORT",
      contractStart: new Date("2026-07-01"), contractEnd: new Date("2026-09-30"), rateAmount: 85000, rateType: "DAILY" },
    // Finance - permanent
    { title: "Senior Financial Analyst", description: "Build financial models, support M&A due diligence, present to C-suite.",
      hardSkills: [{ name: "Financial Modeling", level: 5, required: true }, { name: "Excel", level: 5, required: true }, { name: "Bloomberg Terminal", level: 3 }, { name: "Python", level: 2 }, { name: "Risk Analysis", level: 3 }],
      softSkills: [{ name: "Analytical Thinking", level: 5 }, { name: "Attention to Detail", level: 4 }, { name: "Communication", level: 4 }],
      weights: { hardSkills: 40, softSkills: 25, experience: 25, education: 10 }, threshold: 65,
      companyId: globex.id, createdById: hm2.id, status: "PUBLISHED", roleType: "PERMANENT" },
    // Finance - project-bound
    { title: "Regulatory Compliance Audit (Basel IV)", description: "Project-bound: audit current risk frameworks against Basel IV requirements. Deliverable: gap report + remediation roadmap.",
      hardSkills: [{ name: "Regulatory Compliance", level: 5, required: true }, { name: "Risk Assessment", level: 4, required: true }, { name: "AML/KYC", level: 3 }, { name: "SAR Filing", level: 2 }],
      softSkills: [{ name: "Attention to Detail", level: 5 }, { name: "Communication", level: 4 }, { name: "Integrity", level: 5 }],
      weights: { hardSkills: 45, softSkills: 25, experience: 25, education: 5 }, threshold: 70,
      companyId: globex.id, createdById: hm2.id, status: "PUBLISHED", roleType: "PROJECT",
      contractStart: new Date("2026-06-15"), contractEnd: new Date("2026-08-15"), rateAmount: 120000, rateType: "DAILY" },
    // Healthcare - contract
    { title: "Clinical Trial Coordinator (Phase III)", description: "6-month contract to coordinate a Phase III oncology trial. GCP certification required.",
      hardSkills: [{ name: "Clinical Trials", level: 5, required: true }, { name: "GCP/ICH", level: 5, required: true }, { name: "Data Collection", level: 4 }, { name: "Protocol Design", level: 3 }, { name: "SPSS", level: 2 }],
      softSkills: [{ name: "Empathy", level: 4 }, { name: "Attention to Detail", level: 5 }, { name: "Communication", level: 4 }],
      weights: { hardSkills: 40, softSkills: 20, experience: 30, education: 10 }, threshold: 75,
      companyId: medica.id, createdById: hm3.id, status: "PUBLISHED", roleType: "CONTRACT_LONG",
      contractStart: new Date("2026-07-01"), contractEnd: new Date("2027-01-01"), rateAmount: 65000, rateType: "DAILY" },
    // Healthcare - permanent
    { title: "EHR Implementation Lead", description: "Lead the rollout of our new EHR system across 12 clinics. HL7/FHIR integration experience required.",
      hardSkills: [{ name: "EHR Systems", level: 5, required: true }, { name: "HL7/FHIR", level: 4, required: true }, { name: "SQL", level: 3 }, { name: "Project Management", level: 4 }],
      softSkills: [{ name: "Communication", level: 5 }, { name: "Teamwork", level: 4 }, { name: "Problem Solving", level: 4 }],
      weights: { hardSkills: 40, softSkills: 25, experience: 25, education: 10 }, threshold: 70,
      companyId: medica.id, createdById: hm3.id, status: "PUBLISHED", roleType: "PERMANENT" },
    // Marketing - contract
    { title: "Brand Relaunch Campaign Manager", description: "3-6 month engagement to plan and execute our brand relaunch across digital channels.",
      hardSkills: [{ name: "Digital Marketing", level: 5, required: true }, { name: "Content Strategy", level: 4, required: true }, { name: "SEO/SEM", level: 3 }, { name: "Google Analytics", level: 4 }, { name: "Social Media", level: 3 }],
      softSkills: [{ name: "Creativity", level: 5 }, { name: "Communication", level: 5 }, { name: "Leadership", level: 3 }],
      weights: { hardSkills: 35, softSkills: 30, experience: 25, education: 10 }, threshold: 65,
      companyId: brandCo.id, createdById: hm4.id, status: "PUBLISHED", roleType: "CONTRACT_MEDIUM",
      contractStart: new Date("2026-06-01"), contractEnd: new Date("2026-11-30"), rateAmount: 70000, rateType: "DAILY" },
    // Marketing - project
    { title: "Visual Identity Redesign", description: "Project-bound: redesign our complete visual identity — logo, typography, color system, brand guidelines.",
      hardSkills: [{ name: "Brand Identity", level: 5, required: true }, { name: "Adobe Creative Suite", level: 5, required: true }, { name: "Typography", level: 4 }, { name: "Figma", level: 3 }],
      softSkills: [{ name: "Creativity", level: 5 }, { name: "Client Management", level: 4 }, { name: "Attention to Detail", level: 4 }],
      weights: { hardSkills: 45, softSkills: 25, experience: 25, education: 5 }, threshold: 70,
      companyId: brandCo.id, createdById: hm4.id, status: "PUBLISHED", roleType: "PROJECT",
      contractStart: new Date("2026-07-01"), contractEnd: new Date("2026-10-01"), rateAmount: 75000, rateType: "DAILY" },
    // Engineering - permanent
    { title: "Senior Civil Engineer (Sustainability)", description: "Lead sustainable infrastructure projects. AutoCAD and BIM experience essential.",
      hardSkills: [{ name: "AutoCAD", level: 5, required: true }, { name: "Structural Analysis", level: 4, required: true }, { name: "BIM/Revit", level: 4 }, { name: "Sustainability", level: 3 }, { name: "Project Management", level: 3 }],
      softSkills: [{ name: "Leadership", level: 4 }, { name: "Teamwork", level: 4 }, { name: "Problem Solving", level: 4 }],
      weights: { hardSkills: 45, softSkills: 20, experience: 25, education: 10 }, threshold: 70,
      companyId: greenEng.id, createdById: hm5.id, status: "PUBLISHED", roleType: "PERMANENT" },
    // Engineering - contract
    { title: "Site Safety Inspector (Bridge Project)", description: "2-month on-site safety inspection for the Riverside Bridge retrofit.",
      hardSkills: [{ name: "Structural Analysis", level: 4, required: true }, { name: "AutoCAD", level: 3 }, { name: "Project Management", level: 3 }],
      softSkills: [{ name: "Attention to Detail", level: 5 }, { name: "Communication", level: 4 }, { name: "Problem Solving", level: 4 }],
      weights: { hardSkills: 40, softSkills: 25, experience: 30, education: 5 }, threshold: 60,
      companyId: greenEng.id, createdById: hm5.id, status: "PUBLISHED", roleType: "CONTRACT_SHORT",
      contractStart: new Date("2026-08-01"), contractEnd: new Date("2026-09-30"), rateAmount: 60000, rateType: "DAILY" },
    // Legal - permanent
    { title: "Corporate M&A Associate", description: "Handle M&A transactions, due diligence, and contract negotiations for mid-market deals.",
      hardSkills: [{ name: "M&A", level: 4, required: true }, { name: "Contract Law", level: 5, required: true }, { name: "Due Diligence", level: 4 }, { name: "Legal Research", level: 3 }],
      softSkills: [{ name: "Negotiation", level: 5 }, { name: "Analytical Thinking", level: 5 }, { name: "Communication", level: 4 }, { name: "Integrity", level: 5 }],
      weights: { hardSkills: 35, softSkills: 30, experience: 25, education: 10 }, threshold: 70,
      companyId: lexCorp.id, createdById: hm6.id, status: "PUBLISHED", roleType: "PERMANENT" },
    // Tech - project
    { title: "Data Pipeline Modernization", description: "Project: Replace legacy ETL with modern Spark/Airflow stack. 4-month deliverable with knowledge transfer.",
      hardSkills: [{ name: "Spark", level: 4, required: true }, { name: "Airflow", level: 4, required: true }, { name: "Python", level: 4, required: true }, { name: "SQL", level: 4 }, { name: "AWS", level: 3 }],
      softSkills: [{ name: "Problem Solving", level: 4 }, { name: "Communication", level: 3 }, { name: "Leadership", level: 3 }],
      weights: { hardSkills: 45, softSkills: 15, experience: 30, education: 10 }, threshold: 70,
      companyId: acme.id, createdById: hm1.id, status: "PUBLISHED", roleType: "PROJECT",
      contractStart: new Date("2026-06-01"), contractEnd: new Date("2026-10-01"), rateAmount: 95000, rateType: "DAILY" },
  ];

  const createdRoles = [];
  for (const r of roles) {
    const role = await prisma.jobRole.create({
      data: {
        title: r.title, description: r.description,
        hardSkills: JSON.stringify(r.hardSkills), softSkills: JSON.stringify(r.softSkills),
        weights: JSON.stringify(r.weights), threshold: r.threshold,
        companyId: r.companyId, createdById: r.createdById,
        status: r.status, roleType: r.roleType || "PERMANENT",
        contractStart: (r as any).contractStart || null,
        contractEnd: (r as any).contractEnd || null,
        rateAmount: (r as any).rateAmount || null,
        rateType: (r as any).rateType || null,
        claimedById: (r as any).claimedById || null,
      },
    });
    createdRoles.push(role);
  }

  // Claim some roles for headhunters
  await prisma.jobRole.update({ where: { id: createdRoles[0].id }, data: { claimedById: hhProfile1.id } }); // Tech role -> Alex
  await prisma.jobRole.update({ where: { id: createdRoles[2].id }, data: { claimedById: hhProfile2.id } }); // Finance role -> Jordan
  await prisma.jobRole.update({ where: { id: createdRoles[4].id }, data: { claimedById: hhProfile3.id } }); // Healthcare role -> Casey

  // Create applications with match scoring
  const { computeMatchScore } = await import("../src/lib/matching/engine");

  const applicationPairs = [
    // Tech roles
    { candidateIdx: 0, roleIdx: 0 },  // Emily -> Senior React Dev
    { candidateIdx: 2, roleIdx: 0 },  // Mia -> Senior React Dev
    { candidateIdx: 14, roleIdx: 0 }, // Liam -> Senior React Dev
    { candidateIdx: 3, roleIdx: 1 },  // Ava -> Cloud Migration
    { candidateIdx: 1, roleIdx: 11 }, // James -> Data Pipeline Project
    // Finance roles
    { candidateIdx: 4, roleIdx: 2 },  // Robert -> Financial Analyst
    { candidateIdx: 5, roleIdx: 3 },  // Nina -> Compliance Audit
    // Healthcare roles
    { candidateIdx: 6, roleIdx: 4 },  // Maria -> Clinical Trial
    { candidateIdx: 7, roleIdx: 5 },  // Kevin -> EHR Implementation
    // Marketing roles
    { candidateIdx: 8, roleIdx: 6 },  // Sophie -> Brand Relaunch
    { candidateIdx: 9, roleIdx: 7 },  // Chris -> Visual Identity
    // Engineering roles
    { candidateIdx: 10, roleIdx: 8 }, // Marcus -> Civil Engineer
    { candidateIdx: 10, roleIdx: 9 }, // Marcus -> Safety Inspector
    // Legal roles
    { candidateIdx: 11, roleIdx: 10 }, // Diana -> M&A Associate
    // Cross-domain applications
    { candidateIdx: 13, roleIdx: 6 }, // Olivia -> Brand Relaunch
    { candidateIdx: 0, roleIdx: 11 }, // Emily -> Data Pipeline
    { candidateIdx: 1, roleIdx: 1 },  // James -> Cloud Migration
    { candidateIdx: 12, roleIdx: 7 }, // Sophia -> Visual Identity
  ];

  for (const pair of applicationPairs) {
    const candidate = candidateProfiles[pair.candidateIdx];
    const role = createdRoles[pair.roleIdx];

    const candidateSkills = JSON.parse(candidate.skills);
    const candidateExperience = JSON.parse(candidate.experience);
    const candidateEducation = JSON.parse(candidate.education);

    const result = computeMatchScore(
      { skills: candidateSkills, experience: candidateExperience, education: candidateEducation },
      { hardSkills: JSON.parse(role.hardSkills), softSkills: JSON.parse(role.softSkills), weights: JSON.parse(role.weights) }
    );

    const stage = result.overallScore >= role.threshold ? "SHORTLISTED" : "APPLIED";

    const auditLog = [
      { timestamp: new Date().toISOString(), action: "Application created", actor: "System", details: `Match score: ${result.overallScore}%` },
      ...(stage === "SHORTLISTED" ? [{ timestamp: new Date().toISOString(), action: "Auto-shortlisted", actor: "System", details: `Score ${result.overallScore}% >= threshold ${role.threshold}%` }] : []),
    ];

    const app = await prisma.application.create({
      data: { candidateId: candidate.id, roleId: role.id, matchScore: result.overallScore, scoreBreakdown: JSON.stringify(result.dimensions), stage, auditLog: JSON.stringify(auditLog) },
    });

    for (const gap of result.skillGaps) {
      await prisma.skillGap.create({
        data: { applicationId: app.id, skill: gap.skill, category: gap.category, currentLevel: gap.currentLevel, requiredLevel: gap.requiredLevel, status: gap.status, recommendations: JSON.stringify(gap.recommendations) },
      });
    }
  }

  console.log("Seed completed!");
  console.log(`Created: 6 companies, ${createdRoles.length} roles (perm/contract/project), ${candidateProfiles.length} candidates, 3 headhunters, ${applicationPairs.length} applications`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
