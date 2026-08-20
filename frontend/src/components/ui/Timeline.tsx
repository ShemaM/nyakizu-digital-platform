import { Check } from "lucide-react";
import { cn } from "@/lib/cn";

interface TimelineStep {
  label: string;
  done: boolean;
  /** The step the order is on right now — gets a highlighted, pulsing marker. */
  current?: boolean;
  /** Shown under the label once the step has happened, e.g. "2 Jun, 3:40 PM". */
  date?: string;
}

interface TimelineProps {
  steps: TimelineStep[];
  className?: string;
}

export function Timeline({ steps, className }: TimelineProps) {
  return (
    <div className={cn("relative", className)}>
      {steps.map((step, i) => {
        const isLast = i === steps.length - 1;
        return (
          <div key={step.label} className="relative flex gap-3 pb-6 last:pb-0">
            {!isLast && (
              <span
                className={cn(
                  "absolute left-[11px] top-6 -bottom-1 w-0.5",
                  step.done && !step.current ? "bg-success" : "bg-slate-200"
                )}
                aria-hidden="true"
              />
            )}

            <span
              className={cn(
                "relative z-10 flex items-center justify-center w-6 h-6 rounded-full shrink-0",
                step.current
                  ? "bg-role-dark text-white ring-4 ring-role/20 animate-pulse"
                  : step.done
                  ? "bg-success text-white"
                  : "bg-slate-100 text-slate-300"
              )}
            >
              {step.done && !step.current ? (
                <Check size={13} strokeWidth={3} />
              ) : (
                <span className="w-1.5 h-1.5 rounded-full bg-current" />
              )}
            </span>

            <div className="min-w-0 pt-0.5">
              <p
                className={cn(
                  "text-sm",
                  step.current
                    ? "font-bold text-role"
                    : step.done
                    ? "font-medium text-text-primary"
                    : "text-text-muted"
                )}
              >
                {step.label}
              </p>
              {step.date && (
                <p className="text-xs text-text-muted mt-0.5">{step.date}</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
