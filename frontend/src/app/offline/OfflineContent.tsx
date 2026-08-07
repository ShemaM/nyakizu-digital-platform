"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { RetryButton } from "./RetryButton";

// The service worker serves this page's cached HTML as a fallback for
// whatever URL actually failed — the address bar (and therefore
// window.location.pathname) still reflects the real request, e.g.
// "/auth/google/done", so we read it directly rather than relying on
// next/navigation (whose route context belongs to the cached /offline bundle).
export function OfflineContent() {
  const [pathname, setPathname] = useState<string | null>(null);

  useEffect(() => {
    setPathname(window.location.pathname);
  }, []);

  const isAuthContext = pathname?.startsWith("/auth/") ?? false;

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 text-center bg-ink-bg text-slate-300">
      <div className="w-16 h-16 rounded-full flex items-center justify-center mb-6 bg-brand-gold/10 border border-brand-gold/30">
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

      {isAuthContext ? (
        <>
          <h1 className="text-title-lg font-black mb-2 text-white">Sign-in didn&apos;t finish</h1>
          <p className="text-body mb-1 text-slate-400">
            We couldn&apos;t reach Nyakizu to complete your sign-in.
          </p>
          <p className="text-body mb-8 max-w-xs text-slate-500">
            Check your connection, then try again.
          </p>
          <div className="flex flex-col gap-3 w-full max-w-xs">
            <RetryButton />
            <Link
              href="/login"
              className="w-full py-3 rounded-xl text-body font-semibold text-center bg-white/[0.04] border border-white/10 text-slate-300 hover:bg-white/[0.08] transition-colors"
            >
              Back to sign in
            </Link>
          </div>
        </>
      ) : (
        <>
          <h1 className="text-title-lg font-black mb-2 text-white">Hakuna mtandao</h1>
          <p className="text-body mb-1 text-slate-400">You&apos;re offline right now.</p>
          <p className="text-body mb-8 max-w-xs text-slate-500">
            Draft orders you&apos;ve saved will sync automatically when your connection returns.
          </p>
          <div className="flex flex-col gap-3 w-full max-w-xs">
            <RetryButton />
            <Link
              href="/buyer/lists/new"
              className="w-full py-3 rounded-xl text-body font-semibold text-center bg-white/[0.04] border border-white/10 text-slate-300 hover:bg-white/[0.08] transition-colors"
            >
              Continue drafting order
            </Link>
          </div>
        </>
      )}

      <p className="mt-10 text-caption text-slate-600">Nyakizu Digital Market · Offline mode</p>
    </main>
  );
}
