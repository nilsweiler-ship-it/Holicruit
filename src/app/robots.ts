import type { MetadataRoute } from "next";

/**
 * Crawlers may index the landing and marketing pages only. Everything behind
 * sign-in, plus token links (/claim, /endorse) and the API, is disallowed.
 * (robots.txt is advisory — access control still lives in the app.)
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/pricing", "/contact", "/privacy", "/terms", "/imprint"],
      disallow: [
        "/api/",
        "/candidate",
        "/hiring-manager",
        "/recruiter",
        "/provider",
        "/settings",
        "/feedback",
        "/select-role",
        "/claim/",
        "/endorse/",
        "/login",
        "/register",
      ],
    },
  };
}
