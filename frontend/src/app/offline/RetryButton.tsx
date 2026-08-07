"use client";

export function RetryButton() {
  return (
    <button
      onClick={() => window.location.reload()}
      className="w-full py-3 rounded-xl text-body font-bold bg-brand-gold text-ink-bg"
    >
      Try again
    </button>
  );
}