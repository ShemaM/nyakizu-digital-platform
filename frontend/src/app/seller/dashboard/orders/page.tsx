"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { ClipboardList, AlertCircle, ArrowRight, CheckCircle2, Clock, PackageCheck, Search, ShoppingBag } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Container, Section } from "@/components/layouts";
import { Avatar } from "@/components/ui/Avatar";
import { PageSkeleton } from "@/components/ui/LoadingState";
import { orders, fmtKES, type ApiOrder } from "@/lib/api";
import { getStatusLabel, buyerDisplayName } from "@/lib/order-status";
import { useAutoPoll } from "@/lib/useAutoPoll";

type Filter = "all" | "new" | "packing" | "ready" | "paid" | "cancelled";

const FILTERS: { key: Filter; label: string; statuses?: string[] }[] = [
  { key: "all", label: "All orders" },
  { key: "new", label: "New", statuses: ["submitted"] },
  { key: "packing", label: "Packing", statuses: ["sourcing"] },
  { key: "ready", label: "Ready", statuses: ["locked", "debt_active"] },
  { key: "paid", label: "Paid", statuses: ["cleared"] },
  { key: "cancelled", label: "Cancelled", statuses: ["cancelled"] },
];

function itemCount(order: ApiOrder): number {
  if (!order || !Array.isArray(order.items)) return 0;
  return order.items.reduce((total, item) => total + (typeof item?.quantity === "number" ? item.quantity : 1), 0);
}

function primaryAction(order: ApiOrder): string {
  switch (order?.status) {
    case "submitted": return "Start packing";
    case "sourcing": return "Continue packing";
    case "locked":
    case "debt_active": return "Confirm payment";
    case "cleared": return "View receipt";
    default: return "View order";
  }
}

export default function SellerOrdersPage() {
  const [orderList, setOrderList] = useState<ApiOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");

  useEffect(() => {
    loadOrders(false);
  }, []);

  useAutoPoll(() => loadOrders(true), { intervalMs: 5000 });

  const loadOrders = async (silent = false) => {
    try {
      if (!silent) setIsLoading(true);
      setError(null);
      const data = await orders.sellerList();
      setOrderList(Array.isArray(data) ? data : []);
    } catch (err: any) {
      if (!silent) {
        console.error("Orders load error:", err);
        setError(err?.message || "We could not load your orders.");
      }
    } finally {
      if (!silent) setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <AppShell title="Orders">
        <PageSkeleton showKPIs={false} listCount={4} />
      </AppShell>
    );
  }

  const counts = {
  const safeList = Array.isArray(orderList) ? orderList : [];

    new: safeList.filter((o) => o?.status === "submitted").length,
    packing: safeList.filter((o) => o?.status === "sourcing").length,
    ready: safeList.filter((o) => o && ["locked", "debt_active"].includes(o.status)).length,
    paid: safeList.filter((o) => o?.status === "cleared").length,
    cancelled: safeList.filter((o) => o?.status === "cancelled").length,
  };
  const visibleOrders = useMemo(() => {

    const selected = FILTERS.find((item) => item.key === filter);
    const normalized = query.trim().toLowerCase();
    return safeList
      .filter((order) => order && (!selected?.statuses || selected.statuses.includes(order.status)))
      .filter((order) => !normalized || buyerDisplayName(order).toLowerCase().includes(normalized) || String(order.id).includes(normalized))
      .sort((a, b) => {
        const timeA = a?.created_at ? new Date(a.created_at).getTime() : 0;
        const timeB = b?.created_at ? new Date(b.created_at).getTime() : 0;
        return (isNaN(timeB) ? 0 : timeB) - (isNaN(timeA) ? 0 : timeA);
      });
  }, [filter, safeList, query]);

  return (
    <AppShell title="Orders">
      <Section spacing="md">
        <Container size="xl" className="space-y-6">
          <div className="rounded-2xl border border-border bg-card p-5 text-card-foreground shadow-sm sm:p-6">
            <p className="text-xs font-bold uppercase tracking-wider text-role">Today's priorities</p>
            <div className="mt-1 flex flex-wrap items-end justify-between gap-4">
              <div><h1 className="text-2xl font-black tracking-tight text-foreground sm:text-3xl">Orders workspace</h1><p className="mt-1 text-sm text-muted-foreground">Know what to process next and keep every order moving.</p></div>
              {counts.new + counts.ready > 0 && <Link href="#orders-list" className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-role-dark px-4 text-sm font-black text-white shadow-md transition hover:-translate-y-0.5 hover:shadow-lg focus-visible:ring-2 focus-visible:ring-ring"><PackageCheck size={16} /> Start processing orders <ArrowRight size={15} /></Link>}
            </div>
            <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {([
                { key: "new", count: counts.new, label: "Orders need packing", icon: ShoppingBag },
                { key: "ready", count: counts.ready, label: "Orders ready", icon: PackageCheck },
                { key: "paid", count: counts.paid, label: "Paid orders", icon: CheckCircle2 },
                { key: "cancelled", count: counts.cancelled, label: "Cancelled", icon: ClipboardList },
              ] as const).map(({ key, count, label, icon: Icon }) => <button key={key} type="button" onClick={() => setFilter(key)} className="flex min-h-16 items-center gap-3 rounded-xl border border-border bg-background px-3 py-2 text-left transition hover:-translate-y-0.5 hover:shadow-md focus-visible:ring-2 focus-visible:ring-ring"><Icon size={17} className="shrink-0 text-role" /><span><strong className="block text-xl font-black tabular-nums text-foreground">{count}</strong><span className="text-xs font-semibold text-muted-foreground">{label}</span></span></button>)}
            </div>
          </div>

          {error && (
            <div className="bg-error/10 border border-error/20 text-error rounded-xl p-4 text-caption font-semibold flex items-center gap-2">
              <AlertCircle size={16} /> {error}
            </div>
          )}

          <div id="orders-list" className="space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar" role="tablist" aria-label="Filter orders">
                {FILTERS.map((item) => <button key={item.key} type="button" role="tab" aria-selected={filter === item.key} onClick={() => setFilter(item.key)} className={`min-h-11 shrink-0 rounded-lg border px-4 text-sm font-bold transition hover:-translate-y-0.5 hover:shadow-sm focus-visible:ring-2 focus-visible:ring-ring ${filter === item.key ? "border-role bg-role-dark text-white shadow-sm" : "border-border bg-card text-muted-foreground hover:border-role/50 hover:text-foreground"}`}>{item.label} {item.key !== "all" && <span className="ml-1 tabular-nums">({counts[item.key]})</span>}</button>)}
              </div>
              <label className="relative block shrink-0 sm:w-64"><Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" /><span className="sr-only">Search orders</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search buyer or order..." className="h-11 w-full rounded-lg border border-input bg-card pl-9 pr-3 text-sm text-foreground outline-none focus:border-role focus:ring-2 focus:ring-role/20" /></label>
            </div>
          </div>

          {safeList.length === 0 ? (
            <div className="border border-border bg-card text-muted-foreground rounded-2xl p-12 text-center flex flex-col items-center justify-center min-h-[300px]">
              <ClipboardList size={40} className="text-muted-foreground mb-3" />
              <p className="text-body font-bold text-foreground">No orders yet</p>
              <p className="text-caption text-muted-foreground mt-1">When buyers order from you, they will appear here.</p>
            </div>
          ) : visibleOrders.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border bg-card p-10 text-center"><p className="font-bold text-foreground">No matching orders</p><button type="button" onClick={() => { setFilter("all"); setQuery(""); }} className="mt-2 text-sm font-bold text-role-dark hover:underline">Clear filters</button></div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {visibleOrders.map((order) => (
                <article key={order.id} className="group rounded-2xl border border-border bg-card p-5 text-card-foreground shadow-sm transition hover:-translate-y-0.5 hover:border-role/40 hover:shadow-md">
                  <div className="flex items-start gap-4">
                    <Avatar name={buyerDisplayName(order)} size="lg" className="shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <Link href={`/seller/dashboard/orders/${order.id}/fulfill`} className="hover:underline">
                            <p className="text-lg font-black text-foreground truncate">{buyerDisplayName(order)}</p>
                            <p className="mt-0.5 text-xs font-semibold text-muted-foreground">Order #{order.id} · {itemCount(order)} item{itemCount(order) === 1 ? "" : "s"}</p>
                          </Link>
                        </div>
                        <span className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-black uppercase tracking-wide ${order.status === "submitted" ? "border-purple-300 bg-purple-100 text-purple-800" : order.status === "sourcing" ? "border-orange-300 bg-orange-100 text-orange-800" : order.status === "cleared" ? "border-success/30 bg-success/10 text-success" : order.status === "cancelled" ? "border-error/30 bg-error/10 text-error" : "border-info/30 bg-info/10 text-info"}`}>{getStatusLabel(order.status)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-end justify-between gap-3 border-t border-border mt-4 pt-4">
                    <div><span className="text-caption font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1"><Clock size={12} /> {order.created_at && !isNaN(new Date(order.created_at).getTime()) ? new Date(order.created_at).toLocaleDateString("en-KE") : "Recent"}</span><p className="mt-1 text-xl font-black text-role">{fmtKES(order.final_total ?? order.total_price)}</p></div>
                    <Link href={`/seller/dashboard/orders/${order.id}/fulfill`} className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-role-dark px-3.5 text-xs font-black text-white shadow-sm transition hover:shadow-md focus-visible:ring-2 focus-visible:ring-ring">{primaryAction(order)} <ArrowRight size={14} /></Link>
                  </div>
                </article>
              ))}
            </div>
          )}
        </Container>
      </Section>
    </AppShell>
  );
}
