import { expect, type Page } from "@playwright/test";

export const DEMO_PASSWORD = "password123";
export const DEMO = {
  candidate: "sam@holicruit.test",
  candidateAnon: "aisha@holicruit.test",
  hiringManager: "priya@holicruit.test",
  recruiter: "jordan@holicruit.test",
  provider: "fm@holicruit.test",
} as const;

export const HOME = {
  candidate: "/candidate/matches",
  hiring_manager: "/hiring-manager/pipeline",
  recruiter: "/recruiter",
  provider: "/provider",
} as const;

/** Text that must never appear on a rendered page. */
const RED_FLAGS = [
  /Application error/i,
  /Internal Server Error/i,
  /Unhandled Runtime Error/i,
  /This page could not be found/i,
  /\bundefined\b(?!.*(?:undefined behaviour))/, // leaked JS undefined in copy
  /\[object Object\]/,
  /NaN%/,
  /Test mode/i,
  /lorem ipsum/i,
];

export async function expectHealthy(page: Page) {
  const body = await page.locator("body").innerText();
  for (const re of RED_FLAGS) expect(body, `page ${page.url()} contains red flag ${re}`).not.toMatch(re);
}

export async function login(page: Page, email: string, password = DEMO_PASSWORD) {
  await page.goto("/login");
  await page.getByPlaceholder("you@example.com").fill(email);
  await page.getByPlaceholder("Password").fill(password);
  await page.locator("form").filter({ has: page.getByPlaceholder("Password") }).getByRole("button", { name: /sign in|log in|continue/i }).click();
  await page.waitForURL((u) => !/\/login/.test(u.pathname), { timeout: 20_000 });
}

export async function register(
  page: Page,
  input: { name: string; email: string; password: string; hat: "candidate" | "hiring_manager" | "recruiter" | "provider" },
) {
  await page.goto("/register");
  await page.locator('input[name="name"]').fill(input.name);
  await page.locator('input[name="email"]').fill(input.email);
  await page.locator('input[name="password"]').fill(input.password);
  await page.locator('select[name="hat"]').selectOption(input.hat);
  await page.locator('input[name="consent"]').check();
  await page.locator("form").filter({ has: page.locator('input[name="consent"]') }).getByRole("button").last().click();
  await page.waitForURL((u) => !/\/register/.test(u.pathname), { timeout: 20_000 });
}

export function uniq(prefix: string) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}
