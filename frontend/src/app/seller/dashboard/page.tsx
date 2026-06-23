"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  ShoppingBag, Package, BookOpen, Users, 
  ArrowRight, MapPin, RefreshCw, ChevronRight, TrendingUp 
} from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { PageSkeleton } from "@/components/ui/LoadingState";
import { NoOrdersEmptyState } from "@/components/ui/EmptyState";
import { type ApiOrder, fmtKES, parsePrice } from "@/lib/api"; // Kept helpers, dropped dummy fetcher
import { useAuth } from "@/lib/auth-context";
import { cn } from "@/lib/cn";

export default function SellerDashboardPage() {
  const { user } = useAuth();
  const [orderList, setOrderList] = useState<ApiOrder[]>([]);
  const [pendingBuyersCount, setPendingBuyersCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Fetching authenticated seller's orders via the exact Django URL
      const ordersRes = await fetch("/api/orders/seller/");
      
      if (!ordersRes.ok) { 
        throw new Error("Failed to load orders");
      }
      
      const ordersData = await ordersRes.json();
      setOrderList(ordersData);

      // Optional: Fetch relationships/pending buyers if your backend expands to include this
      // For now, defaulting to 0 unless populated via /api/accounts/me/ or similar or a dedicated endpoint
      if (user && 'pending_requests_count' in user && typeof user.pending_requests_count === 'number') {
        setPendingBuyersCount(user.pending_requests_count);
      }
      
    } catch (err: any) {
      console.error("Dashboard fetch error:", err);
      setError(err.message || "Failed to load dashboard. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // ── KPI Calculations (Real Data) ──────────────────────────────────────────
  const newOrders = orderList.filter(o => o.status === "submitted").length;
  const sourcingOrders = orderList.filter(o => o.status === "sourcing").length;
  const activeDebt = orderList
    .filter(o => o.status === "debt_active")
    .reduce((sum, o) => sum + parsePrice(o.total_price), 0);

  const recentOrders = [...orderList]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5);

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

  // ── Render States ────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <AppShell title="Dashboard" showLogo>
        <PageSkeleton showKPIs={true} listCount={3} />
      </AppShell>
    );
  }

  if (error) {
    return (
      <AppShell title="Dashboard" showLogo>
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
          <p className="text-red-700 font-medium mb-3">{error}</p>
          <button 
            onClick={loadDashboardData}
            className="flex items-center gap-1.5 text-xs font-semibold text-red-700 hover:text-red-800 cursor-pointer mx-auto bg-red-100 px-4 py-2 rounded-lg"
          >
            <RefreshCw size={14} /> Try Again
          </button>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell title="Dashboard" showLogo>

      {/* ── Greeting ──────────────────────────────────────────────────────── */}
      <div className="animate-fade-in-up pb-1">
        <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Overview</p>
        <h2 className="text-xl font-extrabold text-[#0a1f10] mt-0.5 tracking-tight">
          {user?.full_name || user?.username || "Your Shop"}
        </h2>
      </div>

      {/* ── Featured Hero KPI — New Orders ────────────────────────────────── */}
      <Link href="/seller/orders" className="block animate-fade-in-up delay-75">
        <div className="relative overflow-hidden bg-[#0a1f10] rounded-2xl p-6 shadow-xl hover:shadow-2xl hover:-translate-y-0.5 transition-all duration-300 active:scale-[0.98] group">
          <div className="absolute -top-12 -right-12 w-40 h-40 bg-amber-500/20 rounded-full blur-3xl transition-all group-hover:bg-amber-500/30" />
          <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-green-500/10 rounded-full blur-2xl" />
          <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03] mix-blend-overlay"></div>

          <div className="relative z-10 flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                <p className="text-amber-500 text-xs font-bold uppercase tracking-widest">
                  Action Required
                </p>
              </div>
              <p className="text-6xl font-black text-white mt-2 tabular-nums leading-none tracking-tighter">
                {newOrders}
              </p>
              <p className="text-gray-300 text-sm mt-2 font-medium">
                New orders awaiting confirmation
              </p>
            </div>
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-3 backdrop-blur-sm">
              <ShoppingBag size={28} className="text-amber-500" />
            </div>
          </div>

          <div className="relative z-10 mt-6 pt-4 border-t border-white/10 flex items-center justify-between group-hover:border-amber-500/30 transition-colors">
            <p className="text-xs font-bold text-amber-500/80 group-hover:text-amber-400">Review all incoming orders</p>
            <div className="bg-white/5 rounded-full p-1 group-hover:bg-amber-500 group-hover:text-[#0a1f10] text-amber-500 transition-colors">
              <ArrowRight size={14} />
            </div>
          </div>
        </div>
      </Link>

      {/* ── Mini KPIs Grid ────────────────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-3 animate-fade-in-up delay-100">

        {/* Packing / Sourcing */}
        <Link href="/seller/orders">
          <div className="bg-amber-500 rounded-2xl p-4 hover:bg-amber-400 transition-colors active:scale-[0.97] shadow-lg shadow-amber-500/20 relative overflow-hidden">
            <div className="absolute -right-4 -top-4 text-amber-600/30">
              <Package size={56} strokeWidth={1.5} />
            </div>
            <Package size={16} className="text-[#0a1f10] mb-2 relative z-10" />
            <p className="text-2xl font-black text-[#0a1f10] tabular-nums leading-none relative z-10">{sourcingOrders}</p>
            <p className="text-[#0a1f10]/80 text-[10px] font-bold mt-1 leading-tight uppercase relative z-10">Packing<br/>Now</p>
          </div>
        </Link>

        {/* Ledger / Debt */}
        <Link href="/seller/ledger">
          <div className="bg-white border-2 border-[#0a1f10]/5 rounded-2xl p-4 hover:border-amber-500/50 transition-colors active:scale-[0.97] shadow-sm flex flex-col justify-between">
            <TrendingUp size={16} className="text-amber-600 mb-2" />
            <div>
              <p className="text-sm font-black text-[#0a1f10] leading-tight tabular-nums truncate">
                {fmtKES(activeDebt).replace("KES ", "")}
              </p>
              <p className="text-gray-400 text-[9px] font-extrabold uppercase mt-0.5 leading-tight">KES Owed</p>
            </div>
          </div>
        </Link>

        {/* Pending Buyers */}
        <div className={cn(
          "rounded-2xl p-4 transition-colors shadow-sm border",
          pendingBuyersCount > 0 
            ? "bg-[#0a1f10] border-[#0a1f10] text-white" 
            : "bg-gray-50 border-gray-100 text-gray-400"
        )}>
          <Users size={16} className={cn("mb-2", pendingBuyersCount > 0 ? "text-amber-500" : "text-gray-300")} />
          <p className={cn("text-2xl font-black tabular-nums leading-none", pendingBuyersCount > 0 ? "text-white" : "text-gray-400")}>
            {pendingBuyersCount}
          </p>
          <p className={cn("text-[10px] font-bold mt-1 leading-tight uppercase", pendingBuyersCount > 0 ? "text-gray-300" : "text-gray-400")}>
            Pending<br/>Buyers
          </p>
        </div>
      </div>

      {/* ── Recent Orders ─────────────────────────────────────────────────── */}
      <section className="space-y-3 pt-2 animate-fade-in-up delay-150">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-4 bg-amber-500 rounded-full" />
            <h3 className="text-xs font-extrabold text-[#0a1f10] uppercase tracking-wider">Recent Activity</h3>
          </div>
          <Link href="/seller/orders" className="text-[11px] font-bold text-amber-600 hover:text-amber-700 flex items-center gap-0.5">
            View Ledger <ChevronRight size={12} />
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <NoOrdersEmptyState />
        ) : (
          <div className="space-y-2.5">
            {recentOrders.map((order) => (
              <Link href={`/seller/orders/${order.id}/fulfill`} key={order.id}>
                <div className="bg-white rounded-2xl border border-gray-100 p-3.5 flex items-center gap-3 shadow-sm hover:shadow-md hover:border-amber-500/30 hover:-translate-y-0.5 transition-all duration-200 active:scale-[0.99]">
                  {/* Avatar */}
                  <Avatar name={order.buyer_username} size="md" className="w-11 h-11 shrink-0 bg-[#0a1f10]/5 text-[#0a1f10] font-bold" />

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-[#0a1f10] truncate">{order.buyer_username}</p>
                    <div className="flex items-center gap-1.5 mt-1 text-[11px] text-gray-500 font-medium">
                      <MapPin size={11} className="text-amber-500" />
                      <span className="truncate">{order.delivery_address || "Awaiting location"}</span>
                    </div>
                  </div>

                  {/* Amount + status */}
                  <div className="text-right shrink-0 space-y-1.5">
                    <p className="text-sm font-extrabold text-[#0a1f10]">
                      {fmtKES(order.total_price)}
                    </p>
                    <Badge status={getStatusBadge(order.status) as any} />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </AppShell>
  );
}