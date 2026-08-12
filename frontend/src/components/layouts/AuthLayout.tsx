"use client";

import { ReactNode } from "react";
import { Check } from "lucide-react";
import { motion } from "motion/react";
import Link from "next/link";
import { Logo } from "@/components/Logo";

export interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
  alternate?: boolean;
  /** Small caption under the card. Defaults to a generic privacy note. */
  footnote?: string;
  /** Optional heading shown in the dark panel above the trust points. */
  panelHeadline?: ReactNode;
  panelSubtitle?: string;
  /** Skips the left branding/trust-points panel — just the centered form. */
  hidePanel?: boolean;
}

const TRUST_POINTS = [
  "Works even with no internet",
  "No one else can see your stock or price",
  "Free for everyone, always",
];

export function AuthLayout({
  children,
  title,
  subtitle,
  alternate = false,
  footnote = "Your information is safe with us",
  panelHeadline,
  panelSubtitle,
  hidePanel = false,
}: AuthLayoutProps) {
  return (
    <div className={`min-h-screen flex flex-col ${hidePanel ? "" : "lg:flex-row"}`}>
      {/* Top/left: Branding & trust points — near-black + gold, matching the
          homepage's identity. No `flex-1` on mobile: the panel sizes to its
          content instead of claiming half the viewport, so the form below
          never sits below the fold on a phone. */}
      {!hidePanel && (
        <div
          className={`relative flex flex-col justify-center gap-6 overflow-hidden p-6 sm:p-10 lg:flex-1 lg:p-12 ${alternate ? "order-2" : "order-1"} bg-text-primary`}
        >
          <div
            className="pointer-events-none absolute inset-0"
            aria-hidden="true"
            style={{
              background:
                "radial-gradient(ellipse 600px 400px at 90% -10%, rgba(200,134,10,0.18), transparent 60%)",
            }}
          />

          <Link href="/" className="relative inline-flex items-center gap-2.5 w-fit hover:opacity-80 transition-opacity">
            <Logo size={40} inverted className="shrink-0" />
            <span className="text-lg font-bold text-white tracking-tight">Nyakizu Market</span>
          </Link>

          {(panelHeadline || panelSubtitle) && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="relative space-y-2.5 max-w-md"
            >
              {panelHeadline && (
                <h1 className="text-2xl sm:text-3xl font-extrabold leading-tight text-white">{panelHeadline}</h1>
              )}
              {panelSubtitle && <p className="text-base leading-relaxed text-slate-300">{panelSubtitle}</p>}
            </motion.div>
          )}

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut", delay: 0.1 }}
            className="relative space-y-2.5"
          >
            {TRUST_POINTS.map((point) => (
              <div key={point} className="flex items-center gap-2 text-base text-slate-200">
                <Check className="h-4 w-4 shrink-0 text-brand-gold-light" aria-hidden="true" />
                <span>{point}</span>
              </div>
            ))}
          </motion.div>
        </div>
      )}

      {/* Form panel — full width and centered when the branding panel is hidden. */}
      <div
        className={`flex flex-1 items-center justify-center p-4 sm:p-8 lg:p-12 ${hidePanel ? "" : alternate ? "order-1" : "order-2"} bg-dark-secondary overflow-y-auto`}
      >
        <div className="w-full max-w-md py-8 sm:py-10">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut", delay: 0.1 }}
            className="space-y-6 rounded-2xl border border-dark-accent bg-white p-7 shadow-xl sm:p-9"
          >
            <div className={`space-y-1.5 text-center ${hidePanel ? "" : "lg:text-left"}`}>
              <h2 className="text-3xl font-extrabold text-text-primary sm:text-4xl">{title}</h2>
              {subtitle && <p className="text-base text-text-secondary">{subtitle}</p>}
            </div>

            {children}
          </motion.div>

          <p className="mt-6 text-center text-sm text-text-muted">{footnote}</p>
        </div>
      </div>
    </div>
  );
}
