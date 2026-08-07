import { ReactNode } from "react";
import { cn } from "@/lib/cn";

interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

/** Consistent section divider used across dashboard pages — eyebrow + title + optional description/action, with a bottom rule. */
export function SectionHeading({ eyebrow, title, description, action, className }: SectionHeadingProps) {
  return (
    <div className={cn("flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 pb-4 mb-5 border-b border-slate-200", className)}>
      <div className="min-w-0">
        {eyebrow && (
          <p className="text-xs font-extrabold uppercase tracking-widest text-role mb-1">{eyebrow}</p>
        )}
        <h2 className="text-xl sm:text-2xl font-black text-text-primary tracking-tight">{title}</h2>
        {description && <p className="text-sm text-text-muted mt-1">{description}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
