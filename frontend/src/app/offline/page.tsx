import Link from "next/link";
import { RetryButton } from "./RetryButton";

export const metadata = {
  title: "Offline",
};

export default function OfflinePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 text-center"
      style={{ background: "#0a1f10", color: "#e2e8f0" }}>
      <div className="w-16 h-16 rounded-full flex items-center justify-center mb-6"
        style={{ background: "rgba(200,134,10,0.1)", border: "1px solid rgba(200,134,10,0.3)" }}>
        <svg viewBox="0 0 24 24" fill="none" stroke="#C8860A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7">
          <line x1="1" y1="1" x2="23" y2="23" />
          <path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55" />
          <path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39" />
          <path d="M10.71 5.05A16 16 0 0 1 22.56 9" />
          <path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88" />
          <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
          <circle cx="12" cy="20" r="1" fill="#C8860A" stroke="none" />
        </svg>
      </div>
      <h1 className="text-2xl font-black mb-2" style={{ color: "#ffffff" }}>Hakuna mtandao</h1>
      <p className="text-sm mb-1" style={{ color: "#94a3b8" }}>You&apos;re offline right now.</p>
      <p className="text-sm mb-8 max-w-xs" style={{ color: "#64748b" }}>
        Draft orders you&apos;ve saved will sync automatically when your connection returns.
      </p>
      <div className="flex flex-col gap-3 w-full max-w-xs">
        <RetryButton />
        <Link href="/buyer/lists/new" className="w-full py-3 rounded-xl text-sm font-semibold text-center"
          style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", color: "#e2e8f0" }}>
          Continue drafting order
        </Link>
      </div>
      <p className="mt-10 text-xs" style={{ color: "#334155" }}>Nyakizu Digital Market · Offline mode</p>
    </main>
  );
}
