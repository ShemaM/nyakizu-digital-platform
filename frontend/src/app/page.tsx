"use client";

import { useEffect, useId, useRef, useState } from "react";
import {
  ArrowRight,
  BadgeCheck,
  BookOpen,
  CheckCircle2,
  ChevronLeft,
  ClipboardList,
  Eye,
  EyeOff,
  Loader2,
  Lock,
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

interface AccountFields  { fullName: string; phone: string; password: string }
interface BuyerFields    { location: string; mainSupplier: string; businessType: string }
interface SellerFields   { shopName: string; location: string; categories: string[] }

// ── Constants ─────────────────────────────────────────────────────────────────

// Seller product categories — specific enough for Kenyan/Rwandan traders
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

// Buyer business types — must match BuyerProfile.BUSINESS_TYPE_CHOICES in models.py
const BUSINESS_TYPES = ["Hawker", "Retail shop", "Repair shop", "Online seller"];

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

// ── AppLogo ───────────────────────────────────────────────────────────────────

function AppLogo({ inverted = false }: { inverted?: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 shadow-sm shadow-blue-900/20">
        <span className="text-sm font-extrabold tracking-tight text-white">N</span>
      </div>
      <div className="leading-none">
        <p className={`text-[15px] font-bold leading-none ${inverted ? "text-white" : "text-slate-900"}`}>
          Nyakizu
        </p>
        <p className={`mt-1 text-[10px] font-semibold uppercase tracking-widest ${inverted ? "text-white/40" : "text-slate-400"}`}>
          Digital Market
        </p>
      </div>
    </div>
  );
}

// ── StepIndicator ─────────────────────────────────────────────────────────────
// HCI: Visibility of system status — users always know which step they are on.

function StepIndicator({ step, role }: { step: Step; role: Role | null }) {
  const steps = [
    { id: "role" as const,    label: "Role" },
    { id: "account" as const, label: "Account" },
    { id: "details" as const, label: role === "seller" ? "Shop" : "Profile" },
  ];
  const currentIndex = step === "done" ? 3 : steps.findIndex((s) => s.id === step);

  return (
    <nav aria-label="Registration steps">
      <ol className="flex items-center">
        {steps.map((s, i) => {
          const done   = i < currentIndex || step === "done";
          const active = i === currentIndex && step !== "done";
          return (
            <li key={s.id} className={i < steps.length - 1 ? "flex flex-1 items-center" : "flex items-center"}>
              <div className="flex flex-col items-center gap-1.5">
                <div
                  aria-current={active ? "step" : undefined}
                  className={[
                    "flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold transition-all duration-200",
                    done   ? "bg-blue-600 text-white" : "",
                    active ? "bg-blue-600 text-white shadow-[0_0_0_4px_rgba(59,130,246,0.15)]" : "",
                    !done && !active ? "bg-slate-100 text-slate-400" : "",
                  ].filter(Boolean).join(" ")}
                >
                  {done ? "✓" : i + 1}
                </div>
                <span className={`whitespace-nowrap text-[11px] font-medium ${done || active ? "text-slate-600" : "text-slate-400"}`}>
                  {s.label}
                </span>
              </div>
              {i < steps.length - 1 && (
                <div className={`mx-2 mb-5 h-px flex-1 transition-colors duration-300 ${done ? "bg-blue-500" : "bg-slate-200"}`} />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

// ── FieldInput ────────────────────────────────────────────────────────────────
// HCI: Consistency (all inputs identical), error prevention (inline messages
//      directly below the offending field, not in a banner at the top).

interface FieldInputProps {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  error?: string;
  hint?: string;
  autoComplete?: string;
  trailing?: React.ReactNode;
  optional?: boolean;
}

function FieldInput({
  id, label, value, onChange, placeholder, type = "text",
  error, hint, autoComplete, trailing, optional,
}: FieldInputProps) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="flex items-center gap-1.5 text-sm font-medium text-slate-700">
        {label}
        {optional && <span className="text-xs font-normal text-slate-400">(optional)</span>}
      </label>
      <div className="relative">
        <input
          id={id}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${id}-err` : hint ? `${id}-hint` : undefined}
          className={[
            "h-12 w-full rounded-xl border bg-white px-4 text-sm text-slate-900 outline-none transition",
            "placeholder:text-slate-400 focus:ring-3",
            trailing ? "pr-12" : "",
            error
              ? "border-red-300 focus:border-red-400 focus:ring-red-500/10"
              : "border-slate-200 focus:border-blue-500 focus:ring-blue-500/10",
          ].filter(Boolean).join(" ")}
        />
        {trailing && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-3.5">
            {trailing}
          </div>
        )}
      </div>
      {error ? (
        <p id={`${id}-err`} role="alert" className="flex items-center gap-1 text-xs font-medium text-red-600">
          <X size={11} strokeWidth={2.5} />
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="text-xs text-slate-400">{hint}</p>
      ) : null}
    </div>
  );
}

// ── Step 1 — RoleChoice ───────────────────────────────────────────────────────
// HCI: Recognition not recall — icons + descriptions communicate each role
//      without needing the user to already understand the system.

const ROLE_CONFIG = {
  buyer: {
    Icon: ShoppingBag,
    label: "Buyer",
    headline: "Buy from trusted wholesalers",
    description: "Browse approved suppliers, draft orders, track credit balances, and save work for offline days.",
  },
  seller: {
    Icon: Store,
    label: "Wholesaler",
    headline: "Sell and manage orders",
    description: "List products, manage buyer relationships, record M-Pesa payments, and control stock visibility.",
  },
} as const;

function RoleChoice({
  selectedRole, setSelectedRole, onNext,
}: {
  selectedRole: Role | null;
  setSelectedRole: (r: Role) => void;
  onNext: () => void;
}) {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-blue-600">Step 1 of 3</p>
        <h2 className="mt-2 text-xl font-bold text-slate-900">How do you want to trade?</h2>
        <p className="mt-1.5 text-sm text-slate-500">
          Choose your role. You can add the other role later after verification.
        </p>
      </div>

      <div className="grid gap-3">
        {(["buyer", "seller"] as Role[]).map((role) => {
          const { Icon, label, headline, description } = ROLE_CONFIG[role];
          const selected = selectedRole === role;
          return (
            <button
              key={role}
              type="button"
              onClick={() => setSelectedRole(role)}
              className={[
                "group relative flex items-start gap-4 rounded-2xl border-2 p-4 text-left transition-all duration-150",
                selected
                  ? "border-blue-500 bg-blue-50/60 shadow-[0_0_0_1px_#3b82f6]"
                  : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm",
              ].join(" ")}
            >
              <div className={[
                "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-colors duration-150",
                selected
                  ? "bg-blue-600 text-white"
                  : "bg-slate-100 text-slate-500 group-hover:bg-slate-200",
              ].join(" ")}>
                <Icon size={20} />
              </div>
              <div className="min-w-0 flex-1 pr-7">
                <p className="font-semibold text-slate-900">{label}</p>
                <p className="mt-0.5 text-xs font-medium text-slate-500">{headline}</p>
                <p className="mt-1 text-xs leading-relaxed text-slate-400">{description}</p>
              </div>
              <div className={`absolute right-4 top-4 transition-opacity ${selected ? "opacity-100" : "opacity-0"}`}>
                <CheckCircle2 size={18} className="text-blue-600" />
              </div>
            </button>
          );
        })}
      </div>

      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-slate-200" />
        <span className="text-xs font-semibold text-slate-400">OR</span>
        <div className="h-px flex-1 bg-slate-200" />
      </div>

      <a
        href={`${API_BASE}/accounts/google/login/`}
        className="flex h-11 w-full items-center justify-center gap-2.5 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
      >
        <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" aria-hidden="true">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
        </svg>
        Continue with Google
      </a>

      <button
        type="button"
        disabled={!selectedRole}
        onClick={onNext}
        className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 text-sm font-semibold text-white transition hover:bg-blue-700 active:bg-blue-800 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
      >
        {selectedRole ? `Continue as ${ROLE_CONFIG[selectedRole].label}` : "Select a role to continue"}
        <ArrowRight size={16} />
      </button>
    </div>
  );
}

// ── Step 2 — AccountForm ──────────────────────────────────────────────────────
// HCI: Error prevention (field-level validation), user control (back button),
//      feedback (password show/hide to reduce anxiety about what was typed).

function AccountForm({
  account, setAccount, onBack, onNext,
}: {
  account: AccountFields;
  setAccount: (p: Partial<AccountFields>) => void;
  onBack: () => void;
  onNext: () => void;
}) {
  const uid = useId();
  const headingRef = useRef<HTMLHeadingElement>(null);
  const [errors, setErrors] = useState({ fullName: "", phone: "", password: "" });
  const [showPass, setShowPass] = useState(false);

  // Move keyboard focus to heading on mount so screen readers announce the new step
  useEffect(() => { headingRef.current?.focus(); }, []);

  function validate(): boolean {
    const e = { fullName: "", phone: "", password: "" };
    if (!account.fullName.trim())    e.fullName = "Enter your full name.";
    if (!account.phone.trim())       e.phone    = "Enter your phone number.";
    if (account.password.length < 6) e.password = "Password must be at least 6 characters.";
    setErrors(e);
    return !e.fullName && !e.phone && !e.password;
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (validate()) onNext();
  }

  return (
    <form onSubmit={submit} noValidate className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-blue-600">Step 2 of 3</p>
        <h2 ref={headingRef} tabIndex={-1} className="mt-2 text-xl font-bold text-slate-900 outline-none">
          Set up your login
        </h2>
        <p className="mt-1.5 text-sm text-slate-500">Your details are private and never shared.</p>
      </div>

      <div className="space-y-4">
        <FieldInput
          id={`${uid}-name`}
          label="Full name"
          value={account.fullName}
          onChange={(v) => setAccount({ fullName: v })}
          placeholder="e.g. Claudine Mutesi"
          autoComplete="name"
          error={errors.fullName}
        />
        <FieldInput
          id={`${uid}-phone`}
          label="Phone number"
          value={account.phone}
          onChange={(v) => setAccount({ phone: v })}
          placeholder="07XX XXX XXX"
          type="tel"
          autoComplete="tel"
          hint="This becomes your login identifier"
          error={errors.phone}
        />
        <FieldInput
          id={`${uid}-pass`}
          label="Password"
          value={account.password}
          onChange={(v) => setAccount({ password: v })}
          placeholder="At least 6 characters"
          type={showPass ? "text" : "password"}
          autoComplete="new-password"
          error={errors.password}
          trailing={
            <button
              type="button"
              onClick={() => setShowPass((p) => !p)}
              aria-label={showPass ? "Hide password" : "Show password"}
              className="text-slate-400 transition hover:text-slate-600"
            >
              {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          }
        />
      </div>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={onBack}
          aria-label="Back to role selection"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-slate-200 text-slate-500 transition hover:bg-slate-50 hover:text-slate-700"
        >
          <ChevronLeft size={18} />
        </button>
        <button
          type="submit"
          className="flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-blue-600 text-sm font-semibold text-white transition hover:bg-blue-700 active:bg-blue-800"
        >
          Continue <ArrowRight size={16} />
        </button>
      </div>
    </form>
  );
}

// ── Step 3a — BuyerDetailsForm ────────────────────────────────────────────────

function BuyerDetailsForm({
  buyer, setBuyer, onBack, onDone, isLoading, apiError,
}: {
  buyer: BuyerFields;
  setBuyer: (p: Partial<BuyerFields>) => void;
  onBack: () => void;
  onDone: () => void;
  isLoading: boolean;
  apiError: string;
}) {
  const uid = useId();
  const headingRef = useRef<HTMLHeadingElement>(null);
  const [errors, setErrors] = useState({ location: "", businessType: "" });

  useEffect(() => { headingRef.current?.focus(); }, []);

  function validate(): boolean {
    const e = { location: "", businessType: "" };
    if (!buyer.location.trim()) e.location    = "Enter where you sell from.";
    if (!buyer.businessType)    e.businessType = "Choose how you trade.";
    setErrors(e);
    return !e.location && !e.businessType;
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (validate()) onDone();
  }

  return (
    <form onSubmit={submit} noValidate className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-blue-600">Step 3 of 3</p>
        <h2 ref={headingRef} tabIndex={-1} className="mt-2 text-xl font-bold text-slate-900 outline-none">
          Tell suppliers about you
        </h2>
        <p className="mt-1.5 text-sm text-slate-500">
          Helps wholesalers approve your requests quickly.
        </p>
      </div>

      {apiError && (
        <div role="alert" className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          <X size={15} className="mt-0.5 shrink-0" strokeWidth={2.5} />
          {apiError}
        </div>
      )}

      <div className="space-y-4">
        <FieldInput
          id={`${uid}-loc`}
          label="Where do you sell from?"
          value={buyer.location}
          onChange={(v) => setBuyer({ location: v })}
          placeholder="e.g. Eastleigh, Nairobi"
          error={errors.location}
        />

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-slate-700">How do you trade?</p>
            {errors.businessType && (
              <p role="alert" className="flex items-center gap-1 text-xs font-medium text-red-600">
                <X size={11} strokeWidth={2.5} />{errors.businessType}
              </p>
            )}
          </div>
          <div className="grid grid-cols-2 gap-2">
            {BUSINESS_TYPES.map((type) => {
              const active = buyer.businessType === type;
              return (
                <button
                  key={type}
                  type="button"
                  onClick={() => setBuyer({ businessType: type })}
                  className={[
                    "rounded-xl border py-3 text-sm font-semibold transition-all duration-150",
                    active
                      ? "border-blue-500 bg-blue-50 text-blue-700 shadow-[0_0_0_1px_#3b82f6]"
                      : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50",
                  ].join(" ")}
                >
                  {type}
                </button>
              );
            })}
          </div>
        </div>

        <FieldInput
          id={`${uid}-sup`}
          label="Usual supplier"
          value={buyer.mainSupplier}
          onChange={(v) => setBuyer({ mainSupplier: v })}
          placeholder="e.g. RNG Plaza Accessories"
          optional
        />
      </div>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={onBack}
          disabled={isLoading}
          aria-label="Back to account details"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-slate-200 text-slate-500 transition hover:bg-slate-50 disabled:opacity-40"
        >
          <ChevronLeft size={18} />
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-blue-600 text-sm font-semibold text-white transition hover:bg-blue-700 active:bg-blue-800 disabled:cursor-not-allowed disabled:bg-blue-400"
        >
          {isLoading
            ? <><Loader2 size={15} className="animate-spin" /> Creating account…</>
            : <>Create buyer account <ArrowRight size={16} /></>
          }
        </button>
      </div>
    </form>
  );
}

// ── Step 3b — SellerDetailsForm ───────────────────────────────────────────────

function SellerDetailsForm({
  seller, setSeller, onBack, onDone, isLoading, apiError,
}: {
  seller: SellerFields;
  setSeller: (p: Partial<SellerFields>) => void;
  onBack: () => void;
  onDone: () => void;
  isLoading: boolean;
  apiError: string;
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

  function validate(): boolean {
    const e = { shopName: "", location: "", categories: "" };
    if (!seller.shopName.trim())   e.shopName   = "Enter your shop name.";
    if (!seller.location.trim())   e.location   = "Enter your shop location.";
    if (!seller.categories.length) e.categories = "Choose at least one category.";
    setErrors(e);
    return !e.shopName && !e.location && !e.categories;
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (validate()) onDone();
  }

  return (
    <form onSubmit={submit} noValidate className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-blue-600">Step 3 of 3</p>
        <h2 ref={headingRef} tabIndex={-1} className="mt-2 text-xl font-bold text-slate-900 outline-none">
          Register your shop
        </h2>
        <p className="mt-1.5 text-sm text-slate-500">
          Your shop is reviewed by our team before going live.
        </p>
      </div>

      {apiError && (
        <div role="alert" className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          <X size={15} className="mt-0.5 shrink-0" strokeWidth={2.5} />
          {apiError}
        </div>
      )}

      <div className="space-y-4">
        <FieldInput
          id={`${uid}-shopname`}
          label="Shop name"
          value={seller.shopName}
          onChange={(v) => setSeller({ shopName: v })}
          placeholder="e.g. RNG Plaza Accessories"
          error={errors.shopName}
        />
        <FieldInput
          id={`${uid}-loc`}
          label="Shop location"
          value={seller.location}
          onChange={(v) => setSeller({ location: v })}
          placeholder="e.g. Luthuli Avenue, Nairobi"
          error={errors.location}
        />

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-slate-700">What do you sell?</p>
            {errors.categories && (
              <p role="alert" className="flex items-center gap-1 text-xs font-medium text-red-600">
                <X size={11} strokeWidth={2.5} />{errors.categories}
              </p>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {CATEGORY_OPTIONS.map((cat) => {
              const active = seller.categories.includes(cat);
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => toggleCat(cat)}
                  aria-pressed={active}
                  className={[
                    "rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-all duration-150",
                    active
                      ? "border-blue-500 bg-blue-600 text-white shadow-sm"
                      : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50",
                  ].join(" ")}
                >
                  {cat}
                </button>
              );
            })}
          </div>
          <p className="text-xs text-slate-400">
            {seller.categories.length === 0
              ? "Select all that apply"
              : `${seller.categories.length} selected`}
          </p>
        </div>
      </div>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={onBack}
          disabled={isLoading}
          aria-label="Back to account details"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-slate-200 text-slate-500 transition hover:bg-slate-50 disabled:opacity-40"
        >
          <ChevronLeft size={18} />
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-blue-600 text-sm font-semibold text-white transition hover:bg-blue-700 active:bg-blue-800 disabled:cursor-not-allowed disabled:bg-blue-400"
        >
          {isLoading
            ? <><Loader2 size={15} className="animate-spin" /> Submitting…</>
            : <>Submit for verification <ArrowRight size={16} /></>
          }
        </button>
      </div>
    </form>
  );
}

// ── Step 4 — DoneStep ─────────────────────────────────────────────────────────

function DoneStep({
  role, account, buyer, seller, savedOffline, reset,
}: {
  role: Role;
  account: AccountFields;
  buyer: BuyerFields;
  seller: SellerFields;
  savedOffline: boolean;
  reset: () => void;
}) {
  const isSeller  = role === "seller";
  const firstName = account.fullName.split(" ")[0] || "you";

  // When offline, swap the entire success view for a clear warning so the user
  // knows the account was NOT yet sent to the server.
  if (savedOffline) {
    return (
      <div className="space-y-5 py-2 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-50">
          <WifiOff size={32} className="text-amber-500" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900">No internet connection</h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-500">
            Your details were saved on this device. To complete registration,
            open this page again when you have data or Wi-Fi and resubmit.
          </p>
        </div>
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-left text-sm text-amber-800">
          <p className="font-semibold">What to do next:</p>
          <ol className="mt-2 space-y-1 pl-4 list-decimal text-amber-700">
            <li>Connect to the internet (data or Wi-Fi).</li>
            <li>Come back to this page and fill in the form again.</li>
            <li>Your account will be created once you submit successfully.</li>
          </ol>
        </div>
        <button
          type="button"
          onClick={reset}
          className="w-full rounded-xl bg-blue-600 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 py-2 text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-green-50">
        <CheckCircle2 size={32} className="text-green-600" />
      </div>

      <div>
        <h2 className="text-xl font-bold text-slate-900">
          {isSeller ? "Verification submitted!" : "You're all set!"}
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-slate-500">
          {isSeller
            ? `${seller.shopName} is queued for admin review. We'll contact ${firstName} on ${account.phone}.`
            : `Welcome, ${firstName}! Your buyer workspace is ready for ${buyer.location}.`}
        </p>
      </div>

      <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 text-left">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-400">
          Your next steps
        </p>
        <ul className="mt-3 space-y-2.5">
          {(isSeller
            ? ["Wait for admin verification", "Set up your product catalog", "Connect with buyers"]
            : ["Browse verified suppliers", "Draft your first order", "Track your credit balance"]
          ).map((item) => (
            <li key={item} className="flex items-center gap-2.5 text-sm font-medium text-slate-700">
              <CheckCircle2 size={15} className="shrink-0 text-green-500" />
              {item}
            </li>
          ))}
        </ul>
      </div>

      <button
        type="button"
        onClick={reset}
        className="w-full rounded-xl border border-slate-200 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
      >
        Create another account
      </button>
    </div>
  );
}

// ── OnboardingWizard ──────────────────────────────────────────────────────────

interface WizardProps {
  role: Role | null;        setRole: (r: Role) => void;
  step: Step;               setStep: (s: Step) => void;
  account: AccountFields;   setAccount: (p: Partial<AccountFields>) => void;
  buyer: BuyerFields;       setBuyer: (p: Partial<BuyerFields>) => void;
  seller: SellerFields;     setSeller: (p: Partial<SellerFields>) => void;
  isLoading: boolean;
  apiError: string;
  savedOffline: boolean;
  reset: () => void;
  onDone: () => void;
}

function OnboardingWizard(props: WizardProps) {
  const { role, setRole, step, setStep, account, setAccount, buyer, setBuyer,
          seller, setSeller, isLoading, apiError, savedOffline, reset, onDone } = props;

  return (
    <div className="overflow-hidden rounded-2xl bg-white shadow-[0_0_0_1px_rgba(0,0,0,0.06),0_8px_32px_rgba(0,0,0,0.08)]">
      {step !== "done" && (
        <div className="border-b border-slate-100 px-6 py-5 sm:px-8">
          <StepIndicator step={step} role={role} />
        </div>
      )}

      <div className="px-6 py-7 sm:px-8">
        {/* key prop triggers step-in CSS animation on each step change */}
        <div key={step} className="step-in">
          {step === "role" && (
            <RoleChoice
              selectedRole={role}
              setSelectedRole={setRole}
              onNext={() => setStep("account")}
            />
          )}
          {step === "account" && (
            <AccountForm
              account={account} setAccount={setAccount}
              onBack={() => setStep("role")}
              onNext={() => setStep("details")}
            />
          )}
          {step === "details" && role === "buyer" && (
            <BuyerDetailsForm
              buyer={buyer} setBuyer={setBuyer}
              onBack={() => setStep("account")}
              onDone={onDone}
              isLoading={isLoading}
              apiError={apiError}
            />
          )}
          {step === "details" && role === "seller" && (
            <SellerDetailsForm
              seller={seller} setSeller={setSeller}
              onBack={() => setStep("account")}
              onDone={onDone}
              isLoading={isLoading}
              apiError={apiError}
            />
          )}
          {step === "done" && role && (
            <DoneStep
              role={role} account={account} buyer={buyer} seller={seller}
              savedOffline={savedOffline} reset={reset}
            />
          )}
        </div>
      </div>
    </div>
  );
}

// ── App preview mockups ───────────────────────────────────────────────────────

const SAMPLE_SUPPLIERS = [
  { name: "RNG Plaza Accessories", status: "Trusted",  balance: "KES 7,000" },
  { name: "Espoir Mobile",         status: "Approved", balance: "KES 0" },
];

const SAMPLE_ORDER = [
  { name: "Samsung A54 privacy glass × 2", total: "KES 300" },
  { name: "iPhone 13 clear cover × 1",     total: "KES 250" },
  { name: "65W Type-C charger × 1",        total: "KES 450" },
];

function BuyerPreview() {
  return (
    <div className="rounded-2xl bg-slate-950 p-4 text-white">
      <div className="flex items-center justify-between border-b border-white/10 pb-3">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-blue-300">
            Buyer workspace
          </p>
          <p className="mt-0.5 text-sm font-semibold">My Suppliers</p>
        </div>
        <span className="rounded-full bg-green-500/15 px-2.5 py-1 text-[10px] font-semibold text-green-300">
          Offline ready
        </span>
      </div>

      <div className="mt-3 space-y-2">
        {SAMPLE_SUPPLIERS.map((s) => (
          <div key={s.name} className="flex items-center justify-between rounded-xl bg-white/6 px-3 py-2.5">
            <div>
              <p className="text-xs font-semibold">{s.name}</p>
              <p className="text-[11px] text-white/40">{s.status}</p>
            </div>
            <p className="text-xs font-bold text-amber-300">{s.balance}</p>
          </div>
        ))}
      </div>

      <div className="mt-3 rounded-xl bg-white p-3 text-slate-900">
        <div className="mb-2 flex items-center justify-between">
          <p className="text-xs font-bold text-slate-700">Draft order</p>
          <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-700">
            Saved offline
          </span>
        </div>
        {SAMPLE_ORDER.map((item) => (
          <div key={item.name} className="flex justify-between gap-2 py-0.5 text-[11px]">
            <span className="text-slate-500">{item.name}</span>
            <span className="font-semibold text-slate-800">{item.total}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function SellerPreview() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-blue-600">
            Seller dashboard
          </p>
          <p className="mt-0.5 text-sm font-semibold text-slate-900">Today</p>
        </div>
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
          <Store size={17} />
        </div>
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2">
        {[
          { label: "Orders", value: "12" },
          { label: "Debt",   value: "9.4k" },
          { label: "Paid",   value: "6.2k" },
        ].map((m) => (
          <div key={m.label} className="rounded-xl bg-slate-50 p-2.5 text-center">
            <p className="text-[15px] font-bold text-slate-900">{m.value}</p>
            <p className="text-[10px] font-semibold uppercase text-slate-400">{m.label}</p>
          </div>
        ))}
      </div>

      <div className="mt-3 space-y-2">
        {[
          { Icon: Package, title: "Samsung A54 glass", meta: "Can be sourced" },
          { Icon: Lock,    title: "Order #1048",       meta: "Packing locked" },
          { Icon: Wallet,  title: "M-Pesa record",     meta: "KES 3,000 received" },
        ].map(({ Icon, title, meta }) => (
          <div key={title} className="flex items-center gap-2.5 rounded-xl border border-slate-100 p-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
              <Icon size={15} />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-900">{title}</p>
              <p className="text-[11px] text-slate-400">{meta}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Navbar ────────────────────────────────────────────────────────────────────

function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <AppLogo />
        <nav aria-label="Site navigation" className="flex items-center gap-2">
          <span className="hidden items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-500 sm:inline-flex">
            <WifiOff size={12} aria-hidden="true" />
            Works offline
          </span>
          <a
            href="#signup"
            className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 active:bg-blue-800"
          >
            Get started
            <ArrowRight size={14} aria-hidden="true" />
          </a>
        </nav>
      </div>
    </header>
  );
}

// ── HeroSection ───────────────────────────────────────────────────────────────

function HeroSection() {
  return (
    <div className="space-y-10 py-2">
      <div className="space-y-5">
        <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-600 shadow-sm">
          <span className="h-1.5 w-1.5 rounded-full bg-green-500" aria-hidden="true" />
          Trusted by traders in Rwanda and East Africa
        </div>

        <h1 className="text-4xl font-extrabold leading-[1.12] tracking-tight text-slate-900 sm:text-5xl">
          The phone accessories<br />
          <span className="text-blue-600">marketplace your</span><br />
          community trusts.
        </h1>

        <p className="max-w-md text-base leading-relaxed text-slate-500">
          Nyakizu gives buyers and wholesalers structured orders, credit
          tracking, and an offline-ready app built for the realities of
          community trade.
        </p>

        <div className="flex flex-wrap gap-3">
          <a
            href="#signup"
            className="inline-flex h-11 items-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
          >
            Get started free <ArrowRight size={16} aria-hidden="true" />
          </a>
          <a
            href="#features"
            className="inline-flex h-11 items-center rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
          >
            See how it works
          </a>
        </div>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
          {["Free to sign up", "No credit card needed", "Works offline"].map((item) => (
            <span key={item} className="flex items-center gap-1.5 text-xs font-medium text-slate-400">
              <CheckCircle2 size={13} className="text-green-500" aria-hidden="true" />
              {item}
            </span>
          ))}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <BuyerPreview />
        <SellerPreview />
      </div>
    </div>
  );
}

// ── FeatureGrid ───────────────────────────────────────────────────────────────

const FEATURES = [
  {
    Icon: BadgeCheck,
    bg: "bg-blue-50",
    fg: "text-blue-600",
    title: "Verified roles",
    body: "Buyers and sellers are kept separate with admin-controlled verification.",
  },
  {
    Icon: ClipboardList,
    bg: "bg-violet-50",
    fg: "text-violet-600",
    title: "Structured orders",
    body: "Turn shopping lists into trackable order records with full status history.",
  },
  {
    Icon: BookOpen,
    bg: "bg-green-50",
    fg: "text-green-600",
    title: "Credit ledger",
    body: "Pay-later balances and partial M-Pesa payments stay organized and visible.",
  },
  {
    Icon: Zap,
    bg: "bg-amber-50",
    fg: "text-amber-600",
    title: "Offline-first PWA",
    body: "Installable app that saves drafts locally for low-network trading days.",
  },
] as const;

function FeatureGrid() {
  return (
    <section id="features" className="border-y border-slate-200 bg-white">
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <div className="mb-10 max-w-lg">
          <p className="text-xs font-semibold uppercase tracking-widest text-blue-600">
            Platform features
          </p>
          <h2 className="mt-2 text-2xl font-bold text-slate-900">
            Everything traders need in one place
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-500">
            Built for the realities of community-based phone accessories trade.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map(({ Icon, bg, fg, title, body }) => (
            <article key={title} className="rounded-2xl border border-slate-100 bg-slate-50 p-5">
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${bg} ${fg}`}>
                <Icon size={18} aria-hidden="true" />
              </div>
              <h3 className="mt-4 font-semibold text-slate-900">{title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-slate-500">{body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Footer ────────────────────────────────────────────────────────────────────

function Footer() {
  return (
    <footer className="bg-slate-950 text-white">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <AppLogo inverted />
            <p className="mt-3 text-sm text-white/40">Digitizing trusted community trade.</p>
          </div>
          <p className="text-xs text-white/25">© 2026 Nyakizu Digital Market · SWE3090XA</p>
        </div>
      </div>
    </footer>
  );
}

// ── Home ──────────────────────────────────────────────────────────────────────

export default function Home() {
  const [role, setRole] = useState<Role | null>(null);
  const [step, setStep] = useState<Step>("role");
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
    setRole(null);
    setStep("role");
    setAccountState({ fullName: "", phone: "", password: "" });
    setBuyerState({ location: "", mainSupplier: "", businessType: "" });
    setSellerState({ shopName: "", location: "", categories: [] });
    setApiError("");
    setSavedOffline(false);
  }

  async function handleDone() {
    if (!role) return;
    setIsLoading(true);
    setApiError("");

    const payload =
      role === "seller"
        ? { full_name: account.fullName, phone: account.phone, password: account.password,
            role: "seller", shop_name: seller.shopName, shop_location: seller.location,
            categories: seller.categories }
        : { full_name: account.fullName, phone: account.phone, password: account.password,
            role: "buyer", location: buyer.location, main_supplier: buyer.mainSupplier,
            business_type: buyer.businessType };

    try {
      const res = await fetch(`${API_BASE}/api/accounts/register/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        credentials: "include",
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
    <main className="min-h-dvh bg-slate-50">
      <Navbar />

      <div
        id="signup"
        className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:grid lg:grid-cols-[1fr_460px] lg:gap-12 lg:py-16"
      >
        <HeroSection />

        <aside className="mt-8 lg:mt-0 lg:sticky lg:top-8 lg:self-start">
          <OnboardingWizard
            role={role}       setRole={setRole}
            step={step}       setStep={setStep}
            account={account} setAccount={(p) => setAccountState((c) => ({ ...c, ...p }))}
            buyer={buyer}     setBuyer={(p)   => setBuyerState((c)   => ({ ...c, ...p }))}
            seller={seller}   setSeller={(p)  => setSellerState((c)  => ({ ...c, ...p }))}
            isLoading={isLoading}
            apiError={apiError}
            savedOffline={savedOffline}
            reset={reset}
            onDone={handleDone}
          />
        </aside>
      </div>

      <FeatureGrid />
      <Footer />
    </main>
  );
}
