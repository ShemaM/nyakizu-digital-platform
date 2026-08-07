"use client";

import { motion, type Variants } from "motion/react";
import {
  User,
  MailCheck,
  Store,
  ShoppingBag,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";

const columnReveal: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06, delayChildren: 0.1 } },
};

const stepItem: Variants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } },
};

interface Step {
  icon: typeof User;
  title: string;
  description: string;
}

const BUYER_STEPS: Step[] = [
  { icon: User, title: "Sign up as a Buyer", description: "Your name, phone, email, and a password. About two minutes." },
  { icon: MailCheck, title: "Verify your email", description: "Tap the link we send you and your account goes live." },
  { icon: Store, title: "Request to join a seller", description: "Find your wholesaler on Nyakizu and ask for access — the same as asking to join their WhatsApp group." },
  { icon: ShoppingBag, title: "Get approved, start ordering", description: "Once they say yes, build your list, send it, and track it step by step." },
];

const SELLER_STEPS: Step[] = [
  { icon: Store, title: "Sign up as a Seller", description: "Your shop name, location, phone, email, and a password." },
  { icon: MailCheck, title: "Verify your email", description: "Tap the link we send you and your account goes live." },
  { icon: ShieldCheck, title: "Get verified by an admin", description: "This is what earns you the trust badge buyers look for." },
  { icon: CheckCircle2, title: "List stock, start selling", description: "Add products, approve the buyers you trust, and receive your first order." },
];

const ACCENTS = {
  blue: {
    text: "text-blue-700",
    chip: "bg-blue-600",
    chipLast: "bg-blue-600 ring-4 ring-blue-100",
    line: "bg-blue-200",
    lineFill: "bg-blue-600",
    header: "from-blue-600 to-blue-500",
    glow: "hover:shadow-glow-blue",
  },
  violet: {
    text: "text-violet-700",
    chip: "bg-violet-600",
    chipLast: "bg-violet-600 ring-4 ring-violet-100",
    line: "bg-violet-200",
    lineFill: "bg-violet-600",
    header: "from-violet-600 to-violet-500",
    glow: "hover:shadow-glow-violet",
  },
} as const;

function StepColumn({
  role,
  tagline,
  accent,
  steps,
  fromSide,
}: {
  role: string;
  tagline: string;
  accent: "blue" | "violet";
  steps: Step[];
  fromSide: "left" | "right";
}) {
  const a = ACCENTS[accent];

  return (
    <motion.div
      initial={{ opacity: 0, x: fromSide === "left" ? -28 : 28 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      whileHover={{ y: -4 }}
      className={`rounded-3xl border border-slate-200 bg-white overflow-hidden flex flex-col transition-shadow duration-300 shadow-sm ${a.glow}`}
    >
      {/* Colored header banner */}
      <div className={`bg-gradient-to-br ${a.header} px-6 sm:px-8 py-5`}>
        <h3 className="text-xl font-extrabold text-white">{role}</h3>
        <p className="text-sm text-white/80 mt-0.5">{tagline}</p>
      </div>

      <motion.div
        variants={columnReveal}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-40px" }}
        className="p-6 sm:p-8 flex-1"
      >
        {steps.map((step, i) => {
          const isLast = i === steps.length - 1;
          return (
            <motion.div key={step.title} variants={stepItem} className="relative pl-14 pb-9 last:pb-0">
              {!isLast && (
                <span className={`absolute left-[19px] top-10 bottom-0 w-0.5 ${a.line}`} aria-hidden="true">
                  <motion.span
                    className={`block w-full ${a.lineFill} origin-top`}
                    style={{ height: "100%" }}
                    initial={{ scaleY: 0 }}
                    whileInView={{ scaleY: 1 }}
                    viewport={{ once: true, margin: "-40px" }}
                    transition={{ duration: 0.5, ease: "easeOut", delay: 0.15 + i * 0.08 }}
                  />
                </span>
              )}
              <span
                className={`absolute left-0 top-0 w-10 h-10 rounded-full ${isLast ? a.chipLast : a.chip} text-white flex items-center justify-center font-bold text-sm shadow-sm`}
                aria-hidden="true"
              >
                {isLast ? <step.icon className="w-4 h-4" /> : i + 1}
              </span>
              <h4 className="font-bold text-slate-900 text-base">{step.title}</h4>
              <p className="text-sm text-slate-600 mt-1 leading-relaxed">{step.description}</p>
            </motion.div>
          );
        })}
      </motion.div>
    </motion.div>
  );
}

export default function OnboardingWalkthrough() {
  return (
    <div className="grid md:grid-cols-2 gap-6 items-stretch">
      <StepColumn role="Buyer" tagline="Order from trusted sellers" accent="blue" steps={BUYER_STEPS} fromSide="left" />
      <StepColumn role="Seller" tagline="Run your shop from your phone" accent="violet" steps={SELLER_STEPS} fromSide="right" />
    </div>
  );
}
