import { cn } from "@/lib/cn";

interface ProgressBarProps {
  percent: number;
  tone?: "success" | "warning" | "role";
  className?: string;
}

const FILL_CLASSES: Record<NonNullable<ProgressBarProps["tone"]>, string> = {
  success: "bg-success",
  warning: "bg-warning",
  role: "bg-role",
};

export function ProgressBar({ percent, tone = "warning", className }: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, percent));
  return (
    <div className={cn("w-full bg-slate-100 rounded-full h-2", className)}>
      <div
        className={cn("h-2 rounded-full transition-all", FILL_CLASSES[tone])}
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}
