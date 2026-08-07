"use client";

import { cn } from "@/lib/cn";

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "success" | "error" | "warning" | "info";
}

const variants = {
  default: "bg-slate-100 border-slate-200 text-text-secondary",
  success: "bg-success/10 border-success/30 text-success",
  error: "bg-error/10 border-error/30 text-error",
  warning: "bg-warning/10 border-warning/30 text-warning",
  info: "bg-info/10 border-info/30 text-info",
};

// Only errors/warnings are urgent enough to interrupt a screen reader —
// informational and success states should announce politely (role="status")
// rather than aggressively (role="alert") on every benign state change.
const URGENT_VARIANTS: AlertProps["variant"][] = ["error", "warning"];

export function Alert({ variant = "default", className, ...props }: AlertProps) {
  return (
    <div
      role={URGENT_VARIANTS.includes(variant) ? "alert" : "status"}
      className={cn(
        "rounded-lg border px-4 py-3 text-body",
        variants[variant],
        className
      )}
      {...props}
    />
  );
}

export function AlertTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h5 className={cn("mb-1 font-bold leading-none tracking-tight", className)} {...props} />
  );
}

export function AlertDescription({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn("text-sm", className)} {...props} />;
}
