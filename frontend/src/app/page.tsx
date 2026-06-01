"use client";

import { useEffect, useId, useRef, useState } from "react";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ChevronLeft,
  ClipboardList,
  Eye,
  EyeOff,
  Loader2,
  Package,
  ShoppingBag,
  Store,
  Wallet,
  WifiOff,
  X,
  Zap,
} from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────────

type Role = "buyer" | "seller";
type Step = "role" | "account" | "details" | "done";

interface AccountFields { fullName: string; phone: string; password: string }
interface BuyerFields   { location: string; mainSupplier: string; businessType: string }
interface SellerFields  { shopName: string; location: string; categories: string[] }

// ── Constants ─────────────────────────────────────────────────────────────────

const CATEGORY_OPTIONS = [
  "Tempered glass",
  "Phone cases & covers",
  "Chargers & adapters",
  "USB & charging cables",
  "Batteries & power banks",
  "Earphones & earbuds",
  "Memory cards (SD cards)",
  "Phone repair parts",
];

const BUSINESS_TYPES = ["Hawker", "Retail shop", "Repair shop", "Online seller"];

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

// ── Utility ───────────────────────────────────────────────────────────────────

function cx(...classes: (string | false | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

// ── AppLogo ───────────────────────────────────────────────────────────────────

function AppLogo({ inverted = false }: { inverted?: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600">
        <span className="text-sm font-extrabold tracking-tight text-white">N</span>
      </div>
      <div className="leading-none">
        <p className={cx("text-[15px] font-bold leading-none", inverted ? "text-white" : "text-slate-900")}>
          Nyakizu
        </p>
        <p className={cx("mt-1 text-[10px] font-semibold uppercase tracking-widest", inverted ? "text-white/40" : "text-slate-400")}>
          Digital Market
        </p>
      </div>
    </div>
  );
}

// ── StepDots — compact progress indicator ─────────────────────────────────────

function StepDots({ step, role }: { step: Step; role: Role | null }) {
  const steps = [
    { id: "role" as const,    label: "Role" },
    { id: "account" as const, label: "Account" },
    { id: "details" as const, label: role === "seller" ? "Shop" : "Profile" },
  ];
  const idx = step === "done" ? 3 : steps.findIndex((s) => s.id === step);

  return (
    <nav aria-label="Registration progress" className="flex items-center gap-2">
      {steps.map((s, i) => {
        const done   = i < idx || step === "done";
        const active = i === idx && step !== "done";
        return (
          <div key={s.id} className="flex items-center gap-2">
            <div className="flex flex-col items-center gap-1">
              <div
                aria-current={active ? "step" : undefined}
                className={cx(
                  "flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-bold transition-all duration-200",
                  done   && "bg-blue-600 text-white",
                  active && "bg-blue-600 text-white ring-4 ring-blue-500/20",
                  !done && !active && "bg-slate-100 text-slate-400",
                )}
              >
                {done ? "✓" : i + 1}
              </div>
              <span className={cx(
                "text-[10px] font-semibold whitespace-nowrap",
                done || active ? "text-slate-600" : "text-slate-400",
              )}>
                {s.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className={cx(
                "mb-4 h-px w-8 transition-colors duration-300",
                done ? "bg-blue-400" : "bg-slate-200",
              )} />
            )}
          </div>
        );
      })}
    </nav>
  );
}

// ── FieldInput ────────────────────────────────────────────────────────────────

interface FieldProps {
  id: string; label: string; value: string;
  onChange: (v: string) => void;
  placeholder?: string; type?: string;
  error?: string; hint?: string;
  autoComplete?: string;
  trailing?: React.ReactNode;
  optional?: boolean;
}

function FieldInput({ id, label, value, onChange, placeholder, type = "text",
  error, hint, autoComplete, trailing, optional }: FieldProps) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="flex items-center gap-1.5 text-sm font-medium text-slate-700">
        {label}
        {optional && <span className="text-xs font-normal text-slate-400">(optional)</span>}
      </label>
      <div className="relative">
        <input
          id={id} type={type} value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder} autoComplete={autoComplete}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${id}-err` : hint ? `${id}-hint` : undefined}
          className={cx(
            "h-11 w-full rounded-xl border bg-white px-4 text-sm text-slate-900 outline-none transition",
            "placeholder:text-slate-400 focus:ring-3",
            trailing ? "pr-11" : "",
            error
              ? "border-red-300 focus:border-red-400 focus:ring-red-500/10"
              : "border-slate-200 focus:border-blue-500 focus:ring-blue-500/10",
          )}
        />
        {trailing && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-3.5">
            {trailing}
          </div>
        )}
      </div>
      {error ? (
        <p id={`${id}-err`} role="alert" className="flex items-center gap-1 text-xs font-medium text-red-600">
          <X size={11} strokeWidth={2.5} />{error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="text-xs text-slate-400">{hint}</p>
      ) : null}
    </div>
  );
}

// ── Step 1 — RoleChoice ───────────────────────────────────────────────────────

const ROLE_CONFIG = {
  buyer: {
    Icon: ShoppingBag,
    label: "Buyer",
    headline: "Order from your trusted suppliers",
    description: "Browse your supplier's catalog, build a shopping list, and send it digitally. Track what you owe from your phone.",
  },
  seller: {
    Icon: Store,
    label: "Wholesaler / Seller",
    headline: "Set up your digital store",
    description: "Create your catalog, share one WhatsApp link. Buyers order from anywhere. Track fulfillment, M-Pesa payments, and debts.",
  },
} as const;

function RoleChoice({ selectedRole, setSelectedRole, onNext }: {
  selectedRole: Role | null;
  setSelectedRole: (r: Role) => void;
  onNext: () => void;
}) {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-slate-900">How do you want to trade?</h2>
        <p className="mt-1 text-sm text-slate-500">
          Choose your role. You can add the other one later.
        </p>
      </div>

      {/* Role cards */}
      <div className="space-y-2.5">
        {(["buyer", "seller"] as Role[]).map((role) => {
          const { Icon, label, headline, description } = ROLE_CONFIG[role];
          const selected = selectedRole === role;
          return (
            <button
              key={role}
              type="button"
              onClick={() => setSelectedRole(role)}
              className={cx(
                "group relative w-full rounded-2xl border-2 p-4 text-left transition-all duration-150",
                selected
                  ? "border-blue-500 bg-blue-50/60"
                  : "border-slate-200 bg-white hover:border-slate-300",
              )}
            >
              <div className="flex items-start gap-3">
                <div className={cx(
                  "mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors",
                  selected ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-500 group-hover:bg-slate-200",
                )}>
                  <Icon size={19} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-semibold text-slate-900">{label}</p>
                    {selected && <CheckCircle2 size={16} className="shrink-0 text-blue-600" />}
                  </div>
                  <p className="mt-0.5 text-xs font-medium text-slate-500">{headline}</p>
                  <p className="mt-1 text-xs leading-relaxed text-slate-400">{description}</p>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Divider + Google */}
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <div className="h-px flex-1 bg-slate-200" />
          <span className="text-xs font-semibold text-slate-400">or</span>
          <div className="h-px flex-1 bg-slate-200" />
        </div>
        <a
          href={`${API_BASE}/accounts/google/login/`}
          className="flex h-10 w-full items-center justify-center gap-2.5 rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-700 transition hover:bg-slate-50"
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0" aria-hidden="true">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Continue with Google
        </a>
      </div>

      {/* Primary CTA */}
      <button
        type="button"
        disabled={!selectedRole}
        onClick={onNext}
        className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 text-sm font-semibold text-white transition hover:bg-blue-700 active:bg-blue-800 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
      >
        {selectedRole ? `Continue as ${ROLE_CONFIG[selectedRole].label}` : "Select a role to continue"}
        {selectedRole && <ArrowRight size={15} />}
      </button>
    </div>
  );
}

// ── Step 2 — AccountForm ──────────────────────────────────────────────────────

function AccountForm({ account, setAccount, onBack, onNext }: {
  account: AccountFields;
  setAccount: (p: Partial<AccountFields>) => void;
  onBack: () => void;
  onNext: () => void;
}) {
  const uid = useId();
  const headingRef = useRef<HTMLHeadingElement>(null);
  const [errors, setErrors] = useState({ fullName: "", phone: "", password: "" });
  const [showPass, setShowPass] = useState(false);

  useEffect(() => { headingRef.current?.focus(); }, []);

  function validate() {
    const e = { fullName: "", phone: "", password: "" };
    if (!account.fullName.trim())    e.fullName = "Enter your full name.";
    if (!account.phone.trim())       e.phone    = "Enter your phone number.";
    if (account.password.length < 6) e.password = "Use at least 6 characters.";
    setErrors(e);
    return !e.fullName && !e.phone && !e.password;
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (validate()) onNext();
  }

  return (
    <form onSubmit={submit} noValidate className="space-y-5">
      <div>
        <h2 ref={headingRef} tabIndex={-1} className="text-xl font-bold text-slate-900 outline-none">
          Create your account
        </h2>
        <p className="mt-1 text-sm text-slate-500">Your details are private and never shared.</p>
      </div>

      <div className="space-y-3.5">
        <FieldInput
          id={`${uid}-name`} label="Full name"
          value={account.fullName} onChange={(v) => setAccount({ fullName: v })}
          placeholder="e.g. Claudine Mutesi" autoComplete="name"
          error={errors.fullName}
        />
        <FieldInput
          id={`${uid}-phone`} label="Phone number"
          value={account.phone} onChange={(v) => setAccount({ phone: v })}
          placeholder="07XX XXX XXX" type="tel" autoComplete="tel"
          hint="Used to log in — no username to remember"
          error={errors.phone}
        />
        <FieldInput
          id={`${uid}-pass`} label="Password"
          value={account.password} onChange={(v) => setAccount({ password: v })}
          placeholder="At least 6 characters"
          type={showPass ? "text" : "password"} autoComplete="new-password"
          error={errors.password}
          trailing={
            <button type="button" onClick={() => setShowPass((p) => !p)}
              aria-label={showPass ? "Hide password" : "Show password"}
              className="text-slate-400 transition hover:text-slate-600">
              {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          }
        />
      </div>

      <div className="flex gap-2.5">
        <button type="button" onClick={onBack} aria-label="Back"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-slate-200 text-slate-500 transition hover:bg-slate-50">
          <ChevronLeft size={18} />
        </button>
        <button type="submit"
          className="flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-blue-600 text-sm font-semibold text-white transition hover:bg-blue-700 active:bg-blue-800">
          Continue <ArrowRight size={15} />
        </button>
      </div>
    </form>
  );
}

// ── Step 3a — BuyerDetailsForm ────────────────────────────────────────────────

function BuyerDetailsForm({ buyer, setBuyer, onBack, onDone, isLoading, apiError }: {
  buyer: BuyerFields; setBuyer: (p: Partial<BuyerFields>) => void;
  onBack: () => void; onDone: () => void;
  isLoading: boolean; apiError: string;
}) {
  const uid = useId();
  const headingRef = useRef<HTMLHeadingElement>(null);
  const [errors, setErrors] = useState({ location: "", businessType: "" });

  useEffect(() => { headingRef.current?.focus(); }, []);

  function validate() {
    const e = { location: "", businessType: "" };
    if (!buyer.location.trim()) e.location     = "Enter where you sell from.";
    if (!buyer.businessType)    e.businessType  = "Choose how you trade.";
    setErrors(e);
    return !e.location && !e.businessType;
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (validate()) onDone();
  }

  return (
    <form onSubmit={submit} noValidate className="space-y-5">
      <div>
        <h2 ref={headingRef} tabIndex={-1} className="text-xl font-bold text-slate-900 outline-none">
          Tell suppliers about you
        </h2>
        <p className="mt-1 text-sm text-slate-500">Helps wholesalers approve you faster.</p>
      </div>

      {apiError && (
        <div role="alert" className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          <X size={14} className="mt-0.5 shrink-0" strokeWidth={2.5} />{apiError}
        </div>
      )}

      <div className="space-y-3.5">
        <FieldInput
          id={`${uid}-loc`} label="Where do you sell from?"
          value={buyer.location} onChange={(v) => setBuyer({ location: v })}
          placeholder="e.g. Eastleigh, Nairobi" error={errors.location}
        />

        <div className="space-y-2">
          <div className="flex items-baseline justify-between">
            <p className="text-sm font-medium text-slate-700">How do you trade?</p>
            {errors.businessType && (
              <p role="alert" className="flex items-center gap-1 text-xs font-medium text-red-600">
                <X size={10} strokeWidth={2.5} />{errors.businessType}
              </p>
            )}
          </div>
          <div className="grid grid-cols-2 gap-2">
            {BUSINESS_TYPES.map((type) => {
              const active = buyer.businessType === type;
              return (
                <button key={type} type="button" onClick={() => setBuyer({ businessType: type })}
                  className={cx(
                    "rounded-xl border py-2.5 text-sm font-medium transition-all duration-150",
                    active
                      ? "border-blue-500 bg-blue-600 text-white"
                      : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50",
                  )}>
                  {type}
                </button>
              );
            })}
          </div>
        </div>

        <FieldInput
          id={`${uid}-sup`} label="Usual supplier"
          value={buyer.mainSupplier} onChange={(v) => setBuyer({ mainSupplier: v })}
          placeholder="e.g. RNG Plaza Accessories" optional
        />
      </div>

      <div className="flex gap-2.5">
        <button type="button" onClick={onBack} disabled={isLoading} aria-label="Back"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-slate-200 text-slate-500 transition hover:bg-slate-50 disabled:opacity-40">
          <ChevronLeft size={18} />
        </button>
        <button type="submit" disabled={isLoading}
          className="flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-blue-600 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:bg-blue-400">
          {isLoading
            ? <><Loader2 size={14} className="animate-spin" /> Creating…</>
            : <>Create buyer account <ArrowRight size={15} /></>}
        </button>
      </div>
    </form>
  );
}

// ── Step 3b — SellerDetailsForm ───────────────────────────────────────────────

function SellerDetailsForm({ seller, setSeller, onBack, onDone, isLoading, apiError }: {
  seller: SellerFields; setSeller: (p: Partial<SellerFields>) => void;
  onBack: () => void; onDone: () => void;
  isLoading: boolean; apiError: string;
}) {
  const uid = useId();
  const headingRef = useRef<HTMLHeadingElement>(null);
  const [errors, setErrors] = useState({ shopName: "", location: "", categories: "" });

  useEffect(() => { headingRef.current?.focus(); }, []);

  function toggleCat(cat: string) {
    setSeller({
      categories: seller.categories.includes(cat)
        ? seller.categories.filter((c) => c !== cat)
        : [...seller.categories, cat],
    });
  }

  function validate() {
    const e = { shopName: "", location: "", categories: "" };
    if (!seller.shopName.trim())   e.shopName   = "Enter your shop name.";
    if (!seller.location.trim())   e.location   = "Enter your shop location.";
    if (!seller.categories.length) e.categories = "Choose at least one.";
    setErrors(e);
    return !e.shopName && !e.location && !e.categories;
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (validate()) onDone();
  }

  return (
    <form onSubmit={submit} noValidate className="space-y-5">
      <div>
        <h2 ref={headingRef} tabIndex={-1} className="text-xl font-bold text-slate-900 outline-none">
          Register your shop
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Reviewed by our team before going live.
        </p>
      </div>

      {apiError && (
        <div role="alert" className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          <X size={14} className="mt-0.5 shrink-0" strokeWidth={2.5} />{apiError}
        </div>
      )}

      <div className="space-y-3.5">
        <FieldInput
          id={`${uid}-shopname`} label="Shop name"
          value={seller.shopName} onChange={(v) => setSeller({ shopName: v })}
          placeholder="e.g. RNG Plaza Accessories" error={errors.shopName}
        />
        <FieldInput
          id={`${uid}-loc`} label="Shop location"
          value={seller.location} onChange={(v) => setSeller({ location: v })}
          placeholder="e.g. Luthuli Avenue, Nairobi" error={errors.location}
        />

        <div className="space-y-2">
          <div className="flex items-baseline justify-between">
            <p className="text-sm font-medium text-slate-700">What do you sell?</p>
            {errors.categories
              ? <p role="alert" className="flex items-center gap-1 text-xs font-medium text-red-600">
                  <X size={10} strokeWidth={2.5} />{errors.categories}
                </p>
              : seller.categories.length > 0
                ? <p className="text-xs text-blue-600 font-medium">{seller.categories.length} selected</p>
                : <p className="text-xs text-slate-400">Select all that apply</p>
            }
          </div>
          <div className="grid grid-cols-2 gap-2">
            {CATEGORY_OPTIONS.map((cat) => {
              const active = seller.categories.includes(cat);
              return (
                <button key={cat} type="button" onClick={() => toggleCat(cat)} aria-pressed={active}
                  className={cx(
                    "rounded-xl border px-3 py-2 text-left text-xs font-medium transition-all duration-150",
                    active
                      ? "border-blue-500 bg-blue-600 text-white"
                      : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50",
                  )}>
                  {cat}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="flex gap-2.5">
        <button type="button" onClick={onBack} disabled={isLoading} aria-label="Back"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-slate-200 text-slate-500 transition hover:bg-slate-50 disabled:opacity-40">
          <ChevronLeft size={18} />
        </button>
        <button type="submit" disabled={isLoading}
          className="flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-blue-600 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:bg-blue-400">
          {isLoading
            ? <><Loader2 size={14} className="animate-spin" /> Submitting…</>
            : <>Submit for verification <ArrowRight size={15} /></>}
        </button>
      </div>
    </form>
  );
}

// ── Step 4 — DoneStep ─────────────────────────────────────────────────────────

function DoneStep({ role, account, buyer, seller, savedOffline, reset }: {
  role: Role; account: AccountFields; buyer: BuyerFields;
  seller: SellerFields; savedOffline: boolean; reset: () => void;
}) {
  const isSeller  = role === "seller";
  const firstName = account.fullName.split(" ")[0] || "you";

  if (savedOffline) {
    return (
      <div className="space-y-5 py-2 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50">
          <WifiOff size={28} className="text-amber-500" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900">No internet connection</h2>
          <p className="mt-1.5 text-sm leading-relaxed text-slate-500">
            Details saved on this device. Come back with Wi-Fi or data to complete registration.
          </p>
        </div>
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-left">
          <ol className="space-y-1 pl-4 list-decimal text-sm text-amber-800">
            <li>Connect to the internet.</li>
            <li>Return to this page and resubmit.</li>
          </ol>
        </div>
        <button type="button" onClick={reset}
          className="w-full rounded-xl bg-blue-600 py-3 text-sm font-semibold text-white transition hover:bg-blue-700">
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-5 py-2">
      {/* Success header */}
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-green-50">
          <CheckCircle2 size={28} className="text-green-600" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">
          {isSeller ? "Verification submitted!" : "Account created!"}
        </h2>
        <p className="mt-1.5 text-sm leading-relaxed text-slate-500">
          {isSeller
            ? `${seller.shopName} is queued for review. We'll contact ${firstName} on ${account.phone}.`
            : `Welcome, ${firstName}! Your buyer account is ready.`}
        </p>
      </div>

      {/* Next steps */}
      <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
        <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-3">
          What to do next
        </p>
        <ul className="space-y-2.5">
          {(isSeller
            ? ["Wait for admin verification (we'll call you)", "Add products to your catalog", "Share your store link on WhatsApp"]
            : ["Open your trusted supplier's store", "Build and send your shopping list", "Track your orders and balances"]
          ).map((item) => (
            <li key={item} className="flex items-start gap-2.5 text-sm text-slate-700">
              <CheckCircle2 size={15} className="mt-0.5 shrink-0 text-green-500" />
              {item}
            </li>
          ))}
        </ul>
      </div>

      <button type="button" onClick={reset}
        className="w-full rounded-xl border border-slate-200 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50">
        Create another account
      </button>
    </div>
  );
}

// ── OnboardingWizard ──────────────────────────────────────────────────────────

interface WizardProps {
  role: Role | null;      setRole: (r: Role) => void;
  step: Step;             setStep: (s: Step) => void;
  account: AccountFields; setAccount: (p: Partial<AccountFields>) => void;
  buyer: BuyerFields;     setBuyer: (p: Partial<BuyerFields>) => void;
  seller: SellerFields;   setSeller: (p: Partial<SellerFields>) => void;
  isLoading: boolean; apiError: string; savedOffline: boolean;
  reset: () => void; onDone: () => void;
}

function OnboardingWizard(props: WizardProps) {
  const { role, setRole, step, setStep, account, setAccount, buyer, setBuyer,
          seller, setSeller, isLoading, apiError, savedOffline, reset, onDone } = props;

  return (
    <div className="overflow-hidden rounded-2xl bg-white shadow-[0_0_0_1px_rgba(0,0,0,0.07),0_16px_48px_rgba(0,0,0,0.12)]">
      {/* Progress header */}
      {step !== "done" && (
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <StepDots step={step} role={role} />
          <p className="text-xs font-medium text-slate-400">Free · No card needed</p>
        </div>
      )}

      {/* Step content */}
      <div className="px-6 py-6">
        <div key={step} className="step-in">
          {step === "role" && (
            <RoleChoice selectedRole={role} setSelectedRole={setRole} onNext={() => setStep("account")} />
          )}
          {step === "account" && (
            <AccountForm account={account} setAccount={setAccount} onBack={() => setStep("role")} onNext={() => setStep("details")} />
          )}
          {step === "details" && role === "buyer" && (
            <BuyerDetailsForm buyer={buyer} setBuyer={setBuyer} onBack={() => setStep("account")} onDone={onDone} isLoading={isLoading} apiError={apiError} />
          )}
          {step === "details" && role === "seller" && (
            <SellerDetailsForm seller={seller} setSeller={setSeller} onBack={() => setStep("account")} onDone={onDone} isLoading={isLoading} apiError={apiError} />
          )}
          {step === "done" && role && (
            <DoneStep role={role} account={account} buyer={buyer} seller={seller} savedOffline={savedOffline} reset={reset} />
          )}
        </div>
      </div>
    </div>
  );
}

// ── App previews ──────────────────────────────────────────────────────────────

function BuyerPreview() {
  return (
    <div className="overflow-hidden rounded-2xl bg-slate-900 text-white">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-blue-300">Buyer</p>
          <p className="text-sm font-bold mt-0.5">My Suppliers</p>
        </div>
        <span className="flex items-center gap-1 rounded-full bg-green-500/15 px-2.5 py-1 text-[10px] font-semibold text-green-300">
          <span className="h-1.5 w-1.5 rounded-full bg-green-400" />
          Online
        </span>
      </div>

      {/* Suppliers */}
      <div className="px-4 pt-3 space-y-2">
        {[
          { name: "RNG Plaza Accessories", tag: "Verified", debt: "KES 7,000 owed", debtColor: "text-amber-300" },
          { name: "Espoir Mobile",          tag: "Verified", debt: "Cleared",        debtColor: "text-green-400" },
        ].map((s) => (
          <div key={s.name} className="flex items-center justify-between rounded-xl bg-white/8 px-3 py-2.5">
            <div>
              <p className="text-xs font-semibold">{s.name}</p>
              <p className="text-[10px] text-white/40 mt-0.5">{s.tag}</p>
            </div>
            <p className={`text-[11px] font-bold ${s.debtColor}`}>{s.debt}</p>
          </div>
        ))}
      </div>

      {/* Shopping list */}
      <div className="m-4 mt-3 rounded-xl bg-white p-3 text-slate-900">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-bold text-slate-700">Shopping list · RNG Plaza</p>
          <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[9px] font-bold text-amber-700 uppercase tracking-wide">
            Draft
          </span>
        </div>
        {[
          { item: "Samsung A54 tempered glass × 2", price: "KES 300" },
          { item: "iPhone 13 clear cover × 1",      price: "KES 250" },
          { item: "65W Type-C charger × 1",         price: "KES 450" },
        ].map((r) => (
          <div key={r.item} className="flex justify-between py-0.5 text-[11px]">
            <span className="text-slate-500 truncate pr-2">{r.item}</span>
            <span className="font-semibold text-slate-800 shrink-0">{r.price}</span>
          </div>
        ))}
        <div className="mt-2.5 flex justify-between border-t border-slate-100 pt-2 text-xs font-bold">
          <span className="text-slate-500">Draft total</span>
          <span className="text-slate-900">KES 1,000</span>
        </div>
      </div>
    </div>
  );
}

function SellerPreview() {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-blue-600">Wholesaler</p>
          <p className="text-sm font-bold text-slate-900 mt-0.5">RNG Plaza · Today</p>
        </div>
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
          <Store size={16} />
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-3 gap-2 px-4 pt-3">
        {[
          { label: "Orders",      value: "12",     fg: "text-slate-900" },
          { label: "Active debt", value: "KES 9k", fg: "text-amber-600" },
          { label: "Cleared",     value: "KES 6k", fg: "text-green-600" },
        ].map((m) => (
          <div key={m.label} className="rounded-xl bg-slate-50 p-2 text-center">
            <p className={`text-sm font-bold ${m.fg}`}>{m.value}</p>
            <p className="text-[9px] font-semibold uppercase text-slate-400 mt-0.5">{m.label}</p>
          </div>
        ))}
      </div>

      {/* Activity */}
      <div className="px-4 pb-4 pt-3 space-y-2">
        {[
          { Icon: ClipboardList, title: "New list from Fatuma",   meta: "Submitted · KES 1,200", dot: "bg-blue-500" },
          { Icon: Package,       title: "Order #1048 sourcing",   meta: "Sourcing & Packing",    dot: "bg-amber-500" },
          { Icon: Wallet,        title: "M-Pesa received",        meta: "KES 3,000 · Hassan",   dot: "bg-green-500" },
        ].map(({ Icon, title, meta, dot }) => (
          <div key={title} className="flex items-center gap-2.5 rounded-xl border border-slate-100 px-3 py-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
              <Icon size={13} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-slate-900 truncate">{title}</p>
              <p className="text-[10px] text-slate-400">{meta}</p>
            </div>
            <span className={`h-2 w-2 shrink-0 rounded-full ${dot}`} />
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Navbar ────────────────────────────────────────────────────────────────────

function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/95 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <AppLogo inverted />
        <nav className="flex items-center gap-1 sm:gap-2">
          <a href="#features"
            className="hidden h-9 items-center px-3 text-sm font-medium text-white/60 transition hover:text-white sm:inline-flex">
            How it works
          </a>
          <a href={`${API_BASE}/accounts/login/`}
            className="hidden h-9 items-center rounded-xl px-3 text-sm font-medium text-white/70 transition hover:text-white sm:inline-flex">
            Sign in
          </a>
          <a href="#signup"
            className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white transition hover:bg-blue-500">
            Get started
            <ArrowRight size={14} />
          </a>
        </nav>
      </div>
    </header>
  );
}

// ── HeroSection ───────────────────────────────────────────────────────────────

function HeroSection() {
  return (
    <div className="space-y-10 py-10 lg:py-16">
      {/* Text block */}
      <div className="space-y-6">
        <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/8 px-3.5 py-1.5 text-xs font-semibold text-white/70">
          <span className="h-1.5 w-1.5 rounded-full bg-green-400" aria-hidden />
          For phone accessories traders in Rwanda &amp; East Africa
        </div>

        <h1 className="text-4xl font-extrabold leading-[1.08] tracking-tight text-white sm:text-5xl lg:text-6xl">
          Set up your store.<br />
          <span className="text-blue-400">Share it on WhatsApp.</span><br />
          <span className="text-white/80">Buyers order from anywhere.</span>
        </h1>

        <p className="max-w-lg text-base leading-relaxed text-slate-400">
          Nyakizu replaces WhatsApp orders and notebooks with a free digital store.
          Buyers browse your catalog and send shopping lists. You track orders,
          M-Pesa payments, and every debt — all in one place.
        </p>

        <div className="flex flex-wrap gap-3">
          <a href="#signup"
            className="inline-flex h-12 items-center gap-2 rounded-xl bg-blue-600 px-6 text-sm font-bold text-white shadow-lg shadow-blue-900/30 transition hover:bg-blue-500">
            Set up your store
            <ArrowRight size={16} />
          </a>
          <a href="#signup"
            className="inline-flex h-12 items-center gap-2 rounded-xl border border-white/20 bg-white/8 px-6 text-sm font-semibold text-white transition hover:bg-white/15">
            Start as a buyer
          </a>
        </div>

        <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
          {[
            "No app download needed",
            "Share via WhatsApp",
            "Works on weak networks",
          ].map((item) => (
            <span key={item} className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
              <CheckCircle2 size={13} className="text-green-500" />
              {item}
            </span>
          ))}
        </div>
      </div>

      {/* App previews */}
      <div className="grid gap-4 sm:grid-cols-2">
        <BuyerPreview />
        <SellerPreview />
      </div>
    </div>
  );
}

// ── HowItWorks (numbered steps) ───────────────────────────────────────────────

const HOW_IT_WORKS = [
  {
    num: "01",
    Icon: Store,
    color: "text-blue-600",
    bg: "bg-blue-50",
    title: "Set up your digital store",
    body: "Create your catalog in minutes. Add products, set prices, and get a unique link you can share anywhere.",
  },
  {
    num: "02",
    Icon: ClipboardList,
    color: "text-violet-600",
    bg: "bg-violet-50",
    title: "Buyers send shopping lists",
    body: "Your buyers open your link, build their list, and submit. No calls, no texts. Lists lock when submitted.",
  },
  {
    num: "03",
    Icon: Package,
    color: "text-amber-600",
    bg: "bg-amber-50",
    title: "You pack and update the invoice",
    body: "Review each list, source special requests, update the final total, and mark orders ready for pickup.",
  },
  {
    num: "04",
    Icon: BookOpen,
    color: "text-green-600",
    bg: "bg-green-50",
    title: "Track payments and debts",
    body: "Record M-Pesa payments and credit sales. Every buyer's balance is clear — no more chasing debts in your notebook.",
  },
] as const;

function HowItWorks() {
  return (
    <section id="features" className="bg-white">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        {/* Section header */}
        <div className="mb-12 max-w-xl">
          <p className="text-xs font-bold uppercase tracking-widest text-blue-600">How it works</p>
          <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900">
            Replace calls and notebooks<br className="hidden sm:block" /> with one link.
          </h2>
          <p className="mt-3 text-base leading-relaxed text-slate-500">
            Four steps — from store setup to a clean debt ledger. No training required.
          </p>
        </div>

        {/* Steps */}
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {HOW_IT_WORKS.map(({ num, Icon, color, bg, title, body }) => (
            <div key={title} className="relative">
              {/* Step number — large, behind the content */}
              <p className="mb-4 text-7xl font-black leading-none text-slate-100 select-none">
                {num}
              </p>
              <div className={`mb-4 flex h-11 w-11 items-center justify-center rounded-xl ${bg} ${color}`}>
                <Icon size={20} />
              </div>
              <h3 className="font-bold text-slate-900">{title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-slate-500">{body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── ConversionCTA section ─────────────────────────────────────────────────────

function ConversionCTA() {
  return (
    <section className="bg-slate-950 text-white">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
            Ready to replace your notebooks<br className="hidden sm:block" /> and WhatsApp chaos?
          </h2>
          <p className="mt-4 text-base leading-relaxed text-slate-400">
            Takes 3 minutes to set up your store. Your buyers can start ordering from a link — no app download needed.
          </p>

          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <a href="#signup"
              className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-8 text-sm font-bold text-white shadow-lg shadow-blue-900/40 transition hover:bg-blue-500 sm:w-auto">
              Set up your store
              <ArrowRight size={16} />
            </a>
            <a href="#signup"
              className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-white/20 px-8 text-sm font-semibold text-white/80 transition hover:bg-white/8 sm:w-auto">
              Start as a buyer
            </a>
          </div>

          <p className="mt-6 text-xs text-slate-600">
            Free to join · No app download · Works offline
          </p>
        </div>
      </div>
    </section>
  );
}

// ── Footer ────────────────────────────────────────────────────────────────────

function Footer() {
  return (
    <footer className="border-t border-white/5 bg-slate-950 text-white">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <AppLogo inverted />
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-white/35">
              Digitizing trusted community trade for phone accessories wholesalers and buyers.
            </p>
          </div>
          <div className="flex flex-col gap-1.5 text-sm text-white/40">
            <p className="font-semibold text-white/60 mb-1">Platform</p>
            <a href="#signup" className="transition hover:text-white/70">Set up your store</a>
            <a href="#signup" className="transition hover:text-white/70">Start as a buyer</a>
            <a href="#features" className="transition hover:text-white/70">How it works</a>
          </div>
        </div>
        <div className="mt-8 border-t border-white/8 pt-6 text-xs text-white/25">
          © 2026 Nyakizu Digital Market · SWE3090XA · Nzabakamira Shema Manasse
        </div>
      </div>
    </footer>
  );
}

// ── Home ──────────────────────────────────────────────────────────────────────

export default function Home() {
  const [role,   setRole]   = useState<Role | null>(null);
  const [step,   setStep]   = useState<Step>("role");
  const [account,  setAccountState]  = useState<AccountFields>({ fullName: "", phone: "", password: "" });
  const [buyer,    setBuyerState]    = useState<BuyerFields>({ location: "", mainSupplier: "", businessType: "" });
  const [seller,   setSellerState]   = useState<SellerFields>({ shopName: "", location: "", categories: [] });
  const [isLoading,    setIsLoading]    = useState(false);
  const [apiError,     setApiError]     = useState("");
  const [savedOffline, setSavedOffline] = useState(false);

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }
  }, []);

  function reset() {
    setRole(null); setStep("role");
    setAccountState({ fullName: "", phone: "", password: "" });
    setBuyerState({ location: "", mainSupplier: "", businessType: "" });
    setSellerState({ shopName: "", location: "", categories: [] });
    setApiError(""); setSavedOffline(false);
  }

  async function handleDone() {
    if (!role) return;
    setIsLoading(true);
    setApiError("");

    const payload = role === "seller"
      ? { full_name: account.fullName, phone: account.phone, password: account.password,
          role: "seller", shop_name: seller.shopName, shop_location: seller.location, categories: seller.categories }
      : { full_name: account.fullName, phone: account.phone, password: account.password,
          role: "buyer", location: buyer.location, main_supplier: buyer.mainSupplier, business_type: buyer.businessType };

    try {
      const res = await fetch(`${API_BASE}/api/accounts/register/`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload), credentials: "include",
      });
      if (!res.ok) {
        const errs: Record<string, string[]> = await res.json().catch(() => ({}));
        setApiError(String(Object.values(errs).flat()[0] ?? "Registration failed. Please try again."));
        return;
      }
      setStep("done");
    } catch {
      try { localStorage.setItem("nyakizu_pending_registration", JSON.stringify(payload)); } catch {}
      setSavedOffline(true);
      setStep("done");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="min-h-dvh">
      {/* ── Dark header + hero + wizard ─────────────────────────────────────── */}
      <div className="bg-slate-950">
        <Navbar />
        <div
          id="signup"
          className="mx-auto max-w-6xl px-4 sm:px-6 lg:grid lg:grid-cols-[1fr_420px] lg:gap-14"
        >
          {/* Left: hero text + app previews */}
          <HeroSection />

          {/* Right: wizard card — sticky on desktop, stacked on mobile */}
          <div className="pb-12 lg:sticky lg:top-20 lg:self-start lg:py-16">
            <OnboardingWizard
              role={role}     setRole={setRole}
              step={step}     setStep={setStep}
              account={account} setAccount={(p) => setAccountState((c) => ({ ...c, ...p }))}
              buyer={buyer}   setBuyer={(p) => setBuyerState((c) => ({ ...c, ...p }))}
              seller={seller} setSeller={(p) => setSellerState((c) => ({ ...c, ...p }))}
              isLoading={isLoading} apiError={apiError} savedOffline={savedOffline}
              reset={reset} onDone={handleDone}
            />
          </div>
        </div>
      </div>

      {/* ── How it works ────────────────────────────────────────────────────── */}
      <HowItWorks />

      {/* ── Conversion CTA ──────────────────────────────────────────────────── */}
      <ConversionCTA />

      {/* ── Footer ──────────────────────────────────────────────────────────── */}
      <Footer />
    </main>
  );
}
