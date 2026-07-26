"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/persona";
import { runMatchingForOpening } from "@/lib/matching/engine";
import { jobAdParser } from "@/lib/services/ingest";
import { getActivePlan, countOpenRoles } from "@/lib/services/billing";
import { SCORE_CRITERIA } from "@/lib/scoresheet";
import type { SkillGap } from "@/lib/fit/types";

/** Block posting beyond the plan's open-role limit → send to billing. */
async function enforceRoleLimit(userId: string): Promise<void> {
  const { plan } = await getActivePlan(userId, "hiring_manager");
  if (plan.openRoleLimit !== undefined) {
    const count = await countOpenRoles(userId);
    if (count >= plan.openRoleLimit) redirect("/hiring-manager/billing?limit=1");
  }
}

const HARD_BAR = 85;
const SOFT_BAR = 75;

const parseList = (v: FormDataEntryValue | null) =>
  String(v ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

/** Post a role: create the opening and run matching to populate its pipeline. */
export async function createOpening(formData: FormData): Promise<void> {
  const user = await requireUser();
  await enforceRoleLimit(user.id);
  const { plan } = await getActivePlan(user.id, "hiring_manager");
  const title = String(formData.get("title") ?? "").trim();
  if (!title) redirect("/hiring-manager/roles");

  const company = await prisma.company.create({
    data: {
      name: String(formData.get("companyName") ?? "").trim() || "My Company",
      location: String(formData.get("location") ?? "").trim() || "Remote",
      ownerId: user.id,
    },
  });
  // Custom role calibration (Team+). Clamp hard weight 0–100, soft = 100 − hard,
  // pass bar 0–100. Fall back to sensible defaults when not on plan or unset.
  let hardWeight = 60;
  let passBar = 60;
  if (plan.calibration) {
    const hw = Number(formData.get("hardWeight"));
    const pb = Number(formData.get("passBar"));
    if (Number.isFinite(hw)) hardWeight = Math.min(100, Math.max(0, Math.round(hw)));
    if (Number.isFinite(pb)) passBar = Math.min(100, Math.max(0, Math.round(pb)));
  }
  const softWeight = 100 - hardWeight;

  const opening = await prisma.opening.create({
    data: {
      title,
      industry: String(formData.get("industry") ?? "").trim() || "General",
      companyId: company.id,
      location: String(formData.get("location") ?? "").trim() || "Remote",
      salaryMin: Number(formData.get("salaryMin")) || null,
      salaryMax: Number(formData.get("salaryMax")) || null,
      currency: String(formData.get("currency") ?? "").trim() || "€",
      hiringManagerName: user.name,
      hiringManagerHeadline: `Hiring manager · ${company.name}`,
      hiringManagerInitials: user.initials,
      requiredHard: JSON.stringify(parseList(formData.get("requiredHard"))),
      requiredSoft: JSON.stringify(parseList(formData.get("requiredSoft"))),
      priority: plan.priorityMatching ?? false,
      hardWeight,
      softWeight,
      passBar,
    },
  });

  await runMatchingForOpening(opening.id);
  revalidatePath("/hiring-manager/pipeline");
  revalidatePath("/hiring-manager/roles");
  redirect(`/hiring-manager/pipeline?opening=${opening.id}`);
}

/**
 * Import a role by pasting a job ad from another platform: the parser
 * "translates" the free text into the structured opening (title, skills,
 * industry), then matching runs against the candidate pool.
 */
export async function importOpening(formData: FormData): Promise<void> {
  await requireUser();
  const text = String(formData.get("text") ?? "").trim();
  if (!text) redirect("/hiring-manager/roles/import");

  // Parse → hand off to the create form prefilled, so the HM reviews/edits the
  // "translation" before it goes live.
  const parsed = await jobAdParser.parseJobAd(text);
  const params = new URLSearchParams({
    title: parsed.title,
    companyName: parsed.company ?? "",
    location: parsed.location,
    industry: parsed.industry,
    requiredHard: parsed.requiredHard.join(", "),
    requiredSoft: parsed.requiredSoft.join(", "),
    imported: "1",
  });
  redirect(`/hiring-manager/roles/new?${params.toString()}`);
}

/**
 * Re-engage a silver medalist: reopen a closed match, put it back in the
 * pipeline, and open a direct line with an inviting first message. This is the
 * talent-pool "invite to re-match" action.
 */
export async function reopenForReMatch(matchId: string): Promise<void> {
  const user = await requireUser();
  const match = await prisma.match.findUnique({
    where: { id: matchId },
    include: {
      candidate: { include: { user: { select: { name: true } } } },
      opening: { select: { title: true } },
      thread: { select: { id: true } },
    },
  });
  if (!match) redirect("/hiring-manager/talent-pool");

  await prisma.match.update({
    where: { id: matchId },
    data: { stage: "talking", stageChangedAt: new Date(), candidateOptIn: true, managerOptIn: true },
  });

  if (!match.thread) {
    const firstName = match.candidate.user.name.split(" ")[0] ?? "there";
    const thread = await prisma.thread.create({ data: { matchId } });
    await prisma.message.create({
      data: {
        threadId: thread.id,
        fromName: user.name,
        text: `Hi ${firstName} — you were a strong candidate for ${match.opening.title}, and it looks like you've since closed the gap that held things up. We'd love to reopen the conversation. Are you open to talking?`,
      },
    });
  }

  revalidatePath("/hiring-manager/talent-pool");
  revalidatePath("/hiring-manager/pipeline");
  redirect(`/hiring-manager/chat/${matchId}`);
}

/**
 * Update an existing role's calibration (Team+) and re-run matching so the new
 * hard/soft weighting and pass bar immediately re-rank the pipeline.
 */
export async function updateCalibration(openingId: string, formData: FormData): Promise<void> {
  const user = await requireUser();
  const { plan } = await getActivePlan(user.id, "hiring_manager");
  if (!plan.calibration) redirect("/hiring-manager/billing?feature=calibration");

  const opening = await prisma.opening.findFirst({
    where: { id: openingId, company: { ownerId: user.id } },
    select: { id: true },
  });
  if (!opening) redirect("/hiring-manager/roles");

  const hw = Number(formData.get("hardWeight"));
  const pb = Number(formData.get("passBar"));
  const hardWeight = Number.isFinite(hw) ? Math.min(100, Math.max(0, Math.round(hw))) : 60;
  const passBar = Number.isFinite(pb) ? Math.min(100, Math.max(0, Math.round(pb))) : 60;

  // Per-skill importance map (JSON of skill → essential|important|bonus), validated.
  let skillWeights = "{}";
  const raw = String(formData.get("skillWeights") ?? "");
  if (raw) {
    try {
      const parsed = JSON.parse(raw) as Record<string, unknown>;
      const clean: Record<string, string> = {};
      for (const [k, v] of Object.entries(parsed)) {
        if (v === "essential" || v === "important" || v === "bonus") clean[k] = v;
      }
      skillWeights = JSON.stringify(clean);
    } catch {
      /* keep default */
    }
  }

  await prisma.opening.update({
    where: { id: openingId },
    data: { hardWeight, softWeight: 100 - hardWeight, passBar, skillWeights },
  });
  await runMatchingForOpening(openingId);
  revalidatePath("/hiring-manager/pipeline");
  revalidatePath("/hiring-manager/roles");
  redirect(`/hiring-manager/pipeline?opening=${openingId}`);
}

/**
 * Save a role's custom applied assessment (Scale plan). Stores a validated JSON
 * quiz on the opening; the candidate skill-check uses it when present.
 */
export async function saveRoleQuiz(openingId: string, formData: FormData): Promise<void> {
  const user = await requireUser();
  const { plan } = await getActivePlan(user.id, "hiring_manager");
  if (!plan.customAssessments) redirect("/hiring-manager/billing?feature=assessments");

  const opening = await prisma.opening.findFirst({
    where: { id: openingId, company: { ownerId: user.id } },
    select: { id: true },
  });
  if (!opening) redirect("/hiring-manager/roles");

  let quiz: string | null = null;
  const raw = String(formData.get("quiz") ?? "");
  if (raw) {
    try {
      const parsed = JSON.parse(raw) as unknown;
      if (Array.isArray(parsed)) {
        // Keep only well-formed items/options.
        const clean = parsed
          .map((it, i) => {
            const item = it as { id?: string; prompt?: string; note?: string; options?: unknown };
            const prompt = String(item.prompt ?? "").trim();
            const opts = Array.isArray(item.options)
              ? item.options
                  .map((o, j) => {
                    const opt = o as { id?: string; text?: string; score?: unknown };
                    const text = String(opt.text ?? "").trim();
                    const score = Math.min(10, Math.max(0, Math.round(Number(opt.score) || 0)));
                    return text ? { id: opt.id || `o${j}`, text, score } : null;
                  })
                  .filter(Boolean)
              : [];
            return prompt && opts.length >= 2
              ? { id: item.id || `q${i}`, prompt, note: item.note, options: opts }
              : null;
          })
          .filter(Boolean);
        if (clean.length > 0) quiz = JSON.stringify(clean);
      }
    } catch {
      /* ignore malformed */
    }
  }

  await prisma.opening.update({ where: { id: openingId }, data: { quiz } });
  revalidatePath(`/hiring-manager/roles/${openingId}/assessment`);
  redirect(`/hiring-manager/pipeline?opening=${openingId}`);
}

/** Save / unsave (shortlist) a candidate match. */
export async function toggleSaved(matchId: string): Promise<void> {
  await requireUser();
  const m = await prisma.match.findUnique({ where: { id: matchId }, select: { saved: true } });
  if (!m) return;
  await prisma.match.update({ where: { id: matchId }, data: { saved: !m.saved } });
  revalidatePath("/hiring-manager/talent-pool");
  revalidatePath("/hiring-manager/pipeline");
  revalidatePath(`/hiring-manager/candidate/${matchId}`);
}

/** Strip HTML to readable text and pull a likely job title from the markup. */
function htmlToImportable(html: string): { text: string; title?: string; company?: string } {
  const meta = (prop: string) => {
    const re = new RegExp(`<meta[^>]+(?:property|name)=["']${prop}["'][^>]+content=["']([^"']+)["']`, "i");
    return html.match(re)?.[1]?.trim();
  };
  const titleTag = html.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1]?.trim();
  const h1 = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i)?.[1]?.replace(/<[^>]+>/g, " ").trim();
  let title = meta("og:title") || h1 || titleTag;
  let company = meta("og:site_name");
  // Titles are often "Role | Company — Careers"; keep the role, salvage the company.
  if (title) {
    const parts = title.split(/\s+[|–—··-]\s+/).map((p) => p.trim()).filter(Boolean);
    if (parts.length > 1) {
      title = parts[0];
      if (!company) {
        const tail = parts[parts.length - 1].replace(/\bcareers?\b|\bjobs?\b/i, "").trim();
        if (tail) company = tail;
      }
    }
  }

  const text = html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<(br|\/p|\/div|\/li|\/h[1-6])[^>]*>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&#39;|&rsquo;|&apos;/gi, "'")
    .replace(/&quot;|&ldquo;|&rdquo;/gi, '"')
    .replace(/[ \t]+/g, " ")
    .replace(/\n\s*\n\s*\n+/g, "\n\n")
    .trim();

  return { text, title, company };
}

/** Reject non-http and obviously-internal hosts (basic SSRF guard). */
function isFetchableUrl(u: string): URL | null {
  let url: URL;
  try {
    url = new URL(u);
  } catch {
    return null;
  }
  if (url.protocol !== "http:" && url.protocol !== "https:") return null;
  const host = url.hostname.toLowerCase();
  if (
    host === "localhost" ||
    host.endsWith(".local") ||
    /^(127\.|10\.|0\.|169\.254\.|192\.168\.)/.test(host) ||
    /^172\.(1[6-9]|2\d|3[01])\./.test(host)
  ) {
    return null;
  }
  return url;
}

// A real browser UA — many job sites serve a bot challenge (or nothing) to
// obviously-automated agents, so we present as a normal browser.
const IMPORT_UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36";

async function fetchWithTimeout(u: string, ms: number, headers: Record<string, string>) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  try {
    return await fetch(u, { signal: controller.signal, redirect: "follow", headers });
  } finally {
    clearTimeout(timer);
  }
}

const bodyLen = (s: string) => s.replace(/\s/g, "").length;

/**
 * Scrape a URL via Firecrawl — runs a real headless browser, executes the
 * page's JavaScript, and gets past most bot-blocks, returning clean markdown.
 * Only active when FIRECRAWL_API_KEY is set; otherwise returns null so the
 * caller falls back to the plain fetch / reader paths.
 */
async function fetchViaFirecrawl(url: URL): Promise<{ text: string; title?: string } | null> {
  const key = process.env.FIRECRAWL_API_KEY;
  if (!key) return null;
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 25000);
    let res: Response;
    try {
      res = await fetch("https://api.firecrawl.dev/v1/scrape", {
        method: "POST",
        signal: controller.signal,
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
        body: JSON.stringify({ url: url.toString(), formats: ["markdown"], onlyMainContent: true }),
      });
    } finally {
      clearTimeout(timer);
    }
    if (!res.ok) return null;
    const j = (await res.json()) as {
      success?: boolean;
      data?: { markdown?: string; metadata?: { title?: string; ogTitle?: string } };
    };
    const md = j?.data?.markdown;
    if (j?.success && md && md.trim().length > 0) {
      return { text: md, title: j.data?.metadata?.title || j.data?.metadata?.ogTitle };
    }
  } catch {
    /* fall back */
  }
  return null;
}

/** Rewrite known listing/search URLs to their server-rendered detail page. */
function canonicalizeJobUrl(url: URL): URL {
  const host = url.hostname.toLowerCase();
  const jobid = url.searchParams.get("jobid");
  // jobs.ch / jobup.ch search pages carry the job in ?jobid= → use /detail/<id>/.
  if ((host.endsWith("jobs.ch") || host.endsWith("jobup.ch")) && jobid) {
    return new URL(`/en/vacancies/detail/${jobid}/`, url.origin);
  }
  return url;
}

/**
 * Get readable text for a URL. Tries a direct fetch first (works for the many
 * server-rendered job pages), follows a canonical link if the first page is
 * thin, and only then falls back to a reader service that renders JavaScript
 * (for single-page-app boards). Never redirects — returns data or throws.
 */
async function fetchReadable(url: URL): Promise<{ text: string; title?: string; company?: string }> {
  const norm = canonicalizeJobUrl(url);
  const htmlHeaders = { "User-Agent": IMPORT_UA, Accept: "text/html,application/xhtml+xml" };
  let best: { text: string; title?: string; company?: string } | null = null;

  // 0) Firecrawl (renders JS, bypasses bot-blocks) — the reliable path when set.
  const fc = await fetchViaFirecrawl(norm);
  if (fc && bodyLen(fc.text) > 300) return fc;

  // 1) Direct fetch (server-rendered pages).
  try {
    const res = await fetchWithTimeout(norm.toString(), 9000, htmlHeaders);
    if (res.ok) {
      const html = await res.text();
      let ex = htmlToImportable(html);
      // If thin, follow the page's canonical/og:url and try that once.
      if (bodyLen(ex.text) < 400) {
        const canon =
          html.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/i)?.[1] ||
          html.match(/<meta[^>]+property=["']og:url["'][^>]+content=["']([^"']+)["']/i)?.[1];
        if (canon) {
          try {
            const cu = new URL(canon, norm);
            if (cu.toString() !== norm.toString()) {
              const r2 = await fetchWithTimeout(cu.toString(), 9000, htmlHeaders);
              if (r2.ok) {
                const ex2 = htmlToImportable(await r2.text());
                if (bodyLen(ex2.text) > bodyLen(ex.text)) ex = ex2;
              }
            }
          } catch {
            /* ignore */
          }
        }
      }
      if (bodyLen(ex.text) > 300) return ex;
      best = ex;
    }
  } catch {
    /* fall through to reader */
  }

  // 2) Reader service (renders JS) for single-page-app pages.
  try {
    const r = await fetchWithTimeout(`https://r.jina.ai/${norm.toString()}`, 13000, {
      "User-Agent": IMPORT_UA,
      Accept: "text/plain",
      "X-Return-Format": "text",
    });
    if (r.ok) {
      const md = await r.text();
      if (bodyLen(md) > 300) {
        return { text: md, title: md.match(/^Title:\s*(.+)$/m)?.[1]?.trim() };
      }
    }
  } catch {
    /* ignore */
  }

  if (best) return best;
  throw new Error("unreadable");
}

/**
 * Import a role from a job-posting URL: fetch the page (rendering JS via a
 * reader service), extract the text, parse it into a structured opening, and
 * hand off to the review form prefilled. Falls back to paste when unreadable.
 */
export async function importOpeningFromUrl(formData: FormData): Promise<void> {
  await requireUser();
  const raw = String(formData.get("url") ?? "").trim();
  const url = isFetchableUrl(raw);
  if (!url) redirect("/hiring-manager/roles/import?error=url");

  let extracted: { text: string; title?: string; company?: string } | null = null;
  try {
    extracted = await fetchReadable(url);
  } catch {
    extracted = null;
  }
  if (!extracted) redirect("/hiring-manager/roles/import?error=fetch");

  const { text, title, company } = extracted;
  // Too little usable text means we couldn't read it → ask to paste.
  if (text.replace(/\s/g, "").length < 200) {
    redirect("/hiring-manager/roles/import?error=empty");
  }

  const parsed = await jobAdParser.parseJobAd(`${title ? `Title: ${title}\n` : ""}${text}`);
  const params = new URLSearchParams({
    title: parsed.title || title || "",
    companyName: parsed.company ?? company ?? "",
    location: parsed.location,
    industry: parsed.industry,
    requiredHard: parsed.requiredHard.join(", "),
    requiredSoft: parsed.requiredSoft.join(", "),
    imported: "1",
  });
  redirect(`/hiring-manager/roles/new?${params.toString()}`);
}

/** Advance/move a candidate between pipeline stages. */
export async function setStage(
  matchId: string,
  stage: "new" | "talking" | "offer" | "closed",
): Promise<void> {
  await prisma.match.update({ where: { id: matchId }, data: { stage, stageChangedAt: new Date() } });
  revalidatePath("/hiring-manager/pipeline");
}

/** Gate a premium hiring-manager capability, sending to billing if not on plan. */
async function requireHmFeature(
  userId: string,
  feature: "scoreSheets" | "pipelineTools",
  redirectTo: string,
): Promise<void> {
  const { plan } = await getActivePlan(userId, "hiring_manager");
  if (!plan[feature]) redirect(redirectTo);
}

/** Save a structured interview scorecard (Team plan). */
export async function saveScoreSheet(matchId: string, formData: FormData): Promise<void> {
  const user = await requireUser();
  await requireHmFeature(user.id, "scoreSheets", "/hiring-manager/billing?feature=score-sheets");

  const ratings = SCORE_CRITERIA.map((criterion, i) => ({
    criterion,
    score: Math.min(5, Math.max(1, Number(formData.get(`rating-${i}`)) || 3)),
  }));
  const overall = Math.round(ratings.reduce((s, r) => s + r.score, 0) / ratings.length);

  await prisma.scoreSheet.create({
    data: {
      matchId,
      author: user.name,
      ratings: JSON.stringify(ratings),
      overall,
      recommendation: String(formData.get("recommendation") ?? "yes"),
      notes: String(formData.get("notes") ?? "").trim(),
    },
  });
  revalidatePath(`/hiring-manager/candidate/${matchId}`);
}

/** Add a private note on a candidate (Team plan — full pipeline management). */
export async function addNote(matchId: string, formData: FormData): Promise<void> {
  const user = await requireUser();
  await requireHmFeature(user.id, "pipelineTools", "/hiring-manager/billing?feature=pipeline");
  const body = String(formData.get("body") ?? "").trim();
  if (!body) return;
  await prisma.pipelineNote.create({ data: { matchId, author: user.name, body } });
  revalidatePath(`/hiring-manager/candidate/${matchId}`);
}

/**
 * Pass a candidate with feedback: close the match, mark the feedback sent, and
 * generate the candidate's Growth Report (rejection is never silent).
 */
export async function passWithFeedback(matchId: string, body: string): Promise<void> {
  const match = await prisma.match.findUnique({
    where: { id: matchId },
    include: { opening: { include: { company: { select: { name: true } } } } },
  });
  if (!match) return;

  const gaps = JSON.parse(match.gaps) as SkillGap[];
  const primary = gaps.find((g) => g.type === "hard") ?? gaps[0] ?? { skill: "—", type: "hard" as const };

  const others = await prisma.match.findMany({
    where: { candidateId: match.candidateId, stage: { not: "closed" }, id: { not: matchId } },
    select: { gaps: true },
  });
  const rolesCleared = others.filter((o) =>
    (JSON.parse(o.gaps) as SkillGap[]).some((g) => g.skill === primary.skill),
  ).length;
  const programCount = await prisma.program.count({ where: { closesGap: primary.skill } });

  await prisma.match.update({ where: { id: matchId }, data: { stage: "closed" } });
  await prisma.feedbackDraft.upsert({
    where: { matchId },
    update: { body, sent: true },
    create: { matchId, body, sent: true },
  });
  await prisma.growthReport.upsert({
    where: { matchId },
    update: {
      hardYou: match.hardFit,
      softYou: match.softFit,
      primaryGapSkill: primary.skill,
      primaryGapType: primary.type,
      rolesClearedIfClosed: rolesCleared,
      matchingProgramCount: programCount,
    },
    create: {
      matchId,
      roleTitle: match.opening.title,
      company: match.opening.company.name,
      hardYou: match.hardFit,
      hardBar: HARD_BAR,
      softYou: match.softFit,
      softBar: SOFT_BAR,
      primaryGapSkill: primary.skill,
      primaryGapType: primary.type,
      rolesClearedIfClosed: rolesCleared,
      matchingProgramCount: programCount,
    },
  });

  revalidatePath("/hiring-manager/pipeline");
  revalidatePath(`/hiring-manager/candidate/${matchId}`);
  revalidatePath("/candidate/matches");
}
