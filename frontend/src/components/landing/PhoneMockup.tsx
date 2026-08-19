import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

interface PhoneMockupProps {
  children: ReactNode;
  className?: string;
}

/** A generic Android-style phone frame — dark bezel, punch-hole camera, side buttons — wrapping arbitrary screen content. */
export function PhoneMockup({ children, className }: PhoneMockupProps) {
  return (
    <div className={cn("relative w-[150px] sm:w-[190px] lg:w-[210px] aspect-[9/19.5] shrink-0", className)}>
      <span className="absolute -left-px top-20 w-[3px] h-7 rounded-l-sm bg-slate-700" aria-hidden="true" />
      <span className="absolute -left-px top-32 w-[3px] h-10 rounded-l-sm bg-slate-700" aria-hidden="true" />
      <span className="absolute -right-px top-24 w-[3px] h-12 rounded-r-sm bg-slate-700" aria-hidden="true" />

      <div className="relative w-full h-full rounded-[2rem] bg-slate-900 p-[7px] shadow-2xl">
        <div className="relative w-full h-full rounded-[1.6rem] overflow-hidden bg-white">
          <span
            className="absolute left-1/2 top-2 -translate-x-1/2 w-2 h-2 rounded-full bg-slate-900 z-20"
            aria-hidden="true"
          />
          {children}
        </div>
      </div>
    </div>
  );
}
