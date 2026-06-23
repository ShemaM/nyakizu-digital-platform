import { cn } from "@/lib/cn";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  elevated?: boolean;
}

export function Card({ children, className, onClick, elevated }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "app-panel rounded-lg p-4",
        "transition-all duration-200",
        onClick && [
          "cursor-pointer",
          "hover:border-blue-200",
          "hover:shadow-[0_16px_32px_rgba(15,23,42,0.08)]",
          "hover:-translate-y-0.5",
          "active:scale-[0.99]",
        ],
        elevated && "shadow-[0_16px_36px_rgba(15,23,42,0.08)]",
        className
      )}
    >
      {children}
    </div>
  );
}

export function CardSection({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("mt-3 pt-3 border-t border-slate-100", className)}>
      {children}
    </div>
  );
}
