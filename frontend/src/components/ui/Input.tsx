"use client";
import { cn } from "@/lib/cn";
import { AlertCircle } from "lucide-react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  hint?: string;
  optional?: boolean;
  trailing?: React.ReactNode;
}

export function Input({
  label, error, hint, optional, trailing,
  id, className, ...props
}: InputProps) {
  const inputId = id ?? label.toLowerCase().replace(/\s+/g, "-");
  return (
    <div className="space-y-1.5">
      <label htmlFor={inputId}
        className="flex items-center gap-2 text-sm font-semibold text-ink">
        {label}
        {optional && <span className="text-xs font-normal text-muted">(optional)</span>}
      </label>
      <div className="relative">
        <input
          id={inputId}
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-err` : hint ? `${inputId}-hint` : undefined}
          className={cn(
            "h-11 w-full rounded-md border bg-white px-4 text-sm text-ink",
            "placeholder:text-muted transition outline-none",
            "focus:ring-2",
            trailing ? "pr-11" : "",
            error
              ? "border-red-400 ring-red-100 focus:ring-red-200"
              : "border-line focus:border-brand focus:ring-emerald-100",
            className,
          )}
          {...props}
        />
        {trailing && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-3">
            {trailing}
          </div>
        )}
      </div>
      {error ? (
        <p id={`${inputId}-err`} role="alert"
          className="flex items-center gap-1.5 text-xs font-medium text-red-600">
          <AlertCircle size={12} className="shrink-0" />{error}
        </p>
      ) : hint ? (
        <p id={`${inputId}-hint`} className="text-xs text-muted">{hint}</p>
      ) : null}
    </div>
  );
}
