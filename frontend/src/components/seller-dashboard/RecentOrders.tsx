import Link from 'next/link';
import { Package, Receipt, Clock } from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { getStatusLabel, getStatusVariant, buyerDisplayName } from '@/lib/order-status';
import type { ApiOrderItem } from '@/lib/api';

interface OrderItem {
  id: number;
  buyer_username?: string;
  buyer_full_name?: string;
  total_price: string | number;
  final_total?: string | number;
  status: string;
  created_at: string;
  items?: ApiOrderItem[];
}

interface RecentOrdersProps {
  orders: OrderItem[];
}

/** "Today, 10:42 AM" / "Yesterday, 2:15 PM" / "24 Oct 2023". */
function formatTimestamp(iso: string): string {
  const date = new Date(iso);
  const now = new Date();
  const time = date.toLocaleTimeString("en-KE", { hour: "numeric", minute: "2-digit" });
  if (date.toDateString() === now.toDateString()) return `Today, ${time}`;
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) return `Yesterday, ${time}`;
  return date.toLocaleDateString("en-KE", { day: "numeric", month: "short" });
}

/** "Screen Protector, Charger Cable +2 more" — enough to recognize the order at a glance without opening it. */
function summarizeItems(items?: ApiOrderItem[]): string {
  if (!items || items.length === 0) return "No items";
  const names = items.map((i) => i.product_name || i.custom_name || "Unnamed product");
  if (names.length <= 2) return names.join(", ");
  return `${names.slice(0, 2).join(", ")} +${names.length - 2} more`;
}

export const RecentOrders: React.FC<RecentOrdersProps> = ({ orders }) => {
  if (orders.length === 0) {
    return (
      <div className="bg-white p-10 rounded-2xl border border-slate-100 shadow-sm text-center flex flex-col justify-center items-center min-h-[220px]">
        <div className="w-14 h-14 rounded-2xl bg-role-soft flex items-center justify-center mb-3">
          <Package className="w-6 h-6 text-role" />
        </div>
        <p className="text-body font-bold text-text-secondary">No orders yet</p>
        <p className="text-caption text-text-muted mt-1">When buyers order your products, they will appear here.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden divide-y divide-slate-100">
      {orders.map((order) => (
        <div key={order.id} className="p-4 sm:p-5 flex items-center gap-4 hover:bg-slate-50 transition-colors">
          <Link
            href={`/seller/dashboard/orders/${order.id}/fulfill`}
            className="flex items-center gap-4 flex-1 min-w-0"
          >
            <Avatar name={buyerDisplayName(order)} size="lg" colorClassName="bg-role" className="shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-body font-bold text-text-primary truncate">{buyerDisplayName(order)}</p>
                <span className="text-text-muted">·</span>
                <span className="inline-flex items-center gap-1 text-xs text-text-muted">
                  <Clock size={11} aria-hidden="true" /> {formatTimestamp(order.created_at)}
                </span>
              </div>
              <p className="text-caption text-text-muted mt-1 truncate">{summarizeItems(order.items)}</p>
            </div>
          </Link>
          <div className="text-right shrink-0 space-y-1.5">
            <p className="text-body font-black text-text-primary">
              {fmtOrderTotal(order.final_total ?? order.total_price)}
            </p>
            <Badge variant={getStatusVariant(order.status)}>
              {getStatusLabel(order.status)}
            </Badge>
          </div>
          <Link
            href={`/receipt/orders/${order.id}`}
            target="_blank"
            aria-label={`Open invoice for order #${order.id}`}
            className="shrink-0 p-2 rounded-lg text-text-muted hover:text-role hover:bg-role-soft transition-colors"
          >
            <Receipt size={16} aria-hidden="true" />
          </Link>
        </div>
      ))}
    </div>
  );
};

function fmtOrderTotal(amount: string | number): string {
  return `KES ${Number(amount).toLocaleString('en-KE')}`;
}
