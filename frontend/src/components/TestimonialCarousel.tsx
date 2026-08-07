"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export type Testimonial = {
  quote: string;
  name: string;
  role: string;
};

export default function TestimonialCarousel({
  testimonials,
  autoRotateMs = 7000,
}: {
  testimonials: Testimonial[];
  autoRotateMs?: number;
}) {
  const safeTestimonials = testimonials ?? [];
  const [index, setIndex] = useState(0);

  const count = safeTestimonials.length;
  const clampedIndex = count === 0 ? 0 : Math.min(index, count - 1);

  const goPrev = useCallback(() => {
    if (count === 0) return;
    setIndex((prev) => (prev - 1 + count) % count);
  }, [count]);

  const goNext = useCallback(() => {
    if (count === 0) return;
    setIndex((prev) => (prev + 1) % count);
  }, [count]);

  useEffect(() => {
    if (count <= 1) return;
    const t = window.setInterval(() => {
      setIndex((prev) => (prev + 1) % count);
    }, autoRotateMs);
    return () => window.clearInterval(t);
  }, [autoRotateMs, count]);

  const active = count === 0 ? null : safeTestimonials[clampedIndex];

  const dots = useMemo(() => {
    if (count === 0) return null;
    return (
      <div className="mt-4 flex items-center justify-center gap-2" aria-label="Testimonial pages">
        {safeTestimonials.map((_, i) => {
          const isActive = i === clampedIndex;
          return (
            <button
              key={i}
              type="button"
              className={
                isActive
                  ? "h-2.5 w-7 rounded-full bg-brand-gold"
                  : "h-2.5 w-2.5 rounded-full bg-slate-700 hover:bg-slate-600 transition-colors"
              }
              aria-label={`Go to testimonial ${i + 1}`}
              aria-current={isActive ? "true" : undefined}
              onClick={() => setIndex(i)}
            />
          );
        })}
      </div>
    );
  }, [clampedIndex, count, safeTestimonials]);

  if (!active) {
    return (
      <div className="rounded-xl border border-slate-800/50 bg-slate-900/30 p-6 text-slate-400">
        No testimonials yet.
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-slate-800/50 bg-slate-900/30 p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-4">
          <p className="text-slate-100 text-lg leading-relaxed">“{active.quote}”</p>
          <div className="space-y-1">
            <div className="font-bold text-white">{active.name}</div>
            <div className="text-sm text-slate-400">{active.role}</div>
          </div>
        </div>

        {count > 1 && (
          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={goPrev}
              className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-700/50 bg-slate-900/30 hover:bg-slate-900 transition-colors"
              aria-label="Previous testimonial"
            >
              <ChevronLeft className="h-5 w-5 text-slate-200" />
            </button>
            <button
              type="button"
              onClick={goNext}
              className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-700/50 bg-slate-900/30 hover:bg-slate-900 transition-colors"
              aria-label="Next testimonial"
            >
              <ChevronRight className="h-5 w-5 text-slate-200" />
            </button>
          </div>
        )}
      </div>

      {dots}
    </div>
  );
}

