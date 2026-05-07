#!/usr/bin/env node
/**
 * Holicruit MVP Test Runner
 * Tests all critical flows against the running dev server.
 * Usage: node test-mvp.mjs
 */

const BASE = "http://localhost:3000";
const TS = Date.now();

// ── Test bookkeeping ──────────────────────────────────────────────
let passed = 0,
  failed = 0,
  skipped = 0;
const results = [];

function record(id, name, ok, detail = "") {
  if (ok === "skip") {
    skipped++;
    results.push({ id, name, status: "SKIP", detail });
  } else if (ok) {
    passed++;
    results.push({ id, name, status: "PASS", detail });
  } else {
    failed++;
    results.push({ id, name, status: "FAIL", detail: detail.slice(0, 200) });
  }
}

// ── HTTP client with cookie jar ───────────────────────────────────
class Client {
  constructor() {
    this.cookies = "";
  }

  async fetch(path, opts = {}) {
    const headers = { ...opts.headers };
    if (this.cookies) headers["Cookie"] = this.cookies;
    if (opts.body && !headers["Content-Type"])
      headers["Content-Type"] = "application/json";

    const res = await fetch(`${BASE}${path}`, {
      ...opts,
      headers,
      redirect: "manual",
      body:
        opts.body && typeof opts.body === "object" && !headers["Content-Type"]?.includes("urlencoded")
          ? JSON.stringify(opts.body)
          : opts.body,
    });

    // Merge set-cookie headers
    const sc = res.headers.getSetCookie?.() ?? [];
    if (sc.length) {
      const existing = Object.fromEntries(
        this.cookies
          .split("; ")
          .filter(Boolean)
          .map((c) => {
            const [k, ...v] = c.split("=");
            return [k, v.join("=")];
          })
      );
      for (const raw of sc) {
        const cookie = raw.split(";")[0];
        const [k, ...v] = cookie.split("=");
        existing[k] = v.join("=");
      }
      this.cookies = Object.entries(existing)
        .map(([k, v]) => `${k}=${v}`)
        .join("; ");
    }
    return res;
  }

  async json(path, opts = {}) {
    const res = await this.fetch(path, opts);
    const text = await res.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
    return { status: res.status, data, headers: res.headers };
  }

  async login(email, password) {
    // 1. Get CSRF token
    const csrf = await this.json("/api/auth/csrf");
    const csrfToken = csrf.data?.csrfToken;
    if (!csrfToken) throw new Error("No CSRF token");

    // 2. Sign in
    const res = await this.fetch("/api/auth/callback/credentials", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ csrfToken, email, password, json: "true" }),
    });

    // Follow redirect to get session
    if (res.status >= 300 && res.status < 400) {
      await this.fetch("/api/auth/session");
    }

    // Verify session
    const session = await this.json("/api/auth/session");
    return session.data;
  }
}

// ── Test data ─────────────────────────────────────────────────────
const CANDIDATE = {
  name: "Test Candidate",
  email: `candidate-${TS}@test.com`,
  password: "Test1234!",
  role: "CANDIDATE",
};
const HM = {
  name: "Test HiringMgr",
  email: `hm-${TS}@test.com`,
  password: "Test1234!",
  role: "HIRING_MANAGER",
  companyName: `TestCorp-${TS}`,
};
const HH = {
  name: "Test Headhunter",
  email: `hh-${TS}@test.com`,
  password: "Test1234!",
  role: "HEADHUNTER",
};

// Shared state set during tests
const state = {
  candidateId: null,
  candidateProfileId: null,
  hmUserId: null,
  hhUserId: null,
  hhProfileId: null,
  companyId: null,
  roleId: null,
  role2Id: null,
  applicationId: null,
  hhApplicationId: null,
};

// Clients per role
const cClient = new Client();
const hmClient = new Client();
const hhClient = new Client();
const anonClient = new Client();

// ══════════════════════════════════════════════════════════════════
//  1. AUTHENTICATION & REGISTRATION
// ══════════════════════════════════════════════════════════════════
async function testAuth() {
  console.log("\n─── 1. Authentication & Registration ───");

  // 1.1 Register candidate
  {
    const { status, data } = await anonClient.json("/api/auth/register", {
      method: "POST",
      body: CANDIDATE,
    });
    const ok = status === 201 && data.id;
    if (ok) state.candidateId = data.id;
    record("1.1", "Register candidate", ok, `status=${status} id=${data.id}`);
  }

  // 1.2 Register hiring manager
  {
    const { status, data } = await anonClient.json("/api/auth/register", {
      method: "POST",
      body: HM,
    });
    const ok = status === 201 && data.id;
    if (ok) state.hmUserId = data.id;
    record("1.2", "Register hiring manager", ok, `status=${status} id=${data.id}`);
  }

  // 1.3 Register headhunter
  {
    const { status, data } = await anonClient.json("/api/auth/register", {
      method: "POST",
      body: HH,
    });
    const ok = status === 201 && data.id;
    if (ok) state.hhUserId = data.id;
    record("1.3", "Register headhunter", ok, `status=${status} id=${data.id}`);
  }

  // 1.4 Duplicate email rejected
  {
    const { status, data } = await anonClient.json("/api/auth/register", {
      method: "POST",
      body: CANDIDATE,
    });
    const ok = status === 400;
    record("1.4", "Duplicate email rejected", ok, `status=${status} msg=${data?.error}`);
  }

  // 1.5 Weak password rejected
  {
    const { status } = await anonClient.json("/api/auth/register", {
      method: "POST",
      body: { name: "X", email: `weak-${TS}@test.com`, password: "12", role: "CANDIDATE" },
    });
    record("1.5", "Weak password rejected", status === 400, `status=${status}`);
  }

  // 1.6 Missing fields rejected
  {
    const { status } = await anonClient.json("/api/auth/register", {
      method: "POST",
      body: { email: `miss-${TS}@test.com` },
    });
    record("1.6", "Missing fields rejected", status === 400, `status=${status}`);
  }

  // 1.7 Login candidate
  {
    const session = await cClient.login(CANDIDATE.email, CANDIDATE.password);
    const ok = !!session?.user?.email;
    record("1.7", "Login candidate", ok, `user=${session?.user?.email}`);
  }

  // Login HM & HH (needed for later tests)
  await hmClient.login(HM.email, HM.password);
  await hhClient.login(HH.email, HH.password);

  // 1.8 Login wrong password
  {
    const bad = new Client();
    try {
      const session = await bad.login(CANDIDATE.email, "WrongPassword!");
      record("1.8", "Login wrong password rejected", !session?.user, `session=${JSON.stringify(session)}`);
    } catch (e) {
      // May throw or return empty session
      record("1.8", "Login wrong password rejected", true, "threw/empty");
    }
  }

  // 1.9 Login unregistered email
  {
    const bad = new Client();
    try {
      const session = await bad.login("nonexistent@test.com", "whatever");
      record("1.9", "Login unregistered email rejected", !session?.user, `session=${JSON.stringify(session)}`);
    } catch {
      record("1.9", "Login unregistered email rejected", true, "threw/empty");
    }
  }

  // 1.10 Role-based redirect (check session role matches)
  {
    const s = await hmClient.json("/api/auth/session");
    const ok = s.data?.user?.role === "HIRING_MANAGER";
    record("1.10", "HM session has correct role", ok, `role=${s.data?.user?.role}`);
  }

  // 1.12 Logout
  {
    const logoutClient = new Client();
    await logoutClient.login(CANDIDATE.email, CANDIDATE.password);
    const csrf = await logoutClient.json("/api/auth/csrf");
    await logoutClient.fetch("/api/auth/signout", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ csrfToken: csrf.data.csrfToken }),
    });
    const s = await logoutClient.json("/api/auth/session");
    const ok = !s.data?.user;
    record("1.12", "Logout clears session", ok, `session=${JSON.stringify(s.data)}`);
  }
}

// ══════════════════════════════════════════════════════════════════
//  2. CANDIDATE PROFILE MANAGEMENT
// ══════════════════════════════════════════════════════════════════
async function testCandidateProfile() {
  console.log("\n─── 2. Candidate Profile ───");

  // 2.1 View empty profile
  {
    const { status, data } = await cClient.json("/api/candidates/profile");
    const ok = status === 200;
    if (data?.id) state.candidateProfileId = data.id;
    record("2.1", "View profile after registration", ok, `status=${status} id=${data?.id}`);
  }

  // 2.2 Update bio
  {
    const { status, data } = await cClient.json("/api/candidates/profile", {
      method: "PUT",
      body: { bio: "Senior full-stack developer with 8 years of experience." },
    });
    const ok = status === 200 && data?.bio?.includes("Senior");
    if (data?.id) state.candidateProfileId = data.id;
    record("2.2", "Update bio", ok, `status=${status}`);
  }

  // 2.3 Add skills with levels
  {
    const skills = [
      { name: "Python", level: 4, category: "HARD" },
      { name: "React", level: 3, category: "HARD" },
      { name: "TypeScript", level: 4, category: "HARD" },
      { name: "AWS", level: 2, category: "HARD" },
      { name: "Leadership", level: 3, category: "SOFT" },
      { name: "Communication", level: 4, category: "SOFT" },
    ];
    const { status, data } = await cClient.json("/api/candidates/profile", {
      method: "PUT",
      body: { skills },
    });
    const parsed = typeof data?.skills === "string" ? JSON.parse(data.skills) : data?.skills;
    const ok = status === 200 && Array.isArray(parsed) && parsed.length === 6;
    record("2.3", "Add skills with levels", ok, `status=${status} count=${parsed?.length}`);
  }

  // 2.4 Add experience
  {
    const experience = [
      { title: "Senior Developer", company: "BigCorp", years: 5, description: "Led team of 8" },
      { title: "Junior Developer", company: "Startup", years: 3 },
    ];
    const { status, data } = await cClient.json("/api/candidates/profile", {
      method: "PUT",
      body: { experience },
    });
    const parsed = typeof data?.experience === "string" ? JSON.parse(data.experience) : data?.experience;
    const ok = status === 200 && Array.isArray(parsed) && parsed.length === 2;
    record("2.4", "Add experience", ok, `status=${status} count=${parsed?.length}`);
  }

  // 2.5 Add education
  {
    const education = [{ degree: "Master", institution: "ETH Zurich", year: 2016 }];
    const { status, data } = await cClient.json("/api/candidates/profile", {
      method: "PUT",
      body: { education },
    });
    const parsed = typeof data?.education === "string" ? JSON.parse(data.education) : data?.education;
    const ok = status === 200 && Array.isArray(parsed) && parsed.length === 1;
    record("2.5", "Add education", ok, `status=${status}`);
  }

  // 2.6 Set preferences
  {
    const { status } = await cClient.json("/api/candidates/profile", {
      method: "PUT",
      body: { preferences: { locations: ["Zurich", "Remote"], remote: true, salary: { min: 120000, max: 160000 } } },
    });
    record("2.6", "Set preferences", status === 200, `status=${status}`);
  }

  // 2.7 Set visibility
  {
    const { status, data } = await cClient.json("/api/candidates/profile", {
      method: "PUT",
      body: { visibility: "ACTIVE" },
    });
    const ok = status === 200 && data?.visibility === "ACTIVE";
    record("2.7", "Set visibility", ok, `status=${status} vis=${data?.visibility}`);
  }
}

// ══════════════════════════════════════════════════════════════════
//  3. HIRING MANAGER — ROLE MANAGEMENT
// ══════════════════════════════════════════════════════════════════
async function testHMRoles() {
  console.log("\n─── 3. HM Role Management ───");

  // 3.1 Create role (DRAFT)
  {
    const { status, data } = await hmClient.json("/api/roles", {
      method: "POST",
      body: {
        title: "Senior Python Engineer",
        description: "Build ML pipelines and backend services.",
        hardSkills: [
          { name: "Python", level: 4, required: true },
          { name: "AWS", level: 3 },
          { name: "TypeScript", level: 3 },
        ],
        softSkills: [
          { name: "Leadership", level: 3 },
          { name: "Communication", level: 2 },
        ],
        weights: { hardSkills: 40, softSkills: 20, experience: 25, education: 15 },
        threshold: 60,
        status: "DRAFT",
      },
    });
    const ok = status === 201 && data?.id;
    if (ok) state.roleId = data.id;
    record("3.1", "Create role (DRAFT)", ok, `status=${status} id=${data?.id}`);
  }

  // 3.2 Verify hard skills saved
  {
    if (!state.roleId) { record("3.2", "Hard skills saved", false, "no roleId"); }
    else {
      const { data } = await hmClient.json(`/api/roles/${state.roleId}`);
      const hs = typeof data?.hardSkills === "string" ? JSON.parse(data.hardSkills) : data?.hardSkills;
      const ok = Array.isArray(hs) && hs.length === 3;
      record("3.2", "Hard skills saved", ok, `count=${hs?.length}`);
    }
  }

  // 3.5 Verify threshold saved
  {
    if (!state.roleId) { record("3.5", "Threshold saved", false, "no roleId"); }
    else {
      const { data } = await hmClient.json(`/api/roles/${state.roleId}`);
      record("3.5", "Threshold saved", data?.threshold === 60, `threshold=${data?.threshold}`);
    }
  }

  // 3.6 Publish role
  {
    const { status, data } = await hmClient.json(`/api/roles/${state.roleId}`, {
      method: "PATCH",
      body: { status: "PUBLISHED" },
    });
    const ok = status === 200 && data?.status === "PUBLISHED";
    record("3.6", "Publish role", ok, `status=${status} roleStatus=${data?.status}`);
  }

  // Create 2nd role (for quota test later)
  {
    const { data } = await hmClient.json("/api/roles", {
      method: "POST",
      body: {
        title: "Frontend Developer",
        description: "React + TypeScript expert needed.",
        hardSkills: [{ name: "React", level: 4 }, { name: "TypeScript", level: 4 }],
        softSkills: [{ name: "Communication", level: 3 }],
        weights: { hardSkills: 50, softSkills: 15, experience: 25, education: 10 },
        threshold: 70,
        status: "PUBLISHED",
      },
    });
    if (data?.id) state.role2Id = data.id;
  }

  // 3.10 Quota: exceed active roles (STARTER = 2)
  {
    const { status, data } = await hmClient.json("/api/roles", {
      method: "POST",
      body: {
        title: "Third Role",
        description: "Should exceed quota",
        hardSkills: [{ name: "Go", level: 3 }],
        softSkills: [],
        weights: { hardSkills: 50, softSkills: 15, experience: 25, education: 10 },
        threshold: 50,
        status: "PUBLISHED",
      },
    });
    const ok = status === 403 && data?.error === "QUOTA_EXCEEDED";
    record("3.10", "Quota: exceed active roles (STARTER)", ok, `status=${status} err=${data?.error}`);
  }

  // 3.8 Edit existing role
  {
    const { status, data } = await hmClient.json(`/api/roles/${state.roleId}`, {
      method: "PATCH",
      body: { title: "Senior Python Engineer (Updated)" },
    });
    const ok = status === 200 && data?.title?.includes("Updated");
    record("3.8", "Edit existing role", ok, `title=${data?.title}`);
  }

  // 3.11 List own roles
  {
    const { status, data } = await hmClient.json("/api/roles");
    const ok = status === 200 && Array.isArray(data) && data.length >= 2;
    record("3.11", "List own roles", ok, `count=${data?.length}`);
  }

  // 3.14 Cannot see other company's roles via direct ID
  {
    // HH should get 404 for unclaimed role detail (but can see in list)
    // Candidate should get 404
    const { status } = await cClient.json(`/api/roles/${state.roleId}`);
    record("3.14", "Candidate cannot see role detail", status === 404, `status=${status}`);
  }
}

// ══════════════════════════════════════════════════════════════════
//  5. HEADHUNTER FLOWS
// ══════════════════════════════════════════════════════════════════
async function testHHFlows() {
  console.log("\n─── 5. Headhunter Flows ───");

  // 5.1 Browse published roles
  {
    const { status, data } = await hhClient.json("/api/roles");
    const ok = status === 200 && Array.isArray(data) && data.length >= 1;
    record("5.1", "Browse published roles", ok, `count=${data?.length}`);
  }

  // 5.2 Claim a role
  {
    const { status, data } = await hhClient.json(`/api/roles/${state.roleId}/claim`, {
      method: "POST",
    });
    const ok = status === 200 && data?.claimedById;
    if (data?.claimedById) state.hhProfileId = data.claimedById;
    record("5.2", "Claim a role", ok, `status=${status} claimedById=${data?.claimedById}`);
  }

  // 5.4 Cannot claim already-claimed role
  {
    const { status, data } = await hhClient.json(`/api/roles/${state.roleId}/claim`, {
      method: "POST",
    });
    const ok = status === 400;
    record("5.4", "Cannot claim already-claimed role", ok, `status=${status} err=${data?.error}`);
  }

  // 5.5 Submit candidate to claimed role
  {
    const { status, data } = await hhClient.json("/api/applications", {
      method: "POST",
      body: {
        candidateId: state.candidateProfileId || state.candidateId,
        roleId: state.roleId,
        headhunterId: state.hhProfileId,
      },
    });
    const ok = status === 201 && data?.id && data?.matchScore != null;
    if (ok) state.hhApplicationId = data.id;
    record("5.5", "Submit candidate to claimed role", ok, `status=${status} score=${data?.matchScore} stage=${data?.stage}`);
  }

  // 5.6/5.7 Check auto-shortlist (depends on score vs threshold=60)
  {
    if (state.hhApplicationId) {
      const { data } = await hhClient.json(`/api/applications/${state.hhApplicationId}`);
      const autoShortlisted = data?.stage === "SHORTLISTED";
      const scoreAbove = data?.matchScore >= 60;
      const ok = (scoreAbove && autoShortlisted) || (!scoreAbove && data?.stage === "APPLIED");
      record(
        scoreAbove ? "5.6" : "5.7",
        scoreAbove ? "Auto-shortlist on high score" : "Below threshold stays APPLIED",
        ok,
        `score=${data?.matchScore} threshold=60 stage=${data?.stage}`
      );
    }
  }

  // 5.9 View own submissions
  {
    const { status, data } = await hhClient.json("/api/applications");
    const ok = status === 200 && Array.isArray(data) && data.length >= 1;
    record("5.9", "View own submissions", ok, `count=${data?.length}`);
  }

  // 5.10 Email sanitized in shortlist
  {
    const { status, data } = await hhClient.json(`/api/roles/${state.roleId}`);
    if (status === 200 && data?.applications?.length > 0) {
      const emails = data.applications.map((a) => a.candidate?.user?.email).filter(Boolean);
      const ok = emails.length === 0; // All emails should be stripped for HH
      record("5.10", "Email sanitized for HH in role detail", ok, `emailsFound=${emails.length}`);
    } else {
      record("5.10", "Email sanitized for HH in role detail", "skip", "no applications visible");
    }
  }

  // 5.12 HH cannot reveal candidate identity
  {
    if (state.hhApplicationId) {
      const { status } = await hhClient.json(`/api/applications/${state.hhApplicationId}/reveal`, {
        method: "POST",
      });
      const ok = status === 401 || status === 403;
      record("5.12", "HH cannot reveal candidate identity", ok, `status=${status}`);
    } else {
      record("5.12", "HH cannot reveal candidate identity", "skip", "no app");
    }
  }
}

// ══════════════════════════════════════════════════════════════════
//  6. CANDIDATE — JOB DISCOVERY & APPLICATIONS
// ══════════════════════════════════════════════════════════════════
async function testCandidateApplications() {
  console.log("\n─── 6. Candidate Applications ───");

  // 6.2 Apply to a role (role2 — not claimed by HH, so candidate applies directly)
  {
    const { status, data } = await cClient.json("/api/applications", {
      method: "POST",
      body: {
        candidateId: state.candidateProfileId || state.candidateId,
        roleId: state.role2Id,
      },
    });
    const ok = status === 201 && data?.id && data?.matchScore != null;
    if (ok) state.applicationId = data.id;
    record("6.2", "Candidate applies to role", ok, `status=${status} score=${data?.matchScore} stage=${data?.stage}`);
  }

  // 6.3/6.4 Check auto-shortlist (threshold=70 on role2)
  {
    if (state.applicationId) {
      const { data } = await cClient.json(`/api/applications/${state.applicationId}`);
      const above = data?.matchScore >= 70;
      const ok = (above && data?.stage === "SHORTLISTED") || (!above && data?.stage === "APPLIED");
      record(
        above ? "6.3" : "6.4",
        above ? "Auto-shortlist on high score" : "Below threshold stays APPLIED",
        ok,
        `score=${data?.matchScore} threshold=70 stage=${data?.stage}`
      );
    }
  }

  // 6.5 Cannot apply twice to same role
  {
    const { status, data } = await cClient.json("/api/applications", {
      method: "POST",
      body: {
        candidateId: state.candidateProfileId || state.candidateId,
        roleId: state.role2Id,
      },
    });
    const ok = status === 400;
    record("6.5", "Cannot apply twice to same role", ok, `status=${status} err=${data?.error}`);
  }

  // 6.6 View own applications
  {
    const { status, data } = await cClient.json("/api/applications");
    const ok = status === 200 && Array.isArray(data) && data.length >= 1;
    record("6.6", "View own applications", ok, `count=${data?.length}`);
  }

  // 6.9 Candidate can view own application even if HH-submitted
  // (The HH submitted THIS candidate, so candidate should see it — it's their application)
  {
    if (state.hhApplicationId) {
      const { status } = await cClient.json(`/api/applications/${state.hhApplicationId}`);
      const ok = status === 200; // Candidate IS the candidate on this application
      record("6.9", "Candidate can view own HH-submitted application", ok, `status=${status}`);
    } else {
      record("6.9", "Candidate can view own HH-submitted application", "skip", "no app");
    }
  }
}

// ══════════════════════════════════════════════════════════════════
//  4. HM — APPLICATION REVIEW
// ══════════════════════════════════════════════════════════════════
async function testHMApplicationReview() {
  console.log("\n─── 4. HM Application Review ───");

  // 4.1 View application list for role
  {
    const { status, data } = await hmClient.json(`/api/roles/${state.roleId}`);
    const ok = status === 200 && Array.isArray(data?.applications);
    record("4.1", "View applications for role", ok, `count=${data?.applications?.length}`);
  }

  // Find the HH-submitted application from HM perspective
  let hmViewAppId = state.hhApplicationId;

  // 4.2 View application detail
  {
    if (hmViewAppId) {
      const { status, data } = await hmClient.json(`/api/applications/${hmViewAppId}`);
      const ok = status === 200 && data?.matchScore != null;
      record("4.2", "View application detail", ok, `score=${data?.matchScore} stage=${data?.stage}`);
    } else {
      record("4.2", "View application detail", "skip", "no app");
    }
  }

  // 4.3 Score breakdown visible
  {
    if (hmViewAppId) {
      const { data } = await hmClient.json(`/api/applications/${hmViewAppId}`);
      let breakdown;
      try {
        breakdown = typeof data?.scoreBreakdown === "string" ? JSON.parse(data.scoreBreakdown) : data?.scoreBreakdown;
      } catch { breakdown = null; }
      const ok = breakdown && (breakdown.dimensions || breakdown.hardSkills != null);
      record("4.3", "Score breakdown visible", ok, `breakdown=${JSON.stringify(breakdown)?.slice(0, 100)}`);
    } else {
      record("4.3", "Score breakdown visible", "skip", "no app");
    }
  }

  // 4.4 Move to SCREENING
  {
    if (hmViewAppId) {
      const { status, data } = await hmClient.json(`/api/applications/${hmViewAppId}`, {
        method: "PATCH",
        body: { stage: "SCREENING" },
      });
      const ok = status === 200 && data?.stage === "SCREENING";
      record("4.4", "Move to SCREENING", ok, `stage=${data?.stage}`);
    } else {
      record("4.4", "Move to SCREENING", "skip", "no app");
    }
  }

  // 4.5 Move to INTERVIEW
  {
    if (hmViewAppId) {
      const { status, data } = await hmClient.json(`/api/applications/${hmViewAppId}`, {
        method: "PATCH",
        body: { stage: "INTERVIEW" },
      });
      const ok = status === 200 && data?.stage === "INTERVIEW";
      record("4.5", "Move to INTERVIEW", ok, `stage=${data?.stage}`);
    } else {
      record("4.5", "Move to INTERVIEW", "skip", "no app");
    }
  }

  // 4.12 Gap analysis blocked on Starter
  {
    if (hmViewAppId) {
      const { status, data } = await hmClient.json(`/api/applications/${hmViewAppId}/gap-report`);
      const ok = status === 403 && data?.error === "QUOTA_EXCEEDED";
      record("4.12", "Gap analysis blocked on Starter", ok, `status=${status} err=${data?.error}`);
    } else {
      record("4.12", "Gap analysis blocked on Starter", "skip", "no app");
    }
  }

  // 4.9 Reveal candidate identity
  {
    if (hmViewAppId) {
      const { data: appData } = await hmClient.json(`/api/applications/${hmViewAppId}`);
      if (appData?.matchScore >= appData?.role?.threshold || appData?.matchScore >= 60) {
        const { status, data } = await hmClient.json(`/api/applications/${hmViewAppId}/reveal`, {
          method: "POST",
        });
        const revealed = data?.identityRevealed;
        const ok = status === 200 && revealed === true;
        record("4.9", "Reveal candidate identity", ok, `status=${status} identityRevealed=${revealed} candidate=${data?.candidate?.user?.email}`);
      } else {
        record("4.9", "Reveal candidate identity", "skip", `score=${appData?.matchScore} below threshold`);
      }
    } else {
      record("4.9", "Reveal candidate identity", "skip", "no app");
    }
  }

  // 4.8 Reject application (using role2 application)
  {
    if (state.applicationId) {
      const { status, data } = await hmClient.json(`/api/applications/${state.applicationId}`, {
        method: "PATCH",
        body: { stage: "REJECTED" },
      });
      const ok = status === 200 && data?.stage === "REJECTED";
      record("4.8", "Reject application", ok, `stage=${data?.stage}`);
    } else {
      record("4.8", "Reject application", "skip", "no app");
    }
  }
}

// ══════════════════════════════════════════════════════════════════
//  7. MATCHING & SCORING
// ══════════════════════════════════════════════════════════════════
async function testMatching() {
  console.log("\n─── 7. Matching & Scoring ───");

  // 7.1 Compute match score
  {
    const candidateId = state.candidateProfileId || state.candidateId;
    const { status, data } = await hmClient.json("/api/match/score", {
      method: "POST",
      body: { candidateId, roleId: state.roleId },
    });
    const ok = status === 200 && typeof data?.overallScore === "number";
    record("7.1", "Compute match score", ok, `score=${data?.overallScore}`);
  }

  // 7.2 Score dimensions present
  {
    const candidateId = state.candidateProfileId || state.candidateId;
    const { data } = await hmClient.json("/api/match/score", {
      method: "POST",
      body: { candidateId, roleId: state.roleId },
    });
    const dims = data?.dimensions;
    const ok =
      dims &&
      typeof dims.hardSkills === "number" &&
      typeof dims.softSkills === "number" &&
      typeof dims.experience === "number" &&
      typeof dims.education === "number";
    record("7.2", "Score dimensions present", ok, `dims=${JSON.stringify(dims)}`);
  }

  // 7.3 Skill gaps returned
  {
    const candidateId = state.candidateProfileId || state.candidateId;
    const { data } = await hmClient.json("/api/match/score", {
      method: "POST",
      body: { candidateId, roleId: state.roleId },
    });
    const gaps = data?.skillGaps;
    const ok = Array.isArray(gaps);
    const statuses = gaps?.map((g) => g.status) ?? [];
    record("7.3", "Skill gaps returned", ok, `gaps=${gaps?.length} statuses=${[...new Set(statuses)]}`);
  }

  // 7.5 Exceeded skill level capped at 100
  {
    // Python candidate=4, required=4 → should be 100% (MET)
    const candidateId = state.candidateProfileId || state.candidateId;
    const { data } = await hmClient.json("/api/match/score", {
      method: "POST",
      body: { candidateId, roleId: state.roleId },
    });
    const pythonGap = data?.skillGaps?.find((g) => g.skill?.toLowerCase() === "python");
    if (pythonGap) {
      const ok = pythonGap.status === "MET";
      record("7.5", "Matching skill = MET status", ok, `python: cur=${pythonGap.currentLevel} req=${pythonGap.requiredLevel} status=${pythonGap.status}`);
    } else {
      record("7.5", "Matching skill = MET status", "skip", "no python gap entry");
    }
  }

  // 7.13 Score at threshold triggers shortlist (already validated in 5.6/6.3)
  record("7.13", "Auto-shortlist at threshold", "skip", "covered by 5.6/6.3");
}

// ══════════════════════════════════════════════════════════════════
//  8. BILLING & SUBSCRIPTIONS
// ══════════════════════════════════════════════════════════════════
async function testBilling() {
  console.log("\n─── 8. Billing & Subscriptions ───");

  // 8.1 Default HM plan = STARTER
  {
    const { status, data } = await hmClient.json("/api/billing/subscribe");
    const ok = status === 200 && data?.plan === "STARTER";
    record("8.1", "Default HM plan = STARTER", ok, `plan=${data?.plan}`);
  }

  // 8.2 View current plan features
  {
    const { data } = await hmClient.json("/api/billing/subscribe");
    const ok = data?.features && data.features.activeRoles === 2;
    record("8.2", "View plan features", ok, `activeRoles=${data?.features?.activeRoles}`);
  }

  // 8.3 Upgrade to Professional
  {
    const { status, data } = await hmClient.json("/api/billing/subscribe", {
      method: "POST",
      body: { plan: "PROFESSIONAL" },
    });
    const ok = status === 200 && data?.plan === "PROFESSIONAL";
    record("8.3", "Upgrade to Professional", ok, `plan=${data?.plan}`);
  }

  // 8.8 Feature unlocked: gap analysis now works
  {
    if (state.hhApplicationId) {
      const { status, data } = await hmClient.json(`/api/applications/${state.hhApplicationId}/gap-report`);
      const ok = status === 200 && data?.gaps != null;
      record("8.8", "Gap analysis unlocked after upgrade", ok, `status=${status} gaps=${data?.gaps?.length}`);
    } else {
      record("8.8", "Gap analysis unlocked after upgrade", "skip", "no app");
    }
  }

  // 4.11 View gap analysis (Professional) — now should work
  {
    if (state.hhApplicationId) {
      const { data } = await hmClient.json(`/api/applications/${state.hhApplicationId}/gap-report`);
      const hasGaps = Array.isArray(data?.gaps);
      const hasSummary = data?.summary != null;
      record("4.11", "View gap analysis detail", hasGaps, `gapCount=${data?.gaps?.length} hasSummary=${hasSummary}`);
    } else {
      record("4.11", "View gap analysis detail", "skip", "no app");
    }
  }

  // 8.4 Upgrade to Enterprise
  {
    const { status, data } = await hmClient.json("/api/billing/subscribe", {
      method: "POST",
      body: { plan: "ENTERPRISE" },
    });
    const ok = status === 200 && data?.plan === "ENTERPRISE";
    record("8.4", "Upgrade to Enterprise", ok, `plan=${data?.plan}`);
  }

  // 8.5 Usage tracking (subscription has period dates)
  {
    const { data } = await hmClient.json("/api/billing/subscribe");
    const sub = data?.subscription;
    const ok = sub && sub.currentPeriodStart && sub.currentPeriodEnd;
    record("8.5", "Subscription period dates present", ok, `start=${sub?.currentPeriodStart?.slice(0, 10)} end=${sub?.currentPeriodEnd?.slice(0, 10)}`);
  }

  // 8.9 Default HH plan = FREE
  {
    const { status, data } = await hhClient.json("/api/billing/subscribe");
    const ok = status === 200 && data?.plan === "FREE";
    record("8.9", "Default HH plan = FREE", ok, `plan=${data?.plan}`);
  }

  // 8.10 Upgrade HH to PRO
  {
    const { status, data } = await hhClient.json("/api/billing/subscribe", {
      method: "POST",
      body: { plan: "PRO" },
    });
    const ok = status === 200 && data?.plan === "PRO";
    record("8.10", "Upgrade HH to PRO", ok, `plan=${data?.plan}`);
  }

  // Downgrade HM back to STARTER for further tests
  await hmClient.json("/api/billing/subscribe", { method: "POST", body: { plan: "STARTER" } });
}

// ══════════════════════════════════════════════════════════════════
//  9. SECURITY & ACCESS CONTROL
// ══════════════════════════════════════════════════════════════════
async function testSecurity() {
  console.log("\n─── 9. Security & Access Control ───");

  // 9.1 Unauthenticated → dashboard
  {
    const res = await anonClient.fetch("/dashboard");
    const ok = res.status === 302 || res.status === 307 || res.status === 200;
    const location = res.headers.get("location") || "";
    const redirectsToLogin = location.includes("/login") || location.includes("/api/auth");
    record("9.1", "Unauthenticated dashboard redirects", redirectsToLogin || res.status >= 300, `status=${res.status} loc=${location}`);
  }

  // 9.2 Unauthenticated → API
  {
    const { status } = await anonClient.json("/api/roles");
    const ok = status === 401 || status === 302 || status === 307;
    record("9.2", "Unauthenticated API returns 401/redirect", ok, `status=${status}`);
  }

  // 9.6 HM access other company's role (use candidate client which has no company)
  {
    const { status } = await cClient.json(`/api/roles/${state.roleId}`);
    const ok = status === 403 || status === 404;
    record("9.6", "Non-owner cannot access role detail", ok, `status=${status}`);
  }

  // 9.8 Candidate view other's application (HH-submitted app is FOR this candidate, so 200 expected)
  {
    if (state.hhApplicationId) {
      const { status } = await cClient.json(`/api/applications/${state.hhApplicationId}`);
      const ok = status === 200; // This IS the candidate's application
      record("9.8", "Candidate can view own HH-submitted app", ok, `status=${status}`);
    }
  }

  // 9.9 HH access unclaimed role
  {
    if (state.role2Id) {
      const { status } = await hhClient.json(`/api/roles/${state.role2Id}`);
      const ok = status === 404 || status === 403;
      record("9.9", "HH cannot access unclaimed role detail", ok, `status=${status}`);
    }
  }

  // 9.11 Identity reveal creates audit log
  {
    if (state.hhApplicationId) {
      const { data } = await hmClient.json(`/api/applications/${state.hhApplicationId}`);
      let audit;
      try {
        audit = typeof data?.auditLog === "string" ? JSON.parse(data.auditLog) : data?.auditLog;
      } catch { audit = []; }
      const hasRevealEntry = Array.isArray(audit) && audit.some((e) =>
        (e.action || "").toLowerCase().includes("reveal")
      );
      record("9.11", "Audit log contains reveal entry", hasRevealEntry, `auditEntries=${audit?.length}`);
    } else {
      record("9.11", "Audit log contains reveal entry", "skip", "no app");
    }
  }

  // 9.12 Audit trail on stage change
  {
    if (state.hhApplicationId) {
      const { data } = await hmClient.json(`/api/applications/${state.hhApplicationId}`);
      let audit;
      try {
        audit = typeof data?.auditLog === "string" ? JSON.parse(data.auditLog) : data?.auditLog;
      } catch { audit = []; }
      const ok = Array.isArray(audit) && audit.length >= 2; // at least creation + stage change
      record("9.12", "Audit trail has stage change entries", ok, `entries=${audit?.length}`);
    }
  }
}

// ══════════════════════════════════════════════════════════════════
//  10. PUBLIC PAGES
// ══════════════════════════════════════════════════════════════════
async function testPublicPages() {
  console.log("\n─── 10. Public Pages ───");

  const pages = [
    { path: "/", name: "Landing page" },
    { path: "/pricing", name: "Pricing page" },
    { path: "/login", name: "Login page" },
    { path: "/register", name: "Register page" },
    { path: "/compare", name: "Compare page" },
  ];

  for (const [i, page] of pages.entries()) {
    const res = await anonClient.fetch(page.path);
    const ok = res.status === 200;
    const text = await res.text();
    const hasContent = text.length > 500;
    record(`10.${i + 1}`, `${page.name} loads (${page.path})`, ok && hasContent, `status=${res.status} size=${text.length}`);
  }

  // 10.6 Pricing page has plan content
  {
    const res = await anonClient.fetch("/pricing");
    const text = await res.text();
    const hasPricing = text.includes("Professional") || text.includes("Starter") || text.includes("pricing");
    record("10.6", "Pricing page has plan content", hasPricing, `hasPricing=${hasPricing}`);
  }

  // 10.8 Login page has branded header
  {
    const res = await anonClient.fetch("/login");
    const text = await res.text();
    const hasBrand = text.includes("Holicruit") || text.includes("holicruit");
    record("10.8", "Login page has branding", hasBrand, `hasBrand=${hasBrand}`);
  }

  // 10.9 Register page has branded header
  {
    const res = await anonClient.fetch("/register");
    const text = await res.text();
    const hasBrand = text.includes("Holicruit") || text.includes("holicruit");
    record("10.9", "Register page has branding", hasBrand, `hasBrand=${hasBrand}`);
  }
}

// ══════════════════════════════════════════════════════════════════
//  3b. DELETE ROLE + CLOSE ROLE (run late to avoid breaking other tests)
// ══════════════════════════════════════════════════════════════════
async function testRoleLifecycle() {
  console.log("\n─── 3b. Role Lifecycle (close/delete) ───");

  // 3.7 Close role (role2)
  {
    if (state.role2Id) {
      const { status, data } = await hmClient.json(`/api/roles/${state.role2Id}`, {
        method: "PATCH",
        body: { status: "CLOSED" },
      });
      const ok = status === 200 && data?.status === "CLOSED";
      record("3.7", "Close role", ok, `status=${status} roleStatus=${data?.status}`);
    }
  }

  // 3.9 Delete role (role2 — already closed)
  {
    if (state.role2Id) {
      const { status, data } = await hmClient.json(`/api/roles/${state.role2Id}`, {
        method: "DELETE",
      });
      const ok = status === 200 && data?.success;
      record("3.9", "Delete role", ok, `status=${status}`);
    }
  }
}

// ══════════════════════════════════════════════════════════════════
//  RUNNER
// ══════════════════════════════════════════════════════════════════
async function run() {
  console.log("╔══════════════════════════════════════════╗");
  console.log("║   Holicruit MVP Test Runner              ║");
  console.log("╚══════════════════════════════════════════╝");
  console.log(`Server: ${BASE}`);
  console.log(`Test suffix: ${TS}\n`);

  // Verify server is up
  try {
    const res = await fetch(`${BASE}/`);
    if (res.status !== 200) throw new Error(`Server returned ${res.status}`);
  } catch (e) {
    console.error(`\n✗ Cannot reach ${BASE} — is the dev server running?\n  ${e.message}`);
    process.exit(1);
  }

  await testAuth();
  await testCandidateProfile();
  await testHMRoles();
  await testHHFlows();
  await testCandidateApplications();
  await testHMApplicationReview();
  await testMatching();
  await testBilling();
  await testSecurity();
  await testPublicPages();
  await testRoleLifecycle();

  // ── Summary ──────────────────────────────────────────────────
  console.log("\n══════════════════════════════════════════");
  console.log("  RESULTS");
  console.log("══════════════════════════════════════════\n");

  for (const r of results) {
    const icon = r.status === "PASS" ? "✓" : r.status === "FAIL" ? "✗" : "○";
    const color = r.status === "PASS" ? "\x1b[32m" : r.status === "FAIL" ? "\x1b[31m" : "\x1b[33m";
    console.log(`${color}  ${icon} [${r.id}] ${r.name}\x1b[0m  ${r.detail}`);
  }

  console.log(`\n──────────────────────────────────────────`);
  console.log(`  \x1b[32mPassed: ${passed}\x1b[0m  |  \x1b[31mFailed: ${failed}\x1b[0m  |  \x1b[33mSkipped: ${skipped}\x1b[0m  |  Total: ${passed + failed + skipped}`);
  console.log(`──────────────────────────────────────────\n`);

  process.exit(failed > 0 ? 1 : 0);
}

run().catch((e) => {
  console.error("Fatal error:", e);
  process.exit(1);
});
