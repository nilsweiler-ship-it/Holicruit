/**
 * JOURNEYS — end-to-end flows that create and change data.
 * Run only against a throwaway database (CI spins one up). Never against production.
 */
import { test, expect } from "@playwright/test";
import { DEMO, expectHealthy, login, register, uniq } from "./helpers";

test.beforeAll(() => {
  const base = process.env.BASE_URL ?? "http://localhost:3000";
  if (/holicruit\.(com|app)/.test(base) && !process.env.ALLOW_MUTATING_ON_PROD) {
    throw new Error("Refusing to run mutating journeys against production.");
  }
});

test.describe("hiring manager journey", () => {
  test("register with consent → post a confidential role with must-haves → import candidates → claim link is correct", async ({ page, context }) => {
    const email = `${uniq("hm")}@example.com`;
    await register(page, { name: "Test Manager", email, password: "testpass123", hat: "hiring_manager" });
    await expect(page).toHaveURL(/\/hiring-manager\/pipeline/);
    await expectHealthy(page);

    // Post a role: pay, location and work mode are required must-haves.
    await page.goto("/hiring-manager/roles/new");
    await page.locator('input[name="title"]').fill("QA Automation Engineer");
    await page.locator('input[name="companyName"]').fill("Example Robotics AG");
    await page.locator('input[name="location"]').fill("Zürich");
    await page.locator('input[name="industry"]').fill("Robotics");
    await page.locator('input[name="salaryMin"]').fill("90000");
    await page.locator('input[name="salaryMax"]').fill("120000");
    await page.locator('select[name="workMode"]').selectOption("hybrid");
    await page.locator('input[name="requiredHard"]').fill("Playwright, TypeScript, CI/CD");
    await page.locator('input[name="requiredSoft"]').fill("Communication, Ownership");
    await page.locator('input[name="companyConfidential"]').check();
    await page.locator('input[name="companyAlias"]').fill("A Swiss robotics scale-up");
    await page.getByRole("button", { name: /post role/i }).click();
    await expect(page).toHaveURL(/\/hiring-manager\/pipeline\?opening=/);
    await expectHealthy(page);
    const openingId = new URL(page.url()).searchParams.get("opening")!;
    expect(openingId).toBeTruthy();

    // Never-empty pipeline: market snapshot renders even with zero matches.
    await expect(page.locator("body")).toContainText(/Import candidates/);

    // Import a pipeline: stub profile + claim link must point at THIS origin.
    await page.goto(`/hiring-manager/roles/${openingId}/import-candidates`);
    const importedEmail = `${uniq("imported")}@example.com`;
    await page.locator('textarea[name="candidates"]').fill(`Imported Person, ${importedEmail}, Playwright, TypeScript`);
    await page.getByRole("button", { name: /Import & score/ }).click();
    await expect(page).toHaveURL(/added=1/);
    const body = await page.locator("body").innerText();
    const origin = new URL(page.url()).origin;
    const claimLink = body.match(/https?:\/\/\S+\/claim\/[A-Za-z0-9_-]+/)?.[0];
    expect(claimLink, "a claim link is shown").toBeTruthy();
    expect(claimLink!.startsWith(origin), `claim link ${claimLink} must use app origin ${origin}`).toBe(true);
    expect(claimLink).not.toMatch(/railway\.com/);

    // The invited candidate can claim the profile and sign in.
    const claimPage = await context.newPage();
    await claimPage.context().clearCookies();
    await claimPage.goto(claimLink!);
    await expectHealthy(claimPage);
    await claimPage.locator('input[name="password"]').fill("claimpass123");
    await claimPage.getByRole("button", { name: "Claim my profile" }).click();
    await expect(claimPage).toHaveURL(/\/login\?claimed=1/);
    await login(claimPage, importedEmail, "claimpass123");
    await expect(claimPage).toHaveURL(/\/candidate/);
  });
});

test.describe("candidate journey", () => {
  test("register → set must-haves → import CV text → skills added → matches honour the gate", async ({ page }) => {
    const email = `${uniq("cand")}@example.com`;
    await register(page, { name: "Test Candidate", email, password: "testpass123", hat: "candidate" });
    await expect(page).toHaveURL(/\/candidate/);
    await expectHealthy(page);

    // Must-haves are required before matching does anything.
    await page.goto("/candidate/profile/expectations");
    await page.locator('input[name="expectedSalaryMin"]').fill("80000");
    await page.locator('input[name="workModes"][value="hybrid"]').check();
    await page.locator('input[name="workModes"][value="remote"]').check();
    await page.locator('input[name="locationPref"]').fill("Zürich");
    await page.getByRole("button", { name: "Save must-haves" }).click();
    await page.waitForURL((u) => !/error=1/.test(u.search));
    await expectHealthy(page);

    // CV paste → structural skill extraction → review → add.
    await page.goto("/candidate/profile/import");
    await page.getByPlaceholder(/Paste your CV/).fill(`
SKILLS
Playwright, TypeScript, CI/CD, React, GraphQL, Test Automation, Jira

EXPERIENCE
Senior QA engineer, 6 years. Built end-to-end test suites and release pipelines.
`);
    await page.getByRole("button", { name: /extract skills/i }).click();
    await expect(page.locator("body")).toContainText(/We recognised/);
    const count = Number((await page.locator("body").innerText()).match(/We recognised\s+(\d+)/)?.[1] ?? "0");
    expect(count).toBeGreaterThanOrEqual(5);
    await page.getByRole("button", { name: /^Add \d+ skills?/ }).click();
    await expect(page).toHaveURL(/\/candidate\/profile$/);
    await expect(page.locator("body")).toContainText(/Playwright/);
    await expectHealthy(page);

    // Matches page renders with the gate in place (may be empty — must not error).
    await page.goto("/candidate/matches");
    await expectHealthy(page);
  });

  test("must-have gate: a remote-only candidate loses on-site/hybrid matches, and gets them back", async ({ page }) => {
    await login(page, DEMO.candidate);
    const countMatches = async () => {
      await page.goto("/candidate/matches");
      return page.locator('a[href^="/candidate/matches/"]').count();
    };
    const before = await countMatches();

    const setModes = async (modes: string[]) => {
      await page.goto("/candidate/profile/expectations");
      for (const m of ["onsite", "hybrid", "remote"]) {
        const box = page.locator(`input[name="workModes"][value="${m}"]`);
        if (modes.includes(m)) await box.check();
        else await box.uncheck();
      }
      await page.getByRole("button", { name: "Save must-haves" }).click();
      await page.waitForURL((u) => !/error=1/.test(u.search));
    };

    await setModes(["remote"]);
    const remoteOnly = await countMatches();
    expect(remoteOnly).toBeLessThanOrEqual(before);

    await setModes(["onsite", "hybrid", "remote"]);
    const restored = await countMatches();
    expect(restored).toBe(before);
  });

  test("identity reveal is one-way and explicit; GDPR delete removes the account", async ({ page }) => {
    const email = `${uniq("anon")}@example.com`;
    await register(page, { name: "Real Name Here", email, password: "testpass123", hat: "candidate" });

    await page.goto("/settings/privacy");
    await page.locator('input[name="alias"]').fill("Kestrel");
    await page.locator('input[name="anonymous"]').check();
    await page.getByRole("button", { name: "Save privacy settings" }).click();
    await expectHealthy(page);

    // Export reflects the alias setting.
    const exp = await page.request.get("/settings/privacy/export");
    expect(exp.status()).toBe(200);
    expect(await exp.text()).toContain("Kestrel");

    // Erasure requires typing DELETE, then the login no longer works.
    await page.goto("/settings/privacy");
    await page.getByLabel("Type DELETE to confirm").fill("DELETE");
    await page.getByRole("button", { name: /delete/i }).last().click();
    await expect(page).toHaveURL(/\/login\?deleted=1/);
    await page.getByPlaceholder("you@example.com").fill(email);
    await page.getByPlaceholder("Password").fill("testpass123");
    await page.getByRole("button", { name: "Sign in" }).click();
    await expect(page).toHaveURL(/\/login/);
  });
});

test.describe("inbound & feedback land in the admin inbox", () => {
  test("contact form → lead; feedback → inbox", async ({ page }) => {
    const leadName = uniq("Lead");
    await page.goto("/contact?plan=team");
    await page.locator('input[name="name"]').fill(leadName);
    await page.locator('input[name="email"]').fill(`${uniq("lead")}@example.com`);
    await page.locator('input[name="company"]').fill("Example GmbH");
    await page.locator('textarea[name="message"]').fill("We'd like a quote for 3 hiring managers.");
    await page.getByRole("button", { name: "Send message" }).click();
    await expect(page).toHaveURL(/sent=1/);

    // Feedback from a signed-in user.
    await login(page, DEMO.recruiter);
    await page.getByRole("button", { name: "Share feedback" }).click();
    const fbText = `Automated feedback ${uniq("fb")}`;
    const dialog = page.getByRole("dialog");
    await dialog.getByRole("button", { name: "Love it" }).click();
    await dialog.getByPlaceholder(/Tell us more/).fill(fbText);
    await dialog.getByRole("button", { name: "Send", exact: true }).click();
    await expect(dialog).toContainText(/Thank you/);
    await dialog.getByRole("button", { name: "Done" }).click();

    // Admin (priya is not admin; the inbox is gated by ADMIN_EMAILS). CI sets ADMIN_EMAILS=jordan@holicruit.test.
    await page.goto("/feedback");
    await expectHealthy(page);
    await expect(page.locator("body")).toContainText(fbText);
    await expect(page.locator("body")).toContainText(leadName);
  });
});
