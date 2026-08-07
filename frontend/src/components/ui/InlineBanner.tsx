import { LucideIcon, Lock, Info, CheckCircle2, AlertTriangle, CloudOff } from "lucide-react";
import { cn } from "@/lib/cn";

type BannerTone = "locked" | "saved" | "info" | "success" | "warning" | "offline";

interface InlineBannerProps {
  tone: BannerTone;
  children: React.ReactNode;
  icon?: LucideIcon;
  className?: string;
}

const TONE_STYLES: Record<BannerTone, string> = {
  locked: "bg-slate-900 border-slate-900 text-white",
  saved: "bg-amber-50 border-amber-200 text-amber-700",
  info: "bg-blue-50 border-blue-200 text-blue-700",
  success: "bg-green-50 border-green-200 text-green-700",
  warning: "bg-amber-50 border-amber-200 text-amber-700",
  offline: "bg-slate-100 border-slate-200 text-text-secondary",
};

const TONE_ICONS: Record<BannerTone, LucideIcon> = {
  locked: Lock,
  saved: Info,
  info: Info,
  success: CheckCircle2,
  warning: AlertTriangle,
  offline: CloudOff,
};

export function InlineBanner({ tone, children, icon, className }: InlineBannerProps) {
  const Icon = icon ?? TONE_ICONS[tone];
  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-xl border px-3 py-2.5",
        TONE_STYLES[tone],
        className
      )}
    >
      <Icon size={14} className="shrink-0" />
      <p className="text-xs">{children}</p>
    </div>
  );
}
