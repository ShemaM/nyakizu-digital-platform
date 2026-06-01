"use client";

import { useState, useId } from "react";
import {
  ChevronRight,
  CheckCircle2,
  X,
  BookOpen,
  Wallet,
  Users,
  Package,
  ArrowRight,
  ShieldCheck,
  Zap,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type Step = 1 | 2 | 3;

interface AccountFields {
  fullName: string;
  phone: string;
  password: string;
}

interface StoreFields {
  shopName: string;
  location: string;
  categories: string[];
}

const CATEGORIES = [
  "Screen covers",
  "Phone cases",
  "Chargers",
  "Cables",
  "Batteries",
  "Everything",
];

const inputCls =
  "w-full rounded-xl border border-white/15 bg-white/8 px-4 py-3 text-sm text-white placeholder:text-white/35 outline-none transition focus:border-blue-400/60 focus:bg-white/15";

// ─── Step bar ─────────────────────────────────────────────────────────────────

function StepBar({ step }: { step: Step }) {
  const labels = ["Account", "Shop", "Done"];
  return (
    <div className="flex items-center justify-center gap-0 mb-7">
      {([1, 2, 3] as Step[]).map((n, i) => {
        const done = step > n;
        const active = step === n;
        return (
          <div key={n} className="flex items-center">
            <div className="flex flex-col items-center gap-1">
              <div className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-all duration-300 ${done ? "bg-emerald-500 text-white" : active ? "bg-white text-[#1e3a8a]" : "bg-white/10 text-white/30"}`}>
                {done ? <CheckCircle2 size={14} /> : n}
              </div>
              <span className={`text-[10px] font-medium ${active ? "text-white" : "text-white/30"}`}>{labels[i]}</span>
            </div>
            {i < 2 && <div className={`mx-2 mb-5 h-px w-10 transition-all duration-300 ${done ? "bg-emerald-500" : "bg-white/10"}`} />}
          </div>
        );
      })}
    </div>
  );
}

// ─── Step 1 ───────────────────────────────────────────────────────────────────

function Step1({ data, set, onNext }: { data: AccountFields; set: (p: Partial<AccountFields>) => void; onNext: () => void }) {
  const [err, setErr] = useState("");
  const id = useId();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!data.fullName.trim()) return setErr("Tell us your name.");
    if (!data.phone.trim()) return setErr("We need your phone number.");
    if (data.password.length < 6) return setErr("Password needs 6 or more characters.");
    setErr(""); onNext();
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-4">
      <div className="mb-1">
        <p className="text-base font-bold text-white">Who are you?</p>
        <p className="text-xs text-white/40 mt-0.5">Step 1 of 2 · Takes 1 minute</p>
      </div>

      {err && (
        <div className="flex items-center gap-2 rounded-xl bg-red-500/15 border border-red-400/30 px-3 py-2.5 text-xs text-red-300">
          <X size={12} className="shrink-0" /> {err}
        </div>
      )}

      <div className="flex flex-col gap-1.5">
        <label htmlFor={`${id}-n`} className="text-[11px] font-semibold uppercase tracking-widest text-white/40">Your name</label>
        <input id={`${id}-n`} className={inputCls} type="text" placeholder="e.g. Claudine Mutesi" value={data.fullName} onChange={e => set({ fullName: e.target.value })} />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor={`${id}-p`} className="text-[11px] font-semibold uppercase tracking-widest text-white/40">Phone number</label>
        <input id={`${id}-p`} className={inputCls} type="tel" placeholder="07XX XXX XXX" value={data.phone} onChange={e => set({ phone: e.target.value })} />
        <p className="text-[11px] text-white/30">Used to contact you and record M-Pesa payments</p>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor={`${id}-pw`} className="text-[11px] font-semibold uppercase tracking-widest text-white/40">Password</label>
        <input id={`${id}-pw`} className={inputCls} type="password" placeholder="At least 6 characters" value={data.password} onChange={e => set({ password: e.target.value })} autoComplete="new-password" />
      </div>

      <button type="submit" className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-white px-5 py-3.5 text-sm font-bold text-[#1e3a8a] transition hover:bg-blue-50 active:scale-[0.98]">
        Next — My Shop <ChevronRight size={15} />
      </button>

      <p className="text-center text-[11px] text-white/25">
        Already have an account? <a href="#" className="text-white/60 underline">Sign in</a>
      </p>
    </form>
  );
}

// ─── Step 2 ───────────────────────────────────────────────────────────────────

function Step2({ data, set, onNext, onBack }: { data: StoreFields; set: (p: Partial<StoreFields>) => void; onNext: () => void; onBack: () => void }) {
  const [err, setErr] = useState("");
  const id = useId();

  function toggle(cat: string) {
    set({ categories: data.categories.includes(cat) ? data.categories.filter(c => c !== cat) : [...data.categories, cat] });
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!data.shopName.trim()) return setErr("Give your shop a name.");
    if (!data.location.trim()) return setErr("Tell us where your shop is.");
    if (!data.categories.length) return setErr("Choose what you sell.");
    setErr(""); onNext();
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-4">
      <div className="mb-1">
        <p className="text-base font-bold text-white">About your shop</p>
        <p className="text-xs text-white/40 mt-0.5">Step 2 of 2 · Almost done</p>
      </div>

      {err && (
        <div className="flex items-center gap-2 rounded-xl bg-red-500/15 border border-red-400/30 px-3 py-2.5 text-xs text-red-300">
          <X size={12} className="shrink-0" /> {err}
        </div>
      )}

      <div className="flex flex-col gap-1.5">
        <label htmlFor={`${id}-s`} className="text-[11px] font-semibold uppercase tracking-widest text-white/40">Shop name</label>
        <input id={`${id}-s`} className={inputCls} type="text" placeholder="e.g. Espoir Accessories" value={data.shopName} onChange={e => set({ shopName: e.target.value })} />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor={`${id}-l`} className="text-[11px] font-semibold uppercase tracking-widest text-white/40">Where is your shop?</label>
        <input id={`${id}-l`} className={inputCls} type="text" placeholder="e.g. Luthuli Avenue, Nairobi" value={data.location} onChange={e => set({ location: e.target.value })} />
      </div>

      <div className="flex flex-col gap-2">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-white/40">What do you sell?</p>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map(cat => {
            const on = data.categories.includes(cat);
            return (
              <button key={cat} type="button" onClick={() => toggle(cat)}
                className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition-all ${on ? "border-emerald-400/60 bg-emerald-500/15 text-emerald-300" : "border-white/10 bg-white/5 text-white/50 hover:border-white/25 hover:text-white/70"}`}>
                {on && <CheckCircle2 size={10} className="inline mr-1.5" />}{cat}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex gap-2.5 mt-2">
        <button type="button" onClick={onBack} className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-3.5 text-sm font-semibold text-white/60 transition hover:bg-white/10">
          Back
        </button>
        <button type="submit" className="flex flex-[2] items-center justify-center gap-2 rounded-xl bg-white px-4 py-3.5 text-sm font-bold text-[#1e3a8a] transition hover:bg-blue-50 active:scale-[0.98]">
          Open My Shop <ArrowRight size={15} />
        </button>
      </div>
    </form>
  );
}

// ─── Step 3 – success ─────────────────────────────────────────────────────────

function Step3({ account, store, reset }: { account: AccountFields; store: StoreFields; reset: () => void }) {
  return (
    <div className="flex flex-col items-center gap-5 py-2 text-center">
      <div className="relative flex h-20 w-20 items-center justify-center">
        <div className="absolute inset-0 rounded-full bg-emerald-500/20 animate-ping" style={{ animationDuration: "2s" }} />
        <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/20 ring-4 ring-emerald-500/30">
          <CheckCircle2 size={32} className="text-emerald-400" />
        </div>
      </div>
      <div>
        <p className="text-xl font-black text-white">Your shop is in!</p>
        <p className="mt-2 text-sm text-white/50 leading-relaxed">
          We received <span className="font-semibold text-white">&ldquo;{store.shopName}&rdquo;</span>. We will call{" "}
          <span className="font-semibold text-white">{account.fullName.split(" ")[0]}</span> on{" "}
          <span className="font-semibold text-white">{account.phone}</span> to confirm — usually the same day.
        </p>
      </div>
      <div className="w-full rounded-2xl border border-white/8 bg-white/5 p-4 text-left space-y-3">
        <p className="text-[10px] font-bold uppercase tracking-widest text-white/30">What happens next</p>
        {[
          "We call to confirm your shop — usually same day",
          "Once approved, your shop goes live on Nyakizu",
          "Customers in your area can find you and place orders",
        ].map(t => (
          <div key={t} className="flex items-start gap-2.5 text-sm text-white/60">
            <ChevronRight size={13} className="mt-0.5 shrink-0 text-emerald-400" />{t}
          </div>
        ))}
      </div>
      <button onClick={reset} className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/50 transition hover:bg-white/10 hover:text-white/70">
        Register another shop
      </button>
    </div>
  );
}

// ─── Phone mockup ─────────────────────────────────────────────────────────────

function PhoneMockup() {
  return (
    <div className="relative mx-auto w-full max-w-[260px] select-none" aria-hidden>
      {/* floating badge – top right */}
      <div className="absolute -top-3 -right-8 z-20 flex items-center gap-1.5 rounded-full bg-emerald-500 px-3 py-1.5 text-[11px] font-bold text-white shadow-lg shadow-emerald-500/40">
        <CheckCircle2 size={11} /> New order!
      </div>

      {/* phone – tilted */}
      <div className="relative z-10 overflow-hidden rounded-[2rem] border-[3px] border-white/10 bg-[#06101e] shadow-2xl shadow-black/70" style={{ transform: "rotate(4deg)" }}>
        {/* status bar */}
        <div className="flex items-center justify-between bg-[#06101e] px-5 pt-3 pb-1">
          <span className="text-[9px] font-medium text-white/30">9:41</span>
          <div className="flex gap-1">
            {[1,2,3].map(i => <div key={i} className="h-1.5 w-1.5 rounded-full bg-white/20" />)}
          </div>
        </div>

        {/* app header */}
        <div className="bg-[#1e3a8a] px-4 py-3">
          <p className="text-[9px] font-bold uppercase tracking-widest text-blue-300">Nyakizu</p>
          <p className="mt-0.5 text-sm font-bold text-white">Baraka&apos;s Shop</p>
        </div>

        {/* summary bar */}
        <div className="flex gap-2 bg-[#152d6e] px-4 py-3">
          <div className="flex-1 rounded-lg bg-white/8 p-2 text-center">
            <p className="text-[8px] uppercase tracking-wide text-white/40">Orders</p>
            <p className="mt-0.5 text-sm font-black text-white">12</p>
          </div>
          <div className="flex-1 rounded-lg bg-white/8 p-2 text-center">
            <p className="text-[8px] uppercase tracking-wide text-white/40">Pending</p>
            <p className="mt-0.5 text-sm font-black text-amber-400">KES 9,400</p>
          </div>
          <div className="flex-1 rounded-lg bg-white/8 p-2 text-center">
            <p className="text-[8px] uppercase tracking-wide text-white/40">Paid</p>
            <p className="mt-0.5 text-sm font-black text-emerald-400">KES 6,200</p>
          </div>
        </div>

        {/* customer list */}
        <div className="bg-[#06101e] px-4 py-3">
          <p className="mb-2 text-[8px] font-bold uppercase tracking-widest text-white/25">Today&apos;s orders</p>
          {[
            { name: "Jean-Pierre K.", item: "Samsung A54 cover x2", status: "Sourcing", col: "#f59e0b" },
            { name: "Furaha M.", item: "Charger 65W x1", status: "Packed", col: "#3b82f6" },
            { name: "Consolée B.", item: "Screen glass x3", status: "Paid ✓", col: "#22c55e" },
          ].map(b => (
            <div key={b.name} className="flex items-start justify-between gap-2 border-b border-white/5 py-2 last:border-0">
              <div className="flex items-center gap-2">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#1e3a8a]">
                  <span className="text-[8px] font-bold text-white/70">{b.name[0]}</span>
                </div>
                <div>
                  <p className="text-[9px] font-semibold text-white/80">{b.name}</p>
                  <p className="text-[8px] text-white/30">{b.item}</p>
                </div>
              </div>
              <span className="shrink-0 text-[8px] font-bold" style={{ color: b.col }}>{b.status}</span>
            </div>
          ))}
        </div>

        {/* bottom nav */}
        <div className="flex border-t border-white/5 bg-[#06101e] py-2">
          {[["🏪","Shop"],["📦","Orders"],["📒","Records"],["👤","Me"]].map(([icon, label], i) => (
            <div key={label} className={`flex flex-1 flex-col items-center gap-0.5 ${i === 0 ? "opacity-100" : "opacity-20"}`}>
              <span className="text-sm">{icon}</span>
              <span className="text-[7px] text-white/50">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* floating badge – bottom left */}
      <div className="absolute -bottom-3 -left-6 z-20 flex items-center gap-1.5 rounded-full bg-[#2563eb] px-3 py-1.5 text-[11px] font-bold text-white shadow-lg shadow-blue-500/40">
        <Zap size={11} /> 5 new customers
      </div>

      {/* glow layers */}
      <div className="absolute inset-0 -z-10 scale-110 rounded-[2rem] bg-blue-600/25 blur-3xl" style={{ transform: "rotate(4deg) scale(1.1)" }} />
      <div className="absolute inset-0 -z-10 scale-125 rounded-[2rem] bg-violet-600/10 blur-3xl" style={{ transform: "rotate(4deg) scale(1.25)" }} />
    </div>
  );
}

// ─── Mock shop data ───────────────────────────────────────────────────────────

const MOCK_SHOPS = [
  {
    id: "rng-accessories",
    name: "RNG Plaza Accessories",
    owner: "Baraka Mugisha",
    location: "RNG Plaza, Luthuli Avenue",
    categories: ["Screen covers", "Chargers", "Batteries"],
    products: 94,
    orders: 210,
    color: "#2563eb",
    initials: "RNG",
    tag: "Top seller",
    tagColor: "bg-amber-400/15 text-amber-300",
  },
  {
    id: "espoir-mobile",
    name: "Espoir Mobile",
    owner: "Claudine Mutesi",
    location: "Luthuli Avenue, CBD",
    categories: ["Phone cases", "Cables", "Screen covers"],
    products: 61,
    orders: 143,
    color: "#7c3aed",
    initials: "EM",
    tag: "Verified",
    tagColor: "bg-emerald-400/15 text-emerald-300",
  },
  {
    id: "amani-tech",
    name: "Amani Tech Shop",
    owner: "Jean-Pierre Rukundo",
    location: "Tom Mboya Street, CBD",
    categories: ["Everything", "Chargers", "Batteries"],
    products: 38,
    orders: 89,
    color: "#0891b2",
    initials: "AT",
    tag: "Verified",
    tagColor: "bg-emerald-400/15 text-emerald-300",
  },
  {
    id: "furaha-gadgets",
    name: "Furaha Gadgets",
    owner: "Consolée Uwase",
    location: "Ngara, Nairobi",
    categories: ["Phone cases", "Screen covers"],
    products: 27,
    orders: 54,
    color: "#059669",
    initials: "FG",
    tag: "Verified",
    tagColor: "bg-emerald-400/15 text-emerald-300",
  },
];

// ─── Marquee ticker ───────────────────────────────────────────────────────────

const TICKER_ITEMS = ["Products", "Orders", "Payments", "Customers", "Records", "M-Pesa", "Inventory", "Deliveries"];

function Marquee() {
  const items = [...TICKER_ITEMS, ...TICKER_ITEMS];
  return (
    <div className="overflow-hidden bg-[#2563eb] py-3">
      <div className="animate-marquee flex whitespace-nowrap">
        {items.map((t, i) => (
          <span key={i} className="mx-6 text-sm font-bold tracking-widest uppercase text-white/80">
            {t} <span className="text-white/30">·</span>
          </span>
        ))}
      </div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function Home() {
  const [step, setStep] = useState<Step>(1);
  const [account, setAccount] = useState<AccountFields>({ fullName: "", phone: "", password: "" });
  const [store, setStore] = useState<StoreFields>({ shopName: "", location: "", categories: [] });

  function reset() {
    setStep(1);
    setAccount({ fullName: "", phone: "", password: "" });
    setStore({ shopName: "", location: "", categories: [] });
  }

  return (
    <div className="min-h-screen bg-[#04080f] text-white">

      {/* ── Navbar ───────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 border-b border-white/8 bg-[#04080f]/95 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3.5 sm:px-6">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#2563eb]">
              <span className="text-xs font-black text-white">N</span>
            </div>
            <span className="text-base font-black tracking-tight text-white">Nyakizu</span>
            <span className="hidden rounded-full bg-white/8 px-2 py-0.5 text-[10px] font-semibold text-white/40 sm:block">Digital Market</span>
          </div>
          <a href="#open-shop" className="rounded-lg bg-[#2563eb] px-4 py-2 text-sm font-bold text-white transition hover:bg-[#1d4ed8]">
            Open My Shop
          </a>
        </div>
      </header>

      {/* ── Hero ─────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        {/* dot grid */}
        <div className="pointer-events-none absolute inset-0"
          style={{ backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.06) 1px, transparent 1px)", backgroundSize: "28px 28px" }} />
        {/* radial blobs */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-32 -left-32 h-[600px] w-[600px] rounded-full bg-blue-700/20 blur-3xl" />
          <div className="absolute top-40 right-0 h-[500px] w-[500px] rounded-full bg-violet-800/15 blur-3xl" />
          <div className="absolute bottom-0 left-1/3 h-[300px] w-[300px] rounded-full bg-blue-900/20 blur-2xl" />
        </div>

        <div className="relative mx-auto max-w-6xl px-4 pt-20 pb-24 sm:px-6 sm:pt-28 sm:pb-32">
          <div className="grid items-center gap-16 lg:grid-cols-[1fr_auto]">

            {/* text side */}
            <div className="flex flex-col gap-8 max-w-xl">
              <div className="inline-flex w-fit items-center gap-2 rounded-full border border-blue-500/25 bg-blue-500/10 px-3 py-1 text-xs font-semibold text-blue-300">
                <ShieldCheck size={12} /> For community phone sellers in Nairobi
              </div>

              <div>
                <h1 className="text-[3.25rem] font-black leading-[1.05] tracking-tighter text-white sm:text-6xl lg:text-7xl">
                  Your whole<br />
                  shop —<br />
                  <span className="bg-gradient-to-r from-[#60a5fa] via-[#818cf8] to-[#a78bfa] bg-clip-text text-transparent">
                    one screen.
                  </span>
                </h1>
                <p className="mt-6 text-lg leading-relaxed text-white/50">
                  Products. Orders. Payments. Customers. Nyakizu puts everything in one place — on your phone, for free.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <a href="#open-shop"
                  className="flex items-center gap-2 rounded-xl bg-[#2563eb] px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-700/30 transition hover:bg-[#1d4ed8] active:scale-[0.98]">
                  Open My Shop <ArrowRight size={15} />
                </a>
                <a href="#how-it-works"
                  className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-6 py-3.5 text-sm font-semibold text-white/70 transition hover:bg-white/10">
                  How it works
                </a>
              </div>

              {/* trust row */}
              <div className="flex flex-wrap gap-5 text-xs text-white/30">
                {["Free to join", "Approved within 24 h", "Works on any phone"].map(t => (
                  <span key={t} className="flex items-center gap-1.5">
                    <CheckCircle2 size={12} className="text-emerald-400" /> {t}
                  </span>
                ))}
              </div>
            </div>

            {/* mockup side */}
            <div className="flex items-center justify-center lg:justify-end">
              <PhoneMockup />
            </div>
          </div>
        </div>
      </section>

      {/* ── Marquee ──────────────────────────────────────────────── */}
      <Marquee />

      {/* ── Pain section (WHITE — contrast break) ────────────────── */}
      <section className="bg-white">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-widest text-[#2563eb]">The problem</p>
              <h2 className="mt-3 text-3xl font-black leading-tight tracking-tight text-[#0f172a] sm:text-4xl">
                Running a shop is hard<br />without the right tools.
              </h2>
              <p className="mt-4 text-base leading-relaxed text-[#475569]">
                Most phone sellers manage everything from memory or a paper notebook. That works — until it doesn&apos;t.
              </p>
            </div>

            <div className="flex flex-col gap-3">
              {[
                { icon: "📓", label: "Your prices and products live in a notebook that can get lost" },
                { icon: "📞", label: "Customers call to ask what you have — you have to remember" },
                { icon: "🔄", label: "Tracking which orders are ready or paid is confusing" },
              ].map(({ icon, label }) => (
                <div key={label} className="flex items-start gap-4 rounded-2xl border border-[#f1f5f9] bg-[#f8fafc] px-5 py-4">
                  <span className="mt-0.5 shrink-0 text-2xl">{icon}</span>
                  <p className="text-sm leading-relaxed text-[#334155]">{label}</p>
                </div>
              ))}
              <div className="mt-1 flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4">
                <CheckCircle2 size={20} className="shrink-0 text-emerald-600" />
                <p className="text-sm font-semibold text-emerald-800">Nyakizu organizes all of this — for free.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Bento features (light blue-tinted) ───────────────────── */}
      <section className="bg-[#eef2ff]">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <div className="mb-12">
            <p className="text-[11px] font-bold uppercase tracking-widest text-[#2563eb]">What you get</p>
            <h2 className="mt-3 text-3xl font-black leading-tight tracking-tight text-[#0f172a] sm:text-4xl">
              Everything in one place
            </h2>
          </div>

          {/* bento grid */}
          <div className="grid auto-rows-[180px] gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {/* big card – spans 2 rows */}
            <div className="row-span-2 flex flex-col justify-between overflow-hidden rounded-3xl bg-[#1e3a8a] p-6 sm:p-7">
              <div>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10">
                  <Package size={22} className="text-blue-200" />
                </div>
                <h3 className="mt-5 text-xl font-black text-white">Your products &amp; catalog</h3>
                <p className="mt-2 text-sm leading-relaxed text-blue-200/80">
                  Add everything you sell. Set prices. Customers see your catalog and order directly — no phone call needed.
                </p>
              </div>
              <div className="mt-4 rounded-xl bg-white/8 px-4 py-3">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-blue-300/60">Example</p>
                <p className="mt-1 text-sm text-white/80">Samsung A54 Glass · KES 150</p>
                <p className="text-sm text-white/80">65W Charger · KES 450</p>
              </div>
            </div>

            {/* card 2 */}
            <div className="flex flex-col justify-between rounded-3xl bg-white p-5 shadow-sm">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-100">
                <Users size={18} className="text-violet-600" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#0f172a]">Customer management</h3>
                <p className="mt-1 text-xs leading-relaxed text-[#64748b]">Every customer gets their own page. See their orders and history in one tap.</p>
              </div>
            </div>

            {/* card 3 */}
            <div className="flex flex-col justify-between rounded-3xl bg-white p-5 shadow-sm">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100">
                <BookOpen size={18} className="text-amber-600" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#0f172a]">Order tracking</h3>
                <p className="mt-1 text-xs leading-relaxed text-[#64748b]">Draft → Submitted → Sourcing → Packed → Delivered. Every step is clear.</p>
              </div>
            </div>

            {/* card 4 */}
            <div className="flex flex-col justify-between rounded-3xl bg-white p-5 shadow-sm">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100">
                <Wallet size={18} className="text-emerald-600" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#0f172a]">M-Pesa payment records</h3>
                <p className="mt-1 text-xs leading-relaxed text-[#64748b]">You record what you receive. No bank needed. You stay in full control.</p>
              </div>
            </div>

            {/* card 5 – accent */}
            <div className="flex flex-col justify-between rounded-3xl bg-[#2563eb] p-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15">
                <Zap size={18} className="text-white" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Works on any phone</h3>
                <p className="mt-1 text-xs leading-relaxed text-blue-200">Built for budget Android. Fast pages, large buttons, clear text.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Mock shops ───────────────────────────────────────────── */}
      <section className="border-t border-white/5 bg-[#04080f]">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <div className="mb-12 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-widest text-[#2563eb]">Live shops</p>
              <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">
                Sellers already on Nyakizu
              </h2>
              <p className="mt-2 text-sm text-white/40">
                Community sellers already running their shops on Nyakizu.
              </p>
            </div>
            <a href="#open-shop" className="flex w-fit shrink-0 items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-semibold text-white/60 transition hover:bg-white/10 hover:text-white">
              Join them <ArrowRight size={14} />
            </a>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {MOCK_SHOPS.map(shop => (
              <div key={shop.id} className="group flex flex-col gap-4 overflow-hidden rounded-3xl border border-white/8 bg-white/3 p-5 transition hover:border-white/15 hover:bg-white/6">
                {/* header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-sm font-black text-white shadow-lg"
                    style={{ backgroundColor: shop.color }}>
                    {shop.initials}
                  </div>
                  <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${shop.tagColor}`}>
                    {shop.tag}
                  </span>
                </div>

                {/* info */}
                <div>
                  <p className="font-bold text-white leading-snug">{shop.name}</p>
                  <p className="mt-0.5 text-xs text-white/40">{shop.owner}</p>
                  <div className="mt-2 flex items-center gap-1.5 text-xs text-white/30">
                    <span>📍</span>
                    <span>{shop.location}</span>
                  </div>
                </div>

                {/* categories */}
                <div className="flex flex-wrap gap-1.5">
                  {shop.categories.map(cat => (
                    <span key={cat} className="rounded-full border border-white/8 bg-white/5 px-2.5 py-1 text-[10px] text-white/50">
                      {cat}
                    </span>
                  ))}
                </div>

                {/* stats */}
                <div className="mt-auto flex gap-3 border-t border-white/6 pt-4">
                  <div className="flex-1 text-center">
                    <p className="text-lg font-black text-white">{shop.products}</p>
                    <p className="text-[10px] text-white/30">Products</p>
                  </div>
                  <div className="w-px bg-white/6" />
                  <div className="flex-1 text-center">
                    <p className="text-lg font-black text-white">{shop.orders}</p>
                    <p className="text-[10px] text-white/30">Orders</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Sign-up (split screen, deep blue left) ───────────────── */}
      <section id="open-shop" className="bg-[#04080f]">
        <div className="mx-auto max-w-6xl">
          <div className="grid lg:grid-cols-2 min-h-[600px]">

            {/* left panel */}
            <div className="relative overflow-hidden bg-[#1e3a8a] px-8 py-16 sm:px-12 flex flex-col justify-center gap-8">
              {/* bg texture */}
              <div className="pointer-events-none absolute inset-0"
                style={{ backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.04) 1px, transparent 1px)", backgroundSize: "22px 22px" }} />
              <div className="pointer-events-none absolute -bottom-20 -right-20 h-72 w-72 rounded-full bg-blue-500/20 blur-3xl" />

              <div className="relative">
                <p className="text-[11px] font-bold uppercase tracking-widest text-blue-300/60">Seller registration</p>
                <h2 className="mt-3 text-3xl font-black leading-tight text-white sm:text-4xl">
                  Open your shop<br />on Nyakizu
                </h2>
                <p className="mt-4 text-sm leading-relaxed text-blue-200/70">
                  Two steps. Two minutes. We will call you to confirm.
                </p>
              </div>

              <div className="relative flex flex-col gap-4">
                {[
                  { icon: "🆓", label: "Completely free to join" },
                  { icon: "📞", label: "We verify you by phone — same day" },
                  { icon: "📱", label: "Works on any Android phone" },
                  { icon: "💳", label: "Record M-Pesa payments yourself" },
                ].map(({ icon, label }) => (
                  <div key={label} className="flex items-center gap-3 text-sm text-blue-100/80">
                    <span className="text-lg">{icon}</span>
                    {label}
                  </div>
                ))}
              </div>
            </div>

            {/* right panel – form */}
            <div className="flex items-center justify-center border-l border-white/5 bg-[#080f1e] px-6 py-14 sm:px-10">
              <div className="w-full max-w-sm">
                <StepBar step={step} />
                {step === 1 && <Step1 data={account} set={p => setAccount(a => ({ ...a, ...p }))} onNext={() => setStep(2)} />}
                {step === 2 && <Step2 data={store} set={p => setStore(s => ({ ...s, ...p }))} onNext={() => setStep(3)} onBack={() => setStep(1)} />}
                {step === 3 && <Step3 account={account} store={store} reset={reset} />}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── How it works (dark, giant step numbers) ──────────────── */}
      <section id="how-it-works" className="border-t border-white/5 bg-[#04080f]">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <div className="mb-14 text-center">
            <p className="text-[11px] font-bold uppercase tracking-widest text-[#2563eb]">Simple steps</p>
            <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">How it works</h2>
          </div>
          <div className="grid gap-8 sm:grid-cols-3">
            {[
              { n: "01", icon: "📱", title: "Open your shop", body: "Tell us your name, phone, and shop name. Takes 2 minutes." },
              { n: "02", icon: "✅", title: "We confirm you", body: "We call you the same day. Once approved, your shop is live." },
              { n: "03", icon: "📦", title: "Receive orders", body: "Customers send you their orders. You manage them and record payments." },
            ].map(s => (
              <div key={s.n} className="relative overflow-hidden rounded-3xl border border-white/6 bg-white/3 p-7">
                {/* giant decorative number */}
                <span className="pointer-events-none absolute -top-4 -right-2 select-none text-[7rem] font-black leading-none text-white/4">{s.n}</span>
                <span className="relative mb-5 block text-3xl">{s.icon}</span>
                <p className="relative text-base font-bold text-white">{s.title}</p>
                <p className="relative mt-2 text-sm leading-relaxed text-white/40">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA strip ────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-[#1e3a8a]">
        <div className="pointer-events-none absolute inset-0"
          style={{ backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.05) 1px, transparent 1px)", backgroundSize: "24px 24px" }} />
        <div className="relative mx-auto flex max-w-6xl flex-col items-center gap-6 px-4 py-16 text-center sm:px-6">
          <h2 className="text-3xl font-black text-white sm:text-4xl">Ready to digitize your trade?</h2>
          <p className="text-sm text-blue-200/60">Free to join. No credit card. We call you to confirm.</p>
          <a href="#open-shop"
            className="flex items-center gap-2 rounded-xl bg-white px-8 py-4 text-sm font-black text-[#1e3a8a] shadow-xl shadow-black/30 transition hover:bg-blue-50 active:scale-[0.98]">
            Open My Shop <ArrowRight size={16} />
          </a>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────────── */}
      <footer className="border-t border-white/5 bg-[#04080f]">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#2563eb]">
              <span className="text-xs font-black text-white">N</span>
            </div>
            <div>
              <p className="text-sm font-black text-white">Nyakizu Digital Market</p>
              <p className="text-[10px] text-white/20">Digitizing trusted community trade.</p>
            </div>
          </div>
          <div className="flex gap-6 text-xs text-white/25">
            <a href="#" className="hover:text-white/50 transition">Privacy</a>
            <a href="#" className="hover:text-white/50 transition">Terms</a>
            <a href="#" className="hover:text-white/50 transition">Contact</a>
          </div>
          <p className="text-[10px] text-white/15">&copy; {new Date().getFullYear()} Nyakizu</p>
        </div>
      </footer>
    </div>
  );
}
