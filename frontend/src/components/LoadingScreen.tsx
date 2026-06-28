"use client";

import React from "react";

export function LoadingScreen({
  title = "Loading…",
  subtitle = "Please wait",
}: {
  title?: string;
  subtitle?: string;
}) {
  return (
    <div className="min-h-[100dvh] w-full flex items-center justify-center px-6" role="status" aria-live="polite">
      <div className="w-full max-w-sm rounded-2xl p-6" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}>
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-full border-4 border-amber-500/30 border-t-amber-500 animate-spin" aria-hidden="true" />
          <div className="min-w-0">
            <div className="text-white font-black">{title}</div>
            <div className="text-slate-400 text-sm truncate">{subtitle}</div>
          </div>
        </div>
        <div className="h-2 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.08)" }}>
          <div className="h-full w-1/3 rounded-full bg-amber-500/70 animate-pulse" />
        </div>
      </div>
    </div>
  );
}

