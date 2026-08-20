import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/cn"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-semibold transition-all duration-200 ease-spring active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-info focus-visible:ring-offset-2 focus-visible:ring-offset-dark-primary disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-info text-white shadow-md hover:bg-info/90 hover:shadow-lg",
        role: "text-white shadow-md hover:shadow-lg bg-role-dark hover:opacity-90",
        dark: "bg-slate-900 text-white shadow-md hover:bg-slate-800 hover:shadow-lg",
        destructive: "bg-error text-white shadow-sm hover:bg-error/90",
        outline: "border border-slate-300 bg-transparent text-text-secondary shadow-sm hover:bg-slate-50 hover:border-slate-400",
        secondary: "bg-slate-100 text-text-primary shadow-sm hover:bg-slate-200",
        ghost: "text-text-secondary hover:bg-slate-100 hover:text-text-primary",
        link: "text-info underline-offset-4 hover:underline",
      },
      size: {
        default: "h-11 px-8",
        sm: "h-10 rounded-md px-3",
        lg: "h-12 rounded-lg px-8",
        icon: "h-11 w-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  loading?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, loading = false, children, ...props }, ref) => {
    if (asChild) {
      return (
        <Slot
          className={cn(buttonVariants({ variant, size, className }))}
          ref={ref}
          {...props}
        >
          {children}
        </Slot>
      )
    }
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={loading || props.disabled}
        {...props}
      >
        {loading && (
          <span
            className="h-4 w-4 shrink-0 rounded-full border-2 border-current border-t-transparent animate-spin mr-2"
            aria-hidden="true"
          />
        )}
        {children}
      </button>
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
