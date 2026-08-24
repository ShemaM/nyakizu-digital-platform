"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/cn";
import { avatarColor, initials } from "@/lib/avatar";

interface StoreMarkProps {
  name: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  /** The seller's own shop photo, if they've uploaded one. Falls back to
   * the color+initials plate below — on a missing URL or a failed load. */
  imageUrl?: string | null;
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
 * rather than a profile photo. Renders the seller's real shop photo when
 * they've set one; the color+initials plate is the fallback (no photo yet,
 * or the photo failed to load) — not the only option it once was, back when
 * stores had no logo upload at all.
 */
export function StoreMark({ name, size = "md", className, imageUrl }: StoreMarkProps) {
  const [imageFailed, setImageFailed] = useState(false);
  const sizeClass = SIZE_CLASSES[size];

  if (imageUrl && !imageFailed) {
    return (
      <div className={cn("relative overflow-hidden shrink-0", sizeClass, className)}>
        <Image
          src={imageUrl}
          alt={name}
          fill
          unoptimized
          className="object-cover"
          onError={() => setImageFailed(true)}
        />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex items-center justify-center shrink-0 font-black text-white",
        avatarColor(name),
        sizeClass,
        className
      )}
      aria-hidden="true"
    >
      {initials(name)}
    </div>
  );
}
