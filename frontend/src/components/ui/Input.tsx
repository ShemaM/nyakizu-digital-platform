import { forwardRef } from "react";
import { cn } from "@/lib/cn";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  icon?: React.ReactNode;
  error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, icon, error, className, ...props }, ref) => {
    return (
      <div className="space-y-2">
        {label && <label className="text-label">{label}</label>}
        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            className={cn(
              "w-full rounded-lg border border-slate-700 bg-slate-900/50 px-4 py-2 text-slate-100 placeholder-slate-500 transition-all duration-200",
              "focus:border-brand-gold focus:bg-slate-900 focus:ring-1 focus:ring-brand-gold/50 focus:outline-none",
              "disabled:cursor-not-allowed disabled:opacity-50",
              "read-only:cursor-default read-only:bg-slate-900/30",
              icon && "pl-10",
              error && "border-error focus:ring-error/50",
              className
            )}
            {...props}
          />
        </div>
        {error && <p className="text-xs text-error">{error}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";

export { Input };

interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "success" | "error" | "warning" | "info";
}

const variants = {
  default: "bg-slate-800/50 border-slate-700 text-slate-200",
  success: "bg-success/10 border-success/30 text-success",
  error: "bg-error/10 border-error/30 text-error",
  warning: "bg-warning/10 border-warning/30 text-warning",
  info: "bg-info/10 border-info/30 text-info",
};

function Alert({ variant = "default", className, ...props }: AlertProps) {
  return (
    <div
      role="alert"
      className={cn(
        "rounded-lg border px-4 py-3 text-sm",
        variants[variant],
        className
      )}
      {...props}
    />
  );
}

function AlertTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h5 className={cn("mb-1 font-bold leading-none tracking-tight", className)} {...props} />
  );
}

function AlertDescription({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn("text-sm", className)} {...props} />;
}

export { Alert, AlertTitle, AlertDescription };