import { cn } from "@/lib/cn";
import { User } from "lucide-react";

const COLORS = [
  "bg-blue-500", "bg-violet-500", "bg-emerald-500",
  "bg-amber-500", "bg-pink-500", "bg-cyan-600",
];

function avatarColor(name: string): string {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
  return COLORS[Math.abs(h) % COLORS.length];
}

function initials(name: string): string {
  return name.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();
}

interface AvatarProps {
  name: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  showInitials?: boolean;
  imageUrl?: string | null;
}

const SIZE_CLASSES = {
  sm: "w-8 h-8 text-xs",
  md: "w-10 h-10 text-sm",
  lg: "w-12 h-12 text-base",
  xl: "w-16 h-16 text-xl",
};

export function Avatar({
  name,
  size = "md",
  className,
  showInitials = true,
  imageUrl,
}: AvatarProps) {
  const sizeClass = SIZE_CLASSES[size];
  const initialText = showInitials ? initials(name) : name[0]?.toUpperCase() ?? "?";

  if (imageUrl) {
    return (
      <div
        className={cn(
          "rounded-full overflow-hidden shrink-0",
          sizeClass,
          className
        )}
      >
        <img
          src={imageUrl}
          alt={name}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.currentTarget.style.display = "none";
            e.currentTarget.parentElement?.classList.add(
              avatarColor(name),
              "flex",
              "items-center",
              "justify-center",
              "text-white",
              "font-bold"
            );
          }}
        />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "rounded-full flex items-center justify-center shrink-0 text-white font-bold",
        avatarColor(name),
        sizeClass,
        className
      )}
    >
      {initialText}
    </div>
  );
}

interface AvatarGroupProps {
  names: string[];
  size?: "sm" | "md" | "lg";
  max?: number;
  className?: string;
}

export function AvatarGroup({ names, size = "md", max = 3, className }: AvatarGroupProps) {
  const visibleNames = names.slice(0, max);
  const remainingCount = names.length - max;

  return (
    <div className={cn("flex items-center -space-x-2", className)}>
      {visibleNames.map((name, index) => (
        <Avatar
          key={index}
          name={name}
          size={size}
          className="border-2 border-white"
        />
      ))}
      {remainingCount > 0 && (
        <div
          className={cn(
            "rounded-full flex items-center justify-center shrink-0 bg-gray-200 text-gray-600 font-bold border-2 border-white",
            SIZE_CLASSES[size]
          )}
        >
          +{remainingCount}
        </div>
      )}
    </div>
  );
}

interface AvatarPlaceholderProps {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

export function AvatarPlaceholder({ size = "md", className }: AvatarPlaceholderProps) {
  const sizeClass = SIZE_CLASSES[size];

  return (
    <div
      className={cn(
        "rounded-full flex items-center justify-center shrink-0 bg-gray-100 text-gray-400",
        sizeClass,
        className
      )}
    >
      <User size={size === "xl" ? 24 : size === "lg" ? 20 : size === "md" ? 16 : 12} />
    </div>
  );
}