import { Package } from "lucide-react";
import { clsx } from "clsx";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  inverted?: boolean;
  className?: string;
}

export function Logo({ size = "md", inverted = false, className }: LogoProps) {
  const dims = { sm: 30, md: 38, lg: 48 }[size];
  const textName = { sm: "text-sm", md: "text-base", lg: "text-xl" }[size];
  const textSub = { sm: "text-[9px]", md: "text-[10px]", lg: "text-xs" }[size];

  return (
    <div className={clsx("flex items-center gap-2.5 select-none", className)}>
      {/* Icon mark */}
      <div
        style={{ width: dims, height: dims }}
        className={clsx(
          "flex shrink-0 items-center justify-center rounded-lg shadow-sm ring-1",
          inverted
            ? "bg-[#C8860A] text-[#0a1f10] ring-[#C8860A]/30"
            : "bg-[#0a1f10] text-[#C8860A] ring-[#C8860A]/20"
        )}
      >
        <Package size={Math.round(dims * 0.54)} strokeWidth={2.4} />
      </div>

      {/* Word mark */}
      <div className="leading-none">
        <p className={clsx(textName, "font-extrabold leading-none", inverted ? "text-[#0a1f10]" : "text-[#C8860A]")}>
          Nyakizu
        </p>
        <p className={clsx(textSub, "font-bold tracking-wide uppercase mt-0.5", inverted ? "text-[#0a1f10]/60" : "text-[#C8860A]/70")}>
          Digital
        </p>
      </div>
    </div>
  );
}
