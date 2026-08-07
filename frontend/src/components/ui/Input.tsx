import { forwardRef, useId } from "react";
import { cn } from "@/lib/cn";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  icon?: React.ReactNode;
  endAdornment?: React.ReactNode;
  error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, icon, endAdornment, error, className, id, ...props }, ref) => {
    const generatedId = useId();
    const inputId = id ?? generatedId;
    return (
      <div className="space-y-2">
        {label && <label htmlFor={inputId} className="text-label">{label}</label>}
        <div className="relative">
          {icon && (
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            className={cn(
              "flex h-11 w-full rounded-md border border-slate-200 bg-white px-4 text-body text-text-primary placeholder:text-slate-400 transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-info focus-visible:ring-offset-2 focus-visible:ring-offset-dark-primary",
              "disabled:cursor-not-allowed disabled:opacity-50",
              "read-only:cursor-default read-only:bg-slate-50",
              icon && "pl-10",
              endAdornment && "pr-10",
              error && "border-error focus-visible:ring-error",
              className
            )}
            {...props}
          />
          {endAdornment && (
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400">
              {endAdornment}
            </div>
          )}
        </div>
        {error && <p className="mt-1.5 text-caption text-error">{error}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";

export { Input };
