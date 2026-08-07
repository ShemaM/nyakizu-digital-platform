import { forwardRef } from "react";
import { cn } from "@/lib/cn";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "elevated" | "outlined";
  /** Adds a hover lift + shadow bloom for cards that are themselves a click target (e.g. wrapped in a Link). */
  interactive?: boolean;
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = "default", interactive = false, ...props }, ref) => {
    const variants = {
      default:
        "bg-white border border-slate-100 rounded-2xl shadow-[0_1px_2px_rgba(15,23,42,0.04),0_8px_24px_-8px_rgba(15,23,42,0.08)]",
      elevated:
        "bg-white border border-slate-100 rounded-2xl shadow-[0_2px_4px_rgba(15,23,42,0.06),0_16px_40px_-8px_rgba(15,23,42,0.14)]",
      outlined: "bg-transparent border border-slate-200 rounded-2xl",
    };

    return (
      <div
        ref={ref}
        className={cn(
          variants[variant],
          "transition-all duration-200",
          interactive &&
            "cursor-pointer hover:-translate-y-0.5 hover:border-slate-200 hover:shadow-[0_4px_8px_rgba(15,23,42,0.06),0_20px_48px_-8px_rgba(15,23,42,0.18)]",
          className
        )}
        {...props}
      />
    );
  }
);

Card.displayName = "Card";

const CardHeader = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("border-b border-slate-100 px-6 py-5 sm:px-8", className)}
      {...props}
    />
  )
);

CardHeader.displayName = "CardHeader";

const CardTitle = forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h2
      ref={ref}
      className={cn("text-lg font-bold text-text-primary sm:text-xl", className)}
      {...props}
    />
  )
);

CardTitle.displayName = "CardTitle";

const CardDescription = forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p
      ref={ref}
      className={cn("text-sm text-text-secondary mt-1", className)}
      {...props}
    />
  )
);

CardDescription.displayName = "CardDescription";

const CardContent = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("px-6 py-4 sm:px-8", className)}
      {...props}
    />
  )
);

CardContent.displayName = "CardContent";

const CardFooter = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("border-t border-slate-100 flex items-center justify-between gap-3 px-6 py-4 sm:px-8", className)}
      {...props}
    />
  )
);

CardFooter.displayName = "CardFooter";

const CardSection = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("px-6 py-4 sm:px-8", className)}
      {...props}
    />
  )
);

CardSection.displayName = "CardSection";

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardSection, CardFooter };