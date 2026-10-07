"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, type Variants } from "motion/react";
import {
  CheckCircle2,
  Wallet,
  Smartphone,
  ArrowRight,
  Sparkles,
  ChevronDown,
  ShieldCheck,
  Store,
  ShoppingBag,
  TrendingDown,
  Package,
  Layers,
  Clock,
  Percent,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Container, Section, LandingHeader, LandingFooter } from "@/components/layouts";
import CommunityActivity from "@/components/landing/CommunityActivity";
import { PhoneMockup } from "@/components/landing/PhoneMockup";
import { SellerScreenPreview, BuyerScreenPreview } from "@/components/landing/DashboardPreviews";
import { DualPhoneMockup } from "@/components/landing/DualPhoneMockup";

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } },
};

export function HomeContent() {
  // --- Section 1 Hero: Real Screenshot Showcase Tab State ---
  const [activeMockupTab, setActiveMockupTab] = useState<"seller" | "pipeline" | "buyer" | "both">("seller");

  // --- Section 3: Before vs After Toggle State ---
  const [comparisonMode, setComparisonMode] = useState<"nyakizu" | "analog">("nyakizu");

  // --- Section 6: FAQ Accordion State ---
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const toggleFaq = (index: number) => {
    setOpenFaqIndex((prev) => (prev === index ? null : index));
  };

  const FAQS = [
    {
      q: "Why do wholesalers pay KSh 50 to KSh 100 per order instead of a monthly subscription?",
      a: "Fixed monthly subscriptions (like KSh 1,500/month) drain your cash even during slow weeks or quiet shipping days. With Nyakizu, you only pay when you actually pack and lock a carton. Small orders pay KSh 50; larger orders up to the KSh 20,000 maximum order size are strictly capped at KSh 100 max. If you don't pack, you pay zero.",
    },
    {
      q: "Do retail buyers, stall owners, and hawkers across Kenya have to pay anything?",
      a: "No. Nyakizu is 100% free forever for all retail buyers, stall owners, and hawkers. Buyers never pay any registration fee, monthly fee, or per-order fee. They browse catalogs, place orders, and track credit balances at zero cost.",
    },
    {
      q: "How do wholesale sellers pay the per-order fee?",
      a: "Sellers maintain a prepaid billing balance topped up directly via M-Pesa Daraja (STK push or Paybill) whenever convenient. Your first 3 orders are 100% free with zero deposit. When you lock a packed order, the small fee is deducted from your balance.",
    },
    {
      q: "Can competing wholesale shops on Luthuli Avenue see my inventory and prices?",
      a: "Never. Nyakizu is a private wholesale network, not an open public directory. Your catalog is private. Only verified buyers you personally review and approve can view your inventory and prices.",
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
    <div className="min-h-screen bg-dark-primary text-text-primary font-sans selection:bg-brand-gold/30 selection:text-text-primary overflow-x-hidden">
      <LandingHeader />

      {/* ========================================================================= */}
      {/* SECTION 1: HERO (Hostinger Visual Energy + Real Screenshot Mockup)        */}
      {/* ========================================================================= */}
      <section className="relative pt-24 pb-16 sm:pt-36 sm:pb-24 overflow-hidden bg-gradient-to-b from-slate-100/80 via-white to-slate-50 dark:from-[#090A16] dark:via-[#0E1226] dark:to-[#0A0C19] border-b border-dark-accent">
        {/* Radiant Ambient Mesh & Glow Orbs */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[450px] bg-gradient-to-tr from-brand-gold/20 via-purple-600/15 to-transparent rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute top-28 right-4 w-72 h-72 bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />

        {/* Micro-dot grid texture */}
        <div className="absolute inset-0 bg-[radial-gradient(#0000000a_1px,transparent_1px)] dark:bg-[radial-gradient(#ffffff0a_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />

        <Container size="xl" className="relative z-10">
          <div className="max-w-4xl mx-auto text-center mb-12 sm:mb-16">
            {/* Bold Headline with Gradient Accents */}
            <motion.h1
              variants={fadeUp}
              initial="hidden"
              animate="show"
              className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[1.08] text-text-primary"
            >
              The Trade You Already Do.{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-gold via-amber-400 to-amber-600 dark:from-brand-gold dark:via-amber-300 dark:to-amber-500">
                Now Faster, Safer &amp; Digitized.
              </span>
            </motion.h1>

            {/* Clarifying Subtitle */}
            <motion.p
              variants={fadeUp}
              initial="hidden"
              animate="show"
              className="mt-6 text-base sm:text-xl text-text-secondary max-w-2xl mx-auto font-medium leading-relaxed"
            >
              Connect wholesale suppliers in Nairobi CBD with verified countrywide buyers. Track orders through sourcing and packing, lock final totals, and manage credit without paper notebooks or WhatsApp chaos.
            </motion.p>

            {/* Dual CTAs */}
            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="show"
              className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <Button
                size="lg"
                className="w-full sm:w-auto rounded-full bg-brand-gold hover:bg-brand-gold-dark text-slate-950 font-black shadow-xl shadow-brand-gold/25 px-9 text-base h-14 transition-transform hover:scale-105 active:scale-95"
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
                className="w-full sm:w-auto rounded-full border border-dark-accent hover:border-brand-gold/50 bg-dark-secondary/80 hover:bg-dark-tertiary text-text-primary font-bold px-8 text-base h-14 backdrop-blur-md"
                asChild
              >
                <Link href="/pricing">View Pricing &amp; Fees &rarr;</Link>
              </Button>
            </motion.div>

            {/* Four Trust Badges */}
            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="show"
              className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs sm:text-sm text-text-secondary font-semibold"
            >
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Zero Monthly Subscription
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" /> KSh 50–100 Only When Packed
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Retailers &amp; Hawkers Pay KSh 0
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" /> First 3 Orders 100% Free
              </span>
            </motion.div>
          </div>

          {/* ======================================================================= */}
          {/* REAL SCREENSHOT MOCKUP IN ELEVATED BROWSER / LAPTOP CONTAINER           */}
          {/* ======================================================================= */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="show"
            className="max-w-5xl mx-auto relative"
          >
            {/* Glowing Accent Ring behind Mockup */}
            <div className="absolute -inset-1 rounded-[2.5rem] bg-gradient-to-r from-brand-gold/30 via-purple-600/30 to-blue-500/20 blur-xl opacity-75" />

            <div className="relative rounded-2xl sm:rounded-3xl border border-dark-accent bg-dark-card shadow-2xl overflow-hidden">
              {/* Browser Header Bar with Realistic Controls and Live Tabs */}
              <div className="px-4 py-3 bg-dark-secondary border-b border-dark-accent flex flex-wrap items-center justify-between gap-3">
                {/* Traffic Light Window Dots */}
                <div className="flex items-center gap-2 shrink-0">
                  <span className="w-3 h-3 rounded-full bg-[#FF5F56] inline-block" />
                  <span className="w-3 h-3 rounded-full bg-[#FFBD2E] inline-block" />
                  <span className="w-3 h-3 rounded-full bg-[#27C93F] inline-block" />
                  <span className="text-xs text-text-muted font-mono ml-2 hidden sm:inline">nyakizudigital.me</span>
                </div>

                {/* Real Account Switcher Tabs */}
                <div className="flex flex-wrap items-center gap-1 bg-dark-tertiary/70 p-1 rounded-xl border border-dark-accent">
                  <button
                    type="button"
                    onClick={() => setActiveMockupTab("seller")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      activeMockupTab === "seller"
                        ? "bg-brand-gold text-slate-950 shadow-md font-black"
                        : "text-text-secondary hover:text-text-primary"
                    }`}
                  >
                    Sample Seller (Sample Shop)
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveMockupTab("pipeline")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      activeMockupTab === "pipeline"
                        ? "bg-brand-gold text-slate-950 shadow-md font-black"
                        : "text-text-secondary hover:text-text-primary"
                    }`}
                  >
                    Live Order Pipeline
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveMockupTab("buyer")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      activeMockupTab === "buyer"
                        ? "bg-brand-gold text-slate-950 shadow-md font-black"
                        : "text-text-secondary hover:text-text-primary"
                    }`}
                  >
                    Sample Buyer (Kim Dreadlocks)
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveMockupTab("both")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      activeMockupTab === "both"
                        ? "bg-brand-gold text-slate-950 shadow-md font-black"
                        : "text-text-secondary hover:text-text-primary"
                    }`}
                  >
                    Dual Phone View
                  </button>
                </div>

                <div className="hidden md:flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" /> Real Verified Accounts
                </div>
              </div>

              {/* Viewport: Actual Dashboard & Real Pipeline Display */}
              <div className="relative min-h-[480px] sm:min-h-[520px] w-full bg-dark-primary overflow-hidden group flex items-center justify-center">
                {activeMockupTab === "seller" && (
                  <div className="w-full p-4 sm:p-8 flex flex-col lg:flex-row items-center justify-center gap-6 sm:gap-10 bg-gradient-to-b from-dark-card via-dark-secondary to-dark-card">
                    <motion.div
                      initial={{ opacity: 0, scale: 0.96 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3 }}
                      className="relative shrink-0"
                    >
                      <div className="absolute inset-0 bg-brand-gold/20 rounded-full blur-2xl pointer-events-none" />
                      <PhoneMockup className="w-[190px] sm:w-[210px] lg:w-[230px]">
                        <SellerScreenPreview />
                      </PhoneMockup>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: 0.08 }}
                      className="max-w-md space-y-4 text-left"
                    >
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-gold/15 border border-brand-gold/30 text-brand-gold text-xs font-black">
                        <Store className="w-3.5 h-3.5" /> Verified Wholesale Supplier
                      </div>
                      <div>
                        <h3 className="text-xl sm:text-2xl font-black text-text-primary">Sample Shop &middot; Nairobi CBD</h3>
                        <p className="text-xs font-mono text-text-muted mt-0.5">shemanzabakamira@gmail.com</p>
                      </div>

                      <div className="grid grid-cols-3 gap-2 py-1">
                        <div className="bg-dark-tertiary/50 border border-dark-accent rounded-xl p-3 text-center">
                          <p className="text-lg font-black text-text-primary">5</p>
                          <p className="text-[10px] text-text-muted font-bold">Total Orders</p>
                        </div>
                        <div className="bg-dark-tertiary/50 border border-brand-gold/30 rounded-xl p-3 text-center">
                          <p className="text-lg font-black text-brand-gold">13.2K</p>
                          <p className="text-[10px] text-brand-gold font-bold">KES Volume</p>
                        </div>
                        <div className="bg-dark-tertiary/50 border border-dark-accent rounded-xl p-3 text-center">
                          <p className="text-lg font-black text-text-primary">11</p>
                          <p className="text-[10px] text-text-muted font-bold">Products</p>
                        </div>
                      </div>

                      <div className="bg-dark-tertiary/40 border border-dark-accent rounded-xl p-3.5 space-y-2 text-xs text-text-secondary">
                        <div className="flex items-center justify-between">
                          <span className="text-text-muted">Ledger balance:</span>
                          <span className="text-emerald-500 font-bold flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> All paid up (KES 0 debt)
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-text-muted">Real catalog items:</span>
                          <span className="text-text-primary font-medium">A2 Silicon (KES 120), Hot 8 (KES 34)</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-text-muted">Order fee:</span>
                          <span className="text-brand-gold font-black">KSh 50 &ndash; 100 per carton (Max 20k)</span>
                        </div>
                      </div>

                      <p className="text-[11px] text-text-muted leading-relaxed">
                        Actual live dashboard for Sample Shop on Luthuli Avenue. Wholesalers track catalog stock, check off items as they pack, and lock cartons with 1 tap.
                      </p>
                    </motion.div>
                  </div>
                )}

                {activeMockupTab === "pipeline" && (
                  <div className="w-full p-3 sm:p-6 bg-dark-deepest flex flex-col items-center justify-center">
                    <div className="relative w-full max-w-4xl aspect-[16/10] sm:aspect-[16/9] max-h-[460px]">
                      <Image
                        src="/images/order-pipeline.png"
                        alt="Actual Nyakizu Order Pipeline — Pending, Packing, Awaiting Payment, and Completed stages"
                        fill
                        priority
                        className="object-contain rounded-xl shadow-2xl transition-transform duration-500 group-hover:scale-[1.01] border border-dark-accent"
                      />
                    </div>
                    {/* Floating Info Overlay Pill */}
                    <div className="mt-4 max-w-2xl w-full bg-dark-card/95 backdrop-blur-md border border-dark-accent p-3 sm:p-4 rounded-2xl shadow-xl flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-brand-gold/20 text-brand-gold flex items-center justify-center shrink-0">
                          <Layers className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs sm:text-sm font-extrabold text-text-primary">4-Stage Live Workflow Pipeline</p>
                          <p className="text-[11px] sm:text-xs text-text-secondary truncate">
                            Pending (2) &rarr; Packing (1) &rarr; Awaiting Payment (2) &rarr; Completed (8) &middot; Real backend orders
                          </p>
                        </div>
                      </div>
                      <span className="hidden sm:inline-block text-xs font-mono text-brand-gold font-bold">
                        Max order: KSh 20,000
                      </span>
                    </div>
                  </div>
                )}

                {activeMockupTab === "buyer" && (
                  <div className="w-full p-4 sm:p-8 flex flex-col lg:flex-row items-center justify-center gap-6 sm:gap-10 bg-gradient-to-b from-dark-card via-dark-secondary to-dark-card">
                    <motion.div
                      initial={{ opacity: 0, scale: 0.96 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3 }}
                      className="relative shrink-0"
                    >
                      <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-2xl pointer-events-none" />
                      <PhoneMockup className="w-[190px] sm:w-[210px] lg:w-[230px]">
                        <BuyerScreenPreview />
                      </PhoneMockup>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: 0.08 }}
                      className="max-w-md space-y-4 text-left"
                    >
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-500 dark:text-emerald-400 text-xs font-black">
                        <ShoppingBag className="w-3.5 h-3.5" /> Verified Countrywide Buyer
                      </div>
                      <div>
                        <h3 className="text-xl sm:text-2xl font-black text-text-primary">Kim Dreadlocks Kitengela</h3>
                        <p className="text-xs font-mono text-text-muted mt-0.5">kimdreadlockskitengela@gmail.com</p>
                      </div>

                      <div className="grid grid-cols-3 gap-2 py-1">
                        <div className="bg-dark-tertiary/50 border border-emerald-500/30 rounded-xl p-3 text-center">
                          <p className="text-lg font-black text-emerald-500 dark:text-emerald-400">KSh 0</p>
                          <p className="text-[10px] text-text-muted font-bold">Buyer Fee</p>
                        </div>
                        <div className="bg-dark-tertiary/50 border border-blue-500/30 rounded-xl p-3 text-center">
                          <p className="text-lg font-black text-blue-500 dark:text-blue-400">KES 154</p>
                          <p className="text-[10px] text-blue-400 dark:text-blue-300 font-bold">Current Order</p>
                        </div>
                        <div className="bg-dark-tertiary/50 border border-dark-accent rounded-xl p-3 text-center">
                          <p className="text-lg font-black text-text-primary">2</p>
                          <p className="text-[10px] text-text-muted font-bold">Items in Cart</p>
                        </div>
                      </div>

                      <div className="bg-dark-tertiary/40 border border-dark-accent rounded-xl p-3.5 space-y-2 text-xs text-text-secondary">
                        <div className="flex items-center justify-between">
                          <span className="text-text-muted">Approved supplier:</span>
                          <span className="text-brand-gold font-bold">Sample Shop (Nairobi CBD)</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-text-muted">Order contents:</span>
                          <span className="text-text-primary font-medium">1x A2 Cover + 1x Hot 8 Protector</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-text-muted">Platform cost:</span>
                          <span className="text-emerald-500 dark:text-emerald-400 font-bold">100% Free Forever for Buyers</span>
                        </div>
                      </div>

                      <p className="text-[11px] text-text-muted leading-relaxed">
                        Actual buyer dashboard for Kim Dreadlocks Kitengela. Countrywide retail shopkeepers and hawkers browse approved Nairobi wholesaler catalogs and submit orders with zero fees.
                      </p>
                    </motion.div>
                  </div>
                )}

                {activeMockupTab === "both" && (
                  <div className="w-full p-6 sm:p-10 bg-gradient-to-b from-dark-card via-dark-secondary to-dark-card flex flex-col items-center justify-center">
                    <DualPhoneMockup />
                    <p className="text-xs text-text-muted text-center mt-6 max-w-lg">
                      Both verified accounts running simultaneously: Sample Shop (Wholesale Seller in Nairobi CBD) and Kim Dreadlocks Kitengela (Retail Buyer countrywide).
                    </p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </Container>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 2: THE ORDER PIPELINE (Contrasting Section)                       */}
      {/* ========================================================================= */}
      <Section spacing="lg" className="bg-dark-secondary border-b border-dark-accent relative overflow-hidden" id="pipeline">
        <Container size="lg">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xs sm:text-sm font-extrabold text-brand-gold tabular-nums">01</span>
            <span className="text-xs sm:text-sm font-bold uppercase tracking-widest text-text-muted">Order Lifecycle</span>
            <span className="flex-1 h-px bg-dark-accent" />
          </div>

          <div className="max-w-3xl mb-12">
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-text-primary leading-tight">
              From Sourcing to Cleared Payment in 4 Stages
            </h2>
            <p className="mt-4 text-base sm:text-xl text-text-secondary font-medium">
              Every order moves across 4 real stages on your screen. No scattered WhatsApp audio notes, no packing mistakes, and no lost debt records.
            </p>
          </div>

          {/* 4 Pipeline Stages Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Stage 1: Pending */}
            <div className="rounded-2xl border border-dark-accent bg-dark-card p-5 flex flex-col justify-between hover:border-brand-gold/40 transition-colors shadow-sm dark:shadow-lg">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="w-8 h-8 rounded-xl bg-dark-tertiary text-text-secondary font-black text-sm flex items-center justify-center">
                    1
                  </span>
                  <span className="text-xs font-extrabold uppercase px-2 py-0.5 rounded bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                    Pending
                  </span>
                </div>
                <h3 className="text-lg font-bold text-text-primary">Buyer Submits Order</h3>
                <p className="mt-2 text-sm text-text-secondary leading-relaxed">
                  Your approved buyers add accessories from your catalog or submit custom sourcing requests. Arrives as a clean itemized order.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-dark-accent text-xs text-text-muted font-mono">
                Real status: submitted
              </div>
            </div>

            {/* Stage 2: Packing */}
            <div className="rounded-2xl border border-dark-accent bg-dark-card p-5 flex flex-col justify-between hover:border-brand-gold/40 transition-colors shadow-sm dark:shadow-lg">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="w-8 h-8 rounded-xl bg-dark-tertiary text-text-secondary font-black text-sm flex items-center justify-center">
                    2
                  </span>
                  <span className="text-xs font-extrabold uppercase px-2 py-0.5 rounded bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                    Packing
                  </span>
                </div>
                <h3 className="text-lg font-bold text-text-primary">Pack &amp; Check Off Items</h3>
                <p className="mt-2 text-sm text-text-secondary leading-relaxed">
                  Use the live checklist on your phone to check off items as you pack. Quote prices for any custom sourced accessories.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-dark-accent text-xs text-text-muted font-mono">
                Real status: sourcing
              </div>
            </div>

            {/* Stage 3: Awaiting Payment */}
            <div className="rounded-2xl border-2 border-brand-gold/50 bg-brand-gold/5 dark:bg-brand-gold/10 p-5 flex flex-col justify-between shadow-md dark:shadow-xl">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="w-8 h-8 rounded-xl bg-brand-gold text-slate-950 font-black text-sm flex items-center justify-center">
                    3
                  </span>
                  <span className="text-xs font-extrabold uppercase px-2 py-0.5 rounded bg-brand-gold/20 text-brand-gold border border-brand-gold/30">
                    Awaiting Payment
                  </span>
                </div>
                <h3 className="text-lg font-bold text-text-primary">Lock Final Price</h3>
                <p className="mt-2 text-sm text-text-secondary leading-relaxed">
                  Lock the carton total. The prices and goods become immutable. Log M-Pesa payments with transaction reference codes.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-brand-gold/20 text-xs text-brand-gold font-mono font-bold">
                Real status: locked / debt_active
              </div>
            </div>

            {/* Stage 4: Completed */}
            <div className="rounded-2xl border border-dark-accent bg-dark-card p-5 flex flex-col justify-between hover:border-brand-gold/40 transition-colors shadow-sm dark:shadow-lg">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="w-8 h-8 rounded-xl bg-dark-tertiary text-text-secondary font-black text-sm flex items-center justify-center">
                    4
                  </span>
                  <span className="text-xs font-extrabold uppercase px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    Completed
                  </span>
                </div>
                <h3 className="text-lg font-bold text-text-primary">Full Cleared Receipt</h3>
                <p className="mt-2 text-sm text-text-secondary leading-relaxed">
                  When balance reaches KES 0, the order marks cleared. Both parties keep a permanent, unalterable digital transaction record.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-dark-accent text-xs text-emerald-600 dark:text-emerald-400 font-mono">
                Real status: cleared
              </div>
            </div>
          </div>
        </Container>
      </Section>

      {/* ========================================================================= */}
      {/* SECTION 3: BEFORE VS AFTER (Interactive Comparison)                       */}
      {/* ========================================================================= */}
      <Section spacing="lg" className="bg-dark-primary border-b border-dark-accent" id="comparison">
        <Container size="lg">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xs sm:text-sm font-extrabold text-brand-gold tabular-nums">02</span>
            <span className="text-xs sm:text-sm font-bold uppercase tracking-widest text-text-muted">Direct Comparison</span>
            <span className="flex-1 h-px bg-dark-accent" />
          </div>

          <div className="max-w-3xl mb-10">
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-text-primary leading-tight">
              Why Wholesalers Are Leaving WhatsApp Audio Notes Behind
            </h2>
            <p className="mt-3 text-base sm:text-xl text-text-secondary font-medium">
              See the difference between running your business on memory versus a structured platform.
            </p>

            {/* Interactive Toggle Switch */}
            <div className="mt-6 inline-flex p-1.5 rounded-2xl bg-dark-secondary border border-dark-accent">
              <button
                type="button"
                onClick={() => setComparisonMode("nyakizu")}
                className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold transition-all ${
                  comparisonMode === "nyakizu"
                    ? "bg-brand-gold text-slate-950 shadow-md font-black"
                    : "text-text-secondary hover:text-text-primary"
                }`}
              >
                The Nyakizu Digital Workflow
              </button>
              <button
                type="button"
                onClick={() => setComparisonMode("analog")}
                className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold transition-all ${
                  comparisonMode === "analog"
                    ? "bg-rose-500/20 text-rose-600 dark:text-rose-300 border border-rose-500/40 shadow-sm font-black"
                    : "text-text-secondary hover:text-text-primary"
                }`}
              >
                The Analog Way (Paper &amp; Audio Notes)
              </button>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Card 1 */}
            <div
              className={`rounded-3xl border p-6 transition-all duration-300 shadow-sm dark:shadow-xl ${
                comparisonMode === "analog"
                  ? "border-rose-300 dark:border-rose-500/30 bg-rose-50/70 dark:bg-rose-950/20"
                  : "border-brand-gold/40 bg-dark-card"
              }`}
            >
              <span className="text-xs font-mono font-bold text-text-muted block mb-2">01 &middot; Order Taking</span>
              <h3 className="text-lg font-bold text-text-primary">
                {comparisonMode === "analog"
                  ? "15 voice notes and screenshots"
                  : "1-Tap Itemized Orders"}
              </h3>
              <p className="mt-2 text-sm text-text-secondary leading-relaxed">
                {comparisonMode === "analog"
                  ? "Listening to voice notes in a busy shop leads to mistakes. Items are skipped, wrong phone models are packed, and money is lost."
                  : "Buyers select exact accessories and quantities. Custom sourcing requests are priced clearly before packing begins."}
              </p>
            </div>

            {/* Card 2 */}
            <div
              className={`rounded-3xl border p-6 transition-all duration-300 shadow-sm dark:shadow-xl ${
                comparisonMode === "analog"
                  ? "border-rose-300 dark:border-rose-500/30 bg-rose-50/70 dark:bg-rose-950/20"
                  : "border-brand-gold/40 bg-dark-card"
              }`}
            >
              <span className="text-xs font-mono font-bold text-text-muted block mb-2">02 &middot; Price &amp; Packing</span>
              <h3 className="text-lg font-bold text-text-primary">
                {comparisonMode === "analog"
                  ? "Changed orders after carton is sealed"
                  : "Locked Final Price"}
              </h3>
              <p className="mt-2 text-sm text-text-secondary leading-relaxed">
                {comparisonMode === "analog"
                  ? "You spend 40 minutes packing a carton only for the buyer to call demanding to swap models or remove priced items."
                  : "Once the seller clicks Lock Price, the total and items are permanent. Neither party can tamper with history."}
              </p>
            </div>

            {/* Card 3 */}
            <div
              className={`rounded-3xl border p-6 transition-all duration-300 shadow-sm dark:shadow-xl ${
                comparisonMode === "analog"
                  ? "border-rose-300 dark:border-rose-500/30 bg-rose-50/70 dark:bg-rose-950/20"
                  : "border-brand-gold/40 bg-dark-card"
              }`}
            >
              <span className="text-xs font-mono font-bold text-text-muted block mb-2">03 &middot; Debt &amp; Credit</span>
              <h3 className="text-lg font-bold text-text-primary">
                {comparisonMode === "analog"
                  ? "Torn counter book pages"
                  : "Shared M-Pesa Ledger"}
              </h3>
              <p className="mt-2 text-sm text-text-secondary leading-relaxed">
                {comparisonMode === "analog"
                  ? "Counter books get water stains or go missing. Months later, partners argue over whether an old M-Pesa payment was 5,000 or 8,000."
                  : "Every payment is logged with its M-Pesa reference code. Both seller and buyer see the exact same balance and promised date in real time."}
              </p>
            </div>
          </div>
        </Container>
      </Section>

      {/* ========================================================================= */}
      {/* SECTION 4: DUAL TRADE ROLES (Two Distinct Workspaces)                     */}
      {/* ========================================================================= */}
      <Section spacing="lg" className="bg-dark-secondary border-b border-dark-accent" id="roles">
        <Container size="lg">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xs sm:text-sm font-extrabold text-brand-gold tabular-nums">03</span>
            <span className="text-xs sm:text-sm font-bold uppercase tracking-widest text-text-muted">Two Distinct Workspaces</span>
            <span className="flex-1 h-px bg-dark-accent" />
          </div>

          <div className="max-w-2xl mb-12">
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-text-primary leading-tight">
              Built for Wholesalers &amp; Countrywide Retailers
            </h2>
            <p className="mt-3 text-base sm:text-xl text-text-secondary font-medium">
              Dedicated interfaces designed for the daily realities of wholesale sellers and retail buyers.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Wholesaler Showcase */}
            <div className="rounded-3xl border-2 border-brand-gold/50 bg-dark-card p-7 sm:p-9 flex flex-col justify-between shadow-md dark:shadow-2xl relative overflow-hidden">
              <div>
                <div className="flex items-center justify-between mb-6">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-gold/15 text-brand-gold font-black text-xs">
                    <Store className="w-3.5 h-3.5" /> For Wholesale Shop Owners
                  </span>
                  <span className="text-xs text-text-muted">Nairobi CBD &middot; Luthuli Avenue</span>
                </div>

                <h3 className="text-2xl font-black text-text-primary">
                  Protect Your Margin, Speed Up Packing &amp; Secure Your Credit
                </h3>

                <ul className="mt-6 space-y-4 text-sm sm:text-base text-text-secondary">
                  <li className="flex items-start gap-3">
                    <ShieldCheck className="w-5 h-5 text-brand-gold shrink-0 mt-0.5" />
                    <span>
                      <strong className="text-text-primary">Private wholesale pricing:</strong> Competitors on the same street cannot see your prices. Only buyers you personally verify get catalog access.
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-brand-gold shrink-0 mt-0.5" />
                    <span>
                      <strong className="text-text-primary">Fast carton packing:</strong> Turn scattered WhatsApp audio notes into 1 clean checklist. Check off items and lock prices with 1 tap.
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Wallet className="w-5 h-5 text-brand-gold shrink-0 mt-0.5" />
                    <span>
                      <strong className="text-text-primary">Accurate debt records:</strong> Log partial M-Pesa installments with transaction reference codes. Know your total market receivables instantly.
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <TrendingDown className="w-5 h-5 text-brand-gold shrink-0 mt-0.5" />
                    <span>
                      <strong className="text-text-primary">Pay only when you pack:</strong> KSh 50 to KSh 100 per carton. Zero monthly rent or fixed deductions.
                    </span>
                  </li>
                </ul>
              </div>

              <div className="mt-8 pt-6 border-t border-dark-accent">
                <Button
                  size="lg"
                  className="w-full rounded-full bg-brand-gold hover:bg-brand-gold-dark text-slate-950 font-black shadow-lg h-12"
                  asChild
                >
                  <Link href="/register?role=seller">Open Wholesale Shop (First 3 Orders Free)</Link>
                </Button>
              </div>
            </div>

            {/* Buyer Showcase */}
            <div className="rounded-3xl border border-dark-accent bg-dark-card p-7 sm:p-9 flex flex-col justify-between shadow-md dark:shadow-2xl">
              <div>
                <div className="flex items-center justify-between mb-6">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-black text-xs">
                    <ShoppingBag className="w-3.5 h-3.5" /> For Retailers &amp; Hawkers
                  </span>
                  <span className="text-xs text-emerald-600 dark:text-emerald-400 font-extrabold">100% Free Forever</span>
                </div>

                <h3 className="text-2xl font-black text-text-primary">
                  Order from Nairobi at Wholesale Rates with Total Transparency
                </h3>

                <ul className="mt-6 space-y-4 text-sm sm:text-base text-text-secondary">
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                    <span>
                      <strong className="text-text-primary">Direct Nairobi wholesale access:</strong> Browse genuine stock from trusted suppliers without having to travel to Nairobi in person.
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Package className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                    <span>
                      <strong className="text-text-primary">Custom item sourcing:</strong> Need a phone cover or tempered glass model not listed? Request custom sourcing and the seller quotes it for you.
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Clock className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                    <span>
                      <strong className="text-text-primary">Proof of payment &amp; credit:</strong> Submit your M-Pesa transaction reference code directly to the order and view agreed payment due dates.
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Smartphone className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
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
                  className="w-full rounded-full border border-dark-accent hover:border-emerald-500 text-text-primary bg-dark-secondary hover:bg-dark-tertiary font-bold h-12"
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
      {/* SECTION 5: PRICING SNAPSHOT (Streamlined value overview)                  */}
      {/* ========================================================================= */}
      <Section spacing="lg" className="bg-dark-primary border-b border-dark-accent relative" id="pricing">
        <Container size="lg">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xs sm:text-sm font-extrabold text-brand-gold tabular-nums">04</span>
            <span className="text-xs sm:text-sm font-bold uppercase tracking-widest text-text-muted">Simple, Fair Pricing</span>
            <span className="flex-1 h-px bg-dark-accent" />
          </div>

          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-10 sm:mb-12">
            <div className="max-w-2xl">
              <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-text-primary leading-tight">
                Pay Only When You Pack. Zero Monthly Drain.
              </h2>
              <p className="mt-3 text-base sm:text-xl text-text-secondary font-medium">
                No KSh 1,500/month recurring subscriptions. Pay just KSh 50 to KSh 100 only when you lock and dispatch a real carton. Keep 100% of your earnings when trade is slow.
              </p>
            </div>

            <Button
              size="lg"
              className="rounded-full bg-brand-gold hover:bg-brand-gold-dark text-slate-950 font-black shadow-brand shrink-0 h-12 px-6"
              asChild
            >
              <Link href="/pricing">
                Open Full Fee Calculator
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </div>

          {/* 2 Focused Role Pricing Cards */}
          <div className="grid md:grid-cols-2 gap-6 sm:gap-8 mb-8">
            {/* Wholesaler Plan Snapshot */}
            <div className="rounded-3xl border-2 border-brand-gold/50 bg-dark-card p-6 sm:p-9 flex flex-col justify-between shadow-lg relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-brand-gold/10 rounded-full blur-3xl pointer-events-none" />

              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-gold/15 text-brand-gold font-black text-xs">
                    <Store className="w-3.5 h-3.5" /> Wholesale Sellers
                  </span>
                  <span className="text-xs font-bold text-brand-gold bg-brand-gold/10 border border-brand-gold/20 px-2.5 py-0.5 rounded-full">
                    First 3 Orders Free
                  </span>
                </div>

                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-3xl sm:text-4xl font-black text-brand-gold">KSh 50 &ndash; 100</span>
                  <span className="text-xs text-text-muted font-bold">/ packed carton</span>
                </div>
                <p className="text-xs text-text-muted mb-6">
                  Capped strictly at KSh 100 max for all orders up to KSh 20,000 (maximum order size).
                </p>

                <ul className="space-y-3 text-sm text-text-secondary">
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-brand-gold shrink-0 mt-0.5" />
                    <span><strong className="text-text-primary">Zero monthly subscription:</strong> Quiet days cost you KSh 0.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-brand-gold shrink-0 mt-0.5" />
                    <span><strong className="text-text-primary">Instant top-up via M-Pesa:</strong> Top up from KSh 100 via Safaricom STK push.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-brand-gold shrink-0 mt-0.5" />
                    <span><strong className="text-text-primary">Locked order records:</strong> Digital receipt, custom sourcing checklist, and debt ledger included.</span>
                  </li>
                </ul>
              </div>

              <div className="mt-8 pt-6 border-t border-dark-accent relative z-10 flex flex-col sm:flex-row gap-3">
                <Button className="w-full rounded-full bg-brand-gold hover:bg-brand-gold-dark text-slate-950 font-black shadow-md h-12" asChild>
                  <Link href="/register?role=seller">Open Wholesale Shop</Link>
                </Button>
                <Button variant="outline" className="w-full rounded-full border-dark-accent hover:border-brand-gold text-text-primary bg-dark-secondary hover:bg-dark-tertiary font-bold h-12" asChild>
                  <Link href="/pricing">See Fee Details</Link>
                </Button>
              </div>
            </div>

            {/* Buyer Plan Snapshot */}
            <div className="rounded-3xl border border-dark-accent bg-dark-card p-6 sm:p-9 flex flex-col justify-between shadow-lg">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-black text-xs">
                    <ShoppingBag className="w-3.5 h-3.5" /> Retailers &amp; Hawkers
                  </span>
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full">
                    100% Free Forever
                  </span>
                </div>

                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-3xl sm:text-4xl font-black text-emerald-600 dark:text-emerald-400">KSh 0</span>
                  <span className="text-xs text-text-muted font-bold">/ forever</span>
                </div>
                <p className="text-xs text-text-muted mb-6">
                  Countrywide shopkeepers and hawkers browse and order with zero fees.
                </p>

                <ul className="space-y-3 text-sm text-text-secondary">
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span><strong className="text-text-primary">Direct Nairobi wholesale access:</strong> Browse verified supplier catalogs at CBD prices.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span><strong className="text-text-primary">Custom sourcing requests:</strong> Request non-listed accessories easily.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span><strong className="text-text-primary">Shared ledger:</strong> View exact balances and agreed due dates.</span>
                  </li>
                </ul>
              </div>

              <div className="mt-8 pt-6 border-t border-dark-accent flex flex-col sm:flex-row gap-3">
                <Button variant="outline" className="w-full rounded-full border-dark-accent hover:border-emerald-500 text-text-primary bg-dark-secondary hover:bg-dark-tertiary font-bold h-12" asChild>
                  <Link href="/register?role=buyer">Join as Buyer (Free)</Link>
                </Button>
                <Button variant="outline" className="w-full rounded-full border-dark-accent hover:border-brand-gold text-text-primary bg-dark-secondary hover:bg-dark-tertiary font-bold h-12" asChild>
                  <Link href="/pricing#calculator">Simulate Orders</Link>
                </Button>
              </div>
            </div>
          </div>

          {/* Banner Bar linking to /pricing */}
          <div className="rounded-2xl border border-dark-accent bg-dark-secondary/80 p-5 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3 text-left">
              <div className="w-10 h-10 rounded-xl bg-brand-gold/15 text-brand-gold flex items-center justify-center shrink-0">
                <Percent className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-extrabold text-text-primary">
                  Want to test your exact carton sizes on the live fee calculator?
                </p>
                <p className="text-xs text-text-secondary">
                  Check how orders from KSh 1,000 to KSh 20,000 are billed, and review the full fee schedule matrix.
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="rounded-full border-brand-gold/40 hover:border-brand-gold text-brand-gold bg-brand-gold/10 hover:bg-brand-gold/20 font-bold shrink-0 text-xs sm:text-sm h-10 px-5"
              asChild
            >
              <Link href="/pricing">
                Go to Dedicated Pricing Page &rarr;
              </Link>
            </Button>
          </div>
        </Container>
      </Section>

      {/* Community Proof */}
      <CommunityActivity />

      {/* ========================================================================= */}
      {/* SECTION 6: FAQ ACCORDION                                                  */}
      {/* ========================================================================= */}
      <Section spacing="lg" className="bg-dark-secondary border-b border-dark-accent" id="faq">
        <Container size="md">
          <div className="flex items-center gap-2 mb-4 justify-center">
            <span className="text-xs sm:text-sm font-extrabold text-brand-gold tabular-nums">05</span>
            <span className="text-xs sm:text-sm font-bold uppercase tracking-widest text-text-muted">Questions &amp; Answers</span>
          </div>

          <div className="text-center max-w-xl mx-auto mb-10 sm:mb-12">
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-text-primary">
              Frequently Asked Questions
            </h2>
            <p className="mt-2 text-text-secondary text-sm sm:text-base">
              Everything you need to know about pricing, privacy, and how Nyakizu works.
            </p>
          </div>

          <div className="space-y-3">
            {FAQS.map((faq, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div
                  key={faq.q}
                  className="rounded-2xl border border-dark-accent bg-dark-card overflow-hidden transition-colors shadow-sm"
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

      {/* ========================================================================= */}
      {/* SECTION 7: CLOSING CTA                                                    */}
      {/* ========================================================================= */}
      <Section spacing="lg" className="bg-dark-primary relative overflow-hidden">
        <Container size="lg">
          <div className="relative rounded-3xl border-2 border-brand-gold/50 bg-gradient-to-r from-brand-gold/10 via-amber-500/5 to-purple-500/10 dark:from-brand-gold/15 dark:via-[#191D38] dark:to-purple-600/15 bg-dark-card p-8 sm:p-14 text-center shadow-xl dark:shadow-2xl overflow-hidden">
            <div className="relative z-10 max-w-2xl mx-auto space-y-5">
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-brand-gold/20 text-brand-gold font-black text-xs uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" /> Start Digitizing Your Business Today
              </span>

              <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-text-primary leading-tight">
                Put Your Wholesale Orders &amp; Credit on Your Phone.
              </h2>

              <p className="text-text-secondary text-base sm:text-lg leading-relaxed">
                Join Kenyan phone accessory wholesalers and countrywide buyers already trading with 100% trust. Your first 3 orders are completely free.
              </p>

              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button
                  size="lg"
                  className="w-full sm:w-auto rounded-full bg-brand-gold hover:bg-brand-gold-dark text-slate-950 font-black shadow-xl px-9 text-base h-14"
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
                  className="w-full sm:w-auto rounded-full border border-dark-accent hover:border-brand-gold/50 text-text-primary bg-dark-secondary/80 hover:bg-dark-tertiary font-bold px-8 text-base h-14"
                  asChild
                >
                  <Link href="/contact">Talk to Our Nairobi Team</Link>
                </Button>
              </div>

              <p className="text-xs text-text-muted pt-2 font-mono">
                Takes 2 minutes &middot; No credit card or M-Pesa deposit required
              </p>
            </div>
          </div>
        </Container>
      </Section>

      <LandingFooter />
    </div>
  );
}
