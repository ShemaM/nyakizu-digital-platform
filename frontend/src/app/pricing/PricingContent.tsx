"use client";

import { useState } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  Sparkles,
  ChevronDown,
  Wallet,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Container, Section, LandingHeader, LandingFooter } from "@/components/layouts";

export function PricingContent() {
  const [sliderCartonValue, setSliderCartonValue] = useState<number>(24000);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  // KSh 50 minimum to KSh 100 maximum cap
  const computedFee = Math.min(100, Math.max(50, Math.round((sliderCartonValue * 0.005) / 5) * 5));
  const effectivePercentage = ((computedFee / sliderCartonValue) * 100).toFixed(2);

  const toggleFaq = (index: number) => {
    setOpenFaqIndex((prev) => (prev === index ? null : index));
  };

  const PRICING_FAQS = [
    {
      q: "Why did you replace monthly subscriptions with a pay-per-order fee?",
      a: "Fixed subscriptions (like KSh 1,500 every month) punish wholesalers during quiet trading periods or election seasons when shipments drop. Pay-per-order ensures you only pay when you make real money. If you pack 1 carton, you pay KSh 50. If you pack a huge KSh 80,000 carton, the fee is capped at only KSh 100. If you don't pack, you pay zero.",
    },
    {
      q: "Do retail buyers or hawkers in Mombasa, Kisumu, or other towns pay anything?",
      a: "No. Buyers and hawkers use Nyakizu 100% free forever. They do not pay any registration, membership, or order fees. Only wholesalers packing cartons pay the small transaction fee.",
    },
    {
      q: "How do I pay the fee as a wholesaler?",
      a: "Your wholesale account has an integrated billing balance. You top it up via M-Pesa (Daraja STK push or Paybill) starting from just KSh 100. When you lock a packed carton, the fee is automatically deducted. Your first 3 orders are completely free with no deposit required.",
    },
    {
      q: "What happens if my prepaid M-Pesa balance runs out while I'm packing?",
      a: "Nyakizu will never interrupt a live rush or lock you out in the middle of preparing an order. You are given a flexible grace period to top up via M-Pesa after completing your packing.",
    },
  ];

  return (
    <div className="min-h-screen bg-dark-primary text-text-primary selection:bg-brand-gold/20">
      <LandingHeader />

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-hero pt-28 pb-14 sm:pt-40 sm:pb-20 border-b border-dark-accent">
        <Container size="lg" className="text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-brand-gold/30 bg-brand-gold/10 text-brand-gold text-xs sm:text-sm font-bold mb-5">
            <Sparkles className="w-4 h-4" /> Zero Monthly Subscription &middot; Pay Only When You Pack
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-text-primary">
            Transparent Wholesale Pricing.
            <br />
            <span className="text-brand-gold">KSh 50 to KSh 100 Per Carton.</span>
          </h1>

          <p className="mt-4 sm:mt-6 text-base sm:text-xl text-text-secondary max-w-2xl mx-auto leading-relaxed">
            No fixed monthly subscription. Pay only when you pack and dispatch a real carton. Your first 3 orders are 100% free, and retail buyers pay KSh 0 forever.
          </p>
        </Container>
      </section>

      {/* Interactive Calculator Section */}
      <Section spacing="lg" className="bg-dark-secondary border-b border-dark-accent">
        <Container size="lg">
          <div className="rounded-3xl border-2 border-brand-gold/30 bg-dark-card p-6 sm:p-10 shadow-2xl">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-dark-accent">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-brand-gold">
                  Live Fee Simulation
                </span>
                <h2 className="text-2xl font-bold text-text-primary mt-1">
                  Estimate Your Fee Per Packed Carton
                </h2>
              </div>
              <div className="text-left md:text-right">
                <span className="text-xs text-text-muted uppercase tracking-wider block">Service Fee</span>
                <span className="text-3xl sm:text-4xl font-black text-brand-gold tabular-nums">
                  KSh {computedFee}
                </span>
                <span className="text-xs text-text-muted block mt-0.5">
                  ({effectivePercentage}% &middot; Capped at KSh 100)
                </span>
              </div>
            </div>

            {/* Slider */}
            <div className="py-8">
              <div className="flex justify-between items-center mb-3">
                <label htmlFor="pricing-slider" className="text-sm font-bold text-text-primary">
                  Carton / Order Value:{" "}
                  <span className="text-brand-gold font-extrabold text-base">
                    KSh {sliderCartonValue.toLocaleString()}
                  </span>
                </label>
                <span className="text-xs text-text-muted">KSh 2,000 to KSh 80,000+</span>
              </div>

              <input
                id="pricing-slider"
                type="range"
                min={2000}
                max={80000}
                step={1000}
                value={sliderCartonValue}
                onChange={(e) => setSliderCartonValue(Number(e.target.value))}
                className="w-full h-3 bg-dark-secondary rounded-lg appearance-none cursor-pointer accent-brand-gold focus:outline-none"
              />

              <div className="flex justify-between text-xs text-text-muted mt-2">
                <span>KSh 2,000</span>
                <span>KSh 25,000</span>
                <span>KSh 50,000</span>
                <span>KSh 80,000+</span>
              </div>
            </div>

            {/* 4 Stat Tiles */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
              <div className="rounded-2xl border border-dark-accent bg-dark-secondary/60 p-4 text-center">
                <span className="text-[11px] font-bold text-text-muted uppercase tracking-wider block">Order Total</span>
                <span className="text-lg sm:text-xl font-bold text-text-primary tabular-nums mt-1 block">
                  KSh {sliderCartonValue.toLocaleString()}
                </span>
              </div>
              <div className="rounded-2xl border border-brand-gold/40 bg-brand-gold/10 p-4 text-center">
                <span className="text-[11px] font-bold text-brand-gold uppercase tracking-wider block">Wholesaler Pays</span>
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
          </div>
        </Container>
      </Section>

      {/* 3 Tier Cards */}
      <Section spacing="lg" className="bg-dark-primary border-b border-dark-accent">
        <Container size="lg">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-text-primary">
              Three Simple Plans
            </h2>
            <p className="mt-2 text-text-secondary text-sm sm:text-base">
              No hidden fees, no credit card required. Top up with M-Pesa whenever you want.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Card 1 */}
            <div className="rounded-3xl border border-dark-accent bg-dark-card p-6 sm:p-8 flex flex-col justify-between">
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
                    <CheckCircle2 className="w-4 h-4 text-success shrink-0" /> 3 Full carton lockups
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-success shrink-0" /> Zero deposit or credit card
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-success shrink-0" /> Full access to live ledger
                  </li>
                </ul>
              </div>

              <div className="mt-8 pt-5 border-t border-dark-accent">
                <Button variant="outline" className="w-full rounded-full" asChild>
                  <Link href="/register?role=seller">Sign Up Free</Link>
                </Button>
              </div>
            </div>

            {/* Card 2 */}
            <div className="rounded-3xl border-2 border-brand-gold bg-dark-card p-6 sm:p-8 flex flex-col justify-between relative shadow-xl">
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
                    <CheckCircle2 className="w-4 h-4 text-brand-gold shrink-0" /> Permanent locked order receipts
                  </li>
                </ul>
              </div>

              <div className="mt-8 pt-5 border-t border-dark-accent">
                <Button className="w-full rounded-full bg-brand-gold hover:bg-brand-gold-dark text-slate-950 font-extrabold shadow-brand" asChild>
                  <Link href="/register?role=seller">Open Wholesale Shop</Link>
                </Button>
              </div>
            </div>

            {/* Card 3 */}
            <div className="rounded-3xl border border-dark-accent bg-dark-card p-6 sm:p-8 flex flex-col justify-between">
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
                    <CheckCircle2 className="w-4 h-4 text-success shrink-0" /> Shared credit &amp; payment claims
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

      {/* M-Pesa Top Up How It Works Section */}
      <Section spacing="lg" className="bg-dark-secondary border-b border-dark-accent">
        <Container size="md">
          <div className="rounded-3xl border border-dark-accent bg-dark-card p-8 sm:p-10 text-center">
            <div className="w-12 h-12 rounded-2xl bg-brand-gold/15 text-brand-gold flex items-center justify-center mx-auto mb-4">
              <Wallet className="w-6 h-6" />
            </div>
            <h3 className="text-2xl font-bold text-text-primary">
              How M-Pesa Prepaid Top-Up Works
            </h3>
            <p className="mt-2 text-text-secondary text-sm sm:text-base max-w-xl mx-auto">
              You maintain a small prepaid balance on your Nyakizu seller account. Whenever you wish, enter your phone number and receive an instant M-Pesa STK push.
            </p>

            <div className="grid sm:grid-cols-3 gap-4 mt-8 text-left">
              <div className="rounded-2xl border border-dark-accent bg-dark-secondary p-4">
                <span className="text-brand-gold font-bold text-sm block">1. Enter Amount</span>
                <p className="text-xs text-text-muted mt-1">Top up as little as KSh 100 or KSh 500 directly in your dashboard.</p>
              </div>
              <div className="rounded-2xl border border-dark-accent bg-dark-secondary p-4">
                <span className="text-brand-gold font-bold text-sm block">2. Enter PIN</span>
                <p className="text-xs text-text-muted mt-1">Receive an instant Safaricom M-Pesa PIN prompt on your phone.</p>
              </div>
              <div className="rounded-2xl border border-dark-accent bg-dark-secondary p-4">
                <span className="text-brand-gold font-bold text-sm block">3. Pack &amp; Deduct</span>
                <p className="text-xs text-text-muted mt-1">When you lock an order, KSh 50 to KSh 100 is deducted automatically.</p>
              </div>
            </div>
          </div>
        </Container>
      </Section>

      {/* FAQs */}
      <Section spacing="lg" className="bg-dark-primary border-b border-dark-accent">
        <Container size="md">
          <div className="text-center max-w-xl mx-auto mb-10">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-text-primary">
              Pricing Questions &amp; Answers
            </h2>
          </div>

          <div className="space-y-3">
            {PRICING_FAQS.map((faq, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div
                  key={faq.q}
                  className="rounded-2xl border border-dark-accent bg-dark-card overflow-hidden"
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
                    <div className="px-5 pb-5 sm:px-6 sm:pb-6 text-sm text-text-secondary leading-relaxed border-t border-dark-accent/60 pt-4">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </Container>
      </Section>

      {/* Closing CTA */}
      <Section spacing="lg" className="bg-dark-secondary">
        <Container size="sm" className="text-center space-y-4">
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-text-primary">
            Start With 3 Free Orders
          </h2>
          <p className="text-text-secondary text-base">
            No credit card, no M-Pesa deposit required. Set up your shop in 2 minutes.
          </p>
          <div className="pt-2">
            <Button size="lg" className="rounded-full bg-brand-gold hover:bg-brand-gold-dark text-slate-950 font-bold px-8" asChild>
              <Link href="/register?role=seller">Open Your Wholesale Shop</Link>
            </Button>
          </div>
        </Container>
      </Section>

      <LandingFooter />
    </div>
  );
}

