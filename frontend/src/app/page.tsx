"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Logo } from "@/components/Logo";

function ProblemRow({ old, fix }: { old: string; fix: string }) {
  return (
    <div className="grid grid-cols-[1fr_auto_1fr] items-start gap-3 py-4 border-b border-green-900/40 last:border-0">
      <p className="text-sm text-slate-400 line-through decoration-red-400/60">{old}</p>
      <div className="mt-0.5 text-amber-400 font-bold text-base select-none">→</div>
      <p className="text-sm text-green-100 font-medium">{fix}</p>
    </div>
  );
}

function Step({ n, title, body }: { n: string; title: string; body: string }) {
  return (
    <div className="flex gap-4">
      <div className="flex-none w-8 h-8 rounded-full bg-amber-400/10 border border-amber-400/40 flex items-center justify-center text-amber-400 font-black text-sm">
        {n}
      </div>
      <div>
        <p className="font-bold text-green-50">{title}</p>
        <p className="mt-0.5 text-sm text-slate-400">{body}</p>
      </div>
    </div>
  );
}

export default function HomePage() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  return (
    <main className="min-h-screen text-slate-200" style={{ background: "#0a1f10", fontFamily: "'Inter', system-ui, sans-serif" }}>
      <div aria-hidden className="pointer-events-none fixed inset-0 z-0 opacity-[0.03]"
        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`, backgroundSize: "200px" }} />

      <header className="sticky top-0 z-50 transition-all duration-300"
        style={{ background: scrolled ? "rgba(10,31,16,0.92)" : "transparent", backdropFilter: scrolled ? "blur(12px)" : "none", borderBottom: scrolled ? "1px solid rgba(255,255,255,0.06)" : "none" }}>
        <div className="mx-auto max-w-5xl px-5 py-4 flex items-center justify-between">
          <Logo inverted />
          <nav className="flex items-center gap-2">
            <Link href="/login" className="px-4 py-2 text-sm font-semibold text-green-200/80 hover:text-white transition-colors">Sign In</Link>
            <Link href="/register" className="px-4 py-2 text-sm font-bold rounded-lg text-green-950 transition-transform hover:scale-105" style={{ background: "#C8860A" }}>Register</Link>
          </nav>
        </div>
      </header>

      <section className="relative z-10 px-5 pt-16 pb-12 mx-auto max-w-3xl">
        <div className="inline-flex items-center gap-2 mb-6 px-3 py-1.5 rounded-full border border-amber-400/30 bg-amber-400/5">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
          <span className="text-xs font-semibold tracking-widest uppercase text-amber-400">Banyamulenge · Kenya · RNG Plaza</span>
        </div>
        <h1 className="text-4xl sm:text-6xl font-black leading-[1.05] tracking-tight text-white mb-6">
          Your business is already working.<br />
          <span style={{ color: "#C8860A" }}>Nyakizu helps it grow.</span><br />
          <span className="text-green-200/70 font-light text-3xl sm:text-4xl">Simple tools for our community.</span>
        </h1>
        <p className="max-w-xl text-base sm:text-lg text-slate-400 leading-relaxed mb-8">
          A simple app for Banyamulenge phone accessories traders. We build on the trust you already share with each other. Nyakizu gives you clear digital orders, safe credit records, and works perfectly even when you are offline.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 max-w-lg mb-10">
          <Link href="/buyer/suppliers" className="flex-1 rounded-xl px-5 py-4 font-bold text-sm text-center transition-transform hover:scale-[1.02]" style={{ background: "rgba(200,134,10,0.12)", border: "1px solid rgba(200,134,10,0.4)", color: "#C8860A" }}>
            <span className="block text-xs uppercase tracking-widest text-amber-400/60 mb-0.5 font-medium">For Buyers</span>
            Find Suppliers →
          </Link>
          <Link href="/seller/dashboard" className="flex-1 rounded-xl px-5 py-4 font-bold text-sm text-center transition-transform hover:scale-[1.02]" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.12)", color: "#e2e8f0" }}>
            <span className="block text-xs uppercase tracking-widest text-slate-500 mb-0.5 font-medium">For Sellers</span>
            Manage Store →
          </Link>
        </div>

        {/* Signup Mockup Visualization */}
        <div className="relative mx-auto max-w-lg rounded-t-2xl border border-white/10 bg-white/[0.02] p-2 backdrop-blur-md overflow-hidden" style={{ height: "320px", borderBottom: "none" }}>
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-400 to-green-500 opacity-50" />
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
            <div className="text-sm font-bold text-white">Create Account</div>
            <div className="text-xs text-slate-500">Step 1 of 2</div>
          </div>
          <div className="p-5 space-y-5">
            <div className="space-y-1.5">
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Phone Number</div>
              <div className="h-11 rounded-lg bg-black/20 border border-white/5 flex items-center px-4 text-slate-300 text-sm font-mono">+254 7•• ••• •••</div>
            </div>
            <div className="space-y-1.5">
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">I want to register as a:</div>
              <div className="grid grid-cols-2 gap-3">
                <div className="h-20 rounded-xl bg-amber-400/10 border border-amber-400/40 flex flex-col items-center justify-center gap-1 text-amber-400 shadow-[inset_0_0_12px_rgba(200,134,10,0.1)]">
                  <span className="text-sm font-bold">Buyer</span>
                </div>
                <div className="h-20 rounded-xl bg-white/5 border border-white/10 flex flex-col items-center justify-center gap-1 text-slate-400">
                  <span className="text-sm font-bold">Seller</span>
                </div>
              </div>
            </div>
            <div className="h-11 rounded-lg bg-green-600/20 text-green-400 flex items-center justify-center text-sm font-bold border border-green-500/30">Continue</div>
          </div>
          <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-[#0a1f10] to-transparent pointer-events-none" />
        </div>
      </section>

      <section className="relative z-10 mx-auto max-w-3xl px-5 py-12 border-t border-white/5">
        <div className="mb-3 text-xs uppercase tracking-widest text-green-600 font-semibold">Why Choose Nyakizu</div>
        <h2 className="text-2xl sm:text-3xl font-black text-white mb-4">
          Built for our community.<br />
          <span className="font-light text-slate-400">Protecting the relationships you trust.</span>
        </h2>
        <p className="text-slate-400 leading-relaxed text-sm sm:text-base max-w-2xl">
          RNG Plaza on Ronald Ngala Street is where our trade happens. But managing hundreds of orders through mixed-up WhatsApp voice notes and paper notebooks is stressful. Debt records get lost, and mistakes happen while packing.
        </p>
        <p className="mt-4 text-slate-400 leading-relaxed text-sm sm:text-base max-w-2xl">
          Nyakizu solves this. It gives you a safe digital space to organize your items, track who owes you money securely, and make trading faster for both buyers and sellers.
        </p>
      </section>

      <section className="relative z-10 mx-auto max-w-3xl px-5 py-4">
        <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.07)", background: "rgba(255,255,255,0.02)" }}>
          <div className="grid grid-cols-[1fr_auto_1fr] gap-3 px-5 py-4 border-b" style={{ borderColor: "rgba(255,255,255,0.07)", background: "rgba(255,255,255,0.03)" }}>
            <span className="text-xs font-bold uppercase tracking-widest text-red-400/70">The Old Way</span>
            <span />
            <span className="text-xs font-bold uppercase tracking-widest text-green-400/70">With Nyakizu</span>
          </div>
          <div className="px-5 divide-y divide-green-900/30">
            <ProblemRow old="Mixed up WhatsApp voice notes" fix="Clear digital orders with exact product lists" />
            <ProblemRow old="Paper notebooks that can get lost or ruined" fix="Safe digital debt records that are never lost" />
            <ProblemRow old="Buyers changing orders while seller is packing" fix="Orders lock safely once packing begins" />
            <ProblemRow old="Not knowing if a supplier has stock" fix="Clear labels showing exactly what is available" />
            <ProblemRow old="Hard to find new partners you can trust" fix="Only verified and trusted sellers are allowed" />
            <ProblemRow old="Trading stops when there is no network" fix="Save your orders offline and send them later" />
          </div>
        </div>
      </section>

      <section className="relative z-10 mx-auto max-w-3xl px-5 py-12">
        <div className="mb-3 text-xs uppercase tracking-widest text-green-600 font-semibold">How It Works</div>
        <h2 className="text-2xl sm:text-3xl font-black text-white mb-10">Trade easily in 6 steps</h2>
        <div className="space-y-7">
          <Step n="1" title="Connect with verified sellers" body="Find and connect with trusted wholesalers. They will approve you as a buyer, just like you do in person." />
          <Step n="2" title="View products online" body="See what your supplier has in stock. Exact numbers stay hidden, but you will always know if an item is available." />
          <Step n="3" title="Send a clear order" body="Pick your products and quantities easily. You can type this offline and send it when your phone gets a signal." />
          <Step n="4" title="Sellers pack and lock the order" body="Once the seller starts packing, the order is locked so no mistakes are made. Everyone knows exactly what is coming." />
          <Step n="5" title="Save M-Pesa records" body="Both the buyer and seller paste the M-Pesa message. There are no extra fees, just a simple way to track payments." />
          <Step n="6" title="Get your digital receipt" body="Instantly download a clean receipt. Your payment history and debts are safe and cannot be deleted." />
        </div>
      </section>

      <div className="relative z-10 mx-4 sm:mx-auto sm:max-w-3xl rounded-2xl px-6 py-8 mb-8"
        style={{ background: "linear-gradient(135deg, rgba(200,134,10,0.08) 0%, rgba(15,46,26,0.8) 100%)", border: "1px solid rgba(200,134,10,0.2)" }}>
        <blockquote className="text-xl sm:text-2xl font-black text-white leading-snug">
          &ldquo;Nyakizu does not change the way our community trades,
          <span style={{ color: "#C8860A" }}> it just gives us better tools to succeed.&rdquo;</span>
        </blockquote>
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: "Verified Users", desc: "Every seller uses a real ID before they can sell." },
            { label: "Private", desc: "Your debts and payments are only seen by you and your partner." },
            { label: "Safe Records", desc: "Receipts and payments can never be erased or lost." },
          ].map((p) => (
            <div key={p.label} className="rounded-xl px-4 py-3" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
              <div className="text-xs font-bold text-green-300 uppercase tracking-wider mb-1">{p.label}</div>
              <div className="text-xs text-slate-500">{p.desc}</div>
            </div>
          ))}
        </div>
      </div>

      <section className="relative z-10 mx-auto max-w-3xl px-5 py-12">
        <div className="mb-3 text-xs uppercase tracking-widest text-green-600 font-semibold">Who is it for</div>
        <h2 className="text-2xl font-black text-white mb-8">Made for everyone in the market</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { role: "Retailers & Hawkers", desc: "Order products faster, track what you owe safely, build trust with suppliers, and save your work offline.", href: "/register?role=buyer", cta: "Register as a Buyer", accent: "#C8860A" },
            { role: "Wholesalers & Distributors", desc: "Show your products online, approve buyers you know, stop packing mistakes, and track your money easily.", href: "/register?role=seller", cta: "Register as a Seller", accent: "#4ade80" },
          ].map((r) => (
            <div key={r.role} className="rounded-2xl p-5 flex flex-col" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)" }}>
              <div className="inline-block self-start mb-3 text-xs font-bold uppercase tracking-widest px-2.5 py-1 rounded-full" style={{ background: `${r.accent}18`, color: r.accent, border: `1px solid ${r.accent}30` }}>
                {r.role}
              </div>
              <p className="text-sm text-slate-400 flex-1 mb-5">{r.desc}</p>
              <Link href={r.href} className="text-sm font-bold self-start transition-colors" style={{ color: r.accent }}>{r.cta} →</Link>
            </div>
          ))}
        </div>
      </section>

      <section className="relative z-10 mx-4 sm:mx-auto sm:max-w-3xl rounded-2xl px-6 py-12 mb-12 text-center overflow-hidden"
        style={{ background: "linear-gradient(160deg, #0f2e1a 0%, #1a4a25 100%)", border: "1px solid rgba(255,255,255,0.08)" }}>
        <div aria-hidden className="absolute -top-16 -right-16 w-48 h-48 rounded-full opacity-20" style={{ background: "radial-gradient(circle, #C8860A, transparent)" }} />
        <div className="relative z-10">
          <h2 className="text-2xl sm:text-3xl font-black text-white mb-3">Ready to start?</h2>
          <p className="text-slate-400 text-sm mb-8 max-w-md mx-auto">Nyakizu is completely free to use. No hidden fees or automatic bank charges. Just a better way to do your daily business.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/register" className="px-6 py-3.5 rounded-xl text-sm font-bold text-green-950 transition-transform hover:scale-105" style={{ background: "#C8860A" }}>Create Account</Link>
            <Link href="/login" className="px-6 py-3.5 rounded-xl text-sm font-semibold text-slate-300 transition-colors hover:bg-white/5" style={{ border: "1px solid rgba(255,255,255,0.12)" }}>Sign In</Link>
          </div>
        </div>
      </section>

      <footer className="relative z-10 border-t px-5 py-8" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
        <div className="mx-auto max-w-5xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <Logo inverted />
            <p className="mt-1 text-xs text-slate-600">A digital tool for community trade · Nairobi, Kenya</p>
          </div>
          <div className="flex items-center gap-5 text-xs text-slate-600">
            <Link href="/register" className="hover:text-slate-400 transition-colors">Register</Link>
            <Link href="/login" className="hover:text-slate-400 transition-colors">Sign In</Link>
            <span>© {new Date().getFullYear()} Nyakizu Digital Market</span>
          </div>
        </div>
      </footer>
    </main>
  );
}