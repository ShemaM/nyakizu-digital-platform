import { cn } from "@/lib/cn";

const tones: Record<string, string> = {
  approved: "border-emerald-200 bg-emerald-50 text-emerald-700",
  available: "border-emerald-200 bg-emerald-50 text-emerald-700",
  pending: "border-amber-200 bg-amber-50 text-amber-700",
  draft: "border-slate-200 bg-slate-50 text-slate-600",
  rejected: "border-red-200 bg-red-50 text-red-700",
  out_of_stock: "border-red-200 bg-red-50 text-red-700",
};

export function StatusBadge({ value }: { value?: string | null }) {
  const label = value ? value.replaceAll("_", " ") : "unknown";

  return (
    <span
      className={cn(
        "inline-flex h-7 items-center rounded-full border px-2.5 text-xs font-bold capitalize",
        tones[value ?? ""] ?? "border-line bg-white text-body",
      )}
    >
      {label}
    </span>
  );
}
