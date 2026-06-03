"use client";
import { AlertCircle, CheckCircle2, Info, XCircle } from "lucide-react";
import { cn } from "@/lib/cn";

type AlertVariant = "error" | "success" | "warning" | "info";

const styles: Record<AlertVariant, { wrap: string; icon: React.ElementType }> = {
  error:   { wrap: "border-red-200 bg-red-50 text-red-800",     icon: XCircle },
  success: { wrap: "border-green-200 bg-green-50 text-green-800", icon: CheckCircle2 },
  warning: { wrap: "border-amber-200 bg-amber-50 text-amber-800", icon: AlertCircle },
  info:    { wrap: "border-blue-200 bg-blue-50 text-blue-800",   icon: Info },
};

export function Alert({ variant = "error", message, className }: {
  variant?: AlertVariant; message: string; className?: string;
}) {
  const { wrap, icon: Icon } = styles[variant];
  return (
    <div role="alert"
      className={cn("flex items-start gap-2.5 rounded-xl border px-4 py-3 text-sm font-medium", wrap, className)}>
      <Icon size={15} className="mt-0.5 shrink-0" strokeWidth={2.5} />
      {message}
    </div>
  );
}
