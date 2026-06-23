import Link from "next/link";
import { ArrowRight, CheckCircle2, Store } from "lucide-react";

/* ── store window mockup ─────────────────────────────────────────────────── */
function StoreWindow() {
  const rows = [
    { name: "Samsung A54 Tempered Glass",  stock: "120 pcs", price: "KES 150" },
    { name: "iPhone 14 Clear Case",         stock: "50 pcs",  price: "KES 250" },
    { name: "65W GaN USB-C Charger",        stock: "35 pcs",  price: "KES 850" },
    { name: "Braided USB-C Cable 1m",       stock: "200 pcs", price: "KES 120" },
    { name: "20,000mAh Power Bank",         stock: "25 pcs",  price: "KES 1,800" },
  ];

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200
      bg-white shadow-xl ring-1 ring-slate-100/80">

      {/* Browser chrome */}
      <div className="flex items-center gap-3 border-b border-slate-100
        bg-slate-50 px-4 py-3">
        <div className="flex gap-1.5">
          <span className="block h-3 w-3 rounded-full bg-red-400" />
          <span className="block h-3 w-3 rounded-full bg-amber-400" />
          <span className="block h-3 w-3 rounded-full bg-green-400" />
        </div>
        <div className="flex-1 rounded-md border border-slate-200 bg-white
          px-3 py-1 text-center text-xs text-slate-400">
          nyakizu.com/store/rng-plaza
        </div>
      </div>

      {/* Store header */}
      <div className="flex items-center justify-between
        bg-[#1A56DB] px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center
            rounded-xl bg-white/20">
            <Store size={16} className="text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-white">
              RNG Plaza Accessories
            </p>
            <p className="flex items-center gap-1 text-[11px] text-blue-200">
              <CheckCircle2 size={10} strokeWidth={2.5} />
              Verified wholesaler · Nairobi CBD
            </p>
          </div>
        </div>
        <span className="rounded-full bg-green-400/20 px-3 py-1
          text-[11px] font-bold text-green-300">
          Open
        </span>
      </div>

      {/* Product list */}
      <div className="divide-y divide-slate-50">
        {rows.map((r) => (
          <div key={r.name}
            className="flex items-center justify-between px-5 py-3">
            <div>
              <p className="text-sm font-medium text-slate-800">{r.name}</p>
              <p className="text-xs text-slate-400">{r.stock} in stock</p>
            </div>
            <span className="ml-6 shrink-0 text-sm font-bold text-[#1A56DB]">
              {r.price}
            </span>
          </div>
        ))}
      </div>

      {/* CTA footer */}
      <div className="border-t border-slate-100 px-5 py-4">
        <div className="flex h-10 w-full items-center justify-center
          gap-2 rounded-xl bg-[#1A56DB] text-sm font-bold text-white">
          Send Shopping List <ArrowRight size={14} />
        </div>
      </div>
    </div>
  );
}

/* ── stat row ────────────────────────────────────────────────────────────── */
function StatRow() {
  const stats = [
    { value: "50+",     label: "Verified stores"  },
    { value: "300+",    label: "Trusted buyers"   },
    { value: "KES 2M+", label: "Tracked balances" },
  ];
  return (
    <div className="flex items-center gap-8 border-t border-slate-100 pt-7">
      {stats.map(({ value, label }) => (
        <div key={label}>
          <p className="text-2xl font-black text-slate-900">{value}</p>
          <p className="mt-0.5 text-xs text-slate-400">{label}</p>
        </div>
      ))}
    </div>
  );
}

/* ── hero ────────────────────────────────────────────────────────────────── */
export function Hero() {
  const trust = [
    "Admin-verified wholesalers",
    "Per-store buyer approval",
    "Offline-ready",
    "Free to join",
  ];

  return (
    <section className="bg-white">
      <div className="mx-auto grid max-w-6xl items-center gap-12
        px-6 py-20 sm:py-24
        lg:grid-cols-2 lg:gap-20 lg:py-28">

        {/* ── LEFT ───────────────────────────────────────────────────── */}
        <div className="space-y-7">

          <span className="inline-flex items-center gap-2 rounded-full
            border border-blue-100 bg-blue-50 px-4 py-2
            text-xs font-bold text-[#1A56DB]">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#1A56DB]" />
            Trusted community trade · East Africa
          </span>

          <h1 className="text-5xl font-black leading-[1.07]
            tracking-tight text-slate-900 sm:text-6xl">
            Your wholesale.
            <br />
            <span className="text-[#1A56DB]">Digitized.</span>
          </h1>

          <p className="max-w-md text-lg leading-relaxed text-slate-500">
            Wholesalers list their stores. Trusted buyers submit structured
            orders. Every payment and balance tracked — no notebooks, no
            WhatsApp chaos.
          </p>

          <div className="flex flex-wrap gap-3">
            <Link href="/register/seller"
              className="inline-flex h-12 items-center gap-2 rounded-xl
                bg-[#1A56DB] px-8 text-sm font-bold text-white
                shadow-lg shadow-blue-200/60
                transition hover:bg-[#1749c0] active:scale-[0.98]">
              Set up my store <ArrowRight size={16} />
            </Link>
            <Link href="/register/buyer"
              className="inline-flex h-12 items-center gap-2 rounded-xl
                border-2 border-slate-200 bg-white px-7
                text-sm font-semibold text-slate-700
                transition hover:border-slate-300 hover:bg-slate-50">
              Find my supplier
            </Link>
          </div>

          <StatRow />

          <div className="flex flex-wrap gap-x-5 gap-y-2">
            {trust.map(t => (
              <span key={t}
                className="flex items-center gap-1.5 text-xs text-slate-400">
                <CheckCircle2 size={12} className="shrink-0 text-[#22C55E]" />
                {t}
              </span>
            ))}
          </div>
        </div>

        {/* ── RIGHT ──────────────────────────────────────────────────── */}
        <div className="w-full">
          {/* Blue tinted card wrapper for depth */}
          <div className="relative rounded-3xl bg-gradient-to-br
            from-blue-600 to-blue-700 p-4 shadow-2xl shadow-blue-200/60">
            {/* Decorative rings */}
            <div aria-hidden
              className="absolute -right-6 -top-6 h-32 w-32 rounded-full
                border-[20px] border-blue-500/30" />
            <div aria-hidden
              className="absolute -bottom-4 -left-4 h-20 w-20 rounded-full
                border-[14px] border-blue-500/20" />
            <StoreWindow />
          </div>
        </div>
      </div>
    </section>
  );
}
