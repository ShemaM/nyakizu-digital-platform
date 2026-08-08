import type { NextConfig } from "next";

// Same value src/lib/api.ts derives BACKEND_ORIGIN from — kept in sync by
// reading the same env var rather than duplicating the URL.
const BACKEND_ORIGIN = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api").replace(/\/api\/?$/, "");

const nextConfig: NextConfig = {
  reactStrictMode: true,
  reactCompiler: false, // temporarily disabled — Turbopack dev mode + React Compiler
  // is a known trigger for "module factory is not available" errors (vercel/next.js
  // issues #74167, #84264, #90153). Re-enable once upstream fixes this, or scope it
  // to production only if you still want the compiler's optimizations there.
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api",
  },
  async rewrites() {
    // Proxies /api/* to the real Django backend so the browser only ever
    // talks to this app's own origin — see the comment on API_BASE_URL in
    // lib/api.ts for why (cross-site cookie blocking in Brave/Safari).
    return [
      {
        source: "/api/:path*",
        destination: `${BACKEND_ORIGIN}/api/:path*`,
      },
    ];
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