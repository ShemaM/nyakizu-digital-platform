"use client";

import { useState } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  Sparkles,
  ChevronDown,
  Wallet,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Container, Section, LandingHeader, LandingFooter } from "@/components/layouts";

export function PricingContent() {
  const [sliderCartonValue, setSliderCartonValue] = useState<number>(10000);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  // KSh 50 minimum to KSh 100 maximum cap (capped at KSh 20,000 maximum order size)
  const computedFee = Math.min(100, Math.max(50, Math.round((sliderCartonValue * 0.005) / 5) * 5));
  const effectivePercentage = ((computedFee / sliderCartonValue) * 100).toFixed(2);

  const toggleFaq = (index: number) => {
    setOpenFaqIndex((prev) => (prev === index ? null : index));
  };

  const PRICING_FAQS = [
    {
      q: "Why did Nyakizu adopt a pay-per-order fee instead of KSh 1,500/month?",
      a: "Monthly subscription fees punish wholesalers when market foot traffic drops, during rainy seasons, or over quiet trade months. Pay-per-order aligns our incentives with yours: if you don't pack a carton, you pay KSh 0. When you do pack and make money, the fee is tiny (KSh 50 to a maximum cap of KSh 100).",
    },
    {
      q: "What is the maximum order size and maximum fee?",
      a: "The maximum order size supported on Nyakizu is KSh 20,000. Regardless of the size of the order up to KSh 20,000, the platform fee is strictly capped at KSh 100 maximum. That is less than the wholesale margin on a single phone screen protector or cable.",
    },
    {
      q: "Do retail buyers or hawkers across Kenya pay any fee?",
      a: "Never. Retail shop owners, stall managers, and hawkers across Mombasa, Kisumu, Nakuru, Eldoret, and all Kenyan towns use Nyakizu 100% free forever. There is zero signup fee, zero order fee, and zero monthly subscription for buyers.",
    },
    {
      q: "How does the wholesaler prepaid billing balance work?",
      a: "Each wholesaler has a billing wallet inside their dashboard. You top it up via Safaricom M-Pesa (instant STK push prompt) with as little as KSh 100 or KSh 500 whenever you like. When you check off packed goods and tap 'Lock Price', the fee is deducted. The money stays in your account until you actually lock orders.",
    },
    {
      q: "What are the first 3 orders free?",
      a: "Every new wholesale account gets 3 complete order lockups entirely free with zero deposit required. You can experience the speed, checklist, and unalterable receipts before paying a single shilling.",
    },
    {
      q: "What happens if my M-Pesa balance runs out in the middle of packing?",
      a: "Nyakizu will never disrupt a busy market rush or hold up your dispatch. We provide a flexible grace period allowing you to finish packing and top up your balance afterward.",
    },
    {
      q: "Are custom sourcing requests charged extra?",
      a: "No. Sourced items are treated as regular order items. Whether an order contains standard catalog phone covers or custom-sourced screens, the same transparent KSh 50 to KSh 100 per-carton fee applies.",
    },
    {
      q: "Is the debt ledger and payment tracking included for free?",
      a: "Yes. Logging partial M-Pesa payments, transaction reference codes, tracking customer credit (madeni), and promised settlement dates is included with your account at zero extra charge.",
    },
  ];

  const FEE_TIERS = [
    {
      range: "KSh 1,000 – KSh 10,000",
      label: "Small Orders & Daily Re-stocks",
      fee: "KSh 50",
      rate: "0.50% – 5.0%",
      notes: "Platform minimum fee",
    },
    {
      range: "KSh 10,001 – KSh 19,500",
      label: "Medium Cartons & Wholesale Packs",
      fee: "KSh 55 – KSh 95",
      rate: "0.50%",
      notes: "0.5% rate rounded to nearest KES 5",
    },
    {
      range: "KSh 20,000 (Maximum order size)",
      label: "Full Cartons & Volume Shipments",
      fee: "KSh 100",
      rate: "0.50%",
      notes: "Strict maximum cap per order",
    },
    {
      range: "Any order amount",
      label: "Retail Buyers, Stalls & Hawkers",
      fee: "KSh 0",
      rate: "0.00%",
      notes: "100% Free forever for buyers",
    },
  ];

  return (
    <div className="min-h-screen bg-dark-primary text-text-primary selection:bg-brand-gold/30 selection:text-text-primary">
      <LandingHeader />

      {/* ======================================================================= */}
      {/* 1. HERO SECTION                                                         */}
      {/* ======================================================================= */}
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-100/80 via-white to-slate-50 dark:from-[#090A16] dark:via-[#0E1226] dark:to-[#0A0C19] pt-28 pb-14 sm:pt-40 sm:pb-20 border-b border-dark-accent">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[450px] bg-gradient-to-tr from-brand-gold/20 via-purple-600/15 to-transparent rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(#0000000a_1px,transparent_1px)] dark:bg-[radial-gradient(#ffffff0a_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />

        <Container size="lg" className="text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-brand-gold/30 bg-brand-gold/10 text-brand-gold text-xs sm:text-sm font-bold mb-5">
            <Sparkles className="w-4 h-4" /> Zero Monthly Subscription &middot; Pay Only When You Pack
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-text-primary">
            Simple, Transparent Wholesale Pricing.
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-gold via-amber-400 to-amber-600 dark:from-brand-gold dark:via-amber-300 dark:to-amber-500">
              KSh 50 to KSh 100 Per Carton.
            </span>
          </h1>

          <p className="mt-4 sm:mt-6 text-base sm:text-xl text-text-secondary max-w-2xl mx-auto leading-relaxed font-medium">
            No fixed monthly drain. Pay only when you pack and dispatch a real carton. Your first 3 orders are 100% free, and retail buyers pay KSh 0 forever.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs sm:text-sm text-text-secondary font-semibold">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" /> First 3 Orders 100% Free
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Capped at KSh 100 Max
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Retailers &amp; Hawkers Pay KSh 0
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Top Up via M-Pesa from KSh 100
            </span>
          </div>
        </Container>
      </section>

      {/* ======================================================================= */}
      {/* 2. INTERACTIVE FEE CALCULATOR                                           */}
      {/* ======================================================================= */}
      <Section spacing="lg" className="bg-dark-secondary border-b border-dark-accent" id="calculator">
        <Container size="lg">
          <div className="rounded-3xl border-2 border-brand-gold/50 bg-dark-card p-6 sm:p-10 shadow-xl dark:shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-80 h-80 bg-brand-gold/10 dark:bg-brand-gold/15 rounded-full blur-3xl pointer-events-none" />

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-dark-accent relative z-10">
              <div>
                <span className="text-xs font-black uppercase tracking-wider text-brand-gold">
                  Live Fee Simulation
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-text-primary mt-1">
                  Estimate Your Fee Per Packed Carton
                </h2>
                <p className="text-xs sm:text-sm text-text-secondary mt-1">
                  Drag the slider to see exact wholesaler deduction and effective rate.
                </p>
              </div>
              <div className="text-left md:text-right shrink-0">
                <span className="text-xs text-text-muted uppercase tracking-wider block font-bold">Nyakizu Platform Fee</span>
                <span className="text-3xl sm:text-4xl font-black text-brand-gold tabular-nums">
                  KSh {computedFee}
                </span>
                <span className="text-xs text-text-muted block mt-0.5">
                  ({effectivePercentage}% of order total &middot; Capped at KSh 100 max)
                </span>
              </div>
            </div>

            {/* Slider */}
            <div className="py-8 relative z-10">
              <div className="flex justify-between items-center mb-3">
                <label htmlFor="pricing-slider" className="text-sm font-bold text-text-primary">
                  Carton / Order Value:{" "}
                  <span className="text-brand-gold font-black text-lg">
                    KSh {sliderCartonValue.toLocaleString()}
                  </span>
                </label>
                <span className="text-xs text-text-muted">Min KSh 1,000 &mdash; Max KSh 20,000 (Maximum order size)</span>
              </div>

              <input
                id="pricing-slider"
                type="range"
                min={1000}
                max={20000}
                step={500}
                value={sliderCartonValue}
                onChange={(e) => setSliderCartonValue(Number(e.target.value))}
                className="w-full h-3 bg-dark-tertiary border border-dark-accent rounded-lg appearance-none cursor-pointer accent-brand-gold focus:outline-none"
              />

              <div className="flex justify-between text-xs text-text-muted mt-2 font-mono">
                <span>KSh 1,000</span>
                <span>KSh 5,000</span>
                <span>KSh 10,000</span>
                <span>KSh 15,000</span>
                <span>KSh 20,000 (Max)</span>
              </div>
            </div>

            {/* 4 Stat Tiles */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2 relative z-10">
              <div className="rounded-2xl border border-dark-accent bg-dark-tertiary/60 p-4 text-center">
                <span className="text-[11px] font-bold text-text-muted uppercase tracking-wider block">Order Value</span>
                <span className="text-lg sm:text-xl font-bold text-text-primary tabular-nums mt-1 block">
                  KSh {sliderCartonValue.toLocaleString()}
                </span>
              </div>
              <div className="rounded-2xl border border-brand-gold/50 bg-brand-gold/10 p-4 text-center">
                <span className="text-[11px] font-black text-brand-gold uppercase tracking-wider block">Wholesaler Pays</span>
                <span className="text-lg sm:text-xl font-black text-brand-gold tabular-nums mt-1 block">
                  KSh {computedFee}
                </span>
              </div>
              <div className="rounded-2xl border border-dark-accent bg-dark-tertiary/60 p-4 text-center">
                <span className="text-[11px] font-bold text-text-muted uppercase tracking-wider block">Effective Rate</span>
                <span className="text-lg sm:text-xl font-bold text-text-primary tabular-nums mt-1 block">
                  {effectivePercentage}%
                </span>
              </div>
              <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-center">
                <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block">Buyer / Hawkers Fee</span>
                <span className="text-lg sm:text-xl font-bold text-emerald-600 dark:text-emerald-400 tabular-nums mt-1 block">
                  KSh 0 (Free)
                </span>
              </div>
            </div>

            <p className="text-xs text-text-muted text-center mt-6">
              * The fee is strictly capped at KSh 100 maximum for all orders up to KSh 20,000 (maximum order size). That is less than the margin on a single phone screen protector.
            </p>
          </div>
        </Container>
      </Section>

      {/* ======================================================================= */}
      {/* 3. TRANSPARENT FEE SCHEDULE BREAKDOWN TABLE                             */}
      {/* ======================================================================= */}
      <Section spacing="lg" className="bg-dark-primary border-b border-dark-accent">
        <Container size="lg">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-gold block mb-1">
              Complete Fee Matrix
            </span>
            <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-text-primary">
              Clear Rules. Zero Surprises.
            </h2>
            <p className="mt-2 text-text-secondary text-sm sm:text-base">
              Here is exactly how order totals map to fees. No hidden percentage add-ons, no withdrawal penalties.
            </p>
          </div>

          <div className="rounded-3xl border border-dark-accent bg-dark-card overflow-hidden shadow-lg">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-dark-tertiary text-text-primary font-bold border-b border-dark-accent text-xs uppercase tracking-wider">
                  <tr>
                    <th scope="col" className="p-4 sm:p-5">Order / Carton Value</th>
                    <th scope="col" className="p-4 sm:p-5">Tier Description</th>
                    <th scope="col" className="p-4 sm:p-5">Platform Fee</th>
                    <th scope="col" className="p-4 sm:p-5">Effective %</th>
                    <th scope="col" className="p-4 sm:p-5">Policy Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-dark-accent text-text-secondary">
                  {FEE_TIERS.map((tier) => (
                    <tr key={tier.range} className="hover:bg-dark-tertiary/40 transition-colors">
                      <td className="p-4 sm:p-5 font-bold text-text-primary font-mono">{tier.range}</td>
                      <td className="p-4 sm:p-5">{tier.label}</td>
                      <td className="p-4 sm:p-5 font-black text-brand-gold">{tier.fee}</td>
                      <td className="p-4 sm:p-5 font-mono text-xs">{tier.rate}</td>
                      <td className="p-4 sm:p-5 text-xs text-text-muted">{tier.notes}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </Container>
      </Section>

      {/* ======================================================================= */}
      {/* 4. THREE SIMPLE PLANS                                                   */}
      {/* ======================================================================= */}
      <Section spacing="lg" className="bg-dark-secondary border-b border-dark-accent">
        <Container size="lg">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-gold block mb-1">
              Plan Overview
            </span>
            <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-text-primary">
              Three Simple, Transparent Plans
            </h2>
            <p className="mt-2 text-text-secondary text-sm sm:text-base">
              No credit card, no bank guarantees. Maintain an M-Pesa balance on your own terms.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Card 1: Free Trial */}
            <div className="rounded-3xl border border-dark-accent bg-dark-card p-6 sm:p-8 flex flex-col justify-between shadow-sm dark:shadow-xl">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-text-muted">Test Risk-Free</span>
                <h3 className="text-xl font-bold text-text-primary mt-1">First 3 Orders Free</h3>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-3xl font-extrabold text-text-primary">KSh 0</span>
                  <span className="text-xs text-text-muted">/ first 3 cartons</span>
                </div>
                <p className="mt-3 text-sm text-text-secondary leading-relaxed">
                  Start digitizing your wholesale orders immediately. Test with your real buyers with zero financial commitment.
                </p>

                <ul className="mt-6 space-y-3 text-sm text-text-secondary">
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" /> 3 Full carton lockups included
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" /> Zero deposit or credit card
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" /> Full access to live debt ledger
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" /> Private wholesale catalog
                  </li>
                </ul>
              </div>

              <div className="mt-8 pt-5 border-t border-dark-accent">
                <Button variant="outline" className="w-full rounded-full border-dark-accent hover:border-brand-gold text-text-primary bg-dark-secondary hover:bg-dark-tertiary font-bold" asChild>
                  <Link href="/register?role=seller">Sign Up Free</Link>
                </Button>
              </div>
            </div>

            {/* Card 2: Wholesale Pay-As-You-Pack */}
            <div className="rounded-3xl border-2 border-brand-gold bg-dark-card dark:bg-[#141830] p-6 sm:p-8 flex flex-col justify-between relative shadow-lg dark:shadow-2xl">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-brand-gold text-slate-950 font-black text-xs tracking-wide shadow-sm">
                Most Popular for Wholesalers
              </div>

              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-brand-gold">Pay-As-You-Pack</span>
                <h3 className="text-xl font-bold text-text-primary mt-1">Wholesale Per-Order Fee</h3>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-3xl sm:text-4xl font-black text-brand-gold">KSh 50 &ndash; 100</span>
                  <span className="text-xs text-text-muted">/ packed carton</span>
                </div>
                <p className="mt-3 text-sm text-text-secondary leading-relaxed">
                  Only charged when you lock an order and dispatch. Zero charges during quiet seasons. Never a monthly bill.
                </p>

                <ul className="mt-6 space-y-3 text-sm text-text-secondary">
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-brand-gold shrink-0" /> KSh 50 min, KSh 100 max cap
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-brand-gold shrink-0" /> Zero monthly subscription
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-brand-gold shrink-0" /> Instant top-up via M-Pesa Daraja
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-brand-gold shrink-0" /> Locked permanent order receipts
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-brand-gold shrink-0" /> Custom item sourcing checklist
                  </li>
                </ul>
              </div>

              <div className="mt-8 pt-5 border-t border-dark-accent">
                <Button className="w-full rounded-full bg-brand-gold hover:bg-brand-gold-dark text-slate-950 font-black shadow-brand" asChild>
                  <Link href="/register?role=seller">Open Wholesale Shop</Link>
                </Button>
              </div>
            </div>

            {/* Card 3: Retailers & Hawkers */}
            <div className="rounded-3xl border border-dark-accent bg-dark-card p-6 sm:p-8 flex flex-col justify-between shadow-sm dark:shadow-xl">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">For Countrywide Buyers</span>
                <h3 className="text-xl font-bold text-text-primary mt-1">Retailers &amp; Hawkers</h3>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">KSh 0</span>
                  <span className="text-xs text-text-muted">/ forever</span>
                </div>
                <p className="mt-3 text-sm text-text-secondary leading-relaxed">
                  Retail shopkeepers, stall managers, and hawkers across Kenya order through Nyakizu completely free.
                </p>

                <ul className="mt-6 space-y-3 text-sm text-text-secondary">
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" /> 100% Free forever for buyers
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" /> Order from multiple wholesalers
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" /> Shared credit &amp; payment claims
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" /> Custom accessories sourcing
                  </li>
                </ul>
              </div>

              <div className="mt-8 pt-5 border-t border-dark-accent">
                <Button variant="outline" className="w-full rounded-full border-dark-accent hover:border-emerald-500 text-text-primary bg-dark-secondary hover:bg-dark-tertiary font-bold" asChild>
                  <Link href="/register?role=buyer">Join as Buyer (Free)</Link>
                </Button>
              </div>
            </div>
          </div>
        </Container>
      </Section>

      {/* ======================================================================= */}
      {/* 5. HOW M-PESA PREPAID BILLING WORKS                                     */}
      {/* ======================================================================= */}
      <Section spacing="lg" className="bg-dark-primary border-b border-dark-accent">
        <Container size="md">
          <div className="rounded-3xl border border-dark-accent bg-dark-card p-8 sm:p-12 text-center shadow-lg">
            <div className="w-14 h-14 rounded-2xl bg-brand-gold/15 text-brand-gold flex items-center justify-center mx-auto mb-5">
              <Wallet className="w-7 h-7" />
            </div>
            <h3 className="text-2xl sm:text-3xl font-black text-text-primary">
              How M-Pesa Prepaid Top-Up Works
            </h3>
            <p className="mt-3 text-text-secondary text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
              Wholesalers maintain a prepaid balance on their seller account. When packing a carton, top up from as little as KSh 100 using instant Safaricom STK push.
            </p>

            <div className="grid sm:grid-cols-3 gap-5 mt-10 text-left">
              <div className="rounded-2xl border border-dark-accent bg-dark-tertiary/50 p-5">
                <span className="w-7 h-7 rounded-lg bg-brand-gold/20 text-brand-gold font-black text-xs flex items-center justify-center mb-3">1</span>
                <span className="text-text-primary font-bold text-sm block">Enter Amount</span>
                <p className="text-xs text-text-secondary mt-1 leading-relaxed">Top up as little as KSh 100 or KSh 500 directly inside your seller billing panel.</p>
              </div>
              <div className="rounded-2xl border border-dark-accent bg-dark-tertiary/50 p-5">
                <span className="w-7 h-7 rounded-lg bg-brand-gold/20 text-brand-gold font-black text-xs flex items-center justify-center mb-3">2</span>
                <span className="text-text-primary font-bold text-sm block">Enter PIN on Phone</span>
                <p className="text-xs text-text-secondary mt-1 leading-relaxed">Receive an instant Safaricom M-Pesa prompt on your phone and approve with your PIN.</p>
              </div>
              <div className="rounded-2xl border border-dark-accent bg-dark-tertiary/50 p-5">
                <span className="w-7 h-7 rounded-lg bg-brand-gold/20 text-brand-gold font-black text-xs flex items-center justify-center mb-3">3</span>
                <span className="text-text-primary font-bold text-sm block">Pack &amp; Deduct</span>
                <p className="text-xs text-text-secondary mt-1 leading-relaxed">When you lock the carton, the KSh 50 to KSh 100 fee is deducted automatically.</p>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-dark-accent flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-text-muted">
              <span className="flex items-center gap-1.5 font-semibold text-text-secondary">
                <ShieldCheck className="w-4 h-4 text-emerald-500" /> Rush-Hour Grace Period: Nyakizu never cuts off your packing during peak market hours.
              </span>
              <span className="font-mono">Daraja M-Pesa Integrated</span>
            </div>
          </div>
        </Container>
      </Section>

      {/* ======================================================================= */}
      {/* 6. FAQS                                                                 */}
      {/* ======================================================================= */}
      <Section spacing="lg" className="bg-dark-secondary border-b border-dark-accent">
        <Container size="md">
          <div className="text-center max-w-xl mx-auto mb-10">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-gold block mb-1">
              Common Questions
            </span>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-text-primary">
              Pricing Questions &amp; Answers
            </h2>
            <p className="mt-2 text-text-secondary text-sm">
              Everything you need to know about fees, M-Pesa billing, and order caps.
            </p>
          </div>

          <div className="space-y-3">
            {PRICING_FAQS.map((faq, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div
                  key={faq.q}
                  className="rounded-2xl border border-dark-accent bg-dark-card overflow-hidden shadow-sm"
                >
                  <button
                    type="button"
                    onClick={() => toggleFaq(idx)}
                    className="w-full px-5 py-4 sm:px-6 sm:py-5 text-left flex items-center justify-between gap-4 font-bold text-text-primary text-base hover:text-brand-gold transition-colors"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      className={`w-5 h-5 shrink-0 transition-transform duration-200 ${
                        isOpen ? "rotate-180 text-brand-gold" : "text-text-muted"
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 sm:px-6 sm:pb-6 text-sm sm:text-base text-text-secondary leading-relaxed border-t border-dark-accent pt-4">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </Container>
      </Section>

      {/* ======================================================================= */}
      {/* 7. CLOSING CTA                                                          */}
      {/* ======================================================================= */}
      <Section spacing="lg" className="bg-dark-primary">
        <Container size="md">
          <div className="relative rounded-3xl border-2 border-brand-gold/50 bg-gradient-to-r from-brand-gold/10 via-amber-500/5 to-purple-500/10 dark:from-brand-gold/15 dark:via-[#191D38] dark:to-purple-600/15 bg-dark-card p-8 sm:p-12 text-center shadow-xl dark:shadow-2xl overflow-hidden">
            <div className="relative z-10 max-w-xl mx-auto space-y-4">
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-brand-gold/20 text-brand-gold font-black text-xs uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" /> Start Digitizing Today
              </span>
              <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-text-primary">
                Your First 3 Orders Are 100% Free
              </h2>
              <p className="text-text-secondary text-sm sm:text-base leading-relaxed">
                No credit card, no initial deposit required. Open your account in 2 minutes and experience the difference on your next shipment.
              </p>
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                <Button size="lg" className="w-full sm:w-auto rounded-full bg-brand-gold hover:bg-brand-gold-dark text-slate-950 font-black shadow-brand px-8 h-12" asChild>
                  <Link href="/register?role=seller">
                    Open Wholesale Shop
                    <ArrowRight className="w-4 h-4 ml-1.5" />
                  </Link>
                </Button>
                <Button variant="outline" size="lg" className="w-full sm:w-auto rounded-full border-dark-accent hover:border-emerald-500 text-text-primary bg-dark-secondary hover:bg-dark-tertiary font-bold px-8 h-12" asChild>
                  <Link href="/register?role=buyer">Join as Buyer (Free)</Link>
                </Button>
              </div>
            </div>
          </div>
        </Container>
      </Section>

      <LandingFooter />
    </div>
  );
}
