"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion } from "motion/react";

const VIEWS = [
  {
    key: "seller",
    src: "/images/seller-dashboard-desktop.png",
    alt: "The real Nyakizu seller dashboard",
    label: "Seller view",
    dot: "bg-violet-500",
  },
  {
    key: "buyer",
    src: "/images/buyer-dashboard-desktop.png",
    alt: "The real Nyakizu buyer dashboard",
    label: "Buyer view",
    dot: "bg-blue-500",
  },
] as const;

const ROTATE_MS = 4200;
const FLIP_SECONDS = 0.9;

export function RotatingLaptopMockup() {
  const [flipped, setFlipped] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => setFlipped((f) => !f), ROTATE_MS);
    return () => clearInterval(interval);
  }, []);

  const view = VIEWS[flipped ? 1 : 0];

  return (
    <div className="flex flex-col items-center w-full">
      <div className="relative w-full max-w-[720px]" style={{ perspective: 2000 }}>
        {/* Screen — thin bezel, small camera dot, laptop-style rounded top corners */}
        <div className="relative rounded-t-2xl rounded-b-md border-[10px] border-b-0 border-text-primary bg-text-primary shadow-2xl overflow-hidden">
          <span
            className="absolute left-1/2 -translate-x-1/2 top-1 w-1.5 h-1.5 rounded-full bg-black/60 z-10"
            aria-hidden="true"
          />

          {/* Two faces stacked back-to-back (each backface-hidden, the back
              face pre-rotated 180°) so both always render right-side-up —
              rotating a single plane past 90° would otherwise show a
              mirrored "backface" view of whichever image is loaded. */}
          <motion.div
            className="relative aspect-[16/10]"
            animate={{ rotateY: flipped ? 180 : 0 }}
            transition={{ duration: FLIP_SECONDS, ease: "easeInOut" }}
            style={{ transformStyle: "preserve-3d" }}
          >
            {/* Front face — seller */}
            <div
              className="absolute inset-0 bg-white overflow-hidden"
              style={{ backfaceVisibility: "hidden" }}
            >
              <Image
                src={VIEWS[0].src}
                alt={VIEWS[0].alt}
                fill
                sizes="(max-width: 720px) 100vw, 720px"
                className="object-cover object-top"
                priority
              />
            </div>

            {/* Back face — buyer, pre-rotated so it faces forward once the parent hits 180° */}
            <div
              className="absolute inset-0 bg-white overflow-hidden"
              style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
            >
              <Image
                src={VIEWS[1].src}
                alt={VIEWS[1].alt}
                fill
                sizes="(max-width: 720px) 100vw, 720px"
                className="object-cover object-top"
              />
            </div>
          </motion.div>
        </div>

        {/* Base / keyboard deck — the unmistakable "laptop" silhouette cue */}
        <div className="relative h-4 sm:h-5 rounded-b-xl bg-gradient-to-b from-slate-300 to-slate-400 shadow-lg">
          <div className="absolute left-1/2 -translate-x-1/2 top-0 w-28 h-1.5 bg-slate-500/40 rounded-b-md" aria-hidden="true" />
        </div>
      </div>

      {/* View label — cross-fades in sync with which screenshot is showing */}
      <motion.span
        key={view.key}
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="mt-6 inline-flex items-center gap-1.5 rounded-full border border-dark-accent bg-white px-3.5 py-1.5 text-xs font-bold uppercase tracking-wide text-text-secondary shadow-sm"
      >
        <span className={`w-1.5 h-1.5 rounded-full ${view.dot}`} aria-hidden="true" />
        {view.label}
      </motion.span>
    </div>
  );
}
