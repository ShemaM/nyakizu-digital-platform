// Compiles sw-src/sw.ts -> public/sw.js with esbuild.
//
// Deliberately NOT wired through Next's own bundler: Next 16 defaults both
// `dev` and `build` to Turbopack, and Serwist's Turbopack integration
// (@serwist/turbopack) is new enough that its docs 404 in places — this repo
// has already been burned once by a Turbopack/build-tool interaction (see
// the reactCompiler comment in next.config.ts). serwist's runtime library is
// bundler-agnostic, so a small standalone esbuild step avoids that risk
// entirely while still genuinely using Serwist for the service worker.
import { build } from "esbuild";
import { existsSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const outdir = path.join(root, "public");

if (!existsSync(outdir)) mkdirSync(outdir, { recursive: true });

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

await build({
  entryPoints: [path.join(root, "sw-src", "sw.ts")],
  outfile: path.join(outdir, "sw.js"),
  bundle: true,
  format: "iife", // registered as a classic (non-module) SW — no import/export in the output
  target: "es2020",
  minify: process.env.NODE_ENV === "production",
  define: {
    __API_BASE_URL__: JSON.stringify(apiBaseUrl),
  },
});

console.log(`[build-sw] wrote public/sw.js (API_BASE_URL=${apiBaseUrl})`);
