/**
 * SMOKE — read-only checks, safe to run against production (app.holicruit.com).
 * Logs in with the seeded demo accounts, never creates or changes data.
 */
import { test, expect } from "@playwright/test";
import { DEMO, HOME, expectHealthy, login } from "./helpers";

const PUBLIC_PAGES = ["/", "/pricing", "/contact", "/privacy", "/terms", "/imprint", "/login", "/register"];
const PUBLIC_ASSETS = ["/manifest.webmanifest", "/og.png", "/icons/icon-maskable-512x512.png"];

test.describe("public surface", () => {
  for (const path of PUBLIC_PAGES) {
    test(`renders ${path}`, async ({ page }) => {
      const res = await page.goto(path);
      expect(res?.status(), `${path} status`).toBeLessThan(400);
      await expectHealthy(page);
    });
  }

  test("assets: PWA manifest, share image, maskable icon", async ({ request }) => {
    for (const a of PUBLIC_ASSETS) {
      const r = await request.get(a);
      expect(r.status(), a).toBe(200);
    }
    const manifest = await (await request.get("/manifest.webmanifest")).json();
    expect(manifest.name).toMatch(/holicruit/i);
    expect(manifest.display).toBe("standalone");
  });

  test("landing page has no dead internal links or placeholder CTAs", async ({ page, request }) => {
    await page.goto("/");
    const hrefs = await page.locator("a[href]").evaluateAll((as) => as.map((a) => a.getAttribute("href") ?? ""));
    expect(hrefs.filter((h) => h === "#" || h === "" || h === "javascript:void(0)"), "placeholder hrefs").toEqual([]);
    const internal = [...new Set(hrefs.filter((h) => h.startsWith("/") && !h.startsWith("//")))];
    expect(internal.length).toBeGreaterThan(3);
    for (const h of internal) {
      const r = await request.get(h.split("#")[0] || "/");
      expect(r.status(), `link ${h}`).toBeLessThan(400);
    }
  });

  test("share metadata is set", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator('meta[property="og:image"]')).toHaveAttribute("content", /og\.png/);
    await expect(page.locator('meta[property="og:title"]')).toHaveAttribute("content", /.+/);
  });

  test("unknown route is a 404, not a crash", async ({ page }) => {
    const res = await page.goto("/this-route-does-not-exist");
    expect(res?.status()).toBe(404);
  });
});

test.describe("auth guard", () => {
  for (const p of ["/candidate/matches", "/hiring-manager/pipeline", "/recruiter", "/provider", "/settings/privacy", "/feedback"]) {
    test(`unauthenticated ${p} → login`, async ({ page }) => {
      await page.goto(p);
      await expect(page).toHaveURL(/\/login/);
    });
  }
  test("unauthenticated data export is refused", async ({ request }) => {
    const r = await request.get("/settings/privacy/export", { maxRedirects: 0 });
    expect([302, 303, 307, 401, 403]).toContain(r.status());
  });
  test("wrong password is rejected with a message", async ({ page }) => {
    await page.goto("/login");
    await page.getByPlaceholder("you@example.com").fill(DEMO.candidate);
    await page.getByPlaceholder("Password").fill("wrong-password");
    await page.getByRole("button", { name: "Sign in" }).click();
    await expect(page).toHaveURL(/\/login/);
    await expect(page.locator("form").filter({ has: page.getByPlaceholder("Password") })).toContainText(/invalid|incorrect|wrong|couldn.t/i);
  });
});

test.describe("role homes", () => {
  const roles: Array<[string, keyof typeof HOME, string[]]> = [
    [DEMO.candidate, "candidate", ["/candidate/today", "/candidate/profile", "/candidate/growth-paths", "/candidate/profile/expectations", "/candidate/profile/import", "/settings/privacy"]],
    [DEMO.hiringManager, "hiring_manager", ["/hiring-manager/roles", "/hiring-manager/talent-pool", "/hiring-manager/analytics", "/hiring-manager/billing", "/hiring-manager/roles/new", "/hiring-manager/roles/import", "/settings/privacy"]],
    [DEMO.recruiter, "recruiter", ["/recruiter/new", "/settings/privacy"]],
    [DEMO.provider, "provider", ["/provider/new", "/provider/billing"]],
  ];

  for (const [email, role, pages] of roles) {
    test(`${role}: login lands on home and every page renders`, async ({ page }) => {
      await login(page, email);
      await expect(page).toHaveURL(new RegExp(HOME[role].replace(/\//g, "\\/")));
      await expectHealthy(page);
      await expect(page.getByRole("button", { name: "Share feedback" }), "feedback button present").toBeVisible();
      for (const p of pages) {
        const res = await page.goto(p);
        expect(res?.status(), p).toBeLessThan(400);
        await expect(page, `${p} should not bounce to login`).not.toHaveURL(/\/login/);
        await expectHealthy(page);
      }
    });
  }

  test("sign-out ends the session", async ({ page }) => {
    await login(page, DEMO.candidate);
    await page.getByRole("button", { name: "Sam Rivera" }).click();
    await page.getByRole("menuitem", { name: /sign out/i }).click();
    await page.waitForURL((u) => u.pathname === "/" || /\/login/.test(u.pathname));
    await page.goto("/candidate/matches");
    await expect(page).toHaveURL(/\/login/);
  });
});

test.describe("privacy guarantees (seed data)", () => {
  test("hiring manager sees the anonymous candidate's alias, never the real name", async ({ page }) => {
    await login(page, DEMO.hiringManager);
    // Walk every role's pipeline plus the talent pool: the alias must appear somewhere,
    // the real name nowhere.
    await page.goto("/hiring-manager/roles");
    const roleLinks = [...new Set(await page.locator('a[href^="/hiring-manager/"]').evaluateAll((as) => as.map((a) => a.getAttribute("href") ?? "")))]
      .filter((h) => /\/hiring-manager\/(pipeline\?opening=|roles\/[^/]+$)/.test(h));
    const pages = ["/hiring-manager/pipeline", "/hiring-manager/talent-pool", ...roleLinks];
    let aliasSeen = false;
    for (const p of pages) {
      await page.goto(p);
      const body = await page.locator("body").innerText();
      expect(body, `${p} leaks real name`).not.toMatch(/Aisha/);
      if (/Nightingale/.test(body)) aliasSeen = true;
    }
    expect(aliasSeen, "alias shown somewhere on the employer side").toBe(true);
  });

  test("candidate sees a confidential role as its alias, never the real company", async ({ page }) => {
    await login(page, DEMO.candidate);
    await page.goto("/candidate/matches");
    await expect(page.locator("body")).toContainText(/stealth-mode startup/i);
    // The HM's real name must not surface either (hmAnonymous).
    await expect(page.locator("body")).not.toContainText(/Priya/);
  });

  test("candidate sees pay/location compatibility, never a raw salary band", async ({ page }) => {
    await login(page, DEMO.candidate);
    await page.goto("/candidate/matches");
    const noBand = /€\s?\d{2,3}[,.]?\d{3}\s?[–-]\s?€?\s?\d{2,3}[,.]?\d{3}/;
    expect(await page.locator("body").innerText()).not.toMatch(noBand);
    // Open the first match: compatibility language is allowed on the detail, the band is not.
    await page.locator('a[href^="/candidate/matches/"]').first().click();
    await expect(page).toHaveURL(/\/candidate\/matches\/[^/]+$/);
    const detail = await page.locator("body").innerText();
    expect(detail).toMatch(/In range|Slight stretch|Pay TBD|Below target|Location/);
    expect(detail).not.toMatch(noBand);
  });

  test("data export is a JSON file containing only the signed-in account", async ({ page }) => {
    await login(page, DEMO.candidate);
    const res = await page.request.get("/settings/privacy/export");
    expect(res.status()).toBe(200);
    expect(res.headers()["content-type"]).toMatch(/json/);
    const text = await res.text();
    expect(text).toContain(DEMO.candidate);
    expect(text).not.toContain(DEMO.hiringManager);
    expect(text).not.toMatch(/passwordHash/);
  });

  test("AI disclosure and human-review wording is present where decisions are shown", async ({ page }) => {
    await login(page, DEMO.candidate);
    await page.goto("/candidate/matches");
    await expect(page.locator("body")).toContainText(/automated|AI|algorithm/i);
    await page.goto("/privacy");
    await expect(page.locator("body")).toContainText(/Automated Decisions/i);
  });
});

test.describe("feedback", () => {
  test("feedback panel opens from any app page", async ({ page }) => {
    await login(page, DEMO.recruiter);
    await page.getByRole("button", { name: "Share feedback" }).click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await expect(page.getByPlaceholder(/Tell us more/)).toBeVisible();
  });
});
