import { ClipboardList, CheckCircle2, PackageCheck, Wallet, Ban } from "lucide-react";
import { cn } from "@/lib/cn";
import type { TrackerStep } from "@/lib/order-status";

const ICONS = [ClipboardList, CheckCircle2, PackageCheck, Wallet];

interface OrderTrackerProps {
  steps: TrackerStep[];
  className?: string;
}

/** A row of steps with icons and a connecting line — the buyer sees at a glance where their order is, and that every step ahead is still coming. */
export function OrderTracker({ steps, className }: OrderTrackerProps) {
  if (steps.length === 1) {
    // Cancelled — a single terminal state, not a progression.
    return (
      <div className={cn("flex flex-col items-center text-center py-1", className)}>
        <span className="flex items-center justify-center w-10 h-10 rounded-full bg-error/10 text-error mb-2">
          <Ban size={18} />
        </span>
        <p className="text-sm font-bold text-error">{steps[0].label}</p>
      </div>
    );
  }

  const lastIndex = steps.length - 1;
  const currentIndex = steps.findIndex((s) => s.current);
  const progressPct = lastIndex > 0 && currentIndex >= 0 ? (currentIndex / lastIndex) * 100 : 0;

  return (
    <div className={cn("relative", className)}>
      <div
        className="absolute top-[18px] sm:top-[22px] left-[18px] right-[18px] sm:left-[22px] sm:right-[22px] h-0.5 bg-slate-200"
        aria-hidden="true"
      >
        <div className="h-full bg-role transition-all duration-500" style={{ width: `${progressPct}%` }} />
      </div>
      <div className="relative flex justify-between">
        {steps.map((step, i) => {
          const Icon = ICONS[i] ?? CheckCircle2;
          return (
            <div key={step.label} className="flex flex-col items-center flex-1 min-w-0 px-0.5">
              <span
                className={cn(
                  "flex items-center justify-center w-9 h-9 sm:w-11 sm:h-11 rounded-full shrink-0 transition-colors",
                  step.current
                    ? "bg-role-dark text-white ring-4 ring-role/20"
                    : step.done
                    ? "bg-role-dark text-white"
                    : "bg-slate-100 text-slate-300"
                )}
              >
                <Icon size={16} strokeWidth={2.5} />
              </span>
              <p
                className={cn(
                  "mt-2 text-[10px] sm:text-xs font-bold text-center leading-tight",
                  step.current ? "text-role" : step.done ? "text-text-primary" : "text-text-muted"
                )}
              >
                {step.label}
              </p>
              {step.date && <p className="text-[9px] text-text-muted mt-0.5 text-center">{step.date}</p>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
