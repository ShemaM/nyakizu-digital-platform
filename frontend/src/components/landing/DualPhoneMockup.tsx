"use client";

import { motion } from "motion/react";
import { PhoneMockup } from "./PhoneMockup";
import { SellerScreenPreview, BuyerScreenPreview } from "./DashboardPreviews";

function PhoneLabel({ label }: { label: string }) {
  return (
    <span className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-dark-accent/80 bg-dark-secondary/80 px-2.5 py-0.5 text-[11px] font-light font-mono lowercase tracking-normal text-text-muted shadow-sm">
      <span className="w-1.5 h-1.5 rounded-full bg-brand-gold/80" aria-hidden="true" />
      {label}
    </span>
  );
}

/** Two real screens, one phone each — the seller and buyer apps, both on the same gold brand. */
export function DualPhoneMockup() {
  return (
    <div className="flex items-end justify-center gap-4 sm:gap-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="flex flex-col items-center mb-8 sm:mb-12"
      >
        <PhoneMockup>
          <SellerScreenPreview />
        </PhoneMockup>
        <PhoneLabel label="sample seller (sample shop · nairobi)" />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut", delay: 0.12 }}
        className="flex flex-col items-center"
      >
        <PhoneMockup>
          <BuyerScreenPreview />
        </PhoneMockup>
        <PhoneLabel label="sample buyer (kim dreadlocks kitengela)" />
      </motion.div>
    </div>
  );
}
