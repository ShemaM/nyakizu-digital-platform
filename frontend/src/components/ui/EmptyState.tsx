import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/cn";
import { Button } from "./Button";
import { ReactNode } from "react";

interface EmptyStateProps {
  icon?: LucideIcon | ReactNode;
  iconClassName?: string; // Only applies when `icon` is a LucideIcon
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
    variant?: "primary" | "secondary";
  };
  className?: string;
}

const DEFAULT_ICON_SIZE = 32;
const DEFAULT_ICON_COLOR = "text-role";
const DEFAULT_ICON_BG = "bg-role-soft";

export function EmptyState({
  icon: Icon,
  iconClassName,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-slate-100 bg-white p-12 text-center shadow-sm",
        "animate-fade-in-up",
        className
      )}
    >
      {Icon && (
        <div
          className={cn(
            "w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4",
            DEFAULT_ICON_BG,
            iconClassName
          )}
        >
          {typeof Icon === "function" ? (
            <Icon size={DEFAULT_ICON_SIZE} className={DEFAULT_ICON_COLOR} />
          ) : (
            Icon
          )}
        </div>
      )}

      <h3 className="text-sm font-bold text-text-primary sm:text-base">
        {title}
      </h3>

      {description && (
        <p className="mx-auto mt-2 max-w-md text-left text-xs leading-relaxed text-text-secondary">
          {description}
        </p>
      )}

      {action && (
        <div className="mt-6">
          <Button
            variant={action.variant === "primary" ? "default" : action.variant || "default"}
            onClick={action.onClick}
            size="sm"
          >
            {action.label}
          </Button>
        </div>
      )}
    </div>
  );
}

// Pre-configured empty states for common use cases
interface PreConfiguredEmptyStateProps {
  className?: string;
  onActionClick?: () => void;
}

export function NoDataEmptyState({ className, onActionClick }: PreConfiguredEmptyStateProps) {
  return (
    <EmptyState
      icon={
        <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <span className="text-3xl">📭</span>
        </div>
      }
      title="No data found"
      description="There's no data to display at the moment."
      action={onActionClick ? {
        label: "Refresh",
        onClick: onActionClick,
        variant: "secondary",
      } : undefined}
      className={className}
    />
  );
}

export function NoSuppliersEmptyState({ className, onActionClick }: PreConfiguredEmptyStateProps) {
  return (
    <EmptyState
      icon={
        <div className="w-14 h-14 bg-info/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <span className="text-3xl">🏪</span>
        </div>
      }
      title="No suppliers yet"
      description="Approved wholesalers will appear here once they join the platform."
      action={onActionClick ? {
        label: "Find Suppliers",
        onClick: onActionClick,
        variant: "primary",
      } : undefined}
      className={className}
    />
  );
}

export function NoOrdersEmptyState({ className, onActionClick }: PreConfiguredEmptyStateProps) {
  return (
    <EmptyState
      icon={
        <div className="w-14 h-14 bg-violet-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <span className="text-3xl">📦</span>
        </div>
      }
      title="No orders yet"
      description="Your order history will appear here once you start placing orders."
      action={onActionClick ? {
        label: "Place First Order",
        onClick: onActionClick,
        variant: "primary",
      } : undefined}
      className={className}
    />
  );
}

export function NoProductsEmptyState({ className, onActionClick }: PreConfiguredEmptyStateProps) {
  return (
    <EmptyState
      icon={
        <div className="w-14 h-14 bg-success/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <span className="text-3xl">🏷️</span>
        </div>
      }
      title="No products listed"
      description="Start adding products to your catalog to begin selling."
      action={onActionClick ? {
        label: "Add Product",
        onClick: onActionClick,
        variant: "primary",
      } : undefined}
      className={className}
    />
  );
}

export function NoPaymentsEmptyState({ className, onActionClick }: PreConfiguredEmptyStateProps) {
  return (
    <EmptyState
      icon={
        <div className="w-14 h-14 bg-warning/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <span className="text-3xl">💳</span>
        </div>
      }
      title="No payment history"
      description="Your payment records will appear here once transactions are made."
      action={onActionClick ? {
        label: "View Orders",
        onClick: onActionClick,
        variant: "secondary",
      } : undefined}
      className={className}
    />
  );
}

export function SearchResultsEmptyState({ className, onActionClick }: PreConfiguredEmptyStateProps) {
  return (
    <EmptyState
      icon={
        <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <span className="text-3xl">🔍</span>
        </div>
      }
      title="No results found"
      description="Try adjusting your search terms or filters to find what you're looking for."
      action={onActionClick ? {
        label: "Clear Filters",
        onClick: onActionClick,
        variant: "secondary",
      } : undefined}
      className={className}
    />
  );
}