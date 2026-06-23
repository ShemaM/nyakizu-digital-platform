"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle, AlertCircle, RefreshCw } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { ListSkeleton } from "@/components/ui/LoadingState";
import { NoPaymentsEmptyState } from "@/components/ui/EmptyState";
import { orders, type ApiOrder, ApiError, fmtKES, parsePrice } from "@/lib/api";
import { cn } from "@/lib/cn";

export default function DebtsPage() {
  const [orders, setOrders] = useState<ApiOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const allOrders = await orders.list();
      // Filter for orders with relevant payment statuses
      const relevantOrders = allOrders.filter(order => 
        ["debt_active", "cleared", "locked", "submitted", "sourcing"].includes(order.status)
      );
      setOrders(relevantOrders);
    } catch (err) {
      console.error("Failed to load orders:", err);
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Failed to load payment history. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate total outstanding (in a real app, this would come from payment records)
  const totalOwed = orders
    .filter(o => o.status === "debt_active")
    .reduce((sum, o) => sum + parsePrice(o.total_price), 0);

  // Map API status to badge status
  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, string> = {
      "submitted": "submitted",
      "sourcing": "sourcing",
      "locked": "locked",
      "debt_active": "debt_active",
      "cleared": "cleared",
      "cancelled": "cancelled",
    };
    return statusMap[status] || "pending";
  };

  if (isLoading) {
    return (
      <AppShell title="Payments">
        <ListSkeleton count={5} showAvatar={true} lines={2} />
      </AppShell>
    );
  }

  if (error) {
    return (
      <AppShell title="Payments">
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
          <p className="text-red-700 font-medium mb-3">{error}</p>
          <button 
            onClick={loadOrders}
            className="flex items-center gap-1.5 text-xs font-semibold text-red-700 hover:text-red-800 cursor-pointer mx-auto"
          >
            <RefreshCw size={14} /> Try Again
          </button>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell title="Payments">

      {/* ── Balance banner ───────────────────────────────────────────────── */}
      {totalOwed > 0 ? (
        <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl p-5 shadow-[0_4px_16px_rgba(217,119,6,0.3)] animate-fade-in-up">
          <div className="flex items-center gap-2.5 mb-2">
            <div className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center">
              <AlertCircle size={16} className="text-white" />
            </div>
            <p className="text-amber-100 text-xs font-semibold uppercase tracking-wide">
              Total outstanding
            </p>
          </div>
          <p className="text-4xl font-black text-white tabular-nums">{fmtKES(totalOwed)}</p>
          <p className="text-amber-200 text-xs mt-1.5">Please settle with your wholesaler.</p>
        </div>
      ) : (
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-5 shadow-[0_4px_16px_rgba(22,163,74,0.3)] animate-fade-in-up">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <CheckCircle size={20} className="text-white" />
            </div>
            <div>
              <p className="text-white font-bold text-sm">You're all clear!</p>
              <p className="text-green-100 text-xs mt-0.5">No outstanding balances.</p>
            </div>
          </div>
        </div>
      )}

      {/* ── Orders list ─────────────────────────────────────────────────── */}
      {orders.length > 0 && (
        <section className="space-y-2 animate-fade-in-up delay-75">
          <div className="flex items-center gap-2 px-0.5">
            <div className="w-1 h-4 bg-amber-500 rounded-full" />
            <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              Payment history
            </h2>
          </div>

          {orders.map((order) => {
            const total = parsePrice(order.total_price);
            // In a real implementation, you'd calculate paid amount from ledger entries
            const balance = total; // Assuming full balance for now
            const paid = 0; // Would come from payment records
            const pct = total > 0 ? Math.round((paid / total) * 100) : 0;

            return (
              <div
                key={order.id}
                className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.07)]"
              >
                {/* Header row */}
                <div className="px-4 pt-4 pb-3 flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-bold text-gray-900">{order.buyer_username}</span>
                      <Badge status={getStatusBadge(order.status)} />
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {new Date(order.created_at).toLocaleDateString("en-KE", {
                        day: "numeric", month: "short", year: "numeric",
                      })}
                    </p>
                  </div>
                  <Link href={`/buyer/orders/${order.id}`} className="shrink-0 p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
                    <ArrowRight size={15} className="text-gray-400" />
                  </Link>
                </div>

                {/* Progress bar */}
                {order.status === "debt_active" && (
                  <div className="px-4 pb-3">
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="text-gray-400 font-medium">Paid</span>
                      <span className={cn("font-bold", pct === 100 ? "text-green-600" : "text-amber-600")}>
                        {pct}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                      <div
                        className={cn(
                          "h-1.5 rounded-full transition-all duration-700",
                          pct === 100 ? "bg-green-500" : "bg-amber-400"
                        )}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Balance grid */}
                {order.status === "debt_active" && (
                  <div className="grid grid-cols-3 gap-0 border-t border-gray-100">
                    {[
                      { label: "Invoice", value: fmtKES(total),       color: "text-gray-900" },
                      { label: "Paid",    value: fmtKES(paid),        color: "text-green-600" },
                      { label: "Balance", value: fmtKES(balance),     color: balance > 0 ? "text-amber-600" : "text-green-600" },
                    ].map(({ label, value, color }, i) => (
                      <div
                        key={label}
                        className={cn("px-3 py-3 text-center", i < 2 && "border-r border-gray-100")}
                      >
                        <p className="text-[10px] text-gray-400 font-medium mb-0.5">{label}</p>
                        <p className={cn("text-sm font-bold", color)}>{value}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </section>
      )}

      {orders.length === 0 && (
        <NoPaymentsEmptyState onActionClick={loadOrders} />
      )}
    </AppShell>
  );
}
