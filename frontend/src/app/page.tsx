"use client";

import { useEffect, useId, useRef, useState } from "react";
import {
  ArrowRight, BookOpen, CheckCircle2, ChevronLeft,
  ClipboardList, Eye, EyeOff, Loader2, Package,
  ShoppingBag, Store, Wallet, WifiOff, X, Zap,
} from "lucide-react";

// ─── types ────────────────────────────────────────────────────────────────────

type Role = "buyer" | "seller";
type Step = "role" | "account" | "details" | "done";

interface AccountFields  { fullName: string; phone: string; password: string }
interface BuyerFields    { location: string; mainSupplier: string; businessType: string }
interface SellerFields   { shopName: string; location: string; categories: string[] }

// ─── constants ────────────────────────────────────────────────────────────────

const CATS = [
  "Tempered glass",       "Phone cases & covers",
  "Chargers & adapters",  "USB & charging cables",
  "Batteries & power banks", "Earphones & earbuds",
  "Memory cards (SD cards)", "Phone repair parts",
];

const BIZ_TYPES = ["Hawker", "Retail shop", "Repair shop", "Online seller"];
const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

// ─── tiny helpers ─────────────────────────────────────────────────────────────

function c(...cls: (string | false | undefined | null)[]) {
  return cls.filter(Boolean).join(" ");
}

// ─────────────────────────────────────────────────────────────────────────────
// WIZARD COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────

// Progress bar ─────────────────────────────────────────────────────────────────
function Progress({ step, role }: { step: Step; role: Role | null }) {
  const labels = ["Role", "Account", role === "seller" ? "Shop" : "Profile"];
  const cur = step === "done" ? 3 : ["role", "account", "details"].indexOf(step);

  return (
    <div className="flex items-center gap-0">
      {labels.map((lbl, i) => {
        const done   = i < cur || step === "done";
        const active = i === cur && step !== "done";
        return (
          <div key={lbl} className="flex items-center">
            <div className="flex flex-col items-center">
              <div className={c(
                "flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-bold transition-all",
                done   && "bg-blue-600 text-white",
                active && "bg-blue-600 text-white ring-4 ring-blue-600/20",
                !done && !active && "bg-white/10 text-white/40",
              )}>
                {done ? "✓" : i + 1}
              </div>
              <span className={c(
                "mt-1 text-[10px] font-semibold",
                done || active ? "text-white/70" : "text-white/25",
              )}>{lbl}</span>
            </div>
            {i < 2 && (
              <div className={c(
                "mx-2 mb-4 h-px w-8 transition-colors",
                done ? "bg-blue-500" : "bg-white/15",
              )} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// Input ────────────────────────────────────────────────────────────────────────
function Input({
  id, label, value, onChange, placeholder, type = "text",
  error, hint, autoComplete, trailing, optional,
}: {
  id: string; label: string; value: string; onChange: (v: string) => void;
  placeholder?: string; type?: string; error?: string; hint?: string;
  autoComplete?: string; trailing?: React.ReactNode; optional?: boolean;
}) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="flex items-center gap-1.5 text-sm font-medium text-white/80">
        {label}
        {optional && <span className="text-xs font-normal text-white/30">(optional)</span>}
      </label>
      <div className="relative">
        <input
          id={id} type={type} value={value} placeholder={placeholder}
          autoComplete={autoComplete}
          onChange={(e) => onChange(e.target.value)}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${id}-err` : hint ? `${id}-hint` : undefined}
          className={c(
            "h-11 w-full rounded-xl border bg-white/6 px-4 text-sm text-white",
            "placeholder:text-white/25 outline-none transition",
            "focus:ring-2 focus:ring-blue-500/50",
            trailing ? "pr-11" : "",
            error ? "border-red-500/60 focus:border-red-400" : "border-white/12 focus:border-blue-500",
          )}
        />
        {trailing && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-3.5">
            {trailing}
          </div>
        )}
      </div>
      {error ? (
        <p id={`${id}-err`} role="alert" className="flex items-center gap-1 text-xs font-medium text-red-400">
          <X size={11} strokeWidth={2.5} />{error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="text-xs text-white/30">{hint}</p>
      ) : null}
    </div>
  );
}

// ── Step 1: Role ──────────────────────────────────────────────────────────────
function StepRole({ selected, setSelected, onNext }: {
  selected: Role | null;
  setSelected: (r: Role) => void;
  onNext: () => void;
}) {
  const roles: { id: Role; Icon: typeof Store; title: string; sub: string }[] = [
    {
      id: "seller", Icon: Store,
      title: "Wholesaler / Seller",
      sub: "Set up your catalog, share a link, manage orders and debts.",
    },
    {
      id: "buyer", Icon: ShoppingBag,
      title: "Buyer / Hawker",
      sub: "Browse suppliers, send shopping lists, track what you owe.",
    },
  ];

  return (
    <div className="space-y-5">
      <div>
        <p className="text-lg font-bold text-white">Create your account</p>
        <p className="mt-1 text-sm text-white/40">Pick how you trade. You can add the other role later.</p>
      </div>

      <div className="space-y-2.5">
        {roles.map(({ id, Icon, title, sub }) => {
          const on = selected === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => setSelected(id)}
              className={c(
                "w-full rounded-2xl border p-4 text-left transition-all duration-150",
                on  ? "border-blue-500 bg-blue-600/15"
                    : "border-white/10 bg-white/4 hover:border-white/20 hover:bg-white/7",
              )}
            >
              <div className="flex items-center gap-3">
                <div className={c(
                  "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors",
                  on ? "bg-blue-600 text-white" : "bg-white/8 text-white/50",
                )}>
                  <Icon size={19} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-white">{title}</p>
                  <p className="mt-0.5 text-xs text-white/40 leading-relaxed">{sub}</p>
                </div>
                {on && <CheckCircle2 size={17} className="shrink-0 text-blue-400" />}
              </div>
            </button>
          );
        })}
      </div>

      {/* Google */}
      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-white/10" />
        <span className="text-xs text-white/30 font-medium">or</span>
        <div className="h-px flex-1 bg-white/10" />
      </div>

      <a
        href={`${API}/accounts/google/login/`}
        className="flex h-11 w-full items-center justify-center gap-2.5 rounded-xl border border-white/12 bg-white/6 text-sm font-medium text-white/80 transition hover:bg-white/10"
      >
        <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0" aria-hidden>
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
        </svg>
        Continue with Google
      </a>

      <button
        type="button" disabled={!selected} onClick={onNext}
        className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:bg-white/10 disabled:text-white/30 disabled:cursor-not-allowed"
      >
        {selected ? `Continue as ${selected === "seller" ? "Wholesaler" : "Buyer"}` : "Choose a role to continue"}
        {selected && <ArrowRight size={15} />}
      </button>
    </div>
  );
}

// ── Step 2: Account ────────────────────────────────────────────────────────────
function StepAccount({ data, setData, onBack, onNext }: {
  data: AccountFields; setData: (p: Partial<AccountFields>) => void;
  onBack: () => void; onNext: () => void;
}) {
  const uid = useId();
  const h2 = useRef<HTMLHeadingElement>(null);
  const [err, setErr] = useState({ fullName: "", phone: "", password: "" });
  const [show, setShow] = useState(false);

  useEffect(() => { h2.current?.focus(); }, []);

  function validate() {
    const e = { fullName: "", phone: "", password: "" };
    if (!data.fullName.trim())    e.fullName = "Enter your full name.";
    if (!data.phone.trim())       e.phone    = "Enter your phone number.";
    if (data.password.length < 6) e.password = "At least 6 characters.";
    setErr(e);
    return !Object.values(e).some(Boolean);
  }

  function submit(ev: React.FormEvent) {
    ev.preventDefault();
    if (validate()) onNext();
  }

  return (
    <form onSubmit={submit} noValidate className="space-y-5">
      <div>
        <p ref={h2} tabIndex={-1} className="text-lg font-bold text-white outline-none">Your login details</p>
        <p className="mt-1 text-sm text-white/40">Private and never shared.</p>
      </div>
      <div className="space-y-3.5">
        <Input id={`${uid}-n`} label="Full name" value={data.fullName} onChange={(v) => setData({ fullName: v })}
          placeholder="e.g. Claudine Mutesi" autoComplete="name" error={err.fullName} />
        <Input id={`${uid}-p`} label="Phone number" value={data.phone} onChange={(v) => setData({ phone: v })}
          placeholder="07XX XXX XXX" type="tel" autoComplete="tel"
          hint="You'll use this to log in" error={err.phone} />
        <Input id={`${uid}-pw`} label="Password" value={data.password} onChange={(v) => setData({ password: v })}
          placeholder="At least 6 characters" type={show ? "text" : "password"} autoComplete="new-password"
          error={err.password}
          trailing={
            <button type="button" onClick={() => setShow((s) => !s)}
              aria-label={show ? "Hide password" : "Show password"}
              className="text-white/30 transition hover:text-white/60">
              {show ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          }
        />
      </div>
      <div className="flex gap-2">
        <button type="button" onClick={onBack} aria-label="Back"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/12 text-white/50 transition hover:bg-white/8">
          <ChevronLeft size={18} />
        </button>
        <button type="submit"
          className="flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-blue-600 text-sm font-semibold text-white transition hover:bg-blue-500">
          Continue <ArrowRight size={15} />
        </button>
      </div>
    </form>
  );
}

// ── Step 3a: Buyer details ─────────────────────────────────────────────────────
function StepBuyer({ data, setData, onBack, onDone, loading, apiErr }: {
  data: BuyerFields; setData: (p: Partial<BuyerFields>) => void;
  onBack: () => void; onDone: () => void; loading: boolean; apiErr: string;
}) {
  const uid = useId();
  const h2 = useRef<HTMLHeadingElement>(null);
  const [err, setErr] = useState({ location: "", biz: "" });

  useEffect(() => { h2.current?.focus(); }, []);

  function validate() {
    const e = { location: "", biz: "" };
    if (!data.location.trim()) e.location = "Enter where you sell from.";
    if (!data.businessType)    e.biz      = "Choose your business type.";
    setErr(e);
    return !e.location && !e.biz;
  }

  function submit(ev: React.FormEvent) {
    ev.preventDefault();
    if (validate()) onDone();
  }

  return (
    <form onSubmit={submit} noValidate className="space-y-5">
      <div>
        <p ref={h2} tabIndex={-1} className="text-lg font-bold text-white outline-none">About your business</p>
        <p className="mt-1 text-sm text-white/40">Helps wholesalers approve you quickly.</p>
      </div>

      {apiErr && (
        <div role="alert" className="flex items-start gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          <X size={14} className="mt-0.5 shrink-0" strokeWidth={2.5} />{apiErr}
        </div>
      )}

      <div className="space-y-3.5">
        <Input id={`${uid}-l`} label="Where do you sell from?" value={data.location}
          onChange={(v) => setData({ location: v })} placeholder="e.g. Eastleigh, Nairobi"
          error={err.location} />

        <div className="space-y-2">
          <div className="flex items-baseline justify-between">
            <p className="text-sm font-medium text-white/80">How do you trade?</p>
            {err.biz && (
              <p role="alert" className="flex items-center gap-0.5 text-xs text-red-400">
                <X size={10} strokeWidth={2.5} />{err.biz}
              </p>
            )}
          </div>
          <div className="grid grid-cols-2 gap-2">
            {BIZ_TYPES.map((t) => {
              const on = data.businessType === t;
              return (
                <button key={t} type="button" onClick={() => setData({ businessType: t })}
                  className={c(
                    "rounded-xl border py-2.5 text-sm font-medium transition-all",
                    on ? "border-blue-500 bg-blue-600 text-white"
                       : "border-white/12 bg-white/5 text-white/60 hover:bg-white/10",
                  )}>
                  {t}
                </button>
              );
            })}
          </div>
        </div>

        <Input id={`${uid}-s`} label="Usual supplier" value={data.mainSupplier}
          onChange={(v) => setData({ mainSupplier: v })}
          placeholder="e.g. RNG Plaza Accessories" optional />
      </div>

      <div className="flex gap-2">
        <button type="button" onClick={onBack} disabled={loading} aria-label="Back"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/12 text-white/50 transition hover:bg-white/8 disabled:opacity-40">
          <ChevronLeft size={18} />
        </button>
        <button type="submit" disabled={loading}
          className="flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-blue-600 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:bg-blue-600/50">
          {loading ? <><Loader2 size={14} className="animate-spin" />Creating…</> : <>Create account <ArrowRight size={15} /></>}
        </button>
      </div>
    </form>
  );
}

// ── Step 3b: Seller details ────────────────────────────────────────────────────
function StepSeller({ data, setData, onBack, onDone, loading, apiErr }: {
  data: SellerFields; setData: (p: Partial<SellerFields>) => void;
  onBack: () => void; onDone: () => void; loading: boolean; apiErr: string;
}) {
  const uid = useId();
  const h2 = useRef<HTMLHeadingElement>(null);
  const [err, setErr] = useState({ name: "", loc: "", cats: "" });

  useEffect(() => { h2.current?.focus(); }, []);

  function toggle(cat: string) {
    setData({
      categories: data.categories.includes(cat)
        ? data.categories.filter((c) => c !== cat)
        : [...data.categories, cat],
    });
  }

  function validate() {
    const e = { name: "", loc: "", cats: "" };
    if (!data.shopName.trim())    e.name = "Enter your shop name.";
    if (!data.location.trim())    e.loc  = "Enter your shop location.";
    if (!data.categories.length)  e.cats = "Choose at least one.";
    setErr(e);
    return !Object.values(e).some(Boolean);
  }

  function submit(ev: React.FormEvent) {
    ev.preventDefault();
    if (validate()) onDone();
  }

  return (
    <form onSubmit={submit} noValidate className="space-y-5">
      <div>
        <p ref={h2} tabIndex={-1} className="text-lg font-bold text-white outline-none">Register your shop</p>
        <p className="mt-1 text-sm text-white/40">Reviewed by our team before going live.</p>
      </div>

      {apiErr && (
        <div role="alert" className="flex items-start gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          <X size={14} className="mt-0.5 shrink-0" strokeWidth={2.5} />{apiErr}
        </div>
      )}

      <div className="space-y-3.5">
        <Input id={`${uid}-n`} label="Shop name" value={data.shopName}
          onChange={(v) => setData({ shopName: v })} placeholder="e.g. RNG Plaza Accessories"
          error={err.name} />
        <Input id={`${uid}-l`} label="Shop location" value={data.location}
          onChange={(v) => setData({ location: v })} placeholder="e.g. Luthuli Avenue, Nairobi"
          error={err.loc} />

        <div className="space-y-2">
          <div className="flex items-baseline justify-between">
            <p className="text-sm font-medium text-white/80">What do you sell?</p>
            {err.cats
              ? <p role="alert" className="flex items-center gap-0.5 text-xs text-red-400"><X size={10} strokeWidth={2.5} />{err.cats}</p>
              : data.categories.length > 0
                ? <p className="text-xs text-blue-400 font-medium">{data.categories.length} selected</p>
                : <p className="text-xs text-white/30">Select all that apply</p>
            }
          </div>
          <div className="grid grid-cols-2 gap-2">
            {CATS.map((cat) => {
              const on = data.categories.includes(cat);
              return (
                <button key={cat} type="button" onClick={() => toggle(cat)} aria-pressed={on}
                  className={c(
                    "rounded-xl border px-3 py-2 text-left text-xs font-medium transition-all",
                    on ? "border-blue-500 bg-blue-600 text-white"
                       : "border-white/12 bg-white/5 text-white/60 hover:bg-white/10",
                  )}>
                  {cat}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="flex gap-2">
        <button type="button" onClick={onBack} disabled={loading} aria-label="Back"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/12 text-white/50 transition hover:bg-white/8 disabled:opacity-40">
          <ChevronLeft size={18} />
        </button>
        <button type="submit" disabled={loading}
          className="flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-blue-600 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:bg-blue-600/50">
          {loading ? <><Loader2 size={14} className="animate-spin" />Submitting…</> : <>Submit for verification <ArrowRight size={15} /></>}
        </button>
      </div>
    </form>
  );
}

// ── Step 4: Done ───────────────────────────────────────────────────────────────
function StepDone({ role, account, buyer, seller, offline, reset }: {
  role: Role; account: AccountFields; buyer: BuyerFields;
  seller: SellerFields; offline: boolean; reset: () => void;
}) {
  const name = account.fullName.split(" ")[0] || "you";
  const isSeller = role === "seller";

  if (offline) {
    return (
      <div className="space-y-5 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/15">
          <WifiOff size={26} className="text-amber-400" />
        </div>
        <div>
          <p className="text-lg font-bold text-white">No internet</p>
          <p className="mt-1.5 text-sm leading-relaxed text-white/40">
            Details saved on this device. Reconnect and try again to complete registration.
          </p>
        </div>
        <button onClick={reset}
          className="w-full rounded-xl bg-blue-600 py-3 text-sm font-semibold text-white transition hover:bg-blue-500">
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-green-500/15">
          <CheckCircle2 size={26} className="text-green-400" />
        </div>
        <p className="text-lg font-bold text-white">
          {isSeller ? "Verification submitted!" : `Welcome, ${name}!`}
        </p>
        <p className="mt-1.5 text-sm leading-relaxed text-white/40">
          {isSeller
            ? `${seller.shopName} is queued for review. We'll contact you on ${account.phone}.`
            : "Your buyer account is ready. Find a supplier and send your first shopping list."}
        </p>
      </div>

      <div className="rounded-xl border border-white/10 bg-white/4 p-4">
        <p className="mb-3 text-[10px] font-bold uppercase tracking-widest text-white/30">Next steps</p>
        <ul className="space-y-2.5">
          {(isSeller
            ? ["Wait for admin verification — we'll call you", "Add products to your catalog", "Share your store link on WhatsApp"]
            : ["Open a trusted supplier's store", "Build and send your shopping list", "Track your orders and balances"]
          ).map((item) => (
            <li key={item} className="flex items-start gap-2.5 text-sm text-white/70">
              <CheckCircle2 size={14} className="mt-0.5 shrink-0 text-green-400" />{item}
            </li>
          ))}
        </ul>
      </div>

      <button onClick={reset}
        className="w-full rounded-xl border border-white/10 py-3 text-sm font-semibold text-white/50 transition hover:bg-white/5">
        Create another account
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// WIZARD SHELL
// ─────────────────────────────────────────────────────────────────────────────

interface WizardProps {
  role: Role | null; setRole: (r: Role) => void;
  step: Step; setStep: (s: Step) => void;
  account: AccountFields; setAccount: (p: Partial<AccountFields>) => void;
  buyer: BuyerFields; setBuyer: (p: Partial<BuyerFields>) => void;
  seller: SellerFields; setSeller: (p: Partial<SellerFields>) => void;
  loading: boolean; apiErr: string; offline: boolean;
  reset: () => void; onDone: () => void;
}

function Wizard(props: WizardProps) {
  const { role, setRole, step, setStep,
          account, setAccount, buyer, setBuyer, seller, setSeller,
          loading, apiErr, offline, reset, onDone } = props;

  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#111827] shadow-2xl shadow-black/40">
      {/* Header */}
      {step !== "done" && (
        <div className="flex items-center justify-between border-b border-white/8 px-6 py-4">
          <Progress step={step} role={role} />
          <span className="text-xs text-white/25 font-medium hidden sm:block">Free · No card</span>
        </div>
      )}

      {/* Body */}
      <div className="p-6">
        <div key={step} className="animate-up">
          {step === "role" && <StepRole selected={role} setSelected={setRole} onNext={() => setStep("account")} />}
          {step === "account" && <StepAccount data={account} setData={setAccount} onBack={() => setStep("role")} onNext={() => setStep("details")} />}
          {step === "details" && role === "buyer" && <StepBuyer data={buyer} setData={setBuyer} onBack={() => setStep("account")} onDone={onDone} loading={loading} apiErr={apiErr} />}
          {step === "details" && role === "seller" && <StepSeller data={seller} setData={setSeller} onBack={() => setStep("account")} onDone={onDone} loading={loading} apiErr={apiErr} />}
          {step === "done" && role && <StepDone role={role} account={account} buyer={buyer} seller={seller} offline={offline} reset={reset} />}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// LANDING SECTIONS
// ─────────────────────────────────────────────────────────────────────────────

// Logo ──────────────────────────────────────────────────────────────────────────
function Logo() {
  return (
    <div className="flex items-center gap-2.5">
      <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-600">
        <span className="text-sm font-black text-white">N</span>
      </div>
      <span className="text-[15px] font-bold text-white">Nyakizu</span>
    </div>
  );
}

// Navbar ────────────────────────────────────────────────────────────────────────
function Nav() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/8 bg-[#0a0f1c]/90 backdrop-blur-lg">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Logo />
        <div className="flex items-center gap-1">
          <a href="#how" className="hidden h-9 items-center px-3 text-sm text-white/50 transition hover:text-white sm:flex">
            How it works
          </a>
          <a href={`${API}/admin/`} className="hidden h-9 items-center px-3 text-sm text-white/50 transition hover:text-white sm:flex">
            Sign in
          </a>
          <a href="#start"
            className="flex h-9 items-center gap-1.5 rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white transition hover:bg-blue-500">
            Get started <ArrowRight size={14} />
          </a>
        </div>
      </div>
    </header>
  );
}

// Hero ──────────────────────────────────────────────────────────────────────────
function Hero() {
  return (
    <section className="relative overflow-hidden">
      {/* Background grid */}
      <div className="pointer-events-none absolute inset-0"
        style={{ backgroundImage: "radial-gradient(rgba(37,99,235,0.12) 1px, transparent 1px)", backgroundSize: "32px 32px" }} />
      {/* Blue glow */}
      <div className="pointer-events-none absolute left-1/3 top-0 h-96 w-96 -translate-x-1/2 rounded-full bg-blue-600/15 blur-3xl" />

      <div className="relative mx-auto max-w-6xl px-4 pb-8 pt-16 sm:px-6 sm:pt-24">
        <div className="grid items-start gap-10 lg:grid-cols-[1fr_400px] lg:gap-16">

          {/* Left: copy */}
          <div className="space-y-8">
            <div className="space-y-5">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-white/60">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-green-400" />
                Phone accessories trade · Rwanda &amp; East Africa
              </div>

              <h1 className="text-[clamp(2.5rem,6vw,4.5rem)] font-black leading-[1.04] tracking-tight">
                <span className="text-white">Your store.</span><br />
                <span className="bg-gradient-to-r from-blue-400 to-blue-300 bg-clip-text text-transparent">One WhatsApp link.</span><br />
                <span className="text-white/60">Buyers order from anywhere.</span>
              </h1>

              <p className="max-w-lg text-base leading-relaxed text-white/50">
                Replace WhatsApp order chaos and paper notebooks. Set up your
                digital store, let buyers send shopping lists, and track every
                order, M-Pesa payment, and debt — all in one place.
              </p>
            </div>

            {/* CTAs */}
            <div className="flex flex-wrap gap-3">
              <a href="#start"
                className="inline-flex h-12 items-center gap-2 rounded-xl bg-blue-600 px-6 text-sm font-bold text-white shadow-lg shadow-blue-900/50 transition hover:bg-blue-500">
                Set up your store
                <ArrowRight size={16} />
              </a>
              <a href="#start"
                className="inline-flex h-12 items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-6 text-sm font-semibold text-white/80 transition hover:bg-white/10">
                Start as a buyer
              </a>
            </div>

            {/* Social proof chips */}
            <div className="flex flex-wrap items-center gap-3">
              {[
                "No app download",
                "Share on WhatsApp",
                "Works offline",
                "Free to start",
              ].map((t) => (
                <span key={t} className="flex items-center gap-1.5 text-xs font-medium text-white/35">
                  <CheckCircle2 size={12} className="text-green-500" />{t}
                </span>
              ))}
            </div>
          </div>

          {/* Right: wizard */}
          <div id="start" className="lg:sticky lg:top-20">
            {/* Let the parent provide the wizard via children or portal —
                we render a placeholder that the Home component replaces */}
          </div>
        </div>
      </div>
    </section>
  );
}

// App previews ──────────────────────────────────────────────────────────────────
function Previews() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <div className="grid gap-5 sm:grid-cols-2">

        {/* Buyer */}
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#111827]">
          <div className="flex items-center justify-between border-b border-white/8 px-4 py-3">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-blue-400">Buyer</p>
              <p className="mt-0.5 text-sm font-bold text-white">My Suppliers</p>
            </div>
            <span className="flex items-center gap-1.5 rounded-full bg-green-500/12 px-2.5 py-1 text-[10px] font-semibold text-green-300">
              <span className="h-1.5 w-1.5 rounded-full bg-green-400" />Offline ready
            </span>
          </div>
          <div className="p-4 space-y-2.5">
            {[
              { name: "RNG Plaza Accessories", tag: "Verified ✓", bal: "KES 7,000 owed", red: true },
              { name: "Espoir Mobile",          tag: "Verified ✓", bal: "Cleared",        red: false },
            ].map((s) => (
              <div key={s.name} className="flex items-center justify-between rounded-xl bg-white/5 px-3.5 py-3">
                <div>
                  <p className="text-sm font-semibold text-white">{s.name}</p>
                  <p className="mt-0.5 text-[11px] text-white/35">{s.tag}</p>
                </div>
                <span className={`text-xs font-bold ${s.red ? "text-amber-300" : "text-green-400"}`}>
                  {s.bal}
                </span>
              </div>
            ))}
            {/* Shopping list card */}
            <div className="rounded-xl bg-white p-3.5 text-slate-900">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold text-slate-700">Shopping list · RNG Plaza</p>
                <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-amber-700">Draft</span>
              </div>
              <div className="mt-2 space-y-1">
                {[
                  { n: "Samsung A54 tempered glass × 2", p: "KES 300" },
                  { n: "iPhone 13 clear cover × 1",      p: "KES 250" },
                  { n: "65W Type-C charger × 1",         p: "KES 450" },
                ].map((r) => (
                  <div key={r.n} className="flex justify-between text-[11px]">
                    <span className="text-slate-500 truncate pr-2">{r.n}</span>
                    <span className="font-semibold text-slate-800 shrink-0">{r.p}</span>
                  </div>
                ))}
              </div>
              <div className="mt-2 flex justify-between border-t border-slate-100 pt-2 text-xs font-bold">
                <span className="text-slate-500">Draft total</span>
                <span>KES 1,000</span>
              </div>
            </div>
          </div>
        </div>

        {/* Seller */}
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#111827]">
          <div className="flex items-center justify-between border-b border-white/8 px-4 py-3">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-blue-400">Wholesaler</p>
              <p className="mt-0.5 text-sm font-bold text-white">RNG Plaza · Today</p>
            </div>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600/20 text-blue-400">
              <Store size={15} />
            </div>
          </div>
          <div className="p-4 space-y-3">
            {/* Metrics */}
            <div className="grid grid-cols-3 gap-2">
              {[
                { l: "Orders",      v: "12",     cls: "text-white" },
                { l: "Active debt", v: "KES 9k", cls: "text-amber-400" },
                { l: "Cleared",     v: "KES 6k", cls: "text-green-400" },
              ].map((m) => (
                <div key={m.l} className="rounded-xl bg-white/5 p-2.5 text-center">
                  <p className={`text-sm font-bold ${m.cls}`}>{m.v}</p>
                  <p className="mt-0.5 text-[9px] font-semibold uppercase tracking-wide text-white/30">{m.l}</p>
                </div>
              ))}
            </div>
            {/* Activity */}
            {[
              { Icon: ClipboardList, t: "New list · Fatuma",    m: "Submitted · KES 1,200",  dot: "bg-blue-500" },
              { Icon: Package,       t: "Order #1048 sourcing", m: "Sourcing & Packing",      dot: "bg-amber-500" },
              { Icon: Wallet,        t: "M-Pesa received",      m: "KES 3,000 · Hassan",     dot: "bg-green-500" },
            ].map(({ Icon, t, m, dot }) => (
              <div key={t} className="flex items-center gap-3 rounded-xl bg-white/4 border border-white/6 px-3 py-2.5">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/8 text-white/50">
                  <Icon size={13} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-white truncate">{t}</p>
                  <p className="text-[10px] text-white/35">{m}</p>
                </div>
                <span className={`h-2 w-2 shrink-0 rounded-full ${dot}`} />
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}

// How it works ──────────────────────────────────────────────────────────────────
function HowItWorks() {
  const steps = [
    { n: "01", Icon: Store,          c: "text-blue-400",   title: "Set up your store",         body: "Create your catalog, set prices, and get a shareable link in minutes. No technical knowledge needed." },
    { n: "02", Icon: ClipboardList,  c: "text-violet-400", title: "Buyers send shopping lists", body: "Your buyers open your link, select what they need, and submit. Lists lock immediately on submission — no confusion." },
    { n: "03", Icon: Package,        c: "text-amber-400",  title: "You pack and update",        body: "Review submitted lists, source special items, update the final invoice amount, and mark orders ready." },
    { n: "04", Icon: BookOpen,       c: "text-green-400",  title: "Track payments and debts",   body: "Record M-Pesa payments and credit sales. Every buyer's running balance is visible — no more notebook chasing." },
  ] as const;

  return (
    <section id="how" className="border-t border-white/8 py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mb-14">
          <p className="text-xs font-bold uppercase tracking-widest text-blue-400">How it works</p>
          <h2 className="mt-3 text-3xl font-black tracking-tight text-white sm:text-4xl">
            From WhatsApp chaos<br className="hidden sm:block" /> to a clean digital system.
          </h2>
          <p className="mt-4 max-w-xl text-base text-white/40 leading-relaxed">
            Four steps. No training required. Your buyers don't even need an account to browse.
          </p>
        </div>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map(({ n, Icon, c: col, title, body }) => (
            <div key={n} className="group">
              <div className="mb-5 flex items-end gap-3">
                <span className="text-6xl font-black leading-none text-white/8 select-none group-hover:text-white/12 transition-colors">{n}</span>
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/6 ${col} mb-1`}>
                  <Icon size={18} />
                </div>
              </div>
              <h3 className="font-bold text-white">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-white/40">{body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// CTA ────────────────────────────────────────────────────────────────────────────
function CTA() {
  return (
    <section className="relative overflow-hidden border-t border-white/8 py-20">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-blue-900/20 via-transparent to-transparent" />
      <div className="relative mx-auto max-w-3xl px-4 text-center sm:px-6">
        <p className="text-xs font-bold uppercase tracking-widest text-blue-400">Get started today</p>
        <h2 className="mt-4 text-3xl font-black tracking-tight text-white sm:text-4xl">
          Still managing orders<br className="hidden sm:block" /> on WhatsApp and notebooks?
        </h2>
        <p className="mx-auto mt-5 max-w-lg text-base leading-relaxed text-white/40">
          It takes 3 minutes to set up your store. Your buyers can start ordering from a link — no app download, no friction.
        </p>
        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <a href="#start"
            className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-8 text-sm font-bold text-white shadow-lg shadow-blue-900/40 transition hover:bg-blue-500 sm:w-auto">
            Set up your store <ArrowRight size={16} />
          </a>
          <a href="#start"
            className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-white/12 bg-white/5 px-8 text-sm font-semibold text-white/70 transition hover:bg-white/10 sm:w-auto">
            Start as a buyer
          </a>
        </div>
        <p className="mt-5 text-xs text-white/25">Free to join · No card needed · Works offline</p>
      </div>
    </section>
  );
}

// Footer ────────────────────────────────────────────────────────────────────────
function Footer() {
  return (
    <footer className="border-t border-white/8">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-3">
            <Logo />
            <p className="max-w-xs text-sm text-white/30 leading-relaxed">
              Digitizing trusted community trade for phone accessories wholesalers and buyers in East Africa.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-8 text-sm sm:flex sm:gap-12">
            <div className="space-y-2.5">
              <p className="font-semibold text-white/50">Platform</p>
              <a href="#start" className="block text-white/30 transition hover:text-white/60">Set up your store</a>
              <a href="#start" className="block text-white/30 transition hover:text-white/60">Start as a buyer</a>
              <a href="#how"   className="block text-white/30 transition hover:text-white/60">How it works</a>
            </div>
            <div className="space-y-2.5">
              <p className="font-semibold text-white/50">Account</p>
              <a href={`${API}/admin/`} className="block text-white/30 transition hover:text-white/60">Sign in</a>
              <a href="#start"          className="block text-white/30 transition hover:text-white/60">Register</a>
            </div>
          </div>
        </div>
        <div className="mt-10 border-t border-white/8 pt-6 flex flex-col gap-1 sm:flex-row sm:justify-between">
          <p className="text-xs text-white/20">© 2026 Nyakizu Digital Market</p>
          <p className="text-xs text-white/15">SWE3090XA · Nzabakamira Shema Manasse</p>
        </div>
      </div>
    </footer>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// HOME
// ─────────────────────────────────────────────────────────────────────────────

export default function Home() {
  const [role,   setRole]  = useState<Role | null>(null);
  const [step,   setStep]  = useState<Step>("role");
  const [account, setAcct] = useState<AccountFields>({ fullName: "", phone: "", password: "" });
  const [buyer,   setBuyer] = useState<BuyerFields>({ location: "", mainSupplier: "", businessType: "" });
  const [seller,  setSeller] = useState<SellerFields>({ shopName: "", location: "", categories: [] });
  const [loading, setLoading] = useState(false);
  const [apiErr,  setApiErr]  = useState("");
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }
  }, []);

  function reset() {
    setRole(null); setStep("role");
    setAcct({ fullName: "", phone: "", password: "" });
    setBuyer({ location: "", mainSupplier: "", businessType: "" });
    setSeller({ shopName: "", location: "", categories: [] });
    setApiErr(""); setOffline(false);
  }

  async function handleDone() {
    if (!role) return;
    setLoading(true); setApiErr("");

    const payload = role === "seller"
      ? { full_name: account.fullName, phone: account.phone, password: account.password,
          role: "seller", shop_name: seller.shopName, shop_location: seller.location, categories: seller.categories }
      : { full_name: account.fullName, phone: account.phone, password: account.password,
          role: "buyer", location: buyer.location, main_supplier: buyer.mainSupplier, business_type: buyer.businessType };

    try {
      const res = await fetch(`${API}/api/accounts/register/`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload), credentials: "include",
      });
      if (!res.ok) {
        const e: Record<string, string[]> = await res.json().catch(() => ({}));
        setApiErr(String(Object.values(e).flat()[0] ?? "Registration failed. Please try again."));
        return;
      }
      setStep("done");
    } catch {
      try { localStorage.setItem("nyakizu_pending", JSON.stringify(payload)); } catch {}
      setOffline(true); setStep("done");
    } finally {
      setLoading(false);
    }
  }

  const wizardProps: WizardProps = {
    role, setRole, step, setStep,
    account, setAccount: (p) => setAcct((c) => ({ ...c, ...p })),
    buyer,  setBuyer:  (p) => setBuyer((c)  => ({ ...c, ...p })),
    seller, setSeller: (p) => setSeller((c) => ({ ...c, ...p })),
    loading, apiErr, offline, reset, onDone: handleDone,
  };

  return (
    <main className="min-h-dvh bg-[#0a0f1c]">
      <Nav />

      {/* Hero + wizard (side by side on desktop) */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0"
          style={{ backgroundImage: "radial-gradient(rgba(37,99,235,0.10) 1px,transparent 1px)", backgroundSize: "32px 32px" }} />
        <div className="pointer-events-none absolute left-1/4 top-0 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-blue-700/10 blur-3xl" />

        <div className="relative mx-auto max-w-6xl px-4 pb-4 pt-16 sm:px-6 sm:pt-24">
          <div className="grid items-start gap-12 lg:grid-cols-[1fr_400px] lg:gap-16">

            {/* Copy */}
            <div className="space-y-8">
              <div className="space-y-5">
                <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/4 px-3 py-1.5 text-xs font-medium text-white/50">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-green-400" />
                  Phone accessories trade · Rwanda &amp; East Africa
                </div>

                <h1 className="text-[clamp(2.4rem,5.5vw,4.2rem)] font-black leading-[1.05] tracking-tight">
                  <span className="text-white">Your store.</span><br />
                  <span className="bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
                    One WhatsApp link.
                  </span><br />
                  <span className="text-white/55">Buyers order from anywhere.</span>
                </h1>

                <p className="max-w-md text-[15px] leading-relaxed text-white/45">
                  Replace WhatsApp order chaos and paper notebooks. Give your buyers
                  a digital store link, let them send structured shopping lists, and
                  track every order, payment, and debt in one place.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <a href="#start"
                  className="inline-flex h-12 items-center gap-2 rounded-xl bg-blue-600 px-6 text-sm font-bold text-white shadow-lg shadow-blue-900/50 transition hover:bg-blue-500">
                  Set up your store <ArrowRight size={16} />
                </a>
                <a href="#start"
                  className="inline-flex h-12 items-center gap-2 rounded-xl border border-white/12 bg-white/5 px-6 text-sm font-semibold text-white/75 transition hover:bg-white/10">
                  Start as a buyer
                </a>
              </div>

              <div className="flex flex-wrap gap-x-5 gap-y-2">
                {["No app download", "Share on WhatsApp", "Works offline", "Free to start"].map((t) => (
                  <span key={t} className="flex items-center gap-1.5 text-xs text-white/30">
                    <CheckCircle2 size={12} className="text-green-500" />{t}
                  </span>
                ))}
              </div>
            </div>

            {/* Wizard */}
            <div id="start" className="lg:sticky lg:top-20">
              <Wizard {...wizardProps} />
            </div>
          </div>
        </div>
      </section>

      {/* App previews */}
      <Previews />

      {/* How it works */}
      <HowItWorks />

      {/* Conversion CTA */}
      <CTA />

      {/* Footer */}
      <Footer />
    </main>
  );
}
