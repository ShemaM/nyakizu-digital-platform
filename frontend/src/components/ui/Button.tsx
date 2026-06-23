import { cn } from "@/lib/cn";
import type { ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "ghost";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
}

const VARIANT: Record<string, string> = {
  primary: [
    "bg-blue-600 text-white",
    "shadow-[0_8px_18px_rgba(37,99,235,0.18)]",
    "hover:bg-blue-700",
    "active:bg-blue-800",
    "disabled:bg-blue-300 disabled:shadow-none",
  ].join(" "),

  secondary: [
    "bg-white/85 text-slate-700 border border-slate-200",
    "shadow-[0_1px_2px_rgba(15,23,42,0.04)]",
    "hover:bg-white hover:border-slate-300",
    "active:bg-slate-50",
    "disabled:opacity-50 disabled:shadow-none",
  ].join(" "),

  danger: [
    "bg-gradient-to-b from-red-500 to-red-600 text-white",
    "shadow-[0_1px_3px_rgba(220,38,38,0.35)]",
    "hover:from-red-600 hover:to-red-700",
    "disabled:from-red-300 disabled:to-red-300 disabled:shadow-none",
  ].join(" "),

  ghost: [
    "text-blue-700",
    "hover:bg-blue-50",
    "active:bg-blue-100",
    "disabled:opacity-50",
  ].join(" "),
};

const SIZE: Record<string, string> = {
  sm: "px-3 py-1.5 text-xs rounded-lg",
  md: "px-4 py-2.5 text-sm rounded-lg",
  lg: "px-5 py-3 text-sm rounded-lg",
};

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  className,
  children,
  disabled,
  ...rest
}: ButtonProps) {
  return (
    <button
      {...rest}
      disabled={disabled || loading}
      className={cn(
        "inline-flex items-center justify-center gap-2 font-semibold",
        "transition-all duration-150 cursor-pointer select-none",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2",
        "disabled:pointer-events-none",
        "active:scale-[0.98]",
        VARIANT[variant],
        SIZE[size],
        className
      )}
    >
      {loading && (
        <svg className="animate-spin h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
        </svg>
      )}
      {children}
    </button>
  );
}
