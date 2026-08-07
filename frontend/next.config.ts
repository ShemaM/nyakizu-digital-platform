import type { NextConfig } from "next";
const nextConfig: NextConfig = {
  reactStrictMode: true,
  reactCompiler: false, // temporarily disabled — Turbopack dev mode + React Compiler
  // is a known trigger for "module factory is not available" errors (vercel/next.js
  // issues #74167, #84264, #90153). Re-enable once upstream fixes this, or scope it
  // to production only if you still want the compiler's optimizations there.
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api",
  },
  async headers() {
    return [
      {
        // Still a static public/sw.js — see scripts/build-sw.mjs — so it
        // needs these headers manually. app/manifest.ts, by contrast, is a
        // Next.js route and sets its own Content-Type/caching automatically.
        source: "/sw.js",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=0,must-revalidate",
          },
          {
            key: "Service-Worker-Allowed",
            value: "/",
          },
          {
            key: "Content-Type",
            value: "application/javascript; charset=utf-8",
          },
        ],
      },
    ];
  },
};
export default nextConfig;