import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/cn";

interface MetricCardProps {
  Icon: LucideIcon;
  label: string;
  value: string;
  hint?: string;
  tone?: "role" | "success" | "warning" | "error";
}

const TONE_CLASSES: Record<NonNullable<MetricCardProps["tone"]>, string> = {
  role: "bg-role-soft text-role",
  success: "bg-success/12 text-success",
  warning: "bg-warning/12 text-warning",
  error: "bg-error/12 text-error",
};

/** A single overview number — distinct from ShopStats' action cards, this row is "how's business", not "what needs me". */
export function MetricCard({ Icon, label, value, hint, tone = "role" }: MetricCardProps) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 sm:p-5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-wider text-text-muted">{label}</span>
        <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center shrink-0", TONE_CLASSES[tone])}>
          <Icon className="w-4.5 h-4.5" size={18} />
        </div>
      </div>
      <p className="text-2xl sm:text-3xl font-black text-text-primary tabular-nums mt-2 leading-tight">{value}</p>
      {hint && <p className="text-xs text-text-muted mt-1">{hint}</p>}
    </div>
  );
}
