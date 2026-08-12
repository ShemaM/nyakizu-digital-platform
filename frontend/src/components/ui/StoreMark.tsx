import { cn } from "@/lib/cn";
import { avatarColor, initials } from "@/lib/avatar";

interface StoreMarkProps {
  name: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

const SIZE_CLASSES = {
  sm: "w-10 h-10 text-sm rounded-xl",
  md: "w-12 h-12 text-base rounded-xl",
  lg: "w-16 h-16 text-xl rounded-2xl",
  xl: "w-20 h-20 text-2xl rounded-2xl",
};

/**
 * Square identity mark for a store — same color-hash + initials logic as
 * Avatar (rounded, for people), just squared off to read as a "brand plate"
 * rather than a profile photo. Stores have no logo upload today, so this is
 * the permanent visual, not a loading fallback — every store gets one
 * consistent color wherever it appears (directory grid, its own page).
 */
export function StoreMark({ name, size = "md", className }: StoreMarkProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-center shrink-0 font-black text-white",
        avatarColor(name),
        SIZE_CLASSES[size],
        className
      )}
      aria-hidden="true"
    >
      {initials(name)}
    </div>
  );
}
