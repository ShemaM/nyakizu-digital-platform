"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Eye, EyeOff } from "lucide-react";
import { Logo } from "@/components/Logo";
import { useAuth } from "@/lib/auth-context";
import { ApiError } from "@/lib/api";

const inputCls =
  "w-full rounded-xl px-4 py-3 text-sm font-medium outline-none transition-all placeholder:text-slate-600 focus:ring-2";
const inputStyle = {
  background: "rgba(255,255,255,0.05)",
  border: "1px solid rgba(255,255,255,0.1)",
  color: "#e2e8f0",
  ["--tw-ring-color" as string]: "rgba(200,134,10,0.4)",
};

export default function LoginPage() {
  const { login } = useAuth();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword]     = useState("");
  const [showPw, setShowPw]         = useState(false);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(identifier.trim(), password);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not sign in. Please try again.");
      setLoading(false);
    }
  }

  return (
    <main
      className="min-h-screen flex flex-col items-center justify-center px-5 py-12"
      style={{ background: "#0a1f10" }}
    >
      {/* Noise texture */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-0 opacity-[0.025]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundSize: "200px",
        }}
      />

      <div className="relative z-10 w-full max-w-sm">
        {/* Logo */}
        <div className="mb-10 flex justify-center">
          <Logo inverted />
        </div>

        {/* Card */}
        <div
          className="rounded-2xl px-6 py-7"
          style={{
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          {/* Heading */}
          <div className="mb-6">
            <h1 className="text-xl font-black text-white">Karibu tena</h1>
            <p className="mt-0.5 text-sm" style={{ color: "#64748b" }}>
              Sign in with your email or phone number.
            </p>
          </div>

          {/* Error */}
          {error && (
            <div
              className="mb-4 flex items-start gap-2.5 rounded-xl px-4 py-3 text-sm font-semibold"
              style={{
                background: "rgba(248,113,113,0.08)",
                border: "1px solid rgba(248,113,113,0.25)",
                color: "#f87171",
              }}
            >
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <label className="block space-y-1.5">
              <span
                className="text-[11px] font-bold uppercase tracking-widest"
                style={{ color: "#64748b" }}
              >
                Email or phone
              </span>
              <input
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="name@example.com or +254..."
                className={inputCls}
                style={inputStyle}
                required
                autoComplete="username"
              />
            </label>

            <label className="block space-y-1.5">
              <span
                className="text-[11px] font-bold uppercase tracking-widest"
                style={{ color: "#64748b" }}
              >
                Password
              </span>
              <div className="relative">
                <input
                  type={showPw ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Your password"
                  className={inputCls}
                  style={{ ...inputStyle, paddingRight: "2.75rem" }}
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPw((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 transition-colors"
                  style={{ color: "#475569" }}
                  aria-label={showPw ? "Hide password" : "Show password"}
                >
                  {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </label>

            <button
              type="submit"
              disabled={loading}
              className="mt-1 w-full flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold transition-all disabled:opacity-60"
              style={{ background: "#C8860A", color: "#0a1f10" }}
            >
              {loading ? "Signing in…" : "Sign in"}
              {!loading && <ArrowRight size={15} />}
            </button>
          </form>
        </div>

        {/* Footer */}
        <p className="mt-5 text-center text-sm" style={{ color: "#475569" }}>
          New here?{" "}
          <Link
            href="/register"
            className="font-bold transition-colors"
            style={{ color: "#C8860A" }}
          >
            Create a free account
          </Link>
        </p>
      </div>
    </main>
  );
}