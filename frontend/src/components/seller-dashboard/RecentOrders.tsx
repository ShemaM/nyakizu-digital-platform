import Link from 'next/link';
import { MapPin, Package } from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { getStatusLabel, getStatusVariant } from '@/lib/order-status';

interface OrderItem {
  id: number;
  buyer_username?: string;
  delivery_address?: string;
  total_price: string | number;
  status: string;
}

interface RecentOrdersProps {
  orders: OrderItem[];
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
        <Link href={`/seller/dashboard/orders/${order.id}/fulfill`} key={order.id} className="block hover:bg-slate-50 transition-colors">
          <div className="p-4 sm:p-5 flex items-center gap-4">
            <Avatar name={order.buyer_username || "?"} size="lg" className="shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-body font-bold text-text-primary truncate">{order.buyer_username || "Unknown buyer"}</p>
              <div className="flex items-center gap-1.5 mt-1 text-xs text-text-muted font-medium">
                <MapPin size={13} className="text-role shrink-0" />
                <span className="truncate">{order.delivery_address || "No location yet"}</span>
              </div>
            </div>
            <div className="text-right shrink-0 space-y-1.5">
              <p className="text-body font-black text-text-primary">
                {fmtOrderTotal(order.total_price)}
              </p>
              <Badge variant={getStatusVariant(order.status)}>
                {getStatusLabel(order.status)}
              </Badge>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
};

function fmtOrderTotal(amount: string | number): string {
  return `KES ${Number(amount).toLocaleString('en-KE')}`;
}
