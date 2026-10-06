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
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Container, Section, LandingHeader, LandingFooter } from "@/components/layouts";
import CommunityActivity from "@/components/landing/CommunityActivity";

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } },
};

export function HomeContent() {
  // --- Section 1 Hero: Real Screenshot Showcase Tab State ---
  const [activeMockupTab, setActiveMockupTab] = useState<"seller" | "pipeline" | "buyer">("seller");

  // --- Section 3: Before vs After Toggle State ---
  const [comparisonMode, setComparisonMode] = useState<"nyakizu" | "analog">("nyakizu");

  // --- Section 5: Hostinger-Style Interactive Pricing Calculator State ---
  const [orderValue, setOrderValue] = useState<number>(24000);

  // Real backend fee formula (FeeSchedule):
  // 0.5% rate, rounded to nearest KES 5, clamped between KES 50 min and KES 100 max
  const computedFee = Math.min(100, Math.max(50, Math.round((orderValue * 0.005) / 5) * 5));
  const effectivePercentage = ((computedFee / orderValue) * 100).toFixed(2);

  // --- Section 6: FAQ Accordion State ---
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const toggleFaq = (index: number) => {
    setOpenFaqIndex((prev) => (prev === index ? null : index));
  };

  const FAQS = [
    {
      q: "Why do wholesalers pay KSh 50 to KSh 100 per order instead of a monthly subscription?",
      a: "Fixed monthly subscriptions (like KSh 1,500/month) drain your cash even during slow weeks or quiet shipping days. With Nyakizu, you only pay when you actually pack and lock a carton. Small orders pay KSh 50; large orders (even KSh 80,000+) are strictly capped at KSh 100 max. If you don't pack, you pay zero.",
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
    <div className="min-h-screen bg-[#070810] text-[#F0F6FC] font-sans selection:bg-brand-gold/30 selection:text-white overflow-x-hidden">
      <LandingHeader />

      {/* ========================================================================= */}
      {/* SECTION 1: HERO (Hostinger Visual Energy + Real Screenshot Mockup)        */}
      {/* ========================================================================= */}
      <section className="relative pt-24 pb-16 sm:pt-36 sm:pb-24 overflow-hidden bg-gradient-to-b from-[#090A16] via-[#0E1226] to-[#0A0C19] border-b border-white/5">
        {/* Radiant Ambient Mesh & Glow Orbs */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[450px] bg-gradient-to-tr from-brand-gold/20 via-purple-600/15 to-transparent rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute top-28 right-4 w-72 h-72 bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />

        {/* Micro-dot grid texture */}
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff0a_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />

        <Container size="xl" className="relative z-10">
          <div className="max-w-4xl mx-auto text-center mb-12 sm:mb-16">
            {/* Hostinger-style Glowing Pill */}
            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="show"
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-brand-gold/40 bg-brand-gold/10 text-brand-gold text-xs sm:text-sm font-extrabold mb-6 shadow-sm backdrop-blur-md"
            >
              <Sparkles className="w-3.5 h-3.5 animate-pulse text-brand-gold" />
              <span>Direct Wholesale Trade Platform &middot; Pay Only When You Pack</span>
            </motion.div>

            {/* Bold Headline with Gradient Accents */}
            <motion.h1
              variants={fadeUp}
              initial="hidden"
              animate="show"
              className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[1.08] text-white"
            >
              The Trade You Already Do.{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-gold via-amber-300 to-amber-500">
                Now Faster, Safer &amp; Digitized.
              </span>
            </motion.h1>

            {/* Clarifying Subtitle */}
            <motion.p
              variants={fadeUp}
              initial="hidden"
              animate="show"
              className="mt-6 text-base sm:text-xl text-slate-300 max-w-2xl mx-auto font-medium leading-relaxed"
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
                className="w-full sm:w-auto rounded-full border border-white/20 hover:border-brand-gold/50 bg-white/5 hover:bg-white/10 text-white font-bold px-8 text-base h-14 backdrop-blur-md"
                asChild
              >
                <Link href="#pricing">See Fee Calculator &darr;</Link>
              </Button>
            </motion.div>

            {/* Four Trust Badges */}
            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="show"
              className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs sm:text-sm text-slate-400 font-semibold"
            >
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Zero Monthly Subscription
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" /> KSh 50–100 Only When Packed
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Retailers &amp; Hawkers Pay KSh 0
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" /> First 3 Orders 100% Free
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

            <div className="relative rounded-2xl sm:rounded-3xl border border-white/15 bg-[#121528] shadow-2xl overflow-hidden">
              {/* Browser Header Bar with Realistic Controls and Live Tabs */}
              <div className="px-4 py-3 bg-[#181C32] border-b border-white/10 flex flex-wrap items-center justify-between gap-3">
                {/* Traffic Light Window Dots */}
                <div className="flex items-center gap-2 shrink-0">
                  <span className="w-3 h-3 rounded-full bg-[#FF5F56] inline-block" />
                  <span className="w-3 h-3 rounded-full bg-[#FFBD2E] inline-block" />
                  <span className="w-3 h-3 rounded-full bg-[#27C93F] inline-block" />
                  <span className="text-xs text-slate-400 font-mono ml-2 hidden sm:inline">nyakizu.app</span>
                </div>

                {/* Screenshot Switcher Tabs */}
                <div className="flex items-center gap-1 bg-[#0F1222] p-1 rounded-xl border border-white/10">
                  <button
                    type="button"
                    onClick={() => setActiveMockupTab("seller")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      activeMockupTab === "seller"
                        ? "bg-brand-gold text-slate-950 shadow-md font-black"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    Wholesaler Dashboard (Bizoza)
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveMockupTab("pipeline")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      activeMockupTab === "pipeline"
                        ? "bg-brand-gold text-slate-950 shadow-md font-black"
                        : "text-slate-400 hover:text-white"
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
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    Buyer Dashboard (Kamikazi)
                  </button>
                </div>

                <div className="hidden md:flex items-center gap-1.5 text-xs text-emerald-400 font-bold bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" /> Real App Screens
                </div>
              </div>

              {/* Viewport: Actual Screenshot Display */}
              <div className="relative aspect-[16/10] sm:aspect-[16/9] w-full bg-[#0B0D18] overflow-hidden group">
                {activeMockupTab === "seller" && (
                  <div className="relative w-full h-full">
                    <Image
                      src="/images/seller-dashboard-desktop.png"
                      alt="Actual Nyakizu Seller Dashboard — Bizoza Phone Accessories on Luthuli Avenue"
                      fill
                      priority
                      className="object-cover object-top transition-transform duration-500 group-hover:scale-[1.01]"
                    />
                    {/* Floating Info Overlay Pill */}
                    <div className="absolute bottom-4 left-4 right-4 sm:right-auto sm:max-w-md bg-slate-950/90 backdrop-blur-md border border-white/20 p-3 sm:p-4 rounded-2xl shadow-xl flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center shrink-0">
                        <Store className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-extrabold text-white">Bizoza Phone Accessories &middot; Luthuli Ave</p>
                        <p className="text-[11px] text-slate-300 truncate">
                          2 New Orders &middot; 1 Buyer Request &middot; KES 13,600 Money Owed
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {activeMockupTab === "pipeline" && (
                  <div className="relative w-full h-full flex items-center justify-center p-2 sm:p-4 bg-[#090B14]">
                    <div className="relative w-full h-full max-w-4xl">
                      <Image
                        src="/images/order-pipeline.png"
                        alt="Actual Nyakizu Order Pipeline — Pending, Packing, Awaiting Payment, and Completed stages"
                        fill
                        priority
                        className="object-contain transition-transform duration-500 group-hover:scale-[1.01]"
                      />
                    </div>
                    {/* Floating Info Overlay Pill */}
                    <div className="absolute bottom-4 left-4 right-4 sm:right-auto sm:max-w-md bg-slate-950/90 backdrop-blur-md border border-white/20 p-3 sm:p-4 rounded-2xl shadow-xl flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-brand-gold/20 text-brand-gold flex items-center justify-center shrink-0">
                        <Layers className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-extrabold text-white">4-Stage Workflow Pipeline</p>
                        <p className="text-[11px] text-slate-300">
                          Pending (2) &rarr; Packing (1) &rarr; Awaiting Payment (2) &rarr; Completed (8)
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {activeMockupTab === "buyer" && (
                  <div className="relative w-full h-full">
                    <Image
                      src="/images/buyer-dashboard-desktop.png"
                      alt="Actual Nyakizu Buyer Dashboard — Kamikazi order tracking"
                      fill
                      priority
                      className="object-cover object-top transition-transform duration-500 group-hover:scale-[1.01]"
                    />
                    {/* Floating Info Overlay Pill */}
                    <div className="absolute bottom-4 left-4 right-4 sm:right-auto sm:max-w-md bg-slate-950/90 backdrop-blur-md border border-white/20 p-3 sm:p-4 rounded-2xl shadow-xl flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
                        <ShoppingBag className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-extrabold text-white">Kamikazi Buyer Dashboard</p>
                        <p className="text-[11px] text-slate-300 truncate">
                          3 Active Orders &middot; Order #10 (KES 58,750) &middot; Order #12 (KES 16,600)
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </Container>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 2: THE ORDER PIPELINE (Contrasting Dark Slate Section)             */}
      {/* ========================================================================= */}
      <Section spacing="lg" className="bg-[#0C0F22] border-b border-white/5 relative overflow-hidden" id="pipeline">
        <Container size="lg">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xs sm:text-sm font-extrabold text-brand-gold tabular-nums">01</span>
            <span className="text-xs sm:text-sm font-bold uppercase tracking-widest text-slate-400">Order Lifecycle</span>
            <span className="flex-1 h-px bg-white/10" />
          </div>

          <div className="max-w-3xl mb-12">
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
              From Sourcing to Cleared Payment in 4 Stages
            </h2>
            <p className="mt-4 text-base sm:text-xl text-slate-300 font-medium">
              Every order moves across 4 real stages on your screen. No scattered WhatsApp audio notes, no packing mistakes, and no lost debt records.
            </p>
          </div>

          {/* 4 Pipeline Stages Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Stage 1: Pending */}
            <div className="rounded-2xl border border-white/10 bg-[#14182E] p-5 flex flex-col justify-between hover:border-brand-gold/40 transition-colors shadow-lg">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="w-8 h-8 rounded-xl bg-slate-800 text-slate-300 font-black text-sm flex items-center justify-center">
                    1
                  </span>
                  <span className="text-xs font-extrabold uppercase px-2 py-0.5 rounded bg-blue-500/15 text-blue-400 border border-blue-500/20">
                    Pending
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white">Buyer Submits Order</h3>
                <p className="mt-2 text-sm text-slate-300 leading-relaxed">
                  Your approved buyers add accessories from your catalog or submit custom sourcing requests. Arrives as a clean itemized order.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-white/5 text-xs text-slate-400 font-mono">
                Real status: submitted
              </div>
            </div>

            {/* Stage 2: Packing */}
            <div className="rounded-2xl border border-white/10 bg-[#14182E] p-5 flex flex-col justify-between hover:border-brand-gold/40 transition-colors shadow-lg">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="w-8 h-8 rounded-xl bg-slate-800 text-slate-300 font-black text-sm flex items-center justify-center">
                    2
                  </span>
                  <span className="text-xs font-extrabold uppercase px-2 py-0.5 rounded bg-amber-500/15 text-amber-400 border border-amber-500/20">
                    Packing
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white">Pack &amp; Check Off Items</h3>
                <p className="mt-2 text-sm text-slate-300 leading-relaxed">
                  Use the live checklist on your phone to check off items as you pack. Quote prices for any custom sourced accessories.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-white/5 text-xs text-slate-400 font-mono">
                Real status: sourcing
              </div>
            </div>

            {/* Stage 3: Awaiting Payment */}
            <div className="rounded-2xl border border-brand-gold/40 bg-[#181C35] p-5 flex flex-col justify-between shadow-xl">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="w-8 h-8 rounded-xl bg-brand-gold text-slate-950 font-black text-sm flex items-center justify-center">
                    3
                  </span>
                  <span className="text-xs font-extrabold uppercase px-2 py-0.5 rounded bg-brand-gold/20 text-brand-gold border border-brand-gold/30">
                    Awaiting Payment
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white">Lock Final Price</h3>
                <p className="mt-2 text-sm text-slate-300 leading-relaxed">
                  Lock the carton total. The prices and goods become immutable. Log M-Pesa payments with transaction reference codes.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-white/10 text-xs text-brand-gold font-mono font-bold">
                Real status: locked / debt_active
              </div>
            </div>

            {/* Stage 4: Completed */}
            <div className="rounded-2xl border border-white/10 bg-[#14182E] p-5 flex flex-col justify-between hover:border-brand-gold/40 transition-colors shadow-lg">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="w-8 h-8 rounded-xl bg-slate-800 text-slate-300 font-black text-sm flex items-center justify-center">
                    4
                  </span>
                  <span className="text-xs font-extrabold uppercase px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
                    Completed
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white">Full Cleared Receipt</h3>
                <p className="mt-2 text-sm text-slate-300 leading-relaxed">
                  When balance reaches KES 0, the order marks cleared. Both parties keep a permanent, unalterable digital transaction record.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-white/5 text-xs text-emerald-400 font-mono">
                Real status: cleared
              </div>
            </div>
          </div>
        </Container>
      </Section>

      {/* ========================================================================= */}
      {/* SECTION 3: BEFORE VS AFTER (Obsidian Dark Section with High Contrast)     */}
      {/* ========================================================================= */}
      <Section spacing="lg" className="bg-[#070812] border-b border-white/5" id="comparison">
        <Container size="lg">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xs sm:text-sm font-extrabold text-brand-gold tabular-nums">02</span>
            <span className="text-xs sm:text-sm font-bold uppercase tracking-widest text-slate-400">Direct Comparison</span>
            <span className="flex-1 h-px bg-white/10" />
          </div>

          <div className="max-w-3xl mb-10">
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
              Why Wholesalers Are Leaving WhatsApp Audio Notes Behind
            </h2>
            <p className="mt-3 text-base sm:text-xl text-slate-300 font-medium">
              See the difference between running your business on memory versus a structured platform.
            </p>

            {/* Interactive Toggle Switch */}
            <div className="mt-6 inline-flex p-1.5 rounded-2xl bg-[#141628] border border-white/10">
              <button
                type="button"
                onClick={() => setComparisonMode("nyakizu")}
                className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold transition-all ${
                  comparisonMode === "nyakizu"
                    ? "bg-brand-gold text-slate-950 shadow-md"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                The Nyakizu Digital Workflow
              </button>
              <button
                type="button"
                onClick={() => setComparisonMode("analog")}
                className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold transition-all ${
                  comparisonMode === "analog"
                    ? "bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-sm"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                The Analog Way (Paper &amp; Audio Notes)
              </button>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Card 1 */}
            <div
              className={`rounded-3xl border p-6 transition-all duration-300 ${
                comparisonMode === "analog"
                  ? "border-rose-500/30 bg-rose-950/15"
                  : "border-brand-gold/40 bg-[#12162B] shadow-xl"
              }`}
            >
              <span className="text-xs font-mono font-bold text-slate-400 block mb-2">01 &middot; Order Taking</span>
              <h3 className="text-lg font-bold text-white">
                {comparisonMode === "analog"
                  ? "15 voice notes and screenshots"
                  : "1-Tap Itemized Orders"}
              </h3>
              <p className="mt-2 text-sm text-slate-300 leading-relaxed">
                {comparisonMode === "analog"
                  ? "Listening to voice notes in a busy shop leads to mistakes. Items are skipped, wrong phone models are packed, and money is lost."
                  : "Buyers select exact accessories and quantities. Custom sourcing requests are priced clearly before packing begins."}
              </p>
            </div>

            {/* Card 2 */}
            <div
              className={`rounded-3xl border p-6 transition-all duration-300 ${
                comparisonMode === "analog"
                  ? "border-rose-500/30 bg-rose-950/15"
                  : "border-brand-gold/40 bg-[#12162B] shadow-xl"
              }`}
            >
              <span className="text-xs font-mono font-bold text-slate-400 block mb-2">02 &middot; Price &amp; Packing</span>
              <h3 className="text-lg font-bold text-white">
                {comparisonMode === "analog"
                  ? "Changed orders after carton is sealed"
                  : "Locked Final Price"}
              </h3>
              <p className="mt-2 text-sm text-slate-300 leading-relaxed">
                {comparisonMode === "analog"
                  ? "You spend 40 minutes packing a carton only for the buyer to call demanding to swap models or remove priced items."
                  : "Once the seller clicks Lock Price, the total and items are permanent. Neither party can tamper with history."}
              </p>
            </div>

            {/* Card 3 */}
            <div
              className={`rounded-3xl border p-6 transition-all duration-300 ${
                comparisonMode === "analog"
                  ? "border-rose-500/30 bg-rose-950/15"
                  : "border-brand-gold/40 bg-[#12162B] shadow-xl"
              }`}
            >
              <span className="text-xs font-mono font-bold text-slate-400 block mb-2">03 &middot; Debt &amp; Credit</span>
              <h3 className="text-lg font-bold text-white">
                {comparisonMode === "analog"
                  ? "Torn counter book pages"
                  : "Shared M-Pesa Ledger"}
              </h3>
              <p className="mt-2 text-sm text-slate-300 leading-relaxed">
                {comparisonMode === "analog"
                  ? "Counter books get water stains or go missing. Months later, partners argue over whether an old M-Pesa payment was 5,000 or 8,000."
                  : "Every payment is logged with its M-Pesa reference code. Both seller and buyer see the exact same balance and promised date in real time."}
              </p>
            </div>
          </div>
        </Container>
      </Section>

      {/* ========================================================================= */}
      {/* SECTION 4: DUAL TRADE ROLES (Midnight Blue Gradient Section)              */}
      {/* ========================================================================= */}
      <Section spacing="lg" className="bg-gradient-to-b from-[#0B0E20] via-[#090C1B] to-[#0A0D1F] border-b border-white/5" id="roles">
        <Container size="lg">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xs sm:text-sm font-extrabold text-brand-gold tabular-nums">03</span>
            <span className="text-xs sm:text-sm font-bold uppercase tracking-widest text-slate-400">Two Distinct Workspaces</span>
            <span className="flex-1 h-px bg-white/10" />
          </div>

          <div className="max-w-2xl mb-12">
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
              Built for Wholesalers &amp; Countrywide Retailers
            </h2>
            <p className="mt-3 text-base sm:text-xl text-slate-300 font-medium">
              Dedicated interfaces designed for the daily realities of wholesale sellers and retail buyers.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Wholesaler Showcase */}
            <div className="rounded-3xl border-2 border-brand-gold/40 bg-[#12162D] p-7 sm:p-9 flex flex-col justify-between shadow-2xl relative overflow-hidden">
              <div>
                <div className="flex items-center justify-between mb-6">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-gold/15 text-brand-gold font-black text-xs">
                    <Store className="w-3.5 h-3.5" /> For Wholesale Shop Owners
                  </span>
                  <span className="text-xs text-slate-400">Nairobi CBD &middot; Luthuli Avenue</span>
                </div>

                <h3 className="text-2xl font-black text-white">
                  Protect Your Margin, Speed Up Packing &amp; Secure Your Credit
                </h3>

                <ul className="mt-6 space-y-4 text-sm sm:text-base text-slate-300">
                  <li className="flex items-start gap-3">
                    <ShieldCheck className="w-5 h-5 text-brand-gold shrink-0 mt-0.5" />
                    <span>
                      <strong className="text-white">Private wholesale pricing:</strong> Competitors on the same street cannot see your prices. Only buyers you personally verify get catalog access.
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-brand-gold shrink-0 mt-0.5" />
                    <span>
                      <strong className="text-white">Fast carton packing:</strong> Turn scattered WhatsApp audio notes into 1 clean checklist. Check off items and lock prices with 1 tap.
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Wallet className="w-5 h-5 text-brand-gold shrink-0 mt-0.5" />
                    <span>
                      <strong className="text-white">Accurate debt records:</strong> Log partial M-Pesa installments with transaction reference codes. Know your total market receivables instantly.
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <TrendingDown className="w-5 h-5 text-brand-gold shrink-0 mt-0.5" />
                    <span>
                      <strong className="text-white">Pay only when you pack:</strong> KSh 50 to KSh 100 per carton. Zero monthly rent or fixed deductions.
                    </span>
                  </li>
                </ul>
              </div>

              <div className="mt-8 pt-6 border-t border-white/10">
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
            <div className="rounded-3xl border border-white/15 bg-[#101428] p-7 sm:p-9 flex flex-col justify-between shadow-2xl">
              <div>
                <div className="flex items-center justify-between mb-6">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-400 font-black text-xs">
                    <ShoppingBag className="w-3.5 h-3.5" /> For Retailers &amp; Hawkers
                  </span>
                  <span className="text-xs text-emerald-400 font-extrabold">100% Free Forever</span>
                </div>

                <h3 className="text-2xl font-black text-white">
                  Order from Nairobi at Wholesale Rates with Total Transparency
                </h3>

                <ul className="mt-6 space-y-4 text-sm sm:text-base text-slate-300">
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                    <span>
                      <strong className="text-white">Direct Nairobi wholesale access:</strong> Browse genuine stock from trusted suppliers without having to travel to Nairobi in person.
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Package className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                    <span>
                      <strong className="text-white">Custom item sourcing:</strong> Need a phone cover or tempered glass model not listed? Request custom sourcing and the seller quotes it for you.
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Clock className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                    <span>
                      <strong className="text-white">Proof of payment &amp; credit:</strong> Submit your M-Pesa transaction reference code directly to the order and view agreed payment due dates.
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Smartphone className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                    <span>
                      <strong className="text-white">Zero fees for buyers:</strong> Shopkeepers and hawkers across Mombasa, Kisumu, Nakuru, and all towns pay KSh 0 forever.
                    </span>
                  </li>
                </ul>
              </div>

              <div className="mt-8 pt-6 border-t border-white/10">
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full rounded-full border border-white/20 hover:border-emerald-400/60 text-white font-bold h-12"
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
      {/* SECTION 5: HOSTINGER-STYLE PRICING CALCULATOR (High-Energy Glow Section)   */}
      {/* ========================================================================= */}
      <Section spacing="lg" className="bg-[#06070E] border-b border-white/5 relative" id="pricing">
        <Container size="lg">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xs sm:text-sm font-extrabold text-brand-gold tabular-nums">04</span>
            <span className="text-xs sm:text-sm font-bold uppercase tracking-widest text-slate-400">Transparent Pricing</span>
            <span className="flex-1 h-px bg-white/10" />
          </div>

          <div className="max-w-3xl mb-12">
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
              Pay Only When You Pack. Zero Monthly Subscriptions.
            </h2>
            <p className="mt-3 text-base sm:text-xl text-slate-300 font-medium">
              No KSh 1,500/month recurring drain. Keep 100% of your money when trade is slow. Pay just KSh 50 to KSh 100 only when you lock and dispatch a real carton.
            </p>
          </div>

          {/* Interactive Calculator Card */}
          <div className="rounded-3xl border-2 border-brand-gold/40 bg-[#121528] p-6 sm:p-10 shadow-2xl mb-12 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-80 h-80 bg-brand-gold/10 rounded-full blur-3xl pointer-events-none" />

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-white/10 relative z-10">
              <div>
                <span className="text-xs font-black uppercase tracking-wider text-brand-gold">
                  Live Fee Calculator
                </span>
                <h3 className="text-2xl font-black text-white mt-1">
                  Estimate Your Fee Per Locked Order
                </h3>
              </div>
              <div className="text-left md:text-right">
                <span className="text-xs text-slate-400 uppercase tracking-wider block">Nyakizu Platform Fee</span>
                <span className="text-4xl font-black text-brand-gold tabular-nums">
                  KSh {computedFee}
                </span>
                <span className="text-xs text-slate-400 block mt-0.5">
                  ({effectivePercentage}% of order total &middot; Capped at KSh 100 max)
                </span>
              </div>
            </div>

            {/* Slider */}
            <div className="py-8 relative z-10">
              <div className="flex justify-between items-center mb-3">
                <label htmlFor="order-value-slider" className="text-sm font-bold text-white">
                  Order / Carton Value:{" "}
                  <span className="text-brand-gold font-black text-lg">
                    KSh {orderValue.toLocaleString()}
                  </span>
                </label>
                <span className="text-xs text-slate-400">Min KSh 2,000 &mdash; Max KSh 80,000+</span>
              </div>

              <input
                id="order-value-slider"
                type="range"
                min={2000}
                max={80000}
                step={1000}
                value={orderValue}
                onChange={(e) => setOrderValue(Number(e.target.value))}
                className="w-full h-3 bg-[#1B203C] rounded-lg appearance-none cursor-pointer accent-brand-gold focus:outline-none"
              />

              <div className="flex justify-between text-xs text-slate-400 mt-2 font-mono">
                <span>KSh 2,000</span>
                <span>KSh 25,000</span>
                <span>KSh 50,000</span>
                <span>KSh 80,000+</span>
              </div>
            </div>

            {/* Metric Tiles */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2 relative z-10">
              <div className="rounded-2xl border border-white/10 bg-[#161B33] p-4 text-center">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Order Value</span>
                <span className="text-lg sm:text-xl font-bold text-white tabular-nums mt-1 block">
                  KSh {orderValue.toLocaleString()}
                </span>
              </div>
              <div className="rounded-2xl border border-brand-gold/50 bg-brand-gold/15 p-4 text-center">
                <span className="text-[11px] font-black text-brand-gold uppercase tracking-wider block">Wholesaler Fee</span>
                <span className="text-lg sm:text-xl font-black text-brand-gold tabular-nums mt-1 block">
                  KSh {computedFee}
                </span>
              </div>
              <div className="rounded-2xl border border-white/10 bg-[#161B33] p-4 text-center">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Effective Rate</span>
                <span className="text-lg sm:text-xl font-bold text-white tabular-nums mt-1 block">
                  {effectivePercentage}%
                </span>
              </div>
              <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-center">
                <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider block">Buyer / Hawkers Fee</span>
                <span className="text-lg sm:text-xl font-bold text-emerald-400 tabular-nums mt-1 block">
                  KSh 0 (Free)
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-400 text-center mt-6">
              * The fee is strictly capped at KSh 100 maximum, no matter how valuable the carton is. That is less than the margin on a single phone screen protector.
            </p>
          </div>

          {/* 3 Tier Cards */}
          <div className="grid md:grid-cols-3 gap-6">
            {/* Tier 1 */}
            <div className="rounded-3xl border border-white/10 bg-[#12162B] p-6 sm:p-8 flex flex-col justify-between shadow-xl">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Test Risk-Free</span>
                <h3 className="text-xl font-bold text-white mt-1">First 3 Orders Free</h3>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-3xl font-extrabold text-white">KSh 0</span>
                  <span className="text-xs text-slate-400">/ first 3 orders</span>
                </div>
                <p className="mt-3 text-sm text-slate-300 leading-relaxed">
                  Every new wholesale account gets 3 complete order lockups completely free. Experience the speed before spending a shilling.
                </p>

                <ul className="mt-6 space-y-3 text-sm text-slate-300">
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> 3 Full order lockups included
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> Zero deposit or credit card
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> Full access to live debt ledger
                  </li>
                </ul>
              </div>

              <div className="mt-8 pt-5 border-t border-white/10">
                <Button variant="outline" className="w-full rounded-full border-white/20 text-white" asChild>
                  <Link href="/register?role=seller">Sign Up Free</Link>
                </Button>
              </div>
            </div>

            {/* Tier 2: Wholesale Pay-As-You-Pack (Featured) */}
            <div className="rounded-3xl border-2 border-brand-gold bg-[#141830] p-6 sm:p-8 flex flex-col justify-between relative shadow-2xl">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-brand-gold text-slate-950 font-black text-xs tracking-wide shadow-sm">
                Most Popular for Wholesalers
              </div>

              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-brand-gold">Pay-As-You-Pack</span>
                <h3 className="text-xl font-bold text-white mt-1">Wholesale Per-Order Fee</h3>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-3xl sm:text-4xl font-black text-brand-gold">KSh 50 &ndash; 100</span>
                  <span className="text-xs text-slate-400">/ locked order</span>
                </div>
                <p className="mt-3 text-sm text-slate-300 leading-relaxed">
                  Only charged when you lock an order and prepare to dispatch. Zero charges during quiet weeks.
                </p>

                <ul className="mt-6 space-y-3 text-sm text-slate-300">
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

              <div className="mt-8 pt-5 border-t border-white/10">
                <Button className="w-full rounded-full bg-brand-gold hover:bg-brand-gold-dark text-slate-950 font-black shadow-brand" asChild>
                  <Link href="/register?role=seller">Open Wholesale Shop</Link>
                </Button>
              </div>
            </div>

            {/* Tier 3: Retailers & Hawkers */}
            <div className="rounded-3xl border border-white/10 bg-[#12162B] p-6 sm:p-8 flex flex-col justify-between shadow-xl">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">For Countrywide Buyers</span>
                <h3 className="text-xl font-bold text-white mt-1">Retailers &amp; Hawkers</h3>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-3xl font-extrabold text-emerald-400">KSh 0</span>
                  <span className="text-xs text-slate-400">/ forever</span>
                </div>
                <p className="mt-3 text-sm text-slate-300 leading-relaxed">
                  Retail shopkeepers, stall managers, and hawkers across Kenya order through Nyakizu completely free.
                </p>

                <ul className="mt-6 space-y-3 text-sm text-slate-300">
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> 100% Free forever for buyers
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> Order from multiple wholesalers
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> Shared credit &amp; payment claims
                  </li>
                </ul>
              </div>

              <div className="mt-8 pt-5 border-t border-white/10">
                <Button variant="outline" className="w-full rounded-full border-white/20 text-white" asChild>
                  <Link href="/register?role=buyer">Join as Buyer (Free)</Link>
                </Button>
              </div>
            </div>
          </div>
        </Container>
      </Section>

      {/* Community Proof */}
      <CommunityActivity />

      {/* ========================================================================= */}
      {/* SECTION 6: FAQ ACCORDION (Midnight Section)                               */}
      {/* ========================================================================= */}
      <Section spacing="lg" className="bg-[#0C0F22] border-b border-white/5" id="faq">
        <Container size="md">
          <div className="flex items-center gap-2 mb-4 justify-center">
            <span className="text-xs sm:text-sm font-extrabold text-brand-gold tabular-nums">05</span>
            <span className="text-xs sm:text-sm font-bold uppercase tracking-widest text-slate-400">Questions &amp; Answers</span>
          </div>

          <div className="text-center max-w-xl mx-auto mb-10 sm:mb-12">
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
              Frequently Asked Questions
            </h2>
            <p className="mt-2 text-slate-300 text-sm sm:text-base">
              Everything you need to know about pricing, privacy, and how Nyakizu works.
            </p>
          </div>

          <div className="space-y-3">
            {FAQS.map((faq, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div
                  key={faq.q}
                  className="rounded-2xl border border-white/10 bg-[#13162C] overflow-hidden transition-colors"
                >
                  <button
                    type="button"
                    onClick={() => toggleFaq(idx)}
                    className="w-full px-5 py-4 sm:px-6 sm:py-5 text-left flex items-center justify-between gap-4 font-bold text-white text-base sm:text-lg hover:text-brand-gold transition-colors"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      className={`w-5 h-5 shrink-0 transition-transform duration-200 ${
                        isOpen ? "rotate-180 text-brand-gold" : "text-slate-400"
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 sm:px-6 sm:pb-6 text-sm sm:text-base text-slate-300 leading-relaxed border-t border-white/5 pt-4">
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
      {/* SECTION 7: CLOSING CTA (High-Energy Gradient Card)                        */}
      {/* ========================================================================= */}
      <Section spacing="lg" className="bg-[#070810] relative overflow-hidden">
        <Container size="lg">
          <div className="relative rounded-3xl border-2 border-brand-gold/50 bg-gradient-to-r from-brand-gold/15 via-[#191D38] to-purple-600/15 p-8 sm:p-14 text-center shadow-2xl overflow-hidden">
            <div className="relative z-10 max-w-2xl mx-auto space-y-5">
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-brand-gold/20 text-brand-gold font-black text-xs uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" /> Start Digitizing Your Business Today
              </span>

              <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
                Put Your Wholesale Orders &amp; Credit on Your Phone.
              </h2>

              <p className="text-slate-300 text-base sm:text-lg leading-relaxed">
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
                  className="w-full sm:w-auto rounded-full border border-white/20 hover:border-brand-gold/50 text-white font-bold px-8 text-base h-14"
                  asChild
                >
                  <Link href="/contact">Talk to Our Nairobi Team</Link>
                </Button>
              </div>

              <p className="text-xs text-slate-400 pt-2 font-mono">
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
