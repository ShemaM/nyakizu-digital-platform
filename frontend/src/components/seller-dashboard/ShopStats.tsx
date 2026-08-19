import Link from "next/link";
import { ShoppingBag, Users, Wallet, type LucideIcon } from "lucide-react";
import { fmtKES } from "@/lib/api";
import { cn } from "@/lib/cn";

interface ShopStatsProps {
  newOrders: number;
  newBuyerRequests: number;
  moneyOwed: number;
}

interface Tile {
  href: string;
  Icon: LucideIcon;
  value: string;
  label: string;
  tint: string;
}

/**
 * The "what needs your attention" strip — two compact tiles (new orders,
 * buyer requests) plus a full-width money-owed banner. Deliberately no
 * section heading above it: it's the first thing under the greeting, so
 * position alone tells the seller this is the stuff to act on first.
 */
export const ShopStats: React.FC<ShopStatsProps> = ({ newOrders, newBuyerRequests, moneyOwed }) => {
  const tiles: Tile[] = [
    {
      href: "/seller/dashboard/orders",
      Icon: ShoppingBag,
      value: String(newOrders),
      label: newOrders === 1 ? "New Order" : "New Orders",
      tint: "bg-orange-100 text-orange-600",
    },
    {
      href: "/seller/dashboard/buyers",
      Icon: Users,
      value: String(newBuyerRequests),
      label: newBuyerRequests === 1 ? "Buyer Request" : "Buyer Requests",
      tint: "bg-blue-100 text-blue-600",
    },
  ];

  return (
    <div className="space-y-3 sm:space-y-4">
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        {tiles.map((tile) => (
          <Link
            key={tile.label}
            href={tile.href}
            className="rounded-2xl border border-slate-100 bg-white shadow-sm p-4 sm:p-5 transition-all hover:-translate-y-0.5 hover:shadow-md"
          >
            <div className={cn("w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center mb-3", tile.tint)}>
              <tile.Icon className="w-5 h-5" />
            </div>
            <p className="text-2xl sm:text-3xl font-black text-text-primary leading-tight tabular-nums">{tile.value}</p>
            <p className="text-xs sm:text-sm font-semibold text-text-muted mt-0.5 truncate">{tile.label}</p>
          </Link>
        ))}
      </div>

      <Link
        href="/seller/dashboard/ledger"
        className={cn(
          "relative overflow-hidden flex items-center gap-4 rounded-2xl p-4 sm:p-5 transition-all hover:-translate-y-0.5 hover:shadow-md",
          moneyOwed > 0
            ? "bg-red-50 border border-red-100 shadow-sm"
            : "bg-white border border-slate-100 shadow-sm"
        )}
      >
        <span className="absolute -right-6 -top-6 w-24 h-24 rounded-full bg-red-100/50" aria-hidden="true" />
        <div
          className={cn(
            "relative w-11 h-11 rounded-full flex items-center justify-center shrink-0",
            moneyOwed > 0 ? "bg-red-100 text-red-600" : "bg-success/10 text-success"
          )}
        >
          <Wallet className="w-5 h-5" />
        </div>
        <div className="relative min-w-0">
          <p className={cn("text-xl sm:text-2xl font-black leading-tight tabular-nums", moneyOwed > 0 ? "text-red-600" : "text-text-primary")}>
            {moneyOwed > 0 ? fmtKES(moneyOwed) : "All paid up"}
          </p>
          <p className="text-xs sm:text-sm font-semibold text-text-muted mt-0.5">Money Owed</p>
        </div>
      </Link>
    </div>
  );
};
