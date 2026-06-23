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
            ? "bg-white text-blue-700 ring-white/20"
            : "bg-slate-950 text-white ring-slate-900/10"
        )}
      >
        <Package size={dims * 0.54} strokeWidth={2.4} />
      </div>

      {/* Word mark */}
      <div className="leading-none">
        <p className={clsx(textName, "font-extrabold leading-none", inverted ? "text-white" : "text-gray-900")}>
          Nyakizu
        </p>
        <p className={clsx(textSub, "font-bold tracking-wide uppercase mt-0.5", inverted ? "text-slate-400" : "text-blue-600")}>
          Digital
        </p>
      </div>
    </div>
  );
}
