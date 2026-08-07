"use client";


export function LoadingScreen({
  title = "Loading…",
  subtitle = "Please wait",
}: {
  title?: string;
  subtitle?: string;
}) {
  return (
    <div className="min-h-[100dvh] w-full flex items-center justify-center px-6" role="status" aria-live="polite">
      <div className="w-full max-w-sm rounded-2xl p-6 bg-white border border-slate-100 shadow-sm">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-full border-4 border-role/25 border-t-role animate-spin" aria-hidden="true" />
          <div className="min-w-0">
            <div className="text-text-primary font-black">{title}</div>
            <div className="text-text-muted text-sm truncate">{subtitle}</div>
          </div>
        </div>
        <div className="h-2 rounded-full overflow-hidden bg-slate-100">
          <div className="h-full w-1/3 rounded-full bg-role/70 animate-pulse" />
        </div>
      </div>
    </div>
  );
}

