import { cn } from "@/lib/cn";

export interface LoadingProps {
  size?: "sm" | "md" | "lg";
  variant?: "spinner" | "skeleton" | "dots";
  fullScreen?: boolean;
  label?: string;
  className?: string;
}

export function Loading({
  size = "md",
  variant = "spinner",
  fullScreen = false,
  label,
  className,
}: LoadingProps) {
  const sizeMap = {
    sm: "h-4 w-4",
    md: "h-8 w-8",
    lg: "h-12 w-12",
  };

  const container = fullScreen
    ? "fixed inset-0 flex items-center justify-center bg-dark-primary/80 backdrop-blur-sm z-50"
    : "flex items-center justify-center py-8";

  if (variant === "skeleton") {
    return (
      <div className={cn(container, className)}>
        <div className="skeleton h-12 w-12 rounded-lg" />
      </div>
    );
  }

  if (variant === "dots") {
    return (
      <div className={cn(container, className)}>
        <div className="flex gap-2 items-center">
          <span className="skeleton h-2 w-2 rounded-full animate-pulse" />
          <span className="skeleton h-2 w-2 rounded-full animate-pulse delay-100" />
          <span className="skeleton h-2 w-2 rounded-full animate-pulse delay-200" />
          {label && <span className="ml-2 text-sm text-slate-400">{label}</span>}
        </div>
      </div>
    );
  }

  // Default spinner
  return (
    <div className={cn(container, className)}>
      <div className="flex flex-col items-center gap-3">
        <svg
          className={cn("animate-spin text-brand-gold", sizeMap[size])}
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
        {label && <p className="text-sm text-slate-400">{label}</p>}
      </div>
    </div>
  );
}