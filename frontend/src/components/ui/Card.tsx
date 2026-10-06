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
        "bg-dark-card border border-dark-accent rounded-2xl shadow-sm text-text-primary",
      elevated:
        "bg-dark-card border border-dark-accent rounded-2xl shadow-md text-text-primary",
      outlined: "bg-transparent border border-dark-accent rounded-2xl text-text-primary",
    };

    return (
      <div
        ref={ref}
        className={cn(
          variants[variant],
          "transition-all duration-200",
          interactive &&
            "cursor-pointer hover:-translate-y-0.5 hover:border-brand-gold/40 hover:shadow-card-hover",
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
      className={cn("border-b border-dark-accent px-6 py-5 sm:px-8", className)}
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
      className={cn("border-t border-dark-accent flex items-center justify-between gap-3 px-6 py-4 sm:px-8", className)}
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