"use client";

import Link from "next/link";
import { motion, type Variants } from "motion/react";
import {
  BookX, MessagesSquare, PencilLine, PackageSearch,
  CheckCircle2, Lock, Wallet, WifiOff, Gift, UserCheck,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Container, Section, LandingHeader, LandingFooter } from "@/components/layouts";
import CommunityActivity from "@/components/landing/CommunityActivity";
import OnboardingWalkthrough from "@/components/landing/OnboardingWalkthrough";
import { DualPhoneMockup } from "@/components/landing/DualPhoneMockup";

// Shared entrance choreography — one fade+rise timing/easing everywhere so
// the whole page feels like a single system, not several one-off animations.
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

const PROBLEMS = [
  {
    icon: BookX,
    tint: "bg-violet-100 text-violet-600",
    title: "Lost records",
    description: "Notebook pages get lost. Then people argue about who owes what.",
  },
  {
    icon: MessagesSquare,
    tint: "bg-sky-100 text-sky-600",
    title: "Too many messages",
    description: "Orders come by calls and texts. It is easy to miss one or mix them up.",
  },
  {
    icon: PencilLine,
    tint: "bg-amber-100 text-amber-700",
    title: "Changed orders",
    description: "A buyer changes the order after you have packed it. You lose time and money.",
  },
  {
    icon: PackageSearch,
    tint: "bg-stone-200 text-stone-600",
    title: "Hard to track stock",
    description: "Many phone models, many suppliers. Nobody can follow it with pen and paper.",
  },
];

// One direct answer per problem above — same order, same color, so the
// pairing is obvious at a glance rather than needing to be explained.
const SOLUTIONS = [
  {
    icon: CheckCircle2,
    tint: "bg-violet-100 text-violet-600",
    title: "Nothing gets lost",
    description: "Every order and every debt is saved on your phone. No more torn or missing pages.",
  },
  {
    icon: CheckCircle2,
    tint: "bg-sky-100 text-sky-600",
    title: "One clear list",
    description: "Buyers send orders through the app. Nothing missed, nothing mixed up.",
  },
  {
    icon: Lock,
    tint: "bg-amber-100 text-amber-700",
    title: "Orders can't be changed",
    description: "Once it is sent, it is locked. No more edits after you have already packed it.",
  },
  {
    icon: CheckCircle2,
    tint: "bg-stone-200 text-stone-600",
    title: "See your stock at a glance",
    description: "Add what you sell once. Check what is in stock any time, right on your phone.",
  },
];

const FEATURES = [
  {
    icon: UserCheck,
    title: "You choose your buyers",
    description: "Buyers must ask to join your store. You decide who is approved to order from you.",
  },
  {
    icon: Wallet,
    title: "Track M-Pesa payments",
    description: "Log what a buyer paid you and see who still owes you — all in one place, not scattered in old texts.",
  },
  {
    icon: WifiOff,
    title: "Works without internet",
    description: "Keep using Nyakizu even when the network is down. It catches up as soon as you are back online.",
  },
  {
    icon: Gift,
    title: "Free forever",
    description: "No monthly fee, no hidden cost. Free for every trader on Nyakizu, today and always.",
  },
];

function SectionKicker({ index, label }: { index: string; label: string }) {
  return (
    <div className="flex items-center gap-2 mb-4 sm:mb-5">
      <span className="text-xs sm:text-sm font-extrabold text-brand-gold-dark tabular-nums" aria-hidden="true">
        {index}
      </span>
      <span className="text-xs sm:text-sm font-bold uppercase tracking-widest text-text-muted">{label}</span>
      <span className="flex-1 h-px bg-dark-accent" aria-hidden="true" />
    </div>
  );
}

export function HomeContent() {
  return (
    <div className="min-h-screen bg-white text-text-primary selection:bg-brand-gold/20">
      <LandingHeader />

      {/* Hero — stacked and centered on small screens; side-by-side on large
          screens so the section actually uses the width instead of sitting
          as a small centered column in a sea of white. */}
      <section className="relative overflow-hidden bg-gradient-hero pt-24 pb-14 sm:pt-40 sm:pb-28">
        <Container size="xl" className="relative z-10">
          <div className="grid lg:grid-cols-2 lg:gap-12 xl:gap-20 items-center">
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              animate="show"
              className="max-w-xl mx-auto text-center lg:max-w-none lg:mx-0 lg:text-left"
            >
              <motion.h1 variants={fadeUp} className="text-4xl sm:text-6xl xl:text-7xl font-extrabold tracking-tight leading-[1.15] sm:leading-[1.1] text-text-primary">
                The trade you already do.
                <br />
                <span className="text-brand-gold">Now digital.</span>
              </motion.h1>
              <motion.p variants={fadeUp} className="mt-4 sm:mt-6 text-base sm:text-xl xl:text-2xl text-text-secondary leading-relaxed">
                Nyakizu does not change how you already trade. It just moves your{" "}
                <span className="font-semibold text-text-primary">orders, stock and debts</span> off
                notebooks and WhatsApp, onto your phone. Simple to use. Free forever.
              </motion.p>
              <motion.div variants={fadeUp} className="mt-6 sm:mt-8 flex flex-col sm:flex-row items-stretch sm:items-center justify-center lg:justify-start gap-3">
                <Button size="lg" className="w-full sm:w-auto rounded-full bg-brand-gold hover:bg-brand-gold-dark text-text-primary font-bold shadow-brand px-8 text-base h-14" asChild>
                  <Link href="/register">Sign Up</Link>
                </Button>
                <Link
                  href="#problem"
                  className="w-full sm:w-auto flex items-center justify-center rounded-full border-2 border-dark-accent px-6 h-14 sm:h-auto sm:rounded-none sm:border-0 sm:justify-start text-base font-semibold text-text-secondary hover:text-text-primary hover:border-text-secondary/40 sm:hover:border-0 sm:underline underline-offset-4 decoration-dotted transition-colors"
                >
                  See why it matters ↓
                </Link>
              </motion.div>
              <motion.div variants={fadeUp} className="mt-5 sm:mt-6 flex flex-wrap items-center justify-center lg:justify-start gap-x-4 sm:gap-x-5 gap-y-2 text-sm sm:text-base text-text-muted">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-success" aria-hidden="true" /> Free forever
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-success" aria-hidden="true" /> Works offline
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-success" aria-hidden="true" /> Any Android phone
                </span>
              </motion.div>
            </motion.div>

            {/* Two phones, one screen each — the seller and buyer apps,
                both on the gold brand. */}
            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="show"
              className="mt-12 lg:mt-0 flex justify-center"
            >
              <DualPhoneMockup />
            </motion.div>
          </div>
        </Container>
      </section>

      {/* 01 — The Problem */}
      <Section spacing="lg" className="bg-dark-secondary border-y border-dark-accent" id="problem">
        <Container size="lg">
          <SectionKicker index="01" label="The Problem" />
          <div className="max-w-2xl mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-text-primary leading-snug sm:leading-tight">
              The notebook and WhatsApp cannot carry your business anymore
            </h2>
            <p className="mt-2.5 sm:mt-3 text-text-secondary text-base sm:text-xl">
              When your business grows, small mistakes become big losses.
            </p>
          </div>
          <motion.div
            variants={gridReveal}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-80px" }}
            className="grid sm:grid-cols-2 gap-4 sm:gap-5"
          >
            {PROBLEMS.map(({ icon: Icon, tint, title, description }) => (
              <motion.div
                key={title}
                variants={fadeUp}
                className="rounded-2xl border border-dark-accent/70 bg-white shadow-sm p-5 sm:p-6"
              >
                <div className={`w-11 h-11 sm:w-12 sm:h-12 rounded-full flex items-center justify-center mb-3 sm:mb-4 ${tint}`} aria-hidden="true">
                  <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <h3 className="font-bold text-text-primary text-base sm:text-lg">{title}</h3>
                <p className="text-sm sm:text-base text-text-secondary mt-1 sm:mt-1.5 leading-relaxed">{description}</p>
              </motion.div>
            ))}
          </motion.div>
        </Container>
      </Section>

      {/* 02 — The Solution: a direct answer to each problem above */}
      <Section spacing="lg" className="bg-white" id="solution">
        <Container size="lg">
          <SectionKicker index="02" label="The Solution" />
          <div className="max-w-2xl mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-text-primary leading-snug sm:leading-tight">
              Here is exactly how Nyakizu fixes that
            </h2>
            <p className="mt-2.5 sm:mt-3 text-text-secondary text-base sm:text-xl">
              Four problems above. Four fixes below — in the same order.
            </p>
          </div>
          <motion.div
            variants={gridReveal}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-80px" }}
            className="rounded-2xl border border-dark-accent/70 bg-white shadow-sm divide-y divide-dark-accent/70 overflow-hidden sm:rounded-none sm:border-0 sm:shadow-none sm:divide-y-0 sm:bg-transparent sm:grid sm:grid-cols-2 sm:gap-5"
          >
            {SOLUTIONS.map(({ icon: Icon, tint, title, description }) => (
              <motion.div
                key={title}
                variants={fadeUp}
                className="flex items-start gap-4 p-4 sm:block sm:rounded-2xl sm:border sm:border-dark-accent/70 sm:bg-white sm:shadow-sm sm:p-6"
              >
                <div className={`w-11 h-11 sm:w-12 sm:h-12 rounded-full flex items-center justify-center shrink-0 sm:mb-4 ${tint}`} aria-hidden="true">
                  <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-bold text-text-primary text-base sm:text-lg">{title}</h3>
                  <p className="text-sm sm:text-base text-text-secondary mt-1 sm:mt-1.5 leading-relaxed">{description}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </Container>
      </Section>

      {/* 03 — Getting Started: the actual signup mechanics, kept separate
          from "the Solution" so that section stays about solving problems,
          not about how to create an account. */}
      <Section spacing="lg" className="bg-dark-secondary border-y border-dark-accent" id="how-it-works">
        <Container size="lg">
          <SectionKicker index="03" label="Getting Started" />
          <div className="max-w-2xl mb-7 sm:mb-10">
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-text-primary leading-snug sm:leading-tight">
              Start in a few minutes
            </h2>
            <p className="mt-2.5 sm:mt-3 text-text-secondary text-base sm:text-xl">
              Buying or selling, here is exactly what happens, step by step.
            </p>
          </div>
          <OnboardingWalkthrough />
        </Container>
      </Section>

      {/* 04 — Built for how you already trade */}
      <Section spacing="lg" className="bg-text-primary" id="features">
        <Container size="lg">
          <div className="max-w-2xl mb-8 sm:mb-12">
            <span className="text-xs sm:text-sm font-bold uppercase tracking-widest text-brand-gold">04 &middot; Why Nyakizu</span>
            <h2 className="mt-2.5 sm:mt-3 text-2xl sm:text-4xl font-extrabold tracking-tight text-white leading-snug sm:leading-tight">
              Built for how you already trade
            </h2>
            <p className="mt-2.5 sm:mt-3 text-white/70 text-base sm:text-xl">
              No new habits to learn. Nyakizu just makes what you already do safer and faster.
            </p>
          </div>
          <motion.div
            variants={gridReveal}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-80px" }}
            className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5"
          >
            {FEATURES.map(({ icon: Icon, title, description }) => (
              <motion.div
                key={title}
                variants={fadeUp}
                className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 sm:p-6 hover:bg-white/[0.07] transition-colors"
              >
                <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full flex items-center justify-center mb-3 sm:mb-4 bg-brand-gold/15 text-brand-gold" aria-hidden="true">
                  <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <h3 className="font-bold text-white text-base sm:text-lg">{title}</h3>
                <p className="text-sm sm:text-base text-white/70 mt-1 sm:mt-1.5 leading-relaxed">{description}</p>
              </motion.div>
            ))}
          </motion.div>
        </Container>
      </Section>

      {/* 04 — Proof: real, honest pilot-phase numbers */}
      <CommunityActivity />

      {/* Final call to action */}
      <Section spacing="lg" className="bg-brand-gold-subtle">
        <Container size="sm" className="text-center">
          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-text-primary leading-snug sm:leading-tight">
            Ready to run your shop from your phone?
          </h2>
          <p className="mt-2.5 sm:mt-3 text-text-secondary text-base sm:text-xl">
            Join traders already using Nyakizu. It takes about two minutes.
          </p>
          <div className="mt-6 sm:mt-8">
            <Button size="lg" className="w-full sm:w-auto rounded-full bg-brand-gold hover:bg-brand-gold-dark text-text-primary font-bold shadow-brand px-8 text-base h-14" asChild>
              <Link href="/register">Sign Up</Link>
            </Button>
          </div>
        </Container>
      </Section>

      <LandingFooter />
    </div>
  );
}
