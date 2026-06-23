"use client";
import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";

export function CTA() {
  return (
    <section className="bg-[#1A56DB] py-24">
      <div className="mx-auto max-w-3xl px-6 text-center">

        <p className="mb-4 text-xs font-bold uppercase tracking-widest text-blue-200">
          Ready to start?
        </p>

        <h2 className="text-4xl font-black tracking-tight text-white sm:text-5xl">
          Join Free Today
        </h2>

        <p className="mx-auto mt-5 max-w-lg text-lg leading-relaxed text-blue-100">
          Replace paper notebooks and WhatsApp order chaos with a clean
          digital system. 3 minutes to set up your store.
        </p>

        <div className="mt-4 flex flex-wrap justify-center gap-x-6 gap-y-2">
          {["Free forever", "No credit card", "Offline-ready"].map(t => (
            <span key={t}
              className="flex items-center gap-1.5 text-sm text-blue-200">
              <CheckCircle2 size={14} className="text-[#22C55E]" />{t}
            </span>
          ))}
        </div>

        <div className="mt-10 flex flex-col items-center gap-4
          sm:flex-row sm:justify-center">
          <Link href="/register/seller"
            className="inline-flex h-13 w-full items-center justify-center
              gap-2 rounded-xl bg-white px-10 text-sm font-bold
              text-[#1A56DB] shadow-lg transition
              hover:bg-blue-50 active:scale-[0.98] sm:w-auto
              h-[52px]">
            Set up my store <ArrowRight size={16} />
          </Link>
          <Link href="/register/buyer"
            className="inline-flex h-13 w-full items-center justify-center
              gap-2 rounded-xl border-2 border-white/30 px-10
              text-sm font-semibold text-white transition
              hover:bg-white/10 active:scale-[0.98] sm:w-auto
              h-[52px]">
            Find my supplier
          </Link>
        </div>
      </div>
    </section>
  );
}
