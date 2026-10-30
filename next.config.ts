import type { NextConfig } from "next";

/**
 * Security headers for every response. The CSP is deliberately conservative:
 * it locks framing, <base>, form targets and plugins, but has no script-src —
 * a script policy would need per-request nonces for Next's inline scripts.
 */
const SECURITY_HEADERS = [
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  { key: "X-Frame-Options", value: "DENY" },
  {
    key: "Content-Security-Policy",
    value: "frame-ancestors 'none'; base-uri 'self'; form-action 'self'; object-src 'none'",
  },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  turbopack: {
    // Pin the workspace root to this project (absolute path) so Turbopack
    // doesn't try to infer it from ancestor lockfiles.
    root: process.cwd(),
  },
  async headers() {
    return [{ source: "/:path*", headers: SECURITY_HEADERS }];
  },
  // Serve the standalone marketing landing (public/landing.html) at the site
  // root. Everything else (login, register, the app) is handled by Next routes.
  async rewrites() {
    return {
      beforeFiles: [{ source: "/", destination: "/landing.html" }],
    };
  },
};

export default nextConfig;
