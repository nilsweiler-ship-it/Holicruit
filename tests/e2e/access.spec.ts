/**
 * ACCESS — authorization between users (IDOR on id-taking pages).
 *
 * Every page that takes a [matchId], [openingId] or ?opening= must refuse
 * anyone who isn't on the right side of that record. Refusal looks like the
 * branded 404 ("Nothing to see here") or, for the wrong hat entirely, a bounce
 * to the visitor's own home — never the other party's data.
 *
 * Registers throwaway accounts, so it runs in the "journey" project (CI only,
 * throwaway database) and refuses to run against production.
 */
import { test, expect, type Browser, type Page } from "@playwright/test";
import { DEMO, expectHealthy, login, register, uniq } from "./helpers";

test.beforeAll(() => {
  const base = process.env.BASE_URL ?? "http://localhost:3000";
  if (/holicruit\.(com|app)/.test(base) && !process.env.ALLOW_MUTATING_ON_PROD) {
    throw new Error("Refusing to run mutating journeys against production.");
  }
});

const NOT_FOUND_TEXT = /Nothing to see here/;

/** Unique hrefs starting with `prefix` on the current page. */
async function hrefs(page: Page, prefix: string): Promise<string[]> {
  const all = await page
    .locator(`a[href^="${prefix}"]`)
    .evaluateAll((as) => as.map((a) => a.getAttribute("href") ?? ""));
  return [...new Set(all)];
}

/** A logged-out page in its own browser context (separate cookies). */
async function freshPage(browser: Browser): Promise<Page> {
  const ctx = await browser.newContext();
  return ctx.newPage();
}

/**
 * How a request for `path` ended: "404" (branded not-found, whatever the HTTP
 * status — streamed pages can't change it after the shell is sent),
 * "redirect:<path>" (bounced elsewhere, e.g. login or the visitor's home), or
 * "served" (the page rendered — only correct for the owner).
 */
async function outcome(page: Page, path: string): Promise<string> {
  const res = await page.goto(path);
  const target = new URL(path, page.url()).pathname;
  let result = "served";
  await expect
    .poll(
      async () => {
        const url = new URL(page.url());
        if (url.pathname !== target) return (result = `redirect:${url.pathname}`);
        if (res?.status() === 404) return (result = "404");
        const body = await page.locator("body").innerText();
        if (NOT_FOUND_TEXT.test(body)) return (result = "404");
        // Still on the loading skeleton → keep polling; otherwise it was served.
        if (await page.locator('[aria-busy="true"]').count()) return "pending";
        // Guards inside the (app) loading boundary redirect client-side once the
        // stream ends (after `load`): let hydration + that navigation run first.
        await page.waitForLoadState("networkidle").catch(() => {});
        if (new URL(page.url()).pathname !== target) return "pending";
        return (result = "served");
      },
      { message: `waiting for ${path} to settle` },
    )
    .not.toBe("pending");
  return result;
}

/** The visitor must not get `path`: 404 or a redirect away, and a healthy page. */
async function expectRefused(page: Page, path: string, leak?: RegExp) {
  const r = await outcome(page, path);
  expect(r, `${path} was served to a non-owner`).not.toBe("served");
  await expectHealthy(page);
  if (leak) expect(await page.content(), `${path} leaks owner data in the page source`).not.toMatch(leak);
}

/** Priya (seeded HM): one of her opening ids, its title, and one match id on it. */
async function priyaRecords(page: Page) {
  await login(page, DEMO.hiringManager);
  await page.goto("/hiring-manager/roles");
  const pipelineHref = (await hrefs(page, "/hiring-manager/pipeline?opening="))[0];
  expect(pipelineHref, "seed gives Priya at least one role").toBeTruthy();
  const openingId = new URL(pipelineHref!, page.url()).searchParams.get("opening")!;

  await page.goto(pipelineHref!);
  await expectHealthy(page);
  const roleTitle = (await page.locator("h1").first().innerText()).trim();

  // Pipeline cards navigate on click (no <a>), so open one to learn a match id.
  const card = page.locator('[role="button"][draggable="true"]').first();
  await expect(card, "seed gives Priya's role at least one candidate").toBeVisible();
  await card.click();
  await page.waitForURL(/\/hiring-manager\/candidate\/[^/]+$/);
  const matchId = new URL(page.url()).pathname.split("/").pop()!;
  await expect(page.locator("body")).toContainText(/Back to pipeline/);
  return { openingId, pipelineHref: pipelineHref!, roleTitle, matchId };
}

/** Escape a string for use inside a RegExp. */
const re = (s: string) => new RegExp(s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));

test.describe("hiring-manager pages are owner-only", () => {
  test("a candidate cannot open an HM pipeline, deep-dive, interview kit or role tools", async ({ page, browser }) => {
    const priya = await priyaRecords(page);

    const cand = await freshPage(browser);
    await login(cand, DEMO.candidate);
    for (const p of [
      priya.pipelineHref,
      `/hiring-manager/candidate/${priya.matchId}`,
      `/hiring-manager/interview/${priya.matchId}`,
      `/hiring-manager/roles/${priya.openingId}/calibration`,
      `/hiring-manager/roles/${priya.openingId}/assessment`,
      `/hiring-manager/roles/${priya.openingId}/import-candidates`,
    ]) {
      await expectRefused(cand, p);
      const body = await cand.locator("body").innerText();
      expect(body, `${p}: employer-only content shown to a candidate`).not.toMatch(
        /Back to pipeline|Structured score sheet|Interview guide|Import & score/,
      );
    }
  });

  test("another hiring manager gets a 404 on someone else's role and match", async ({ page, browser }) => {
    const priya = await priyaRecords(page);

    const other = await freshPage(browser);
    await register(other, {
      name: "Other Manager",
      email: `${uniq("hm-other")}@example.com`,
      password: "testpass123",
      hat: "hiring_manager",
    });
    await expect(other).toHaveURL(/\/hiring-manager\/pipeline/);

    for (const p of [
      priya.pipelineHref,
      `/hiring-manager/candidate/${priya.matchId}`,
      `/hiring-manager/interview/${priya.matchId}`,
      `/hiring-manager/roles/${priya.openingId}/calibration`,
      `/hiring-manager/roles/${priya.openingId}/assessment`,
      `/hiring-manager/roles/${priya.openingId}/import-candidates`,
    ]) {
      expect(await outcome(other, p), `foreign HM on ${p}`).toBe("404");
      await expectHealthy(other);
      // The 404 must not carry the role in its HTML/RSC payload either.
      expect(await other.content(), `${p} leaks the role title`).not.toMatch(re(priya.roleTitle));
    }

    // A garbage or repeated ?opening= is a 404 too, not someone's "first" role.
    expect(await outcome(other, "/hiring-manager/pipeline?opening=does-not-exist")).toBe("404");
    expect(await outcome(other, `/hiring-manager/pipeline?opening=${priya.openingId}&opening=x`)).toBe("404");

    // Positive control: the owner still gets her pipeline.
    expect(await outcome(page, priya.pipelineHref)).toBe("served");
  });
});

test.describe("candidate pages are owner-only", () => {
  test("a candidate cannot open another candidate's match or growth report", async ({ page, browser }) => {
    await login(page, DEMO.candidateAnon);
    await page.goto("/candidate/matches");
    const matchHref = (await hrefs(page, "/candidate/matches/"))[0];
    expect(matchHref, "seed gives Aisha at least one match").toBeTruthy();
    const matchId = matchHref!.split("/").pop()!;
    const growthHref = (await hrefs(page, "/candidate/growth/"))[0];

    // Positive control: Aisha sees her own match.
    expect(await outcome(page, matchHref!)).toBe("served");

    const sam = await freshPage(browser);
    await login(sam, DEMO.candidate);
    expect(await outcome(sam, `/candidate/matches/${matchId}`), "another candidate's match").toBe("404");
    await expectHealthy(sam);
    expect(await outcome(sam, `/candidate/growth/${matchId}`), "another candidate's growth report").toBe("404");
    if (growthHref) expect(await outcome(sam, growthHref), "another candidate's growth report").toBe("404");
    // …nor read the employer view of her match through the HM URLs.
    await expectRefused(sam, `/hiring-manager/candidate/${matchId}`);
  });

  test("the hiring manager can't read the candidate view of a match (it unmasks the candidate)", async ({ page }) => {
    const priya = await priyaRecords(page);
    // Priya has no candidate profile: the candidate area bounces her; the match page never renders.
    await expectRefused(page, `/candidate/matches/${priya.matchId}`);
    await expectRefused(page, `/candidate/growth/${priya.matchId}`);
  });

  test("unknown ids render the branded 404 with a way back", async ({ page }) => {
    await login(page, DEMO.candidate);
    for (const p of ["/candidate/matches/does-not-exist", "/candidate/growth/does-not-exist"]) {
      expect(await outcome(page, p), p).toBe("404");
      await expectHealthy(page);
      await expect(page.getByRole("link", { name: /home/i }).first(), `${p} offers a way back`).toBeVisible();
    }
  });
});

test.describe("anonymity holds in the page source", () => {
  test("the anonymous candidate's real name is not in the HM pipeline or deep-dive HTML/RSC", async ({ page, browser }) => {
    await login(page, DEMO.candidateAnon);
    await page.goto("/candidate/matches");
    const matchId = (await hrefs(page, "/candidate/matches/"))[0]?.split("/").pop();
    expect(matchId, "seed gives Aisha at least one match").toBeTruthy();

    const hm = await freshPage(browser);
    await login(hm, DEMO.hiringManager);
    await hm.goto("/hiring-manager/roles");
    const pipelines = await hrefs(hm, "/hiring-manager/pipeline?opening=");
    for (const p of ["/hiring-manager/pipeline", ...pipelines, `/hiring-manager/candidate/${matchId}`]) {
      await outcome(hm, p);
      expect(await hm.content(), `${p} source leaks the real name`).not.toMatch(/Aisha/);
    }
  });
});

test.describe("logged-out visitors", () => {
  for (const p of [
    "/hiring-manager/pipeline?opening=x",
    "/hiring-manager/candidate/x",
    "/hiring-manager/interview/x",
    "/hiring-manager/roles/x/calibration",
    "/candidate/matches/x",
    "/candidate/growth/x",
    "/provider",
    "/recruiter",
  ]) {
    test(`${p} → login`, async ({ browser }) => {
      const anon = await freshPage(browser);
      await anon.goto(p);
      await expect(anon).toHaveURL(/\/login/);
    });
  }
});
