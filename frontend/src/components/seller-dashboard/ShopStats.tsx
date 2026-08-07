import Link from "next/link";
import { ShoppingBag, Users, Wallet, ArrowRight, CheckCircle2, type LucideIcon } from "lucide-react";
import { fmtKES } from "@/lib/api";
import { cn } from "@/lib/cn";

interface ShopStatsProps {
  newOrders: number;
  newBuyerRequests: number;
  moneyOwed: number;
}

interface AttentionCard {
  href: string;
  Icon: LucideIcon;
  active: boolean;
  value: string;
  label: string;
  description: string;
  cta: string;
}

/** Actionable "needs your attention" cards — the seller's real quick actions: new orders, buyer requests, money owed. */
export const ShopStats: React.FC<ShopStatsProps> = ({ newOrders, newBuyerRequests, moneyOwed }) => {
  const cards: AttentionCard[] = [
    {
      href: "/seller/dashboard/orders",
      Icon: ShoppingBag,
      active: newOrders > 0,
      value: String(newOrders),
      label: newOrders === 1 ? "New order" : "New orders",
      description: newOrders > 0 ? "Waiting for you to start packing." : "No new orders right now.",
      cta: "Review orders",
    },
    {
      href: "/seller/dashboard/buyers",
      Icon: Users,
      active: newBuyerRequests > 0,
      value: String(newBuyerRequests),
      label: newBuyerRequests === 1 ? "Buyer request" : "Buyer requests",
      description: newBuyerRequests > 0 ? "Buyers waiting for your approval." : "No pending buyer requests.",
      cta: "Review buyers",
    },
    {
      href: "/seller/dashboard/ledger",
      Icon: Wallet,
      active: moneyOwed > 0,
      value: fmtKES(moneyOwed),
      label: "Money owed",
      description: moneyOwed > 0 ? "Still owed to you by buyers." : "You're fully paid up.",
      cta: "View payments",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {cards.map((card) => (
        <Link
          key={card.label}
          href={card.href}
          className={cn(
            "group flex items-start gap-4 rounded-2xl border p-5 sm:p-6 transition-all hover:-translate-y-0.5",
            card.active
              ? "bg-white border-role/20 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_8px_24px_-8px_rgba(15,23,42,0.08)] hover:shadow-[0_4px_8px_rgba(15,23,42,0.06),0_20px_48px_-8px_rgba(15,23,42,0.18)]"
              : "bg-slate-50 border-slate-100"
          )}
        >
          <div
            className={cn(
              "w-12 h-12 rounded-xl flex items-center justify-center shrink-0",
              card.active ? "bg-role-soft text-role" : "bg-white text-success border border-slate-100"
            )}
          >
            {card.active ? <card.Icon className="w-6 h-6" /> : <CheckCircle2 className="w-6 h-6" />}
          </div>
          <div className="min-w-0 flex-1">
            <p className={cn("text-2xl font-black leading-tight", card.active ? "text-text-primary" : "text-text-secondary")}>
              {card.value}
            </p>
            <p className="text-sm font-bold text-text-secondary mt-0.5">{card.label}</p>
            <p className="text-xs text-text-muted mt-1 leading-relaxed">{card.description}</p>
            <span className={cn("inline-flex items-center gap-1 text-xs font-bold mt-3", card.active ? "text-role" : "text-text-muted")}>
              {card.cta} <ArrowRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
            </span>
          </div>
        </Link>
      ))}
    </div>
  );
};
