import Link from "next/link";
import { ShoppingBag, Users, Wallet, ArrowRight, type LucideIcon } from "lucide-react";
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
  value: string;
  label: string;
  description: string;
  cta: string;
}

/**
 * Actionable "needs your attention" cards — new orders, buyer requests,
 * money owed. Only ever shows cards with something to act on; a "0 new
 * orders" card is noise, not signal, so it's simply not rendered.
 */
export const ShopStats: React.FC<ShopStatsProps> = ({ newOrders, newBuyerRequests, moneyOwed }) => {
  const cards: AttentionCard[] = [];

  if (newOrders > 0) {
    cards.push({
      href: "/seller/dashboard/orders",
      Icon: ShoppingBag,
      value: String(newOrders),
      label: newOrders === 1 ? "New order" : "New orders",
      description: "Waiting for you to start packing.",
      cta: "View Orders",
    });
  }

  if (newBuyerRequests > 0) {
    cards.push({
      href: "/seller/dashboard/buyers",
      Icon: Users,
      value: String(newBuyerRequests),
      label: newBuyerRequests === 1 ? "Buyer request" : "Buyer requests",
      // Workflow explainer: a buyer request is not the same as a buyer — it's
      // access a buyer has to ask for before they can order, and it sits
      // pending until you act on it.
      description: "Buyers who asked to order from you, waiting on your approval.",
      cta: "View Requests",
    });
  }

  if (moneyOwed > 0) {
    cards.push({
      href: "/seller/dashboard/ledger",
      Icon: Wallet,
      value: fmtKES(moneyOwed),
      label: "Money owed",
      description: "Still owed to you by buyers.",
      cta: "View Ledger",
    });
  }

  if (cards.length === 0) return null;

  return (
    <div className={cn("grid grid-cols-1 gap-4", cards.length > 1 && "sm:grid-cols-3")}>
      {cards.map((card) => (
        <Link
          key={card.label}
          href={card.href}
          className="group flex items-start gap-4 rounded-2xl border border-role/20 bg-white p-5 sm:p-6 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_8px_24px_-8px_rgba(15,23,42,0.08)] transition-all hover:-translate-y-0.5 hover:shadow-[0_4px_8px_rgba(15,23,42,0.06),0_20px_48px_-8px_rgba(15,23,42,0.18)]"
        >
          <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 bg-role-soft text-role">
            <card.Icon className="w-6 h-6" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-2xl font-black leading-tight text-text-primary">{card.value}</p>
            <p className="text-sm font-bold text-text-secondary mt-0.5">{card.label}</p>
            <p className="text-xs text-text-muted mt-1 leading-relaxed">{card.description}</p>
            <span className="inline-flex items-center gap-1 text-xs font-bold mt-3 text-role">
              {card.cta} <ArrowRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
            </span>
          </div>
        </Link>
      ))}
    </div>
  );
};
