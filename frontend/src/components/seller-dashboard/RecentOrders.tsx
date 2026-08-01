import React from 'react';
import Link from 'next/link';
import { MapPin } from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';

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
  const mapStatus = (status: string) => {
    const mapping: Record<string, string> = {
      submitted: 'New Order',
      sourcing: 'Preparing',
      locked: 'Ready',
      debt_active: 'Money Owed',
      cleared: 'Paid',
      cancelled: 'Cancelled',
    };
    return mapping[status] || status;
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'submitted': return 'bg-amber-500/20 text-amber-300 border border-amber-500/30';
      case 'sourcing': return 'bg-blue-500/20 text-blue-300 border border-blue-500/30';
      case 'locked': return 'bg-purple-500/20 text-purple-300 border border-purple-500/30';
      case 'debt_active': return 'bg-rose-500/20 text-rose-300 border border-rose-500/30';
      case 'cleared': return 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30';
      default: return 'bg-slate-800 text-slate-400';
    }
  };

  if (orders.length === 0) {
    return (
      <div className="bg-slate-900/80 p-8 rounded-2xl border border-slate-800 text-center text-slate-400 shadow-sm min-h-[250px] flex flex-col justify-center items-center">
        <p className="text-sm font-medium">No recent orders found.</p>
        <p className="text-xs text-slate-500 mt-1">When buyers order your products, they will appear here.</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-900/80 rounded-2xl border border-slate-800 shadow-sm overflow-hidden">
      <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/40">
        <h3 className="text-xs font-extrabold text-slate-300 uppercase tracking-wider">Recent Activity</h3>
        <Link href="/seller/orders" className="text-xs font-bold text-amber-400 hover:text-amber-500">
          See All
        </Link>
      </div>
      <div className="divide-y divide-slate-800/60 p-3 space-y-2">
        {orders.map((order) => (
          <Link href={`/seller/orders/${order.id}/fulfill`} key={order.id} className="block">
            <div className="bg-slate-900/40 rounded-xl border border-slate-800/80 p-3 flex items-center gap-3 hover:bg-slate-800/40 transition-all duration-200">
              <Avatar name={order.buyer_username || "?"} size="md" className="w-10 h-10 shrink-0 bg-slate-800 text-slate-200 font-bold border border-slate-700" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-slate-100 truncate">{order.buyer_username || "Unknown buyer"}</p>
                <div className="flex items-center gap-1 mt-0.5 text-xs text-slate-400 font-medium">
                  <MapPin size={12} className="text-amber-500 shrink-0" />
                  <span className="truncate">{order.delivery_address || "Awaiting location"}</span>
                </div>
              </div>
              <div className="text-right shrink-0 space-y-1.5">
                <p className="text-sm font-extrabold text-slate-100">
                  KES {Number(order.total_price).toLocaleString('en-KE')}
                </p>
                <span className={`inline-block px-2 py-0.5 text-[10px] font-bold rounded-md ${getStatusStyle(order.status)}`}>
                  {mapStatus(order.status)}
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};
