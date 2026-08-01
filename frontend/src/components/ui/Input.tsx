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
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            className={cn(
              "flex h-11 w-full rounded-md border border-dark-accent bg-dark-secondary px-4 text-sm text-slate-200 placeholder:text-slate-500 transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold focus-visible:ring-offset-2 focus-visible:ring-offset-dark-primary",
              "disabled:cursor-not-allowed disabled:opacity-50",
              "read-only:cursor-default read-only:bg-dark-tertiary",
              icon && "pl-10",
              error && "border-error focus-visible:ring-error",
              className
            )}
            {...props}
          />
        </div>
        {error && <p className="mt-1.5 text-xs text-error">{error}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";

export { Input };
