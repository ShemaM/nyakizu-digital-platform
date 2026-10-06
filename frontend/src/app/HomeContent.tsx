"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, type Variants } from "motion/react";
import {
  BookX,
  MessagesSquare,
  CheckCircle2,
  Lock,
  Wallet,
  Smartphone,
  Truck,
  ArrowRight,
  Sparkles,
  ChevronDown,
  ShieldCheck,
  Store,
  ShoppingBag,
  TrendingDown,
  FileSpreadsheet,
  Package,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Container, Section, LandingHeader, LandingFooter } from "@/components/layouts";
import CommunityActivity from "@/components/landing/CommunityActivity";

// Shared spring and stagger transitions
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
  // --- Section 1 Hero: Interactive Live Two-Way Preview State ---
  const [activeRoleView, setActiveRoleView] = useState<"seller" | "buyer">("seller");
  const [orderLocked, setOrderLocked] = useState(true);

  // --- Section 4: Interactive Pricing Calculator State ---
  const [sliderCartonValue, setSliderCartonValue] = useState<number>(24000);

  // Pricing calculation:
  // KSh 50 minimum up to KSh 100 maximum cap
  // 0.5% calculation rounded to nearest 5 KES, clamped between 50 and 100
  const computedFee = Math.min(100, Math.max(50, Math.round((sliderCartonValue * 0.005) / 5) * 5));
  const effectivePercentage = ((computedFee / sliderCartonValue) * 100).toFixed(2);

  // --- Section 7: FAQ Accordion State ---
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const toggleFaq = (index: number) => {
    setOpenFaqIndex((prev) => (prev === index ? null : index));
  };

  const FAQS = [
    {
      question: "Why do wholesalers pay KSh 50 to KSh 100 per order instead of a monthly fee?",
      answer:
        "Fixed monthly subscriptions (like KSh 1,500/month) drain your working capital during slow weeks and demand payment even when trade is quiet. With Nyakizu, you only pay when you actually pack and lock a carton. Small orders pay KSh 50; large cartons (even KSh 80,000+) are strictly capped at KSh 100. If you don't pack, you pay KSh 0.",
    },
    {
      question: "Do retail shopkeepers and hawkers across Kenya have to pay anything?",
      answer:
        "No. Nyakizu is 100% free forever for all retail buyers, stall owners, and hawkers. Buyers never pay a sign-up fee, membership fee, or per-order fee. They browse catalogs, place orders, and view credit balances at zero cost.",
    },
    {
      question: "How do sellers pay the per-order fee?",
      answer:
        "Sellers top up a small prepaid balance directly via M-Pesa Daraja (STK Push or Paybill) whenever convenient. Your first 3 orders are 100% free with zero deposit. When you lock a packed carton, the fee (KSh 50 to KSh 100) is deducted from your balance.",
    },
    {
      question: "Can competing wholesale shops on Luthuli Avenue see my prices?",
      answer:
        "Never. Nyakizu is not an open public directory where competitors can scrape your prices. Your catalog is private. Only verified buyers you personally approve can view your inventory and prices.",
    },
    {
      question: "Does Nyakizu work when network data or CBD connectivity is unstable?",
      answer:
        "Yes. While we are continuously engineering offline sync, the platform is currently built ultra-lightweight. It loads in seconds, uses minimal Safaricom bundles, and reliably preserves your data even on fluctuating 3G/4G connections across wholesale streets and transit hubs.",
    },
    {
      question: "Can we record shuttle parcel waybills (e.g., North Rift, Guardian, Tahmeed)?",
      answer:
        "Yes! When packing an order, you can log the parcel shuttle name (North Rift, Guardian, Tahmeed, 2NK, etc.), booking receipt number, and destination stage. Both the wholesaler and the buyer get a synchronized receipt with parcel details.",
    },
  ];

  return (
    <div className="min-h-screen bg-dark-primary text-text-primary selection:bg-brand-gold/20">
      <LandingHeader />

      {/* ========================================================================= */}
      {/* SECTION 1: HERO (High-Impact Hostinger-Style with Interactive Preview)    */}
      {/* ========================================================================= */}
      <section className="relative overflow-hidden bg-gradient-hero pt-24 pb-14 sm:pt-36 sm:pb-24 border-b border-dark-accent">
        <Container size="xl" className="relative z-10">
          <div className="grid lg:grid-cols-12 gap-10 lg:gap-8 items-center">
            {/* Left Column: Messaging & Action */}
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              animate="show"
              className="lg:col-span-7 text-center lg:text-left"
            >
              {/* Trust Badge */}
              <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-brand-gold/30 bg-brand-gold/10 text-brand-gold text-xs sm:text-sm font-bold mb-4 sm:mb-6">
                <span className="w-2 h-2 rounded-full bg-brand-gold animate-pulse" aria-hidden="true" />
                <span>🇰🇪 The Digital Counter Book for Kenya&apos;s Phone Accessories Trade</span>
              </motion.div>

              {/* Main Headline */}
              <motion.h1
                variants={fadeUp}
                className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.12] text-text-primary"
              >
                From Nairobi Wholesale Shops to Traders Across Kenya —{" "}
                <span className="text-brand-gold">Trade with 100% Trust.</span>
              </motion.h1>

              {/* Clarifying Subtitle */}
              <motion.p
                variants={fadeUp}
                className="mt-4 sm:mt-6 text-base sm:text-xl text-text-secondary leading-relaxed max-w-2xl mx-auto lg:mx-0"
              >
                Digitize your orders, stock, and credit records. Keep your trusted suppliers, your loyal buyers, and your credit agreements — just leave the worn-out counter books and WhatsApp chaos behind.
              </motion.p>

              {/* Dual Action CTAs */}
              <motion.div
                variants={fadeUp}
                className="mt-6 sm:mt-8 flex flex-col sm:flex-row items-stretch sm:items-center justify-center lg:justify-start gap-3 sm:gap-4"
              >
                <Button
                  size="lg"
                  className="rounded-full bg-brand-gold hover:bg-brand-gold-dark text-slate-950 font-extrabold shadow-brand px-8 text-base h-14"
                  asChild
                >
                  <Link href="/register?role=seller">
                    Open Your Wholesale Shop — Free
                    <ArrowRight className="w-5 h-5 ml-1.5" />
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="rounded-full border-2 border-dark-accent hover:border-brand-gold/40 text-text-primary font-bold px-6 text-base h-14"
                  asChild
                >
                  <Link href="#pricing">See How Trade Syncs ↓</Link>
                </Button>
              </motion.div>

              {/* Four Trust Badges */}
              <motion.div
                variants={fadeUp}
                className="mt-6 sm:mt-8 flex flex-wrap items-center justify-center lg:justify-start gap-x-5 gap-y-2 text-xs sm:text-sm text-text-muted"
              >
                <span className="flex items-center gap-1.5 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-success" /> Zero Monthly Subscription
                </span>
                <span className="flex items-center gap-1.5 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-success" /> KSh 50–100 Only When Packed
                </span>
                <span className="flex items-center gap-1.5 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-success" /> Retailers &amp; Hawkers Pay KSh 0
                </span>
                <span className="flex items-center gap-1.5 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-success" /> Runs Fast on Tecno &amp; Infinix
                </span>
              </motion.div>
            </motion.div>

            {/* Right Column: Live Interactive Two-Way Preview Card */}
            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="show"
              className="lg:col-span-5 flex justify-center"
            >
              <div className="w-full max-w-md rounded-2xl border border-dark-accent bg-dark-card shadow-2xl overflow-hidden">
                {/* Header with Switcher Tabs */}
                <div className="p-3 bg-dark-secondary border-b border-dark-accent flex items-center justify-between">
                  <div className="flex items-center gap-1.5 bg-dark-tertiary p-1 rounded-xl">
                    <button
                      type="button"
                      onClick={() => setActiveRoleView("seller")}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                        activeRoleView === "seller"
                          ? "bg-brand-gold text-slate-950 shadow-sm"
                          : "text-text-muted hover:text-text-primary"
                      }`}
                    >
                      Wholesaler View (Nairobi)
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveRoleView("buyer")}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                        activeRoleView === "buyer"
                          ? "bg-brand-gold text-slate-950 shadow-sm"
                          : "text-text-muted hover:text-text-primary"
                      }`}
                    >
                      Buyer View (Kisumu)
                    </button>
                  </div>
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-success px-2 py-0.5 rounded-full bg-success/10">
                    <span className="w-1.5 h-1.5 rounded-full bg-success animate-ping" /> Live Sync
                  </span>
                </div>

                {/* Content Area */}
                <div className="p-5 space-y-4">
                  {/* Order Header */}
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[11px] font-extrabold uppercase tracking-wider text-text-muted">
                        Carton Order #NYK-1084
                      </span>
                      <h4 className="text-base font-bold text-text-primary mt-0.5">
                        {activeRoleView === "seller" ? "Buyer: Kisumu Mobile Zone" : "Wholesaler: Luthuli Apex Wholesale"}
                      </h4>
                      <p className="text-xs text-text-muted">
                        {activeRoleView === "seller" ? "Dispatched from CBD Nairobi" : "Destination: Kisumu CBD Stage"}
                      </p>
                    </div>
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
                        orderLocked
                          ? "bg-brand-gold/15 text-brand-gold border border-brand-gold/30"
                          : "bg-info/15 text-info border border-info/30"
                      }`}
                    >
                      {orderLocked ? <Lock className="w-3 h-3" /> : <Package className="w-3 h-3" />}
                      {orderLocked ? "Carton Locked" : "Packing in Progress"}
                    </span>
                  </div>

                  {/* Packed Items List */}
                  <div className="rounded-xl border border-dark-accent bg-dark-secondary/50 p-3 space-y-2">
                    <div className="text-[11px] font-bold text-text-muted uppercase tracking-wider flex justify-between">
                      <span>Itemized Packed Goods</span>
                      <span>Subtotal</span>
                    </div>
                    <div className="text-xs flex justify-between items-center text-text-primary">
                      <span>50x 65W Fast Type-C Chargers</span>
                      <span className="font-semibold tabular-nums">KSh 12,500</span>
                    </div>
                    <div className="text-xs flex justify-between items-center text-text-primary">
                      <span>100x 9D Tempered Glass (Tecno/Samsung)</span>
                      <span className="font-semibold tabular-nums">KSh 7,000</span>
                    </div>
                    <div className="text-xs flex justify-between items-center text-text-primary">
                      <span>30x Heavy-Duty Transparent Cases</span>
                      <span className="font-semibold tabular-nums">KSh 4,500</span>
                    </div>
                  </div>

                  {/* Shuttle Parcel Dispatch Tag */}
                  <div className="rounded-xl border border-dark-accent/80 bg-dark-secondary p-3 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-brand-gold/15 text-brand-gold flex items-center justify-center">
                        <Truck className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-text-primary">North Rift Shuttle</p>
                        <p className="text-[11px] text-text-muted">Waybill #NR-9284 &middot; Kisumu Office</p>
                      </div>
                    </div>
                    <span className="text-xs font-semibold text-success">Dispatched</span>
                  </div>

                  {/* Shared Credit & Ledger Summary */}
                  <div className="rounded-xl border border-dark-accent bg-dark-tertiary p-3 space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-text-muted">Total Carton Value</span>
                      <span className="font-bold text-text-primary tabular-nums">KSh 24,000</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-text-muted">Paid via M-Pesa (Tranche 1)</span>
                      <span className="font-bold text-success tabular-nums">- KSh 14,000</span>
                    </div>
                    <div className="h-px bg-dark-accent" />
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-brand-gold">Outstanding Credit (Chukua Uza)</span>
                      <span className="font-extrabold text-brand-gold tabular-nums">KSh 10,000</span>
                    </div>
                  </div>

                  {/* Fee Transparency Note */}
                  <div className="flex items-center justify-between text-[11px] pt-1 text-text-muted">
                    <span>
                      {activeRoleView === "seller"
                        ? "Wholesale Fee for this KSh 24k carton: KSh 70"
                        : "Buyer Fee: KSh 0 (100% Free)"}
                    </span>
                    <button
                      type="button"
                      onClick={() => setOrderLocked(!orderLocked)}
                      className="text-brand-gold hover:underline font-semibold"
                    >
                      Toggle Lock Status
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </Container>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 2: THE THREE ANALOG PAINS WE DIGITIZE (Before vs. After)          */}
      {/* ========================================================================= */}
      <Section spacing="lg" className="bg-dark-secondary border-b border-dark-accent" id="pains">
        <Container size="lg">
          <SectionKicker index="01" label="Ground Reality" />
          <div className="max-w-3xl mb-10 sm:mb-14">
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-text-primary leading-snug sm:leading-tight">
              The Counter Book &amp; WhatsApp Audio Notes Were Never Made for 50 Cartons a Week
            </h2>
            <p className="mt-3 text-text-secondary text-base sm:text-xl leading-relaxed">
              When orders flow daily between Nairobi, Mombasa, Kisumu, and Eldoret, small analog slips turn into lost money, missed shuttles, and broken trust between brothers.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Comparison 1 */}
            <div className="rounded-2xl border border-dark-accent bg-dark-card p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-error/15 text-error flex items-center justify-center">
                    <MessagesSquare className="w-5 h-5" />
                  </div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-error px-2 py-0.5 rounded bg-error/10">
                    Analog Chaos
                  </span>
                </div>
                <h3 className="text-lg font-bold text-text-primary">The 20-Message Audio Mess</h3>
                <p className="mt-2 text-sm text-text-secondary leading-relaxed">
                  Buyers send 15 voice notes, half-typed lists, and forwarded photos. In the rush of Luthuli Avenue, items get skipped and wrong models get packed.
                </p>
              </div>

              <div className="mt-6 pt-5 border-t border-dark-accent">
                <div className="flex items-center gap-2 text-success font-bold text-xs uppercase tracking-wider mb-1.5">
                  <CheckCircle2 className="w-4 h-4" /> Nyakizu Digital Fix
                </div>
                <p className="text-sm font-medium text-text-primary">
                  1-Tap Itemized Orders with exact models, quantities, and agreed prices. Zero missed items.
                </p>
              </div>
            </div>

            {/* Comparison 2 */}
            <div className="rounded-2xl border border-dark-accent bg-dark-card p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-warning/15 text-warning flex items-center justify-center">
                    <Package className="w-5 h-5" />
                  </div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-warning px-2 py-0.5 rounded bg-warning/10">
                    Packing Disputes
                  </span>
                </div>
                <h3 className="text-lg font-bold text-text-primary">Changed Minds at the Shuttle Stage</h3>
                <p className="mt-2 text-sm text-text-secondary leading-relaxed">
                  You spend 45 minutes sealing a carton, carry it to the North Rift or Guardian office, and the buyer calls wanting to edit items or renegotiate price.
                </p>
              </div>

              <div className="mt-6 pt-5 border-t border-dark-accent">
                <div className="flex items-center gap-2 text-success font-bold text-xs uppercase tracking-wider mb-1.5">
                  <Lock className="w-4 h-4" /> Nyakizu Digital Fix
                </div>
                <p className="text-sm font-medium text-text-primary">
                  Locked Cartons. Once packed and locked, the item list and carton total are permanent. Neither party can alter history.
                </p>
              </div>
            </div>

            {/* Comparison 3 */}
            <div className="rounded-2xl border border-dark-accent bg-dark-card p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-violet-500/15 text-violet-400 flex items-center justify-center">
                    <BookX className="w-5 h-5" />
                  </div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-violet-400 px-2 py-0.5 rounded bg-violet-500/10">
                    Lost Records
                  </span>
                </div>
                <h3 className="text-lg font-bold text-text-primary">Daftari Imepotea (Torn Debt Pages)</h3>
                <p className="mt-2 text-sm text-text-secondary leading-relaxed">
                  Trade runs on credit (<em>chukua uza, lipa baadaye</em>). Counter books get water damage, worn pages go missing, and traders argue about who owes what.
                </p>
              </div>

              <div className="mt-6 pt-5 border-t border-dark-accent">
                <div className="flex items-center gap-2 text-success font-bold text-xs uppercase tracking-wider mb-1.5">
                  <Wallet className="w-4 h-4" /> Nyakizu Digital Fix
                </div>
                <p className="text-sm font-medium text-text-primary">
                  Shared Live Ledger. Both seller and buyer see the exact same balance and M-Pesa payments in real-time.
                </p>
              </div>
            </div>
          </div>
        </Container>
      </Section>

      {/* ========================================================================= */}
      {/* SECTION 3: DUAL TRADE HUB (Wholesalers ⟷ Countrywide Retailers)           */}
      {/* ========================================================================= */}
      <Section spacing="lg" className="bg-dark-primary border-b border-dark-accent" id="network">
        <Container size="lg">
          <SectionKicker index="02" label="Two Sides of the Trade" />
          <div className="max-w-2xl mb-10 sm:mb-14">
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-text-primary leading-snug sm:leading-tight">
              Tailored for Nairobi Wholesalers &amp; Countrywide Retailers
            </h2>
            <p className="mt-2.5 sm:mt-3 text-text-secondary text-base sm:text-xl">
              Nyakizu connects wholesale shops in Nairobi CBD with stalls, repair shops, and hawkers across Kenya.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Wholesalers Card */}
            <div className="rounded-3xl border-2 border-brand-gold/30 bg-dark-card p-6 sm:p-8 flex flex-col justify-between relative overflow-hidden">
              <div className="absolute top-0 right-0 w-36 h-36 bg-brand-gold/5 rounded-full blur-2xl pointer-events-none" />
              <div>
                <div className="flex items-center justify-between mb-6">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-gold/15 text-brand-gold font-bold text-xs">
                    <Store className="w-3.5 h-3.5" /> For Wholesale Shop Owners
                  </span>
                  <span className="text-xs text-text-muted">Nairobi CBD &middot; Luthuli &middot; Eastleigh</span>
                </div>

                <h3 className="text-xl sm:text-2xl font-bold text-text-primary">
                  Protect Your Margin, Speed Up Packing, and Secure Your Credit
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
                      <strong className="text-text-primary">Fast carton packing:</strong> Turn 10 scattered WhatsApp audio notes into 1 clean packing list. Pack and lock cartons in half the time.
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Wallet className="w-5 h-5 text-brand-gold shrink-0 mt-0.5" />
                    <span>
                      <strong className="text-text-primary">Accurate debt records:</strong> Log partial M-Pesa installments with 2 taps. Know your total market receivables instantly.
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <TrendingDown className="w-5 h-5 text-brand-gold shrink-0 mt-0.5" />
                    <span>
                      <strong className="text-text-primary">Pay only when you pack:</strong> KSh 50 to KSh 100 per carton. No monthly rent or fixed deductions.
                    </span>
                  </li>
                </ul>
              </div>

              <div className="mt-8 pt-6 border-t border-dark-accent">
                <Button
                  size="lg"
                  className="w-full rounded-full bg-brand-gold hover:bg-brand-gold-dark text-slate-950 font-bold shadow-md"
                  asChild
                >
                  <Link href="/register?role=seller">Open Wholesale Shop (3 Orders Free)</Link>
                </Button>
              </div>
            </div>

            {/* Retailers & Hawkers Card */}
            <div className="rounded-3xl border border-dark-accent bg-dark-secondary p-6 sm:p-8 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-6">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-success/15 text-success font-bold text-xs">
                    <ShoppingBag className="w-3.5 h-3.5" /> For Retailers &amp; Hawkers
                  </span>
                  <span className="text-xs text-success font-bold">100% Free Forever</span>
                </div>

                <h3 className="text-xl sm:text-2xl font-bold text-text-primary">
                  Order from Nairobi at Wholesale Rates with Total Transparency
                </h3>

                <ul className="mt-6 space-y-4 text-sm sm:text-base text-text-secondary">
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-success shrink-0 mt-0.5" />
                    <span>
                      <strong className="text-text-primary">Direct Nairobi wholesale access:</strong> Browse genuine stock from trusted suppliers without having to travel to Nairobi in person.
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Truck className="w-5 h-5 text-success shrink-0 mt-0.5" />
                    <span>
                      <strong className="text-text-primary">Instant shuttle waybill tracking:</strong> Know the exact booking receipt and stage (North Rift, Guardian, Tahmeed) the minute your carton is dispatched.
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <FileSpreadsheet className="w-5 h-5 text-success shrink-0 mt-0.5" />
                    <span>
                      <strong className="text-text-primary">Proof of payment &amp; credit:</strong> Protect your standing and reputation. Every shilling paid on M-Pesa is recorded so credit disputes never arise.
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
                  className="w-full rounded-full border-2 border-dark-accent hover:border-success/50 text-text-primary font-bold"
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
          <SectionKicker index="03" label="Transparent Pricing" />
          <div className="max-w-3xl mb-10 sm:mb-12">
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-text-primary leading-snug sm:leading-tight">
              Pay Only When You Pack. Zero Monthly Subscriptions.
            </h2>
            <p className="mt-3 text-text-secondary text-base sm:text-xl leading-relaxed">
              No KSh 1,500/month deduction. Keep 100% of your money when trade is slow. Pay just KSh 50 to KSh 100 only when you lock and dispatch a real carton.
            </p>
          </div>

          {/* Interactive Calculator Slider Card */}
          <div className="rounded-3xl border-2 border-brand-gold/30 bg-dark-card p-6 sm:p-10 shadow-2xl mb-12">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-dark-accent">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-brand-gold">
                  Interactive Fee Calculator
                </span>
                <h3 className="text-xl sm:text-2xl font-bold text-text-primary mt-1">
                  See how small your fee is per carton
                </h3>
              </div>
              <div className="text-left md:text-right">
                <span className="text-xs text-text-muted uppercase tracking-wider block">Nyakizu Platform Fee</span>
                <span className="text-3xl sm:text-4xl font-black text-brand-gold tabular-nums">
                  KSh {computedFee}
                </span>
                <span className="text-xs text-text-muted block mt-0.5">
                  ({effectivePercentage}% of carton value &middot; Capped at KSh 100)
                </span>
              </div>
            </div>

            {/* Slider Control */}
            <div className="py-8">
              <div className="flex justify-between items-center mb-3">
                <label htmlFor="carton-value-slider" className="text-sm font-bold text-text-primary">
                  Order / Carton Value:{" "}
                  <span className="text-brand-gold font-extrabold text-base">
                    KSh {sliderCartonValue.toLocaleString()}
                  </span>
                </label>
                <span className="text-xs text-text-muted">Min KSh 2,000 &mdash; Max KSh 80,000+</span>
              </div>

              <input
                id="carton-value-slider"
                type="range"
                min={2000}
                max={80000}
                step={1000}
                value={sliderCartonValue}
                onChange={(e) => setSliderCartonValue(Number(e.target.value))}
                className="w-full h-3 bg-dark-secondary rounded-lg appearance-none cursor-pointer accent-brand-gold focus:outline-none"
              />

              <div className="flex justify-between text-xs text-text-muted mt-2">
                <span>KSh 2k (Small parcel)</span>
                <span>KSh 25k (Standard carton)</span>
                <span>KSh 50k (Master carton)</span>
                <span>KSh 80k+ (Bulk order)</span>
              </div>
            </div>

            {/* 4 Quick Stat Metric Tiles */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4">
              <div className="rounded-2xl border border-dark-accent bg-dark-secondary/60 p-4 text-center">
                <span className="text-[11px] font-bold text-text-muted uppercase tracking-wider block">Carton Value</span>
                <span className="text-lg sm:text-xl font-bold text-text-primary tabular-nums mt-1 block">
                  KSh {sliderCartonValue.toLocaleString()}
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

          {/* 3 Hostinger-Style Plan Cards */}
          <div className="grid md:grid-cols-3 gap-6">
            {/* Card 1: Free Trial */}
            <div className="rounded-3xl border border-dark-accent bg-dark-card p-6 flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-text-muted">Test Risk-Free</span>
                <h3 className="text-xl font-bold text-text-primary mt-1">First 3 Orders Free</h3>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-3xl font-extrabold text-text-primary">KSh 0</span>
                  <span className="text-xs text-text-muted">/ first 3 cartons</span>
                </div>
                <p className="mt-3 text-sm text-text-secondary leading-relaxed">
                  Every new wholesale account gets 3 complete order lockups completely free. Experience the speed before spending a shilling.
                </p>

                <ul className="mt-6 space-y-3 text-sm text-text-secondary">
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-success shrink-0" /> 3 Full carton lockups
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-success shrink-0" /> Zero deposit or credit card
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-success shrink-0" /> Full access to live ledger
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-success shrink-0" /> Shuttle dispatch receipts
                  </li>
                </ul>
              </div>

              <div className="mt-8 pt-5 border-t border-dark-accent">
                <Button variant="outline" className="w-full rounded-full" asChild>
                  <Link href="/register?role=seller">Sign Up Free</Link>
                </Button>
              </div>
            </div>

            {/* Card 2: Wholesale Pay-As-You-Pack (Featured) */}
            <div className="rounded-3xl border-2 border-brand-gold bg-dark-card p-6 flex flex-col justify-between relative shadow-xl">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-brand-gold text-slate-950 font-extrabold text-xs tracking-wide shadow-sm">
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
                    <CheckCircle2 className="w-4 h-4 text-brand-gold shrink-0" /> Instant top-up via M-Pesa
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-brand-gold shrink-0" /> Locked permanent carton record
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-brand-gold shrink-0" /> Shared buyer debt ledger
                  </li>
                </ul>
              </div>

              <div className="mt-8 pt-5 border-t border-dark-accent">
                <Button className="w-full rounded-full bg-brand-gold hover:bg-brand-gold-dark text-slate-950 font-extrabold shadow-brand" asChild>
                  <Link href="/register?role=seller">Open Wholesale Shop</Link>
                </Button>
              </div>
            </div>

            {/* Card 3: Retailers & Hawkers */}
            <div className="rounded-3xl border border-dark-accent bg-dark-card p-6 flex flex-col justify-between">
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
                    <CheckCircle2 className="w-4 h-4 text-success shrink-0" /> Real-time parcel waybill updates
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-success shrink-0" /> Clear record of debt and payments
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
      {/* SECTION 5: BENTO GRID (Ground-Engineered Features for Kenyan Realities)    */}
      {/* ========================================================================= */}
      <Section spacing="lg" className="bg-dark-primary border-b border-dark-accent" id="features">
        <Container size="lg">
          <SectionKicker index="04" label="Ground Realities" />
          <div className="max-w-2xl mb-10 sm:mb-14">
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-text-primary leading-snug sm:leading-tight">
              Engineered for Nairobi Streets, Transit Shuttles &amp; Brotherhood
            </h2>
            <p className="mt-2.5 sm:mt-3 text-text-secondary text-base sm:text-xl">
              Generic software fails on Luthuli Avenue. Nyakizu is built around the real customs of Kenya&apos;s phone accessory trade.
            </p>
          </div>

          <motion.div
            variants={gridReveal}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-80px" }}
            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {/* Bento Card 1: Shuttle & Parcel Dispatch Logging (Spans 2 cols on lg) */}
            <motion.div
              variants={fadeUp}
              className="lg:col-span-2 rounded-3xl border border-dark-accent bg-dark-card p-6 sm:p-8 flex flex-col justify-between hover:border-brand-gold/40 transition-colors"
            >
              <div>
                <div className="w-12 h-12 rounded-2xl bg-brand-gold/15 text-brand-gold flex items-center justify-center mb-5">
                  <Truck className="w-6 h-6" />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-text-primary">
                  Shuttle &amp; Courier Parcel Logging
                </h3>
                <p className="mt-2 text-sm sm:text-base text-text-secondary leading-relaxed">
                  Log the parcel courier name (North Rift Shuttle, Guardian Coach, Tahmeed, 2NK, Modern Coast, etc.), waybill receipt number, and drop-off stage right into the locked order. Both buyer and seller have an immediate digital record before the vehicle leaves Nairobi.
                </p>
              </div>
              <div className="mt-6 flex flex-wrap gap-2 text-xs font-semibold text-text-muted">
                <span className="px-3 py-1 rounded-full bg-dark-secondary border border-dark-accent">North Rift Shuttle</span>
                <span className="px-3 py-1 rounded-full bg-dark-secondary border border-dark-accent">Guardian Coach</span>
                <span className="px-3 py-1 rounded-full bg-dark-secondary border border-dark-accent">Tahmeed Express</span>
                <span className="px-3 py-1 rounded-full bg-dark-secondary border border-dark-accent">2NK Sacco</span>
              </div>
            </motion.div>

            {/* Bento Card 2: Shared Credit Ledger */}
            <motion.div
              variants={fadeUp}
              className="rounded-3xl border border-dark-accent bg-dark-card p-6 sm:p-8 flex flex-col justify-between hover:border-brand-gold/40 transition-colors"
            >
              <div>
                <div className="w-12 h-12 rounded-2xl bg-success/15 text-success flex items-center justify-center mb-5">
                  <Wallet className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-text-primary">
                  Shared Credit Ledger (Chukua Uza)
                </h3>
                <p className="mt-2 text-sm text-text-secondary leading-relaxed">
                  Trade runs on trust. Track balances and partial M-Pesa installments so partners never argue over missing counter book pages or old debt.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-dark-accent text-xs font-bold text-brand-gold">
                Protects brotherhood &amp; business trust
              </div>
            </motion.div>

            {/* Bento Card 3: Lightweight on Budget Android Phones */}
            <motion.div
              variants={fadeUp}
              className="rounded-3xl border border-dark-accent bg-dark-card p-6 sm:p-8 flex flex-col justify-between hover:border-brand-gold/40 transition-colors"
            >
              <div>
                <div className="w-12 h-12 rounded-2xl bg-sky-500/15 text-sky-400 flex items-center justify-center mb-5">
                  <Smartphone className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-text-primary">
                  Fast on Tecno, Infinix &amp; Itel
                </h3>
                <p className="mt-2 text-sm text-text-secondary leading-relaxed">
                  Designed with low data consumption in mind. Optimized to open fast on budget smartphones and stay responsive under unstable CBD connectivity.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-dark-accent text-xs font-bold text-text-muted">
                Low Safaricom bundle consumption
              </div>
            </motion.div>

            {/* Bento Card 4: Private Wholesale Network (Spans 2 cols on lg) */}
            <motion.div
              variants={fadeUp}
              className="lg:col-span-2 rounded-3xl border border-dark-accent bg-dark-card p-6 sm:p-8 flex flex-col justify-between hover:border-brand-gold/40 transition-colors"
            >
              <div>
                <div className="w-12 h-12 rounded-2xl bg-violet-500/15 text-violet-400 flex items-center justify-center mb-5">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-text-primary">
                  Closed &amp; Protected Wholesale Network
                </h3>
                <p className="mt-2 text-sm sm:text-base text-text-secondary leading-relaxed">
                  Your wholesale prices are your trade secret. Nyakizu is not an open directory where competitors on your street can see what you charge. Only verified retail buyers you manually approve can access your catalog.
                </p>
              </div>
              <div className="mt-6 flex items-center gap-3 text-xs font-semibold text-text-secondary">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-success" /> Seller approves every buyer
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-success" /> Prices hidden from outsiders
                </span>
              </div>
            </motion.div>
          </motion.div>
        </Container>
      </Section>

      {/* ========================================================================= */}
      {/* SECTION 6: THE 3-STEP JOURNEY (Nairobi to Countrywide in 60 Seconds)       */}
      {/* ========================================================================= */}
      <Section spacing="lg" className="bg-dark-secondary border-b border-dark-accent" id="how-it-works">
        <Container size="lg">
          <SectionKicker index="05" label="How It Works" />
          <div className="max-w-2xl mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-text-primary leading-snug sm:leading-tight">
              From Counter Book to Dispatched Carton in 3 Steps
            </h2>
            <p className="mt-2.5 sm:mt-3 text-text-secondary text-base sm:text-xl">
              Start in about two minutes. No complicated software setup or training required.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 relative">
            {/* Step 1 */}
            <div className="rounded-2xl border border-dark-accent bg-dark-card p-6 relative">
              <div className="w-10 h-10 rounded-full bg-brand-gold text-slate-950 font-black text-lg flex items-center justify-center mb-4">
                1
              </div>
              <h3 className="text-lg font-bold text-text-primary">Add Your Accessories</h3>
              <p className="mt-2 text-sm text-text-secondary leading-relaxed">
                Add chargers, screen protectors, cables, and covers with your wholesale prices. Takes about 2 minutes from your phone.
              </p>
            </div>

            {/* Step 2 */}
            <div className="rounded-2xl border border-dark-accent bg-dark-card p-6 relative">
              <div className="w-10 h-10 rounded-full bg-brand-gold text-slate-950 font-black text-lg flex items-center justify-center mb-4">
                2
              </div>
              <h3 className="text-lg font-bold text-text-primary">Approve Your Buyers</h3>
              <p className="mt-2 text-sm text-text-secondary leading-relaxed">
                Share your private shop link on WhatsApp. Review and approve the buyers from Kisumu, Mombasa, or Nairobi you already trust.
              </p>
            </div>

            {/* Step 3 */}
            <div className="rounded-2xl border border-dark-accent bg-dark-card p-6 relative">
              <div className="w-10 h-10 rounded-full bg-brand-gold text-slate-950 font-black text-lg flex items-center justify-center mb-4">
                3
              </div>
              <h3 className="text-lg font-bold text-text-primary">Pack, Lock &amp; Sync</h3>
              <p className="mt-2 text-sm text-text-secondary leading-relaxed">
                Receive clear itemized orders. Pack, lock the carton, record the shuttle parcel waybill, and track credit on the shared ledger.
              </p>
            </div>
          </div>

          <div className="mt-12 text-center">
            <Button size="lg" className="rounded-full bg-brand-gold hover:bg-brand-gold-dark text-slate-950 font-bold px-8" asChild>
              <Link href="/register">Start Now &mdash; Free Account</Link>
            </Button>
          </div>
        </Container>
      </Section>

      {/* ========================================================================= */}
      {/* SECTION: COMMUNITY ACTIVITY & PILOT NUMBERS                               */}
      {/* ========================================================================= */}
      <CommunityActivity />

      {/* ========================================================================= */}
      {/* SECTION 7: FAQ ACCORDION (Interactive Collapsible)                        */}
      {/* ========================================================================= */}
      <Section spacing="lg" className="bg-dark-primary border-b border-dark-accent" id="faq">
        <Container size="md">
          <SectionKicker index="06" label="Questions & Answers" />
          <div className="text-center max-w-xl mx-auto mb-10 sm:mb-12">
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-text-primary">
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
                  key={faq.question}
                  className="rounded-2xl border border-dark-accent bg-dark-card overflow-hidden transition-colors"
                >
                  <button
                    type="button"
                    onClick={() => toggleFaq(idx)}
                    className="w-full px-5 py-4 sm:px-6 sm:py-5 text-left flex items-center justify-between gap-4 font-bold text-text-primary text-base sm:text-lg hover:text-brand-gold transition-colors"
                  >
                    <span>{faq.question}</span>
                    <ChevronDown
                      className={`w-5 h-5 shrink-0 transition-transform duration-200 ${
                        isOpen ? "rotate-180 text-brand-gold" : "text-text-muted"
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 sm:px-6 sm:pb-6 text-sm sm:text-base text-text-secondary leading-relaxed border-t border-dark-accent/60 pt-4">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </Container>
      </Section>

      {/* ========================================================================= */}
      {/* SECTION 8: HIGH-CONVERSION CLOSING CTA BANNER                             */}
      {/* ========================================================================= */}
      <Section spacing="lg" className="bg-dark-secondary relative overflow-hidden">
        <Container size="lg">
          <div className="relative rounded-3xl border-2 border-brand-gold/40 bg-gradient-to-br from-dark-card via-dark-card to-dark-tertiary p-8 sm:p-14 text-center shadow-2xl overflow-hidden">
            {/* Ambient Gold Glow Aura */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-brand-gold/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 max-w-2xl mx-auto space-y-4 sm:space-y-6">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-gold/15 text-brand-gold font-extrabold text-xs uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" /> Start Digitizing Your Business Today
              </span>

              <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-text-primary leading-tight">
                Put Your Wholesale Counter Book on Your Phone Today.
              </h2>

              <p className="text-text-secondary text-base sm:text-lg leading-relaxed">
                Join Kenyan phone accessories wholesalers and countrywide retailers already eliminating packing mistakes and lost debt records. Your first 3 orders are completely free.
              </p>

              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button
                  size="lg"
                  className="w-full sm:w-auto rounded-full bg-brand-gold hover:bg-brand-gold-dark text-slate-950 font-extrabold shadow-brand px-9 text-base h-14"
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
