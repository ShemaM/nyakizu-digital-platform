"use client";

import { useState, useEffect } from "react";
import { Package, ClipboardList, AlertCircle, RefreshCw, Clock, CheckCircle } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Badge } from "@/components/ui/Badge";
import { PageSkeleton } from "@/components/ui/LoadingState";
import { orders, fmtKES } from "@/lib/api";

export default function SellerOrdersPage() {
  const [orderList, setOrderList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await orders.sellerList();
      setOrderList(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.error("Orders load error:", err);
      setError(err?.message || "Failed to load settlement orders.");
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status?.toLowerCase()) {
      case "completed": return "success";
      case "pending": return "warning";
      case "cancelled": return "error";
      default: return "default";
    }
  };

  if (isLoading) {
    return (
      <AppShell title="Orders Ledger" showLogo>
        <PageSkeleton showKPIs={false} listCount={4} />
      </AppShell>
    );
  }

  return (
    <AppShell title="Orders Ledger" showLogo>
      <div className="space-y-6">
        {/* Header Summary Row */}
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 backdrop-blur-md">
          <div>
            <h1 className="text-xl font-black text-slate-100 tracking-tight">Orders Ledger</h1>
            <p className="text-xs text-slate-400 mt-1">Track wholesale inbound pipeline, client payments, and supply statuses.</p>
          </div>
          <button 
            onClick={loadOrders}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-bold uppercase tracking-wider text-slate-200 border border-slate-700 rounded-xl transition-colors cursor-pointer"
          >
            <RefreshCw size={12} /> Sync Ledger
          </button>
        </div>

        {error && (
          <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl p-4 text-xs font-semibold flex items-center gap-2">
            <AlertCircle size={16} /> {error}
          </div>
        )}

        {/* Orders Stack */}
        {orderList.length === 0 ? (
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-12 text-center text-slate-400 flex flex-col items-center justify-center min-h-[300px]">
            <ClipboardList size={40} className="text-slate-600 mb-3" />
            <p className="text-sm font-bold text-slate-200">No active orders</p>
            <p className="text-xs text-slate-500 mt-1">When buyers initiate requests or checkouts, they will instantly display here.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {orderList.map((order) => (
              <div key={order.id} className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-slate-700 transition-all">
                <div className="flex items-start gap-3 min-w-0">
                  <div className="p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-400 shrink-0">
                    <Package size={18} />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-black text-slate-200">Order #{order.id}</span>
                      <Badge variant={getStatusBadgeVariant(order.status)}>
                        {order.status || "Pending"}
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5 truncate">
                      Buyer: <span className="text-slate-300 font-medium">{order.buyer_name || order.buyer || "Marketplace Client"}</span>
                    </p>
                  </div>
                </div>

                <div className="flex sm:flex-col items-baseline sm:items-end justify-between border-t border-slate-800/60 sm:border-none pt-3 sm:pt-0">
                  <span className="text-sm font-black text-slate-100">{fmtKES(order.total || order.amount || 0)}</span>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-0.5 flex items-center gap-1">
                    <Clock size={10} /> {order.created_at ? new Date(order.created_at).toLocaleDateString() : "Recent Deal"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
