"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, type Variants } from "motion/react";
import {
  CheckCircle2,
  Lock,
  Wallet,
  Smartphone,
  ArrowRight,
  Sparkles,
  ChevronDown,
  ShieldCheck,
  Store,
  ShoppingBag,
  TrendingDown,
  Check,
  Package,
  Plus,
  FileText,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Container, Section, LandingHeader, LandingFooter } from "@/components/layouts";
import CommunityActivity from "@/components/landing/CommunityActivity";

// Shared entrance choreographies
const staggerContainer: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } },
};

const gridReveal: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};

function SectionKicker({ index, label }: { index: string; label: string }) {
  return (
    <div className="flex items-center gap-2 mb-3 sm:mb-4">
      <span className="text-xs sm:text-sm font-extrabold text-brand-gold tabular-nums" aria-hidden="true">
        {index}
      </span>
      <span className="text-xs sm:text-sm font-bold uppercase tracking-widest text-text-muted">{label}</span>
      <span className="flex-1 h-px bg-dark-accent" aria-hidden="true" />
    </div>
  );
}

export function HomeContent() {
  // --- Section 1 Hero: Real Backend Interactive Screen Explorer State ---
  const [activeScreenTab, setActiveScreenTab] = useState<"fulfill" | "catalog" | "ledger">("fulfill");

  // Interactive packing items inside the hero fulfill preview (real OrderItem.is_packed)
  const [packedItems, setPackedItems] = useState<{ [key: string]: boolean }>({
    item1: true,
    item2: true,
    item3: false,
  });

  const togglePacked = (key: string) => {
    setPackedItems((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // --- Section 2: Before vs After Interactive Toggle ---
  const [comparisonMode, setComparisonMode] = useState<"analog" | "nyakizu">("nyakizu");

  // --- Section 4: Interactive Hostinger-Style Pricing Calculator State ---
  const [cartonValue, setCartonValue] = useState<number>(24000);

  // Real backend fee formula (FeeSchedule):
  // 0.5% rate, rounded to nearest KES 5, clamped between KES 50 min and KES 100 max
  const computedFee = Math.min(100, Math.max(50, Math.round((cartonValue * 0.005) / 5) * 5));
  const effectivePercentage = ((computedFee / cartonValue) * 100).toFixed(2);

  // --- Section 7: FAQ Accordion State ---
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const toggleFaq = (index: number) => {
    setOpenFaqIndex((prev) => (prev === index ? null : index));
  };

  const FAQS = [
    {
      q: "Why do wholesalers pay KSh 50 to KSh 100 per order instead of a monthly subscription?",
      a: "Monthly subscriptions (like KSh 1,500/month) drain your cash even when business is slow. With Nyakizu, you only pay when you actually pack and lock a carton. Small orders pay KSh 50; large orders (even KSh 80,000+) are strictly capped at KSh 100. If you pack nothing, you pay zero.",
    },
    {
      q: "Do retail buyers, stall owners, and hawkers across Kenya have to pay anything?",
      a: "No. Nyakizu is 100% free forever for all retail buyers and hawkers. Buyers never pay any registration fee, monthly fee, or per-order fee. They browse catalogs, place orders, and track credit balances at zero cost.",
    },
    {
      q: "How do wholesale sellers pay the per-order fee?",
      a: "Sellers maintain a prepaid billing balance topped up directly via M-Pesa Daraja (STK push or Paybill) whenever convenient. Your first 3 orders are 100% free with no deposit required. When you lock a packed order, the small fee is deducted from your balance.",
    },
    {
      q: "Can competing wholesale shops on Luthuli Avenue see my inventory and prices?",
      a: "Never. Nyakizu is a private wholesale network, not an open public directory. Your catalog is private. Only verified buyers you personally approve can view your inventory and prices.",
    },
    {
      q: "How does Nyakizu handle orders when items need custom sourcing?",
      a: "Buyers can add items from your catalog or use the built-in 'Can't find it? Ask us to source it' box. As the seller, you review the requested item on your fulfill screen, quote the price, check it off when packed, and lock the final total.",
    },
    {
      q: "How are partial payments and debt (madeni) tracked?",
      a: "When a buyer sends money via M-Pesa, you log the payment amount and M-Pesa transaction reference directly against the order. The system calculates the remaining balance and tracks the promised payment date in real time.",
    },
  ];

  return (
    <div className="min-h-screen bg-dark-primary text-text-primary selection:bg-brand-gold/20 overflow-x-hidden">
      <LandingHeader />

      {/* ========================================================================= */}
      {/* SECTION 1: HERO (Hostinger-Style Visual Rhythm & Interactive Screen Mockup)*/}
      {/* ========================================================================= */}
      <section className="relative overflow-hidden pt-24 pb-16 sm:pt-36 sm:pb-28 border-b border-dark-accent">
        {/* Radiant Ambient Mesh Glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-gradient-to-tr from-brand-gold/15 via-amber-500/10 to-transparent rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-10 right-10 w-96 h-96 bg-purple-600/10 rounded-full blur-[100px] pointer-events-none" />

        <Container size="xl" className="relative z-10">
          <div className="grid lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left Column: Messaging & CTAs */}
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              animate="show"
              className="lg:col-span-7 text-center lg:text-left"
            >
              {/* Hostinger-Style Tag Pill */}
              <motion.div
                variants={fadeUp}
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-brand-gold/40 bg-brand-gold/10 text-brand-gold text-xs sm:text-sm font-extrabold mb-5 sm:mb-6 shadow-sm backdrop-blur-md"
              >
                <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                <span>Direct Wholesale Trade Platform &middot; Pay Only When You Pack</span>
              </motion.div>

              {/* Punchy Main Headline */}
              <motion.h1
                variants={fadeUp}
                className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.1] text-text-primary"
              >
                The Trade You Already Do.{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-gold via-amber-400 to-brand-gold-light">
                  Now Faster, Safer &amp; Digitized.
                </span>
              </motion.h1>

              {/* Grounded Subtitle */}
              <motion.p
                variants={fadeUp}
                className="mt-5 text-base sm:text-xl text-text-secondary leading-relaxed max-w-2xl mx-auto lg:mx-0 font-medium"
              >
                Nyakizu connects wholesale phone accessory suppliers with verified countrywide buyers. Track orders from sourcing to packing, lock final totals, and manage M-Pesa debt without paper notebooks or WhatsApp chaos.
              </motion.p>

              {/* Action Buttons */}
              <motion.div
                variants={fadeUp}
                className="mt-8 flex flex-col sm:flex-row items-stretch sm:items-center justify-center lg:justify-start gap-4"
              >
                <Button
                  size="lg"
                  className="rounded-full bg-brand-gold hover:bg-brand-gold-dark text-slate-950 font-black shadow-lg shadow-brand-gold/20 px-8 text-base h-14 transition-all hover:scale-[1.02] active:scale-[0.98]"
                  asChild
                >
                  <Link href="/register?role=seller">
                    Open Your Wholesale Shop
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="rounded-full border-2 border-dark-accent hover:border-brand-gold/40 text-text-primary font-bold px-7 text-base h-14 backdrop-blur-md"
                  asChild
                >
                  <Link href="#pricing">Test Fee Calculator &darr;</Link>
                </Button>
              </motion.div>

              {/* Trust Indicators */}
              <motion.div
                variants={fadeUp}
                className="mt-8 flex flex-wrap items-center justify-center lg:justify-start gap-x-6 gap-y-2.5 text-xs sm:text-sm text-text-muted font-semibold"
              >
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-success" /> Zero Monthly Subscription
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-success" /> KSh 50–100 Only When Packed
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-success" /> Retailers &amp; Hawkers Pay KSh 0
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-success" /> First 3 Orders 100% Free
                </span>
              </motion.div>
            </motion.div>

            {/* Right Column: Interactive Real Backend Screen Explorer */}
            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="show"
              className="lg:col-span-5 relative"
            >
              {/* Floating Decorative Chips */}
              <div className="absolute -top-4 -right-2 sm:-right-4 z-20 hidden sm:flex items-center gap-2 rounded-xl border border-dark-accent bg-dark-card/95 backdrop-blur-md px-3.5 py-2 shadow-xl animate-bounce-slow">
                <CheckCircle2 className="w-4 h-4 text-success" />
                <span className="text-xs font-bold text-text-primary">M-Pesa Verified &middot; KES 14,000</span>
              </div>
              <div className="absolute -bottom-4 -left-2 sm:-left-4 z-20 hidden sm:flex items-center gap-2 rounded-xl border border-brand-gold/40 bg-dark-card/95 backdrop-blur-md px-3.5 py-2 shadow-xl">
                <Lock className="w-4 h-4 text-brand-gold" />
                <span className="text-xs font-bold text-brand-gold">Order Locked &middot; Final KES 24,000</span>
              </div>

              {/* Main Card Container */}
              <div className="w-full max-w-md mx-auto rounded-3xl border-2 border-dark-accent bg-dark-card/95 backdrop-blur-xl shadow-2xl overflow-hidden transition-all duration-300 hover:border-brand-gold/30">
                {/* Real Screen Tab Switcher */}
                <div className="p-3 bg-dark-secondary/80 border-b border-dark-accent flex items-center justify-between gap-1">
                  <div className="flex items-center gap-1 bg-dark-tertiary p-1 rounded-xl w-full">
                    <button
                      type="button"
                      onClick={() => setActiveScreenTab("fulfill")}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        activeScreenTab === "fulfill"
                          ? "bg-brand-gold text-slate-950 shadow-sm"
                          : "text-text-muted hover:text-text-primary"
                      }`}
                    >
                      Fulfill Checklist
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveScreenTab("catalog")}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        activeScreenTab === "catalog"
                          ? "bg-brand-gold text-slate-950 shadow-sm"
                          : "text-text-muted hover:text-text-primary"
                      }`}
                    >
                      Buyer Catalog
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveScreenTab("ledger")}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        activeScreenTab === "ledger"
                          ? "bg-brand-gold text-slate-950 shadow-sm"
                          : "text-text-muted hover:text-text-primary"
                      }`}
                    >
                      Debt Ledger
                    </button>
                  </div>
                </div>

                {/* Tab 1: Fulfill Screen (Real Order & Packing Stage) */}
                {activeScreenTab === "fulfill" && (
                  <div className="p-5 space-y-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-1.5 text-xs text-text-muted">
                          <span>Order #1084</span>
                          <span>&middot;</span>
                          <span className="font-semibold text-text-secondary">Kisumu Mobile Zone</span>
                        </div>
                        <h4 className="text-base font-bold text-text-primary mt-0.5">
                          Packing Stage (Sourcing)
                        </h4>
                      </div>
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-warning/15 text-warning border border-warning/30">
                        <Package className="w-3 h-3" /> Packing
                      </span>
                    </div>

                    {/* Interactive Packing Items Checklist */}
                    <div className="rounded-2xl border border-dark-accent bg-dark-secondary/60 p-3 space-y-2.5">
                      <div className="flex items-center justify-between text-[11px] font-bold text-text-muted uppercase tracking-wider">
                        <span>Items Checklist (Tap to pack)</span>
                        <span>Price</span>
                      </div>

                      <div
                        onClick={() => togglePacked("item1")}
                        className={`flex items-center justify-between p-2 rounded-xl border cursor-pointer transition-all ${
                          packedItems.item1
                            ? "border-success/40 bg-success/10 text-text-primary"
                            : "border-dark-accent bg-dark-card text-text-secondary"
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className={`w-4 h-4 rounded flex items-center justify-center ${packedItems.item1 ? "bg-success text-slate-950" : "border border-dark-accent"}`}>
                            {packedItems.item1 && <Check className="w-3 h-3 stroke-[3]" />}
                          </div>
                          <span className={`text-xs font-semibold truncate ${packedItems.item1 ? "line-through text-text-muted" : ""}`}>
                            50&times; 65W Fast Type-C Charger
                          </span>
                        </div>
                        <span className="text-xs font-bold tabular-nums">KES 12,500</span>
                      </div>

                      <div
                        onClick={() => togglePacked("item2")}
                        className={`flex items-center justify-between p-2 rounded-xl border cursor-pointer transition-all ${
                          packedItems.item2
                            ? "border-success/40 bg-success/10 text-text-primary"
                            : "border-dark-accent bg-dark-card text-text-secondary"
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className={`w-4 h-4 rounded flex items-center justify-center ${packedItems.item2 ? "bg-success text-slate-950" : "border border-dark-accent"}`}>
                            {packedItems.item2 && <Check className="w-3 h-3 stroke-[3]" />}
                          </div>
                          <span className={`text-xs font-semibold truncate ${packedItems.item2 ? "line-through text-text-muted" : ""}`}>
                            100&times; 9D Tempered Glass
                          </span>
                        </div>
                        <span className="text-xs font-bold tabular-nums">KES 7,000</span>
                      </div>

                      <div
                        onClick={() => togglePacked("item3")}
                        className={`flex items-center justify-between p-2 rounded-xl border cursor-pointer transition-all ${
                          packedItems.item3
                            ? "border-success/40 bg-success/10 text-text-primary"
                            : "border-dark-accent bg-dark-card text-text-secondary"
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className={`w-4 h-4 rounded flex items-center justify-center ${packedItems.item3 ? "bg-success text-slate-950" : "border border-dark-accent"}`}>
                            {packedItems.item3 && <Check className="w-3 h-3 stroke-[3]" />}
                          </div>
                          <span className={`text-xs font-semibold truncate ${packedItems.item3 ? "line-through text-text-muted" : ""}`}>
                            30&times; Heavy-Duty Covers (Sourced)
                          </span>
                        </div>
                        <span className="text-xs font-bold tabular-nums">KES 4,500</span>
                      </div>
                    </div>

                    {/* Delivery & Buyer Notes (Real backend fields: delivery_address & buyer_notes) */}
                    <div className="rounded-xl border border-dark-accent bg-dark-secondary p-3 text-xs space-y-1">
                      <div className="flex justify-between text-text-muted">
                        <span>Delivery Address:</span>
                        <span className="text-text-primary font-medium">Kisumu CBD, Oginga Odinga St</span>
                      </div>
                      <div className="flex justify-between text-text-muted">
                        <span>Buyer Note:</span>
                        <span className="text-text-primary font-medium">&quot;Pack tight, call before dispatch&quot;</span>
                      </div>
                    </div>

                    {/* Lock Price Action Bar */}
                    <div className="pt-1 flex items-center justify-between">
                      <div>
                        <span className="text-[11px] text-text-muted block">Final Total</span>
                        <span className="text-base font-extrabold text-brand-gold tabular-nums">KES 24,000</span>
                      </div>
                      <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-brand-gold text-slate-950 font-bold text-xs shadow-sm">
                        <Lock className="w-3.5 h-3.5" /> Lock Final Price
                      </div>
                    </div>
                  </div>
                )}

                {/* Tab 2: Buyer Catalog & Sourcing */}
                {activeScreenTab === "catalog" && (
                  <div className="p-5 space-y-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-1 text-xs text-brand-gold font-bold">
                          <Store className="w-3 h-3" /> Sample Shop Wholesale &middot; Nairobi
                        </div>
                        <h4 className="text-base font-bold text-text-primary mt-0.5">
                          Approved Wholesale Catalog
                        </h4>
                      </div>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-success/15 text-success">
                        <ShieldCheck className="w-3 h-3" /> Approved Buyer
                      </span>
                    </div>

                    {/* Catalog Items */}
                    <div className="grid grid-cols-2 gap-2">
                      <div className="rounded-xl border border-dark-accent bg-dark-secondary p-2.5 space-y-1">
                        <p className="text-xs font-bold text-text-primary truncate">A2 Core Silicon Cover</p>
                        <p className="text-[11px] text-text-muted">Wholesale Rate</p>
                        <div className="flex items-center justify-between pt-1">
                          <span className="text-xs font-black text-brand-gold">KES 120</span>
                          <span className="w-5 h-5 rounded-full bg-brand-gold/15 text-brand-gold flex items-center justify-center text-xs font-bold">+</span>
                        </div>
                      </div>
                      <div className="rounded-xl border border-dark-accent bg-dark-secondary p-2.5 space-y-1">
                        <p className="text-xs font-bold text-text-primary truncate">Hot 8 Screen Protectors</p>
                        <p className="text-[11px] text-text-muted">Wholesale Rate</p>
                        <div className="flex items-center justify-between pt-1">
                          <span className="text-xs font-black text-brand-gold">KES 34</span>
                          <span className="w-5 h-5 rounded-full bg-brand-gold/15 text-brand-gold flex items-center justify-center text-xs font-bold">+</span>
                        </div>
                      </div>
                    </div>

                    {/* Real backend Custom Sourcing Input feature */}
                    <div className="rounded-xl border border-dashed border-dark-accent bg-dark-secondary/50 p-3">
                      <span className="text-[11px] font-bold text-text-primary block">
                        Can&apos;t find it? Ask us to source it
                      </span>
                      <p className="text-[10px] text-text-muted mt-0.5">
                        Type any accessory model not in the catalog. The seller quotes a price upon packing.
                      </p>
                    </div>

                    {/* Cart Bar */}
                    <div className="rounded-xl bg-brand-gold p-2.5 flex items-center justify-between text-slate-950 font-bold text-xs">
                      <span className="flex items-center gap-1.5">
                        <ShoppingBag className="w-4 h-4" /> 3 Items in Order
                      </span>
                      <span className="font-black">Submit Order &rarr;</span>
                    </div>
                  </div>
                )}

                {/* Tab 3: Debt Ledger (Real Order & Payment Record) */}
                {activeScreenTab === "ledger" && (
                  <div className="p-5 space-y-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-1 text-xs text-text-muted">
                          <span>Order #1084</span>
                          <span>&middot;</span>
                          <span className="font-semibold text-text-secondary">Balance Owed</span>
                        </div>
                        <h4 className="text-base font-bold text-text-primary mt-0.5">
                          Status: Debt Active
                        </h4>
                      </div>
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-warning/15 text-warning border border-warning/30">
                        <Clock className="w-3 h-3" /> Debt Active
                      </span>
                    </div>

                    {/* Shared Ledger Breakdown */}
                    <div className="rounded-2xl border border-dark-accent bg-dark-secondary/60 p-3.5 space-y-2 text-xs">
                      <div className="flex justify-between items-center">
                        <span className="text-text-muted">Final Locked Total</span>
                        <span className="font-bold text-text-primary tabular-nums">KES 24,000</span>
                      </div>
                      <div className="flex justify-between items-center text-success">
                        <span className="font-medium">M-Pesa Payment Received</span>
                        <span className="font-bold tabular-nums">- KES 14,000</span>
                      </div>
                      <div className="h-px bg-dark-accent" />
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-brand-gold">Outstanding Balance</span>
                        <span className="font-black text-brand-gold tabular-nums text-sm">KES 10,000</span>
                      </div>
                    </div>

                    {/* Real PaymentRecord & Expected Date */}
                    <div className="rounded-xl border border-dark-accent bg-dark-secondary p-3 space-y-1.5 text-xs">
                      <div className="flex justify-between items-center">
                        <span className="text-text-muted">M-Pesa Reference:</span>
                        <span className="font-mono font-bold text-text-primary">QJK892KL01</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-text-muted">Expected Payment Date:</span>
                        <span className="font-semibold text-text-secondary">Next Friday</span>
                      </div>
                    </div>

                    {/* Fee Deducted from prepaid balance */}
                    <div className="text-[11px] text-text-muted flex justify-between items-center pt-1">
                      <span>Wholesale Fee: KSh 70 (Deducted from prepaid balance)</span>
                      <span className="text-success font-semibold">Buyer Fee: KSh 0</span>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </Container>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 2: BEFORE VS AFTER (Interactive Switcher)                         */}
      {/* ========================================================================= */}
      <Section spacing="lg" className="bg-dark-secondary border-b border-dark-accent" id="comparison">
        <Container size="lg">
          <SectionKicker index="01" label="Direct Comparison" />
          <div className="max-w-3xl mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-text-primary leading-tight">
              Trade That Used to Break Friendships, Now Built on Certainty
            </h2>
            <p className="mt-3 text-text-secondary text-base sm:text-lg">
              Compare how phone accessory trade runs on paper and audio notes versus Nyakizu.
            </p>

            {/* Interactive Toggle Switch */}
            <div className="mt-6 inline-flex p-1 rounded-2xl bg-dark-tertiary border border-dark-accent">
              <button
                type="button"
                onClick={() => setComparisonMode("analog")}
                className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                  comparisonMode === "analog"
                    ? "bg-error/20 text-error border border-error/30 shadow-sm"
                    : "text-text-muted hover:text-text-primary"
                }`}
              >
                The Analog Way (Paper &amp; Audio Notes)
              </button>
              <button
                type="button"
                onClick={() => setComparisonMode("nyakizu")}
                className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                  comparisonMode === "nyakizu"
                    ? "bg-brand-gold text-slate-950 font-black shadow-md"
                    : "text-text-muted hover:text-text-primary"
                }`}
              >
                The Nyakizu Way (Digital &amp; Locked)
              </button>
            </div>
          </div>

          {/* Comparison Cards Grid */}
          <div className="grid md:grid-cols-3 gap-6">
            {/* Card 1 */}
            <div
              className={`rounded-3xl border p-6 transition-all duration-300 ${
                comparisonMode === "analog"
                  ? "border-error/30 bg-error/5"
                  : "border-brand-gold/30 bg-dark-card shadow-lg"
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-text-muted">
                  01 &middot; Order Submission
                </span>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                    comparisonMode === "analog" ? "bg-error/20 text-error" : "bg-success/20 text-success"
                  }`}
                >
                  {comparisonMode === "analog" ? "Audio Note Chaos" : "1-Tap Itemized Orders"}
                </span>
              </div>
              <h3 className="text-lg font-bold text-text-primary">
                {comparisonMode === "analog"
                  ? "15 WhatsApp voice notes and blurry pictures"
                  : "Structured catalog items with custom sourcing notes"}
              </h3>
              <p className="mt-2 text-sm text-text-secondary leading-relaxed">
                {comparisonMode === "analog"
                  ? "Sellers spend hours listening to voice notes in noisy shops. Items get forgotten, wrong phone models get packed, and buyers complain."
                  : "Buyers select exact accessories and quantities. Custom sourcing requests are priced clearly before packing begins."}
              </p>
            </div>

            {/* Card 2 */}
            <div
              className={`rounded-3xl border p-6 transition-all duration-300 ${
                comparisonMode === "analog"
                  ? "border-error/30 bg-error/5"
                  : "border-brand-gold/30 bg-dark-card shadow-lg"
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-text-muted">
                  02 &middot; Price &amp; Packing
                </span>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                    comparisonMode === "analog" ? "bg-error/20 text-error" : "bg-success/20 text-success"
                  }`}
                >
                  {comparisonMode === "analog" ? "Changed Minds & Arguments" : "Locked Final Total"}
                </span>
              </div>
              <h3 className="text-lg font-bold text-text-primary">
                {comparisonMode === "analog"
                  ? "Renegotiating after the carton is sealed"
                  : "Permanent lock once packing is verified"}
              </h3>
              <p className="mt-2 text-sm text-text-secondary leading-relaxed">
                {comparisonMode === "analog"
                  ? "A seller spends 40 minutes packing a carton only for the buyer to call demanding to swap models or remove priced items."
                  : "Once the seller finishes the packing checklist and clicks Lock Price, the total and items are permanent. Neither party can tamper with history."}
              </p>
            </div>

            {/* Card 3 */}
            <div
              className={`rounded-3xl border p-6 transition-all duration-300 ${
                comparisonMode === "analog"
                  ? "border-error/30 bg-error/5"
                  : "border-brand-gold/30 bg-dark-card shadow-lg"
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-text-muted">
                  03 &middot; Credit Records
                </span>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                    comparisonMode === "analog" ? "bg-error/20 text-error" : "bg-success/20 text-success"
                  }`}
                >
                  {comparisonMode === "analog" ? "Torn Counter Books" : "Shared M-Pesa Ledger"}
                </span>
              </div>
              <h3 className="text-lg font-bold text-text-primary">
                {comparisonMode === "analog"
                  ? "Lost pages and disputed remaining balance"
                  : "Real-time balance with M-Pesa codes"}
              </h3>
              <p className="mt-2 text-sm text-text-secondary leading-relaxed">
                {comparisonMode === "analog"
                  ? "Counter books get water stains or mislaid. Months later, partners fight over whether an old M-Pesa installment was 5,000 or 8,000."
                  : "Every payment is logged with its M-Pesa reference code. Both seller and buyer see the exact same balance and promised date in real time."}
              </p>
            </div>
          </div>
        </Container>
      </Section>

      {/* ========================================================================= */}
      {/* SECTION 3: DUAL TRADE ROLES (Wholesalers ⟷ Countrywide Buyers)            */}
      {/* ========================================================================= */}
      <Section spacing="lg" className="bg-dark-primary border-b border-dark-accent" id="roles">
        <Container size="lg">
          <SectionKicker index="02" label="Built for Both Roles" />
          <div className="max-w-2xl mb-10 sm:mb-14">
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-text-primary leading-tight">
              Tailored for Wholesale Shops &amp; Countrywide Retailers
            </h2>
            <p className="mt-2.5 text-text-secondary text-base sm:text-lg">
              Dedicated interfaces designed for the distinct daily routines of wholesale sellers and retail buyers.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Wholesaler Card */}
            <div className="rounded-3xl border-2 border-brand-gold/30 bg-dark-card p-7 sm:p-9 flex flex-col justify-between relative overflow-hidden shadow-xl">
              <div>
                <div className="flex items-center justify-between mb-6">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-gold/15 text-brand-gold font-extrabold text-xs">
                    <Store className="w-3.5 h-3.5" /> Wholesale Shop Owners
                  </span>
                  <span className="text-xs text-text-muted">Nairobi CBD &middot; Luthuli &middot; Regional Hubs</span>
                </div>

                <h3 className="text-xl sm:text-2xl font-bold text-text-primary">
                  Manage Catalogs, Packing Checklists, and Customer Credit
                </h3>

                <ul className="mt-6 space-y-4 text-sm sm:text-base text-text-secondary">
                  <li className="flex items-start gap-3">
                    <ShieldCheck className="w-5 h-5 text-brand-gold shrink-0 mt-0.5" />
                    <span>
                      <strong className="text-text-primary">Protected wholesale pricing:</strong> Your wholesale catalog is hidden from outsiders. Only buyers you personally review and approve get access.
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-brand-gold shrink-0 mt-0.5" />
                    <span>
                      <strong className="text-text-primary">Operational packing checklist:</strong> Check off items as you source and pack. Quote custom accessory requests directly in the order.
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Wallet className="w-5 h-5 text-brand-gold shrink-0 mt-0.5" />
                    <span>
                      <strong className="text-text-primary">Two-tap M-Pesa payment records:</strong> Log installment payments with transaction reference codes. Outstanding debt is calculated automatically.
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <TrendingDown className="w-5 h-5 text-brand-gold shrink-0 mt-0.5" />
                    <span>
                      <strong className="text-text-primary">Pay only when you pack:</strong> KSh 50 to KSh 100 per locked order. Zero monthly rent or fixed deductions.
                    </span>
                  </li>
                </ul>
              </div>

              <div className="mt-8 pt-6 border-t border-dark-accent">
                <Button
                  size="lg"
                  className="w-full rounded-full bg-brand-gold hover:bg-brand-gold-dark text-slate-950 font-bold shadow-md h-12"
                  asChild
                >
                  <Link href="/register?role=seller">Open Wholesale Shop (First 3 Orders Free)</Link>
                </Button>
              </div>
            </div>

            {/* Buyer Card */}
            <div className="rounded-3xl border border-dark-accent bg-dark-secondary p-7 sm:p-9 flex flex-col justify-between shadow-xl">
              <div>
                <div className="flex items-center justify-between mb-6">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-success/15 text-success font-extrabold text-xs">
                    <ShoppingBag className="w-3.5 h-3.5" /> Retailers, Stalls &amp; Hawkers
                  </span>
                  <span className="text-xs text-success font-bold">100% Free Forever</span>
                </div>

                <h3 className="text-xl sm:text-2xl font-bold text-text-primary">
                  Order from Trusted Suppliers with Transparent Debt Records
                </h3>

                <ul className="mt-6 space-y-4 text-sm sm:text-base text-text-secondary">
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-success shrink-0 mt-0.5" />
                    <span>
                      <strong className="text-text-primary">Direct access to approved wholesalers:</strong> Browse product catalogs and stock from your verified wholesale partners.
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Plus className="w-5 h-5 text-success shrink-0 mt-0.5" />
                    <span>
                      <strong className="text-text-primary">Custom sourcing requests:</strong> Can&apos;t find a specific screen protector or cover? Type it in the sourcing box and the seller quotes it for you.
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <FileText className="w-5 h-5 text-success shrink-0 mt-0.5" />
                    <span>
                      <strong className="text-text-primary">Payment claims &amp; debt visibility:</strong> Submit your M-Pesa transaction reference directly to the order and view agreed payment due dates.
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Smartphone className="w-5 h-5 text-success shrink-0 mt-0.5" />
                    <span>
                      <strong className="text-text-primary">Zero fees for buyers:</strong> Shopkeepers and hawkers across Mombasa, Kisumu, Nakuru, and all towns pay KSh 0 forever.
                    </span>
                  </li>
                </ul>
              </div>

              <div className="mt-8 pt-6 border-t border-dark-accent">
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full rounded-full border-2 border-dark-accent hover:border-success/50 text-text-primary font-bold h-12"
                  asChild
                >
                  <Link href="/register?role=buyer">Join as Countrywide Buyer (Free)</Link>
                </Button>
              </div>
            </div>
          </div>
        </Container>
      </Section>

      {/* ========================================================================= */}
      {/* SECTION 4: HOSTINGER-STYLE INTERACTIVE PRICING CALCULATOR                  */}
      {/* ========================================================================= */}
      <Section spacing="lg" className="bg-dark-secondary border-b border-dark-accent" id="pricing">
        <Container size="lg">
          <SectionKicker index="03" label="Transparent Fee Structure" />
          <div className="max-w-3xl mb-10 sm:mb-12">
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-text-primary leading-tight">
              Pay Only When You Pack. Zero Monthly Subscriptions.
            </h2>
            <p className="mt-3 text-text-secondary text-base sm:text-lg">
              No KSh 1,500/month recurring drain. Keep 100% of your earnings when trade is slow. Pay just KSh 50 to KSh 100 only when you lock a real order.
            </p>
          </div>

          {/* Interactive Calculator Card */}
          <div className="rounded-3xl border-2 border-brand-gold/30 bg-dark-card p-6 sm:p-10 shadow-2xl mb-12">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-dark-accent">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-brand-gold">
                  Live Fee Calculator
                </span>
                <h3 className="text-xl sm:text-2xl font-bold text-text-primary mt-1">
                  Estimate Your Fee Per Locked Order
                </h3>
              </div>
              <div className="text-left md:text-right">
                <span className="text-xs text-text-muted uppercase tracking-wider block">Nyakizu Platform Fee</span>
                <span className="text-3xl sm:text-4xl font-black text-brand-gold tabular-nums">
                  KSh {computedFee}
                </span>
                <span className="text-xs text-text-muted block mt-0.5">
                  ({effectivePercentage}% of order total &middot; Capped at KSh 100 max)
                </span>
              </div>
            </div>

            {/* Interactive Slider */}
            <div className="py-8">
              <div className="flex justify-between items-center mb-3">
                <label htmlFor="order-value-slider" className="text-sm font-bold text-text-primary">
                  Order / Carton Value:{" "}
                  <span className="text-brand-gold font-extrabold text-base">
                    KSh {cartonValue.toLocaleString()}
                  </span>
                </label>
                <span className="text-xs text-text-muted">Min KSh 2,000 &mdash; Max KSh 80,000+</span>
              </div>

              <input
                id="order-value-slider"
                type="range"
                min={2000}
                max={80000}
                step={1000}
                value={cartonValue}
                onChange={(e) => setCartonValue(Number(e.target.value))}
                className="w-full h-3 bg-dark-secondary rounded-lg appearance-none cursor-pointer accent-brand-gold focus:outline-none"
              />

              <div className="flex justify-between text-xs text-text-muted mt-2">
                <span>KSh 2,000 (Small order)</span>
                <span>KSh 25,000 (Standard carton)</span>
                <span>KSh 50,000 (Master carton)</span>
                <span>KSh 80,000+ (Bulk order)</span>
              </div>
            </div>

            {/* Metric Tiles */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
              <div className="rounded-2xl border border-dark-accent bg-dark-secondary/60 p-4 text-center">
                <span className="text-[11px] font-bold text-text-muted uppercase tracking-wider block">Order Value</span>
                <span className="text-lg sm:text-xl font-bold text-text-primary tabular-nums mt-1 block">
                  KSh {cartonValue.toLocaleString()}
                </span>
              </div>
              <div className="rounded-2xl border border-brand-gold/40 bg-brand-gold/10 p-4 text-center">
                <span className="text-[11px] font-bold text-brand-gold uppercase tracking-wider block">Wholesaler Fee</span>
                <span className="text-lg sm:text-xl font-black text-brand-gold tabular-nums mt-1 block">
                  KSh {computedFee}
                </span>
              </div>
              <div className="rounded-2xl border border-dark-accent bg-dark-secondary/60 p-4 text-center">
                <span className="text-[11px] font-bold text-text-muted uppercase tracking-wider block">Effective Rate</span>
                <span className="text-lg sm:text-xl font-bold text-text-primary tabular-nums mt-1 block">
                  {effectivePercentage}%
                </span>
              </div>
              <div className="rounded-2xl border border-success/30 bg-success/10 p-4 text-center">
                <span className="text-[11px] font-bold text-success uppercase tracking-wider block">Buyer / Hawkers Fee</span>
                <span className="text-lg sm:text-xl font-bold text-success tabular-nums mt-1 block">
                  KSh 0 (Free)
                </span>
              </div>
            </div>

            <p className="text-xs text-text-muted text-center mt-6">
              * The fee is strictly capped at KSh 100 maximum, no matter how valuable the carton is. That is less than the margin on a single phone screen protector.
            </p>
          </div>

          {/* Three Tier Cards */}
          <div className="grid md:grid-cols-3 gap-6">
            {/* Tier 1 */}
            <div className="rounded-3xl border border-dark-accent bg-dark-card p-6 sm:p-8 flex flex-col justify-between shadow-lg">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-text-muted">Test Risk-Free</span>
                <h3 className="text-xl font-bold text-text-primary mt-1">First 3 Orders Free</h3>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-3xl font-extrabold text-text-primary">KSh 0</span>
                  <span className="text-xs text-text-muted">/ first 3 orders</span>
                </div>
                <p className="mt-3 text-sm text-text-secondary leading-relaxed">
                  Every new wholesale account receives 3 complete order lockups completely free. Experience the workflow before making any M-Pesa deposit.
                </p>

                <ul className="mt-6 space-y-3 text-sm text-text-secondary">
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-success shrink-0" /> 3 Full order lockups included
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-success shrink-0" /> Zero deposit or credit card
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-success shrink-0" /> Full access to live debt ledger
                  </li>
                </ul>
              </div>

              <div className="mt-8 pt-5 border-t border-dark-accent">
                <Button variant="outline" className="w-full rounded-full" asChild>
                  <Link href="/register?role=seller">Sign Up Free</Link>
                </Button>
              </div>
            </div>

            {/* Tier 2: Wholesale (Featured) */}
            <div className="rounded-3xl border-2 border-brand-gold bg-dark-card p-6 sm:p-8 flex flex-col justify-between relative shadow-2xl">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-brand-gold text-slate-950 font-black text-xs tracking-wide shadow-sm">
                Most Popular for Wholesalers
              </div>

              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-brand-gold">Pay-As-You-Pack</span>
                <h3 className="text-xl font-bold text-text-primary mt-1">Wholesale Per-Order Fee</h3>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-3xl sm:text-4xl font-black text-brand-gold">KSh 50 &ndash; 100</span>
                  <span className="text-xs text-text-muted">/ locked order</span>
                </div>
                <p className="mt-3 text-sm text-text-secondary leading-relaxed">
                  Only charged when you lock an order and prepare to dispatch. Zero charges during quiet weeks.
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
                    <CheckCircle2 className="w-4 h-4 text-brand-gold shrink-0" /> Locked permanent order record
                  </li>
                </ul>
              </div>

              <div className="mt-8 pt-5 border-t border-dark-accent">
                <Button className="w-full rounded-full bg-brand-gold hover:bg-brand-gold-dark text-slate-950 font-black shadow-brand" asChild>
                  <Link href="/register?role=seller">Open Wholesale Shop</Link>
                </Button>
              </div>
            </div>

            {/* Tier 3: Buyers & Hawkers */}
            <div className="rounded-3xl border border-dark-accent bg-dark-card p-6 sm:p-8 flex flex-col justify-between shadow-lg">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-success">For Countrywide Buyers</span>
                <h3 className="text-xl font-bold text-text-primary mt-1">Retailers &amp; Hawkers</h3>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-3xl font-extrabold text-success">KSh 0</span>
                  <span className="text-xs text-text-muted">/ forever</span>
                </div>
                <p className="mt-3 text-sm text-text-secondary leading-relaxed">
                  Retail shopkeepers, stall managers, and hawkers across Kenya order through Nyakizu completely free.
                </p>

                <ul className="mt-6 space-y-3 text-sm text-text-secondary">
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-success shrink-0" /> 100% Free forever for buyers
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-success shrink-0" /> Order from multiple wholesalers
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-success shrink-0" /> Track M-Pesa payment claims
                  </li>
                </ul>
              </div>

              <div className="mt-8 pt-5 border-t border-dark-accent">
                <Button variant="outline" className="w-full rounded-full" asChild>
                  <Link href="/register?role=buyer">Join as Buyer (Free)</Link>
                </Button>
              </div>
            </div>
          </div>
        </Container>
      </Section>

      {/* ========================================================================= */}
      {/* SECTION 5: BENTO GRID (Ground Realities & Real Backend Capabilities)       */}
      {/* ========================================================================= */}
      <Section spacing="lg" className="bg-dark-primary border-b border-dark-accent" id="features">
        <Container size="lg">
          <SectionKicker index="04" label="Ground Realities" />
          <div className="max-w-2xl mb-10 sm:mb-14">
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-text-primary leading-tight">
              Engineered for Real Wholesale Street Operations
            </h2>
            <p className="mt-2.5 text-text-secondary text-base sm:text-lg">
              Generic software fails on busy wholesale streets. Nyakizu is built around the real customs of Kenya&apos;s phone accessory trade.
            </p>
          </div>

          <motion.div
            variants={gridReveal}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-80px" }}
            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {/* Bento Card 1: Fulfill & Packing Checklist */}
            <motion.div
              variants={fadeUp}
              className="lg:col-span-2 rounded-3xl border border-dark-accent bg-dark-card p-7 sm:p-8 flex flex-col justify-between hover:border-brand-gold/40 transition-colors shadow-lg"
            >
              <div>
                <div className="w-12 h-12 rounded-2xl bg-brand-gold/15 text-brand-gold flex items-center justify-center mb-5">
                  <Package className="w-6 h-6" />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-text-primary">
                  Operational Fulfill &amp; Packing Checklist
                </h3>
                <p className="mt-2 text-sm sm:text-base text-text-secondary leading-relaxed">
                  Turn scattered WhatsApp voice notes into a structured packing checklist. Mark items as packed on your phone, quote custom-sourced accessories on the fly, and lock the final price before dispatch.
                </p>
              </div>
              <div className="mt-6 flex flex-wrap gap-2 text-xs font-semibold text-text-muted">
                <span className="px-3 py-1 rounded-full bg-dark-secondary border border-dark-accent">Checklist Tracking</span>
                <span className="px-3 py-1 rounded-full bg-dark-secondary border border-dark-accent">Custom Item Sourcing</span>
                <span className="px-3 py-1 rounded-full bg-dark-secondary border border-dark-accent">Immutable Price Lock</span>
              </div>
            </motion.div>

            {/* Bento Card 2: Shared M-Pesa Debt Ledger */}
            <motion.div
              variants={fadeUp}
              className="rounded-3xl border border-dark-accent bg-dark-card p-7 sm:p-8 flex flex-col justify-between hover:border-brand-gold/40 transition-colors shadow-lg"
            >
              <div>
                <div className="w-12 h-12 rounded-2xl bg-success/15 text-success flex items-center justify-center mb-5">
                  <Wallet className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-text-primary">
                  Shared Debt &amp; M-Pesa Ledger
                </h3>
                <p className="mt-2 text-sm text-text-secondary leading-relaxed">
                  Log partial payments with real M-Pesa reference codes. Both parties see the remaining balance and promised due date so business partners never dispute old debt.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-dark-accent text-xs font-bold text-brand-gold">
                Protects trust &amp; creditworthiness
              </div>
            </motion.div>

            {/* Bento Card 3: Lightweight on Budget Android Phones */}
            <motion.div
              variants={fadeUp}
              className="rounded-3xl border border-dark-accent bg-dark-card p-7 sm:p-8 flex flex-col justify-between hover:border-brand-gold/40 transition-colors shadow-lg"
            >
              <div>
                <div className="w-12 h-12 rounded-2xl bg-sky-500/15 text-sky-400 flex items-center justify-center mb-5">
                  <Smartphone className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-text-primary">
                  Fast on Tecno, Infinix &amp; Itel
                </h3>
                <p className="mt-2 text-sm text-text-secondary leading-relaxed">
                  Engineered with minimal asset overhead. Consumes virtually zero data bundles and stays responsive on budget smartphones under fluctuating network conditions.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-dark-accent text-xs font-bold text-text-muted">
                Low Safaricom bundle consumption
              </div>
            </motion.div>

            {/* Bento Card 4: Private & Closed Wholesale Network */}
            <motion.div
              variants={fadeUp}
              className="lg:col-span-2 rounded-3xl border border-dark-accent bg-dark-card p-7 sm:p-8 flex flex-col justify-between hover:border-brand-gold/40 transition-colors shadow-lg"
            >
              <div>
                <div className="w-12 h-12 rounded-2xl bg-violet-500/15 text-violet-400 flex items-center justify-center mb-5">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-text-primary">
                  Private Wholesale Network
                </h3>
                <p className="mt-2 text-sm sm:text-base text-text-secondary leading-relaxed">
                  Your wholesale prices are your trade secret. Nyakizu is not an open directory where competitors on your street can see what you charge. Only buyers you personally verify can access your catalog.
                </p>
              </div>
              <div className="mt-6 flex items-center gap-4 text-xs font-semibold text-text-secondary">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-success" /> Manual buyer approval
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-success" /> Hidden wholesale prices
                </span>
              </div>
            </motion.div>
          </motion.div>
        </Container>
      </Section>

      {/* ========================================================================= */}
      {/* SECTION 6: 3-STEP WORKFLOW                                                */}
      {/* ========================================================================= */}
      <Section spacing="lg" className="bg-dark-secondary border-b border-dark-accent" id="how-it-works">
        <Container size="lg">
          <SectionKicker index="05" label="Simple Process" />
          <div className="max-w-2xl mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-text-primary leading-tight">
              Start Trading in 3 Simple Steps
            </h2>
            <p className="mt-2.5 text-text-secondary text-base sm:text-lg">
              No complicated training or hardware required. Set up your shop right from your mobile browser.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="rounded-2xl border border-dark-accent bg-dark-card p-6 shadow-md">
              <div className="w-10 h-10 rounded-full bg-brand-gold text-slate-950 font-black text-lg flex items-center justify-center mb-4">
                1
              </div>
              <h3 className="text-lg font-bold text-text-primary">List Your Accessories</h3>
              <p className="mt-2 text-sm text-text-secondary leading-relaxed">
                Add chargers, screen protectors, cables, and covers with your wholesale prices. Takes about 2 minutes from your phone.
              </p>
            </div>

            <div className="rounded-2xl border border-dark-accent bg-dark-card p-6 shadow-md">
              <div className="w-10 h-10 rounded-full bg-brand-gold text-slate-950 font-black text-lg flex items-center justify-center mb-4">
                2
              </div>
              <h3 className="text-lg font-bold text-text-primary">Approve Your Buyers</h3>
              <p className="mt-2 text-sm text-text-secondary leading-relaxed">
                Share your private shop link on WhatsApp. Review and approve the buyers from Kisumu, Mombasa, or Nairobi you already know.
              </p>
            </div>

            <div className="rounded-2xl border border-dark-accent bg-dark-card p-6 shadow-md">
              <div className="w-10 h-10 rounded-full bg-brand-gold text-slate-950 font-black text-lg flex items-center justify-center mb-4">
                3
              </div>
              <h3 className="text-lg font-bold text-text-primary">Pack, Lock &amp; Record</h3>
              <p className="mt-2 text-sm text-text-secondary leading-relaxed">
                Receive clear itemized orders. Pack goods, lock the final price, and log partial M-Pesa payments on the shared ledger.
              </p>
            </div>
          </div>

          <div className="mt-12 text-center">
            <Button size="lg" className="rounded-full bg-brand-gold hover:bg-brand-gold-dark text-slate-950 font-black px-8 h-12 shadow-md" asChild>
              <Link href="/register">Start Now &mdash; Free Account</Link>
            </Button>
          </div>
        </Container>
      </Section>

      {/* Community Proof */}
      <CommunityActivity />

      {/* ========================================================================= */}
      {/* SECTION 7: INTERACTIVE FAQ ACCORDION                                      */}
      {/* ========================================================================= */}
      <Section spacing="lg" className="bg-dark-primary border-b border-dark-accent" id="faq">
        <Container size="md">
          <SectionKicker index="06" label="Questions & Answers" />
          <div className="text-center max-w-xl mx-auto mb-10 sm:mb-12">
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-text-primary">
              Frequently Asked Questions
            </h2>
            <p className="mt-2 text-text-secondary text-sm sm:text-base">
              Everything you need to know about fees, catalog privacy, and how Nyakizu works.
            </p>
          </div>

          <div className="space-y-3">
            {FAQS.map((faq, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div
                  key={faq.q}
                  className="rounded-2xl border border-dark-accent bg-dark-card overflow-hidden transition-colors"
                >
                  <button
                    type="button"
                    onClick={() => toggleFaq(idx)}
                    className="w-full px-5 py-4 sm:px-6 sm:py-5 text-left flex items-center justify-between gap-4 font-bold text-text-primary text-base sm:text-lg hover:text-brand-gold transition-colors"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      className={`w-5 h-5 shrink-0 transition-transform duration-200 ${
                        isOpen ? "rotate-180 text-brand-gold" : "text-text-muted"
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 sm:px-6 sm:pb-6 text-sm sm:text-base text-text-secondary leading-relaxed border-t border-dark-accent/60 pt-4">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </Container>
      </Section>

      {/* ========================================================================= */}
      {/* SECTION 8: CLOSING CTA BANNER                                             */}
      {/* ========================================================================= */}
      <Section spacing="lg" className="bg-dark-secondary relative overflow-hidden">
        <Container size="lg">
          <div className="relative rounded-3xl border-2 border-brand-gold/40 bg-gradient-to-br from-dark-card via-dark-card to-dark-tertiary p-8 sm:p-14 text-center shadow-2xl overflow-hidden">
            {/* Ambient Gold Glow Aura */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-brand-gold/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 max-w-2xl mx-auto space-y-4 sm:space-y-6">
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-brand-gold/15 text-brand-gold font-extrabold text-xs uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" /> Start Digitizing Your Trade Today
              </span>

              <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-text-primary leading-tight">
                Put Your Wholesale Orders &amp; Ledger on Your Phone.
              </h2>

              <p className="text-text-secondary text-base sm:text-lg leading-relaxed">
                Join Kenyan phone accessory wholesalers and countrywide buyers already eliminating packing mistakes and lost debt records. Your first 3 orders are completely free.
              </p>

              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button
                  size="lg"
                  className="w-full sm:w-auto rounded-full bg-brand-gold hover:bg-brand-gold-dark text-slate-950 font-black shadow-brand px-9 text-base h-14"
                  asChild
                >
                  <Link href="/register">
                    Open Your Free Account
                    <ArrowRight className="w-5 h-5 ml-1.5" />
                  </Link>
                </Button>

                <Button
                  variant="outline"
                  size="lg"
                  className="w-full sm:w-auto rounded-full border-2 border-dark-accent hover:border-brand-gold/40 text-text-primary font-bold px-8 text-base h-14"
                  asChild
                >
                  <Link href="/contact">Talk to Our Nairobi Team</Link>
                </Button>
              </div>

              <p className="text-xs text-text-muted pt-2">
                Takes 2 minutes &middot; No credit card or M-Pesa deposit required to start
              </p>
            </div>
          </div>
        </Container>
      </Section>

      <LandingFooter />
    </div>
  );
}
