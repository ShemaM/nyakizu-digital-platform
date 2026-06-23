import { cn } from "@/lib/cn";

// Base skeleton animation class
const SKELETON_BASE = "animate-pulse bg-gray-200 rounded";

// Generic skeleton component for any element
interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return <div className={cn(SKELETON_BASE, className)} />;
}

// Card skeleton - simulates a card loading state
interface CardSkeletonProps {
  className?: string;
  showAvatar?: boolean;
  lines?: number;
}

export function CardSkeleton({ className, showAvatar = false, lines = 3 }: CardSkeletonProps) {
  return (
    <div
      className={cn(
        "bg-white rounded-2xl border border-gray-100 p-4 shadow-[0_1px_3px_rgba(0,0,0,0.07)]",
        className
      )}
    >
      <div className="flex items-start gap-3">
        {showAvatar && (
          <Skeleton className="w-12 h-12 rounded-xl shrink-0" />
        )}
        <div className="flex-1 min-w-0 space-y-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
          {Array.from({ length: lines }).map((_, i) => (
            <Skeleton key={i} className="h-3 w-full" />
          ))}
        </div>
      </div>
    </div>
  );
}

// List skeleton - simulates multiple cards in a list
interface ListSkeletonProps {
  count?: number;
  className?: string;
  showAvatar?: boolean;
  lines?: number;
}

export function ListSkeleton({
  count = 3,
  className,
  showAvatar = false,
  lines = 2,
}: ListSkeletonProps) {
  return (
    <div className={cn("space-y-3", className)}>
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton
          key={i}
          showAvatar={showAvatar}
          lines={lines}
          className={cn("animate-fade-in-up", i === 0 ? "delay-75" : i === 1 ? "delay-150" : "delay-200")}
        />
      ))}
    </div>
  );
}

// KPI card skeleton - simulates metric cards
interface KPICardSkeletonProps {
  className?: string;
}

export function KPICardSkeleton({ className }: KPICardSkeletonProps) {
  return (
    <div
      className={cn(
        "bg-white rounded-2xl border border-gray-100 p-5 shadow-[0_1px_3px_rgba(0,0,0,0.07)]",
        className
      )}
    >
      <Skeleton className="h-3 w-1/3 mb-3" />
      <Skeleton className="h-8 w-1/2 mb-2" />
      <Skeleton className="h-3 w-full" />
    </div>
  );
}

// KPI grid skeleton - simulates a row of metric cards
interface KPIGridSkeletonProps {
  count?: number;
  className?: string;
}

export function KPIGridSkeleton({ count = 3, className }: KPIGridSkeletonProps) {
  return (
    <div className={cn("grid gap-3 sm:grid-cols-3", className)}>
      {Array.from({ length: count }).map((_, i) => (
        <KPICardSkeleton
          key={i}
          className={cn("animate-fade-in-up", i === 0 ? "delay-75" : i === 1 ? "delay-150" : "delay-200")}
        />
      ))}
    </div>
  );
}

// Page skeleton - simulates a full page loading state
interface PageSkeletonProps {
  showHeader?: boolean;
  showKPIs?: boolean;
  listCount?: number;
  className?: string;
}

export function PageSkeleton({
  showHeader = true,
  showKPIs = false,
  listCount = 3,
  className,
}: PageSkeletonProps) {
  return (
    <div className={cn("space-y-4", className)}>
      {showHeader && (
        <div className="animate-fade-in-up">
          <Skeleton className="h-6 w-48 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>
      )}

      {showKPIs && (
        <KPIGridSkeleton count={3} className="animate-fade-in-up delay-75" />
      )}

      <ListSkeleton
        count={listCount}
        showAvatar={true}
        lines={2}
        className="animate-fade-in-up delay-100"
      />
    </div>
  );
}

// Table skeleton - simulates a table loading state
interface TableSkeletonProps {
  rows?: number;
  columns?: number;
  className?: string;
}

export function TableSkeleton({ rows = 5, columns = 4, className }: TableSkeletonProps) {
  return (
    <div className={cn("bg-white rounded-2xl border border-gray-100 overflow-hidden", className)}>
      {/* Header */}
      <div className="border-b border-gray-100 p-4">
        <div className="flex gap-4">
          {Array.from({ length: columns }).map((_, i) => (
            <Skeleton key={i} className="h-4 flex-1" />
          ))}
        </div>
      </div>

      {/* Rows */}
      <div className="divide-y divide-gray-50">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="p-4">
            <div className="flex gap-4">
              {Array.from({ length: columns }).map((_, j) => (
                <Skeleton key={j} className="h-4 flex-1" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Button skeleton - simulates a loading button
interface ButtonSkeletonProps {
  className?: string;
}

export function ButtonSkeleton({ className }: ButtonSkeletonProps) {
  return (
    <Skeleton className={cn("h-10 w-32 rounded-lg", className)} />
  );
}

// Inline loading indicator - small loading spinner/text
interface InlineLoadingProps {
  text?: string;
  className?: string;
}

export function InlineLoading({ text = "Loading...", className }: InlineLoadingProps) {
  return (
    <div className={cn("flex items-center gap-2 text-sm text-gray-500", className)}>
      <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      <span>{text}</span>
    </div>
  );
}

// Full page loading overlay
interface FullPageLoadingProps {
  text?: string;
}

export function FullPageLoading({ text = "Loading..." }: FullPageLoadingProps) {
  return (
    <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm text-gray-600">{text}</p>
      </div>
    </div>
  );
}