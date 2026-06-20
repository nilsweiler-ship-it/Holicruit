import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    // Pin the workspace root to this project (absolute path) so Turbopack
    // doesn't try to infer it from ancestor lockfiles.
    root: process.cwd(),
  },
};

export default nextConfig;
