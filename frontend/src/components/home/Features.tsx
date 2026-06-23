import {
  BookOpen, ClipboardList, Package,
  ShieldCheck, Store, Wallet,
} from "lucide-react";

const FEATURES = [
  {
    Icon: Store,
    bg: "bg-blue-50", color: "text-[#1A56DB]",
    title: "Wholesaler dashboard",
    body: "Manage your catalog, review incoming shopping lists, and see every buyer's balance from one screen.",
  },
  {
    Icon: ClipboardList,
    bg: "bg-amber-50", color: "text-amber-600",
    title: "Structured shopping lists",
    body: "Buyers send itemised lists — not voice notes. No missed items, no confusion.",
  },
  {
    Icon: Wallet,
    bg: "bg-green-50", color: "text-green-600",
    title: "Payment and debt ledger",
    body: "Amount owed, received, and cleared — per buyer, per order. Always accurate.",
  },
  {
    Icon: Package,
    bg: "bg-blue-50", color: "text-[#1A56DB]",
    title: "Order status tracking",
    body: "Draft → Submitted → Sourcing → Delivered. Both parties see the same status in real time.",
  },
  {
    Icon: ShieldCheck,
    bg: "bg-green-50", color: "text-green-600",
    title: "Verified relationships",
    body: "Every buyer–wholesaler pair is admin-verified and store-approved. No strangers in your catalog.",
  },
  {
    Icon: BookOpen,
    bg: "bg-amber-50", color: "text-amber-600",
    title: "Offline-ready catalog",
    body: "Buyers can browse and draft shopping lists without an internet connection.",
  },
] as const;

export function Features() {
  return (
    <section className="bg-white py-24">
      <div className="mx-auto max-w-6xl px-6">

        <div className="mb-14 max-w-xl">
          <p className="mb-3 text-xs font-bold uppercase tracking-widest text-[#1A56DB]">
            Features
          </p>
          <h2 className="text-4xl font-black tracking-tight text-slate-900">
            Everything trade needs.
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-slate-500">
            Built for phone accessories wholesale trade in East Africa —
            practical, reliable, and designed around how traders actually work.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map(({ Icon, bg, color, title, body }) => (
            <article key={title}
              className="group rounded-2xl border border-slate-200 bg-white
                p-6 shadow-sm transition-all hover:shadow-md hover:border-slate-300">
              <div className={`mb-5 inline-flex h-11 w-11 items-center
                justify-center rounded-xl ${bg} ${color}
                transition-transform group-hover:scale-105`}>
                <Icon size={20} strokeWidth={2} />
              </div>
              <h3 className="mb-2 text-base font-bold text-slate-900">{title}</h3>
              <p className="text-sm leading-relaxed text-slate-500">{body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
