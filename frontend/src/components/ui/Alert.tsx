import { forwardRef } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/cn";
import { AlertCircle, CheckCircle2, Info, AlertTriangle, X } from "lucide-react";

const alertVariants = cva(
  "relative w-full rounded-lg border p-4 flex gap-3 items-start [&>svg+div]:grow",
  {
    variants: {
      variant: {
        default: "border-slate-700 bg-slate-900/50 text-slate-200",
        success:
          "border-success/30 bg-success/5 text-success [&>svg]:text-success",
        warning:
          "border-warning/30 bg-warning/5 text-warning [&>svg]:text-warning",
        error: "border-error/30 bg-error/5 text-error [&>svg]:text-error",
        info: "border-info/30 bg-info/5 text-info [&>svg]:text-info",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface AlertProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof alertVariants> {
  onClose?: () => void;
}

const Alert = forwardRef<HTMLDivElement, AlertProps>(
  ({ className, variant, onClose, children, ...props }, ref) => {
    const getIcon = () => {
      switch (variant) {
        case "success":
          return <CheckCircle2 className="h-5 w-5 shrink-0 mt-0.5" />;
        case "warning":
          return <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />;
        case "error":
          return <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />;
        case "info":
          return <Info className="h-5 w-5 shrink-0 mt-0.5" />;
        default:
          return null;
      }
    };

    return (
      <div
        ref={ref}
        role="alert"
        className={cn(alertVariants({ variant }), className)}
        {...props}
      >
        {getIcon()}
        <div>{children}</div>
        {onClose && (
          <button
            onClick={onClose}
            className="shrink-0 opacity-50 hover:opacity-100 transition-opacity"
            aria-label="Close alert"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    );
  }
);

Alert.displayName = "Alert";

const AlertTitle = forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3 ref={ref} className={cn("font-bold", className)} {...props} />
  )
);

AlertTitle.displayName = "AlertTitle";

const AlertDescription = forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm opacity-90", className)}
    {...props}
  />
));

AlertDescription.displayName = "AlertDescription";

export { Alert, AlertTitle, AlertDescription };
