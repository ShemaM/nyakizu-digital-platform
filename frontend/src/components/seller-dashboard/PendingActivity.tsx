import Link from "next/link";
import { UserCheck, Package, Wallet, Clock3, CheckCircle2 } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { fmtKES, parsePrice, type ApiOrder, type ApiRelationship } from "@/lib/api";
import { buyerDisplayName } from "@/lib/order-status";

interface PendingActivityProps {
  orders: ApiOrder[];
  relationships: ApiRelationship[];
}

interface ActivityItem {
  id: string;
  buyerName: string;
  message: string;
  timestamp: string;
  href: string;
  Icon: typeof Package;
}

/** "3h ago" / "2d ago" / a plain date once it's old — short enough to sit on one line next to the buyer's name. */
function timeAgo(iso: string): string {
  const then = new Date(iso).getTime();
  const minutes = Math.max(0, Math.round((Date.now() - then) / 60000));
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString("en-KE", { day: "numeric", month: "short" });
}

/**
 * Splits everything currently unresolved into who has to act on it next —
 * a claimed payment or a fresh order needs the seller; a sent price or an
 * open balance needs the buyer. Kept as two short, separately-labeled
 * lists rather than one merged feed, since "what do I do" and "what am I
 * waiting on someone else for" are different questions the seller asks.
 */
function buildActivity(orders: ApiOrder[], relationships: ApiRelationship[]): { onYou: ActivityItem[]; onBuyer: ActivityItem[] } {
  const onYou: ActivityItem[] = [];
  const onBuyer: ActivityItem[] = [];

  for (const order of orders) {
    const name = buyerDisplayName(order);
    const fulfillHref = `/seller/dashboard/orders/${order.id}/fulfill`;
    const pendingClaim = (order.payment_claims ?? []).find((c) => !c.resolved);

    if (pendingClaim) {
      onYou.push({
        id: `claim-${order.id}`,
        buyerName: name,
        message: `Sent ${fmtKES(pendingClaim.amount)}. Confirm the M-Pesa code`,
        timestamp: pendingClaim.submitted_at,
        href: "/seller/dashboard/ledger",
        Icon: Wallet,
      });
      continue;
    }

    if (order.status === "submitted") {
      onYou.push({
        id: `new-${order.id}`,
        buyerName: name,
        message: "New order. Start packing",
        timestamp: order.created_at,
        href: fulfillHref,
        Icon: Package,
      });
    } else if (order.status === "sourcing") {
      onYou.push({
        id: `packing-${order.id}`,
        buyerName: name,
        message: "Being packed. Send the price once it's ready",
        timestamp: order.updated_at ?? order.created_at,
        href: fulfillHref,
        Icon: Package,
      });
    } else if (order.status === "locked") {
      onBuyer.push({
        id: `locked-${order.id}`,
        buyerName: name,
        message: "Price sent. Waiting to be paid",
        timestamp: order.updated_at ?? order.created_at,
        href: fulfillHref,
        Icon: Clock3,
      });
    } else if (order.status === "debt_active") {
      onBuyer.push({
        id: `debt-${order.id}`,
        buyerName: name,
        message: `Still owes ${fmtKES(order.balance ?? parsePrice(order.final_total ?? order.total_price) - parsePrice(order.amount_paid ?? 0))}`,
        timestamp: order.updated_at ?? order.created_at,
        href: "/seller/dashboard/ledger",
        Icon: Wallet,
      });
    }
  }

  for (const rel of relationships) {
    if (rel.status === "pending") {
      onYou.push({
        id: `rel-${rel.id}`,
        buyerName: rel.buyer_name || "A buyer",
        message: "Wants to become your customer",
        timestamp: rel.created_at,
        href: "/seller/dashboard/buyers",
        Icon: UserCheck,
      });
    }
  }

  const byOldestFirst = (a: ActivityItem, b: ActivityItem) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
  onYou.sort(byOldestFirst);
  onBuyer.sort(byOldestFirst);

  return { onYou, onBuyer };
}

function ActivityList({ items, emptyText, urgent }: { items: ActivityItem[]; emptyText: string; urgent?: boolean }) {
  if (items.length === 0) {
    return (
      <Card>
        <div className="flex flex-col items-center justify-center text-center py-8 px-4">
          <CheckCircle2 size={22} className="text-success mb-2" />
          <p className="text-sm font-semibold text-text-secondary">{emptyText}</p>
        </div>
      </Card>
    );
  }

  return (
    <Card
      className={`overflow-hidden divide-y ${urgent ? "divide-warning/10 ring-1 ring-warning/25" : "divide-slate-100"}`}
    >
      {items.map((item) => (
        <Link
          key={item.id}
          href={item.href}
          className={`flex items-center gap-3 px-4 py-3 sm:px-5 transition-colors ${
            urgent ? "hover:bg-warning/5" : "hover:bg-slate-50"
          }`}
        >
          <span
            className={`flex items-center justify-center w-9 h-9 rounded-full shrink-0 ${
              urgent ? "bg-warning/15 text-warning" : "bg-role-soft text-role-dark"
            }`}
          >
            <item.Icon size={16} />
          </span>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-text-primary truncate">{item.buyerName}</p>
            <p className="text-xs text-text-muted truncate">{item.message}</p>
          </div>
          <span className="text-[11px] font-semibold text-text-muted shrink-0">{timeAgo(item.timestamp)}</span>
        </Link>
      ))}
    </Card>
  );
}

export function PendingActivity({ orders, relationships }: PendingActivityProps) {
  const { onYou, onBuyer } = buildActivity(orders, relationships);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div>
        <p className="flex items-center gap-2 mb-2 px-1">
          <span className="text-xs font-black text-warning uppercase tracking-widest">Waiting On You</span>
          {onYou.length > 0 && (
            <span className="flex items-center justify-center min-w-4.5 h-4.5 px-1 rounded-full bg-warning text-white text-[11px] font-bold leading-none">
              {onYou.length}
            </span>
          )}
        </p>
        <ActivityList items={onYou} emptyText="Nothing needs you right now." urgent />
      </div>
      <div>
        <p className="text-xs font-black text-text-muted uppercase tracking-widest mb-2 px-1">
          Waiting On Buyers ({onBuyer.length})
        </p>
        <ActivityList items={onBuyer} emptyText="No buyers are waiting on anything." />
      </div>
    </div>
  );
}
