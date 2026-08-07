"use client";

import { Minus, Plus } from "lucide-react";
import { cn } from "@/lib/cn";

interface QuantityStepperProps {
  qty: number;
  onDecrease: () => void;
  onIncrease: () => void;
  disabled?: boolean;
  className?: string;
}

export function QuantityStepper({ qty, onDecrease, onIncrease, disabled, className }: QuantityStepperProps) {
  return (
    <div className={cn("flex items-center gap-2 shrink-0", className)}>
      {qty > 0 && (
        <>
          <button
            type="button"
            onClick={onDecrease}
            aria-label="Decrease quantity"
            className="w-11 h-11 rounded-full bg-slate-100 flex items-center justify-center hover:bg-slate-200 cursor-pointer transition-colors"
          >
            <Minus size={14} />
          </button>
          <span className="w-5 text-center text-body font-bold text-text-primary">{qty}</span>
        </>
      )}
      <button
        type="button"
        onClick={onIncrease}
        disabled={disabled}
        aria-label="Increase quantity"
        className="w-11 h-11 rounded-full bg-role text-white flex items-center justify-center hover:opacity-90 disabled:bg-slate-200 disabled:text-slate-400 cursor-pointer disabled:cursor-not-allowed shadow-sm transition-colors"
      >
        <Plus size={15} />
      </button>
    </div>
  );
}
