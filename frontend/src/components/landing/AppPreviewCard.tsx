import { Store, Lock, CheckCircle2, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/Badge";

const ORDER_ROWS = [
  { label: "Tempered Glass — Samsung A54", qty: "Pack of 10", variant: "success" as const, status: "Cleared" },
  { label: "USB-C Fast Charger 25W", qty: "Pack of 5", variant: "default" as const, status: "Locked" },
  { label: "Wireless Earbuds TWS", qty: "1 pair", variant: "warning" as const, status: "Sourcing" },
];

export function AppPreviewCard() {
  return (
    <div className="relative mx-auto w-full max-w-sm lg:max-w-none">
      {/* Warm ambient glow behind the card */}
      <div
        className="absolute -inset-8 rounded-[3rem] bg-orange-300/20 blur-3xl"
        aria-hidden="true"
      />

      {/* Main preview card */}
      <div className="relative rounded-3xl border border-orange-100 bg-white p-5 shadow-[0_2px_4px_rgba(120,53,15,0.06),0_24px_48px_-12px_rgba(120,53,15,0.18)] transition-transform duration-500 rotate-1 hover:rotate-0 sm:p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-100">
              <Store className="h-5 w-5 text-orange-700" />
            </div>
            <div>
              <p className="text-sm font-bold text-stone-900">Eastleigh Phone Hub</p>
              <p className="text-xs text-stone-500">Wholesaler dashboard</p>
            </div>
          </div>
          <span className="flex items-center gap-1.5 rounded-full bg-success/10 px-2.5 py-1 text-xs font-semibold text-success">
            <span className="h-1.5 w-1.5 rounded-full bg-success" />
            Live
          </span>
        </div>

        <div className="mt-5 rounded-2xl border border-orange-100 bg-orange-50/60 p-4">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">This week</p>
            <TrendingUp className="h-4 w-4 text-success" />
          </div>
          <p className="mt-1 text-2xl font-bold tracking-tight text-stone-900">KES 128,400</p>
        </div>

        <div className="mt-4 space-y-2">
          {ORDER_ROWS.map((row) => (
            <div
              key={row.label}
              className="flex items-center justify-between gap-3 rounded-xl border border-stone-100 bg-stone-50/80 px-3 py-2.5"
            >
              <div className="min-w-0">
                <p className="truncate text-xs font-semibold text-stone-800">{row.label}</p>
                <p className="text-xs text-stone-500">{row.qty}</p>
              </div>
              <Badge
                variant={row.variant === "default" ? undefined : row.variant}
                className={`shrink-0 text-xs ${row.variant === "default" ? "bg-stone-800 text-white" : ""}`}
              >
                {row.status}
              </Badge>
            </div>
          ))}
        </div>

        <div className="mt-4 flex items-center justify-between border-t border-orange-100 pt-4">
          <span className="text-xs font-medium text-stone-500">Outstanding balance</span>
          <span className="text-sm font-bold text-warning">KES 6,200</span>
        </div>
      </div>

      {/* Floating chip: payment recorded */}
      <div className="absolute -right-4 -top-4 hidden items-center gap-2 rounded-xl border border-orange-100 bg-white px-3 py-2 shadow-lg sm:flex">
        <CheckCircle2 className="h-4 w-4 text-success" />
        <span className="text-xs font-semibold text-stone-800">Payment recorded</span>
      </div>

      {/* Floating chip: order locked */}
      <div className="absolute -bottom-4 -left-4 hidden items-center gap-2 rounded-xl border border-orange-100 bg-white px-3 py-2 shadow-lg sm:flex">
        <Lock className="h-4 w-4 text-orange-600" />
        <span className="text-xs font-semibold text-stone-800">Order #128 locked</span>
      </div>
    </div>
  );
}
