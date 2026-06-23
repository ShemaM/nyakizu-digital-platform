"use client";

export function RetryButton() {
  return (
    <button
      onClick={() => window.location.reload()}
      className="w-full py-3 rounded-xl text-sm font-bold"
      style={{ background: "#C8860A", color: "#0a1f10" }}
    >
      Try again
    </button>
  );
}