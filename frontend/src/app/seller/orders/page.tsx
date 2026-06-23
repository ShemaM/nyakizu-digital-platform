"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { MapPin, ShoppingBag, Calendar, ArrowRight, AlertCircle } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { PageSkeleton } from "@/components/ui/LoadingState";
import { cn } from "@/lib/cn";
import { type ApiOrder, fmtKES } from "@/lib/api";

function OrderRow({ order }: { order: ApiOrder }) {
  const date = new Date(order.created_at).toLocaleDateString("en-KE", {
    day: "numeric", month: "short", year: "numeric"
  });

  return (
    <Link href={`/seller/orders/${order.id}/fulfill`}>
      <div className="bg-white rounded-2xl border border-gray-100 p-3.5 flex items-center gap-3 shadow-sm hover:shadow-md hover:border-amber-500/30 hover:-translate-y-0.5 transition-all duration-200 active:scale-[0.99] group">

        {/* Avatar */}
        <Avatar 
          name={order.buyer_username} 
          size="md" 
          className="w-12 h-12 shrink-0 bg-[#0a1f10]/5 text-[#0a1f10] font-black border border-[#0a1f10]/10" 
        />

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start mb-0.5">
            <p className="text-sm font-black text-[#0a1f10] truncate">{order.buyer_username}</p>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest hidden sm:block">
              #{order.id.toString().slice(0, 6)}
            </p>
          </div>
          
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1">
            <span className="flex items-center gap-1 text-[11px] text-gray-500 font-medium">
              <MapPin size={11} className="text-amber-500" />
              <span className="truncate max-w-[120px]">{order.delivery_address || "No location"}</span>
            </span>
            <span className="flex items-center gap-1 text-[11px] text-gray-400 font-medium">
              <Calendar size={11} />
              {date}
            </span>
          </div>
        </div>

        {/* Amount + status */}
        <div className="text-right shrink-0 flex flex-col items-end gap-1.5 pl-2 border-l border-gray-50">
          <p className="text-sm font-black text-[#0a1f10]">
            {fmtKES(order.total_price)}
          </p>
          <div className="flex items-center gap-2">
            <Badge status={order.status as any} />
            <ArrowRight size={14} className="text-gray-300 group-hover:text-amber-500 transition-colors" />
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function SellerOrdersPage() {
  const [orders, setOrders] = useState<ApiOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchOrders() {
      try {
        setIsLoading(true);
        // Using exact Django REST URL for seller's orders
        const res = await fetch("/api/orders/seller/");
        if (!res.ok) throw new Error("Failed to load orders");
        
        const data = await res.json();
        
        // Sort newest first
        const sorted = data.sort((a: ApiOrder, b: ApiOrder) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        
        setOrders(sorted);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    }

    fetchOrders();
  }, []);

  const active = orders.filter((o) => !["cleared", "cancelled"].includes(o.status));
  const past   = orders.filter((o) =>  ["cleared", "cancelled"].includes(o.status));

  if (isLoading) {
    return (
      <AppShell title="Orders">
        <PageSkeleton showKPIs={false} listCount={5} />
      </AppShell>
    );
  }

  if (error) {
    return (
      <AppShell title="Orders">
        <div className="bg-red-50 border border-red-200 p-6 rounded-2xl text-center text-red-700 mt-4">
          <AlertCircle className="mx-auto mb-2" />
          <p className="font-bold">Could not load orders.</p>
          <p className="text-xs mt-1 opacity-80">{error}</p>
        </div>
      </AppShell>
    );
  }

  if (orders.length === 0) {
    return (
      <AppShell title="Orders">
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center shadow-sm animate-fade-in-up mt-6">
          <div className="w-16 h-16 bg-[#0a1f10]/5 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-[#0a1f10]/10">
            <ShoppingBag size={28} className="text-[#0a1f10]/40" />
          </div>
          <p className="text-sm font-black text-[#0a1f10]">No orders yet</p>
          <p className="text-xs text-gray-500 mt-1.5 max-w-[200px] mx-auto">
            When your trusted buyers place orders, they will appear here.
          </p>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell title="Orders">

      {/* ── Summary ────────────────────────────────────────────────────────── */}
      <div className="mb-5 flex items-center justify-between animate-fade-in-up">
        <div>
          <h1 className="text-xl font-extrabold text-[#0a1f10] tracking-tight">Order Management</h1>
          <p className="text-xs text-gray-500 font-medium mt-0.5">
            You have <span className="font-bold text-amber-600">{active.length}</span> active orders to process.
          </p>
        </div>
      </div>

      {/* ── Active Orders ──────────────────────────────────────────────────── */}
      {active.length > 0 && (
        <section className="space-y-3 animate-fade-in-up delay-75">
          <div className="flex items-center gap-2 px-1">
            <div className="w-1.5 h-4 bg-amber-500 rounded-full" />
            <h2 className="text-[11px] font-black text-[#0a1f10] uppercase tracking-widest">Active Pipeline</h2>
          </div>
          <div className="space-y-2.5">
            {active.map((o) => <OrderRow key={o.id} order={o} />)}
          </div>
        </section>
      )}

      {/* ── Past Orders ────────────────────────────────────────────────────── */}
      {past.length > 0 && (
        <section className="space-y-3 animate-fade-in-up delay-100 mt-6">
          <div className="flex items-center gap-2 px-1 pt-2">
            <div className="w-1.5 h-4 bg-gray-300 rounded-full" />
            <h2 className="text-[11px] font-black text-gray-500 uppercase tracking-widest">Completed & Cancelled</h2>
          </div>
          <div className="space-y-2.5">
            {past.map((o) => <OrderRow key={o.id} order={o} />)}
          </div>
        </section>
      )}
    </AppShell>
  );
}