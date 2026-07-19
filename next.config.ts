import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    // Pin the workspace root to this project (absolute path) so Turbopack
    // doesn't try to infer it from ancestor lockfiles.
    root: process.cwd(),
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
