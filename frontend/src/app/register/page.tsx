"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  AlertCircle, ArrowLeft, ArrowRight,
  CheckCircle2, ClipboardList, ShieldCheck, Store,
} from "lucide-react";
import { Logo } from "@/components/Logo";
import { cn } from "@/lib/cn";
import { auth as authApi, ApiError, type RegisterPayload } from "@/lib/api";

// ─── Constants ────────────────────────────────────────────────────────────────
type Step     = "role" | "details" | "success";
type UserRole = "buyer" | "seller";

const BUSINESS_TYPES = [
  { key: "Retail shop",   label: "Retail shop",   desc: "I resell from a fixed shop." },
  { key: "Repair shop",   label: "Repair shop",   desc: "I repair and resell accessories." },
  { key: "Online seller", label: "Online seller", desc: "I sell via WhatsApp / social media." },
  { key: "Hawker",        label: "Hawker",        desc: "I sell on the street or on the move." },
];

const ROLES = [
  { value: "buyer"  as const, sw: "Mimi ni mnunuzi", en: "I buy from wholesalers", sub: "Hawkers, shops, repair centres, online resellers.", Icon: ClipboardList },
  { value: "seller" as const, sw: "Mimi ni muuzaji", en: "I sell to resellers",    sub: "Wholesalers supplying phone accessories to buyers.",  Icon: Store },
];

const INPUT = "w-full rounded-xl px-4 py-3 text-sm outline-none transition placeholder:text-slate-600 focus:ring-2 focus:ring-amber-500/40 bg-white/5 border border-white/10 text-white";

// ─── Field ────────────────────────────────────────────────────────────────────
function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-[11px] font-bold uppercase tracking-widest text-slate-500">
        {label}{required && <span className="ml-1 text-red-400">*</span>}
      </span>
      {children}
    </label>
  );
}

// ─── Inner page (needs useSearchParams so must be inside Suspense) ────────────
function RegisterContent() {
  const params = useSearchParams();

  const [step,    setStep]    = useState<Step>("role");
  const [role,    setRole]    = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");
  const [form,    setForm]    = useState({
    full_name: "", email: "", phone: "", password: "",
    location: "", main_supplier: "", business_type: BUSINESS_TYPES[0].key,
    shop_name: "", shop_location: "",
  });

  // Pre-select role from URL query param
  useEffect(() => {
    const t = params.get("type");
    if (t === "hawker")     { setRole("buyer");  setStep("details"); }
    if (t === "wholesaler") { setRole("seller"); setStep("details"); }
  }, [params]);

  const set = (k: string) =>
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value }));

  function reset() {
    setForm({ full_name: "", email: "", phone: "", password: "", location: "", main_supplier: "", business_type: BUSINESS_TYPES[0].key, shop_name: "", shop_location: "" });
    setRole(null); setStep("role"); setError("");
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!role) return;
    setError(""); setLoading(true);

    const payload: RegisterPayload = {
      full_name: form.full_name, email: form.email,
      phone: form.phone, password: form.password, role,
      ...(role === "buyer"
        ? { location: form.location, main_supplier: form.main_supplier, business_type: form.business_type }
        : { shop_name: form.shop_name, shop_location: form.shop_location, categories: [] }),
    };

    try {
      await authApi.register(payload);
      setStep("success");
    } catch (err) {
      console.error("Register error:", err);
      setError(err instanceof ApiError ? err.message : "Could not create account. Please try again.");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setLoading(false);
    }
  }

  // ── Success ──────────────────────────────────────────────────────────────────
  if (step === "success") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] px-5 text-center">
        <div className="w-16 h-16 rounded-full flex items-center justify-center mb-5"
          style={{ background: "rgba(74,222,128,0.1)", border: "1px solid rgba(74,222,128,0.3)" }}>
          <CheckCircle2 size={28} style={{ color: "#4ade80" }} />
        </div>
        <h1 className="text-2xl font-black text-white mb-2">Check your email</h1>
        <p className="text-sm text-slate-400 leading-relaxed mb-2 max-w-sm">
          We sent a verification link to{" "}
          <span className="font-bold text-amber-400">{form.email}</span>.
        </p>
        {role === "seller" && (
          <p className="mt-3 rounded-xl px-4 py-3 text-sm font-semibold max-w-sm"
            style={{ background: "rgba(200,134,10,0.08)", border: "1px solid rgba(200,134,10,0.25)", color: "#C8860A" }}>
            After verification, our team reviews your shop — usually 1–2 days.
          </p>
        )}
        <Link href="/login"
          className="mt-7 inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-black"
          style={{ background: "#C8860A", color: "#0a1f10" }}>
          Go to sign in <ArrowRight size={15} />
        </Link>
      </div>
    );
  }

  // ── Form ─────────────────────────────────────────────────────────────────────
  return (
    <>
      {/* Progress bar */}
      <div className="w-full h-0.5 rounded-full mb-8 overflow-hidden" style={{ background: "rgba(255,255,255,0.08)" }}>
        <div className="h-full rounded-full transition-all duration-500"
          style={{ width: step === "role" ? "50%" : "100%", background: "#C8860A" }} />
      </div>

      {/* Step label */}
      <p className="text-[11px] uppercase tracking-widest font-bold mb-1" style={{ color: "#C8860A" }}>
        Step {step === "role" ? "1" : "2"} of 2
      </p>
      <h1 className="text-2xl font-black text-white mb-6">
        {step === "role" ? "How do you trade?" : "Your details"}
      </h1>

      {/* ── Step 1: Role ──────────────────────────────────────────────────────── */}
      {step === "role" && (
        <div className="space-y-3">
          {ROLES.map(({ value, sw, en, sub, Icon }) => {
            const sel = role === value;
            return (
              <button key={value} type="button" onClick={() => setRole(value)}
                className={cn("w-full text-left rounded-2xl px-5 py-4 transition-all border",
                  sel ? "bg-amber-500/10 border-amber-500/50 ring-2 ring-amber-500/15"
                      : "bg-white/[0.03] border-white/10 hover:bg-white/[0.06]"
                )}>
                <div className="flex items-start gap-4">
                  <div className={cn("flex-none w-11 h-11 rounded-xl flex items-center justify-center border",
                    sel ? "bg-amber-500/15 border-amber-500/40 text-amber-400"
                        : "bg-white/5 border-white/10 text-slate-500")}>
                    <Icon size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={cn("text-[10px] uppercase tracking-widest font-bold mb-0.5",
                      sel ? "text-amber-400" : "text-slate-600")}>{sw}</p>
                    <p className="font-black text-sm text-white">{en}</p>
                    <p className="text-xs mt-0.5 text-slate-500">{sub}</p>
                  </div>
                  <div className={cn("flex-none w-4 h-4 rounded-full mt-1 border-2 flex items-center justify-center transition-all",
                    sel ? "border-amber-500 bg-amber-500" : "border-white/20")}>
                    {sel && <div className="w-1.5 h-1.5 rounded-full bg-[#0a1f10]" />}
                  </div>
                </div>
              </button>
            );
          })}

          <div className="flex items-center justify-between pt-2">
            <button type="button" disabled={!role}
              onClick={() => role && setStep("details")}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-black transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ background: "#C8860A", color: "#0a1f10" }}>
              Continue <ArrowRight size={15} />
            </button>
            <button type="button" onClick={reset}
              className="text-xs font-semibold text-slate-600 hover:text-slate-400 transition-colors">
              Clear
            </button>
          </div>
        </div>
      )}

      {/* ── Step 2: Details ───────────────────────────────────────────────────── */}
      {step === "details" && role && (
        <form onSubmit={submit} className="space-y-5">
          {error && (
            <div className="flex items-start gap-2.5 rounded-xl px-4 py-3 text-sm font-semibold"
              style={{ background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.25)", color: "#f87171" }}>
              <AlertCircle size={15} className="mt-0.5 shrink-0" /> {error}
            </div>
          )}

          {/* Role badge */}
          <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest"
            style={{ background: "rgba(200,134,10,0.1)", border: "1px solid rgba(200,134,10,0.25)", color: "#C8860A" }}>
            {role === "buyer" ? "Mnunuzi · Buyer" : "Muuzaji · Seller"}
          </span>

          {/* Common fields */}
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Full name" required>
              <input className={INPUT} value={form.full_name} onChange={set("full_name")} placeholder="Your name" required />
            </Field>
            <Field label="Phone" required>
              <input className={INPUT} type="tel" value={form.phone} onChange={set("phone")} placeholder="+254..." required />
            </Field>
            <Field label="Email" required>
              <input className={INPUT} type="email" value={form.email} onChange={set("email")} placeholder="name@example.com" required autoComplete="email" />
            </Field>
            <Field label="Password" required>
              <input className={INPUT} type="password" value={form.password} onChange={set("password")} placeholder="Create a password" required autoComplete="new-password" />
            </Field>
          </div>

          {/* Role-specific fields */}
          {role === "buyer" ? (
            <>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Where do you trade?" required>
                  <input className={INPUT} value={form.location} onChange={set("location")} placeholder="Nairobi, Eastleigh" required />
                </Field>
                <Field label="Main supplier (optional)">
                  <input className={INPUT} value={form.main_supplier} onChange={set("main_supplier")} placeholder="Who do you buy from?" />
                </Field>
              </div>
              <Field label="Business type" required>
                <div className="grid gap-2 sm:grid-cols-2 mt-1">
                  {BUSINESS_TYPES.map((bt) => {
                    const checked = form.business_type === bt.key;
                    return (
                      <label key={bt.key}
                        className={cn("flex cursor-pointer items-start gap-3 rounded-xl px-3 py-2.5 transition-all border",
                          checked ? "bg-amber-500/8 border-amber-500/35" : "bg-white/[0.03] border-white/8")}>
                        <input type="radio" name="business_type" value={bt.key} checked={checked}
                          onChange={(e) => setForm((f) => ({ ...f, business_type: e.target.value }))}
                          className="mt-0.5 h-4 w-4 shrink-0 accent-amber-500" />
                        <span>
                          <span className={cn("block text-sm font-black", checked ? "text-amber-400" : "text-white")}>{bt.label}</span>
                          <span className="block text-[11px] mt-0.5 text-slate-500">{bt.desc}</span>
                        </span>
                      </label>
                    );
                  })}
                </div>
              </Field>
            </>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Shop name" required>
                <input className={INPUT} value={form.shop_name} onChange={set("shop_name")} placeholder="Your shop name" required />
              </Field>
              <Field label="Shop location" required>
                <input className={INPUT} value={form.shop_location} onChange={set("shop_location")} placeholder="Nairobi, CBD" required />
              </Field>
            </div>
          )}

          {/* Trust note */}
          <div className="flex items-start gap-2.5 rounded-xl px-4 py-3 text-xs"
            style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
            <ShieldCheck size={13} className="mt-0.5 shrink-0" style={{ color: "#4ade80" }} />
            <span className="text-slate-500">
              {role === "seller"
                ? "Seller accounts are reviewed before going live — we'll contact you within 1–2 days."
                : "You only see suppliers who approve you. No open marketplace."}
            </span>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-1">
            <button type="button" onClick={() => setStep("role")}
              className="inline-flex items-center gap-1.5 text-sm font-bold text-slate-500 hover:text-slate-300 transition-colors">
              <ArrowLeft size={14} /> Back
            </button>
            <button type="submit" disabled={loading}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-black disabled:opacity-60 transition-all"
              style={{ background: "#C8860A", color: "#0a1f10" }}>
              {loading ? "Creating…" : "Create account"}
            </button>
          </div>
        </form>
      )}
    </>
  );
}

// ─── Page shell (server component wrapper) ────────────────────────────────────
export default function RegisterPage() {
  return (
    <main className="min-h-[100dvh]" style={{ background: "#0a1f10" }}>
      <div className="mx-auto max-w-lg px-5 py-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <Logo inverted />
          <Link href="/login" className="text-sm font-semibold text-slate-500 hover:text-slate-300 transition-colors">
            Have an account?{" "}
            <span style={{ color: "#C8860A" }}>Sign in</span>
          </Link>
        </div>

        {/* Content — Suspense boundary for useSearchParams */}
        <Suspense fallback={
          <div className="space-y-3">
            <div className="h-0.5 w-full rounded-full mb-8" style={{ background: "rgba(255,255,255,0.08)" }} />
            <div className="h-7 w-40 rounded-lg animate-pulse" style={{ background: "rgba(255,255,255,0.05)" }} />
            <div className="h-32 rounded-2xl animate-pulse" style={{ background: "rgba(255,255,255,0.03)" }} />
            <div className="h-32 rounded-2xl animate-pulse" style={{ background: "rgba(255,255,255,0.03)" }} />
          </div>
        }>
          <RegisterContent />
        </Suspense>
      </div>
    </main>
  );
}