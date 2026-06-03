"use client";
import { cn } from "@/lib/cn";
import { Loader2 } from "lucide-react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  asChild?: boolean;
}

const variants = {
  primary: "bg-brand text-white hover:bg-brand-dark shadow-sm",
  secondary: "border border-line bg-white text-ink hover:border-brand hover:text-brand shadow-sm",
  ghost: "text-body hover:bg-surface hover:text-ink",
  danger: "bg-danger text-white hover:bg-red-700",
};
const sizes = {
  sm: "h-9 px-4 text-sm rounded-md gap-1.5",
  md: "h-11 px-6 text-sm rounded-md gap-2",
  lg: "h-12 px-8 text-base rounded-md gap-2",
};

export function Button({
  variant = "primary", size = "md",
  loading, disabled, children, className, ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      disabled={disabled || loading}
      className={cn(
        "inline-flex items-center justify-center font-semibold",
        "transition active:scale-[0.98] focus-visible:outline-none",
        "focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2",
        "disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none",
        variants[variant], sizes[size], className,
      )}
    >
      {loading && <Loader2 size={15} className="animate-spin shrink-0" />}
      {children}
    </button>
  );
}
