"use client";

import Link from "next/link";
import { useState, type ReactNode } from "react";
import {
  AlertTriangle,
  ArrowRight,
  BarChart3,
  Bell,
  ChevronRight,
  Clock3,
  Package,
  ShoppingBag as ShoppingBagIcon,
  Star,
  TrendingUp,
  Users,
  Wallet,
} from "lucide-react";
import { fmtKES, parsePrice, products as productsApi, type ApiOrder, type ApiProduct, type ApiRelationship, ApiError } from "@/lib/api";
import { Avatar } from "@/components/ui/Avatar";
import { cn } from "@/lib/cn";
import { buyerDisplayName } from "@/lib/order-status";

const ACTIVE_STATUSES = new Set(["submitted", "sourcing", "locked", "debt_active", "cleared"]);

function orderValue(order?: ApiOrder | null): number {
  if (!order) return 0;
  return parsePrice(order.final_total ?? order.total_price);
}

function paidValue(order?: ApiOrder | null): number {
  if (!order) return 0;
  return parsePrice(order.amount_paid ?? 0);
}

function isSameDay(date: Date, target: Date): boolean {
  if (!date || isNaN(date.getTime()) || !target || isNaN(target.getTime())) return false;
  return date.toDateString() === target.toDateString();
}

function inLastDays(iso: string | undefined | null, days: number): boolean {
  if (!iso) return false;
  const d = new Date(iso);
  if (isNaN(d.getTime())) return false;
  const cutoff = new Date();
  cutoff.setHours(0, 0, 0, 0);
  cutoff.setDate(cutoff.getDate() - (days - 1));
  return d >= cutoff;
}

function SectionCard({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("rounded-2xl border border-border bg-card p-5 text-card-foreground shadow-sm sm:p-6", className)}>{children}</div>;
}

function Metric({ icon: Icon, label, value, hint, tone = "role" }: {
  icon: typeof Wallet;
  label: string;
  value: string;
  hint: string;
  tone?: "role" | "success" | "warning";
}) {
  return (
    <SectionCard>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-text-muted">{label}</p>
          <p className="mt-2 text-2xl font-black tabular-nums text-text-primary">{value}</p>
        </div>
        <span className={cn(
          "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
          tone === "success" ? "bg-success/12 text-success" : tone === "warning" ? "bg-warning/12 text-warning" : "bg-role-soft text-role-dark"
        )}>
          <Icon size={19} />
        </span>
      </div>
      <p className="mt-1 text-xs text-text-muted">{hint}</p>
    </SectionCard>
  );
}

export function SellerMetrics({ orders = [], products = [], relationships = [] }: {
  orders?: ApiOrder[];
  products?: ApiProduct[];
  relationships?: ApiRelationship[];
}) {
  const safeOrders = Array.isArray(orders) ? orders : [];
  const safeProducts = Array.isArray(products) ? products : [];
  const safeRelationships = Array.isArray(relationships) ? relationships : [];

  const validOrders = safeOrders.filter((order) => order && ACTIVE_STATUSES.has(order.status));
  const today = new Date();
  const todayRevenue = validOrders.filter((o) => o?.created_at && isSameDay(new Date(o.created_at), today)).reduce((sum, o) => sum + paidValue(o), 0);
  const weeklyRevenue = validOrders.filter((o) => inLastDays(o?.created_at, 7)).reduce((sum, o) => sum + paidValue(o), 0);
  const monthlyRevenue = validOrders.filter((o) => inLastDays(o?.created_at, 30)).reduce((sum, o) => sum + paidValue(o), 0);
  const buyers = new Map<string, { name: string; orders: number; value: number }>();
  validOrders.forEach((order) => {
    if (!order) return;
    const key = String(order.buyer ?? order.buyer_username ?? buyerDisplayName(order));
    const current = buyers.get(key) ?? { name: buyerDisplayName(order), orders: 0, value: 0 };
    current.orders += 1;
    current.value += orderValue(order);
    buyers.set(key, current);
  });
  const returning = [...buyers.values()].filter((buyer) => buyer.orders > 1).length;
  const completedOrPaid = validOrders.filter((o) => o.status === "cleared" || paidValue(o) > 0);
  const aov = completedOrPaid.length ? completedOrPaid.reduce((sum, o) => sum + orderValue(o), 0) / completedOrPaid.length : 0;
  const conversionBase = safeRelationships.filter((relationship) => relationship?.status === "approved").length;
  const conversionRate = conversionBase ? (buyers.size / conversionBase) * 100 : 0;
  const lowStock = safeProducts.filter((product) => product && product.status !== "out_of_stock" && (product.stock_quantity ?? 0) <= 3).length;

  const groups = [
    { title: "Sales performance", description: "Money and order momentum", metrics: [
      [Wallet, "Revenue", fmtKES(todayRevenue), "Today · " + fmtKES(monthlyRevenue) + " this month", "success"],
      [ShoppingBagIcon, "Orders", String(validOrders.length), "Active orders", "role"],
      [TrendingUp, "Average order value", fmtKES(aov), `${completedOrPaid.length} paid orders`, "role"],
    ] },
    { title: "Customer insights", description: "Relationships that drive repeat sales", metrics: [
      [Users, "Total customers", String(Math.max(buyers.size, safeRelationships.filter((r) => r?.status === "approved").length)), "Approved buyers", "role"],
      [Users, "Returning customers", String(returning), "More than one order", "role"],
      [Bell, "Messages / requests", String(safeRelationships.filter((r) => r?.status === "pending").length), "Buyer requests pending", "warning"],
    ] },
    { title: "Store health", description: "What needs action next", metrics: [
      [Package, "Active products", String(safeProducts.filter((p) => p?.status === "available").length), "Visible to buyers", "role"],
      [AlertTriangle, "Low stock", String(lowStock), "Three units or fewer", "warning"],
      [Clock3, "Pending orders", String(validOrders.filter((o) => o.status !== "cleared").length), "Need processing", "warning"],
    ] },
  ] as const;
  return <div>
    <div className="mb-4 flex items-end justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-wider text-role">At a glance</p><h2 className="text-xl font-black text-foreground">Business performance</h2></div><p className="text-xs text-muted-foreground">Clear signals, fewer cards</p></div>
    <div className="grid gap-3 lg:grid-cols-3">{groups.map((group) => <SectionCard key={group.title} className="p-0"><div className="border-b border-border px-4 py-4 sm:px-5"><h3 className="font-black text-foreground">{group.title}</h3><p className="mt-0.5 text-xs text-muted-foreground">{group.description}</p></div><div className="divide-y divide-border">{group.metrics.map(([icon, label, value, hint, tone]) => <MetricRow key={label} icon={icon} label={label} value={value} hint={hint} tone={tone} />)}</div></SectionCard>)}</div>
    <div className="mt-3 grid gap-3 sm:grid-cols-2"><Metric icon={TrendingUp} label="Weekly revenue" value={fmtKES(weeklyRevenue)} hint="Last 7 days" tone="success" /><Metric icon={BarChart3} label="Monthly revenue" value={fmtKES(monthlyRevenue)} hint={`Conversion rate ${conversionRate.toFixed(1)}%`} tone="success" /></div>
  </div>;
}

function MetricRow({ icon: Icon, label, value, hint, tone }: { icon: typeof Wallet; label: string; value: string; hint: string; tone: "role" | "success" | "warning" }) {
  return <div className="flex items-center gap-3 px-4 py-3.5 sm:px-5"><span className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-lg", tone === "success" ? "bg-success/12 text-success" : tone === "warning" ? "bg-warning/12 text-warning" : "bg-role-soft text-role-dark")}><Icon size={17} /></span><div className="min-w-0 flex-1"><p className="text-xs font-bold text-muted-foreground">{label}</p><p className="text-lg font-black tabular-nums text-foreground">{value}</p></div><p className="max-w-[8rem] text-right text-xs text-muted-foreground">{hint}</p></div>;
}

export function getCurrentWeekInfo(now: Date = new Date()) {
  const year = now.getFullYear();
  const month = now.getMonth();
  const dayOfMonth = now.getDate(); // e.g. 8

  // Week of the month (Week 1: 1-7, Week 2: 8-14, Week 3: 15-21, Week 4: 22-28, Week 5: 29-end)
  const weekNumber = Math.min(5, Math.floor((dayOfMonth - 1) / 7) + 1);
  const startDay = (weekNumber - 1) * 7 + 1;
  const lastDayOfMonth = new Date(year, month + 1, 0).getDate();
  const endDay = Math.min(startDay + 6, lastDayOfMonth);

  // 7 days for the chart view
  const days: Date[] = Array.from({ length: 7 }, (_, index) => {
    return new Date(year, month, startDay + index);
  });

  const startDate = new Date(year, month, startDay, 0, 0, 0, 0);
  const endDate = new Date(year, month, startDay + 6, 23, 59, 59, 999);
  const monthName = now.toLocaleDateString("en-KE", { month: "short" });

  return {
    weekNumber,
    startDay,
    endDay,
    startDate,
    endDate,
    days,
    monthName,
    label: `Week ${weekNumber} · ${startDay} ${monthName} – ${endDay} ${monthName}`,
  };
}

function RevenueChart({ orders = [], days }: { orders: ApiOrder[]; days: 7 | 30 }) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const weekInfo = getCurrentWeekInfo(today);
  const safeOrders = Array.isArray(orders) ? orders : [];

  const points = days === 7
    ? weekInfo.days.map((date) => {
        const d = new Date(date);
        d.setHours(0, 0, 0, 0);
        const matching = safeOrders.filter((order) => {
          if (!order?.created_at) return false;
          const orderDate = new Date(order.created_at);
          return isSameDay(orderDate, d);
        });
        return {
          date: d,
          revenue: matching.reduce((sum, order) => sum + paidValue(order), 0),
          orders: matching.length,
          isToday: isSameDay(d, today),
          isFuture: d > today,
        };
      })
    : Array.from({ length: 30 }, (_, index) => {
        const date = new Date(today);
        date.setDate(date.getDate() - (29 - index));
        const matching = safeOrders.filter((order) => {
          if (!order?.created_at) return false;
          const orderDate = new Date(order.created_at);
          return isSameDay(orderDate, date);
        });
        return {
          date,
          revenue: matching.reduce((sum, order) => sum + paidValue(order), 0),
          orders: matching.length,
          isToday: isSameDay(date, today),
          isFuture: false,
        };
      });

  const maxRevenue = Math.max(1, ...points.map((point) => point.revenue || 0));
  const maxOrders = Math.max(1, ...points.map((point) => point.orders || 0));
  const labels = days === 7 ? points : points.filter((_, index) => index % 5 === 0 || index === points.length - 1);

  return (
    <div>
      <div className="flex h-40 items-end gap-1.5 sm:gap-2">
        {points.map((point) => {
          const dateStr = point.date.toLocaleDateString("en-KE", { day: "numeric", month: "short" });
          const hasRevenue = point.revenue > 0;
          const hasOrders = point.orders > 0;
          
          let heightPercent = 4;
          let barClass = "bg-dark-accent/40";
          let tooltip = `${dateStr}: 0 orders · KES 0`;

          if (hasRevenue) {
            heightPercent = Math.max(14, (point.revenue / maxRevenue) * 100);
            barClass = "bg-role/85 group-hover:bg-role";
            tooltip = `${dateStr}: ${fmtKES(point.revenue)} · ${point.orders} order${point.orders === 1 ? "" : "s"}`;
          } else if (hasOrders) {
            heightPercent = Math.max(22, Math.min(85, (point.orders / maxOrders) * 60));
            barClass = "bg-role/35 border border-dashed border-role/80 group-hover:bg-role/50";
            tooltip = `${dateStr}: ${point.orders} order${point.orders === 1 ? "" : "s"} · KES 0 paid`;
          } else if (point.isToday) {
            heightPercent = 8;
            barClass = "bg-role/25 border border-dashed border-role/40";
            tooltip = `${dateStr} (Today): No orders yet`;
          } else if (point.isFuture) {
            heightPercent = 3;
            barClass = "bg-dark-accent/25 border-b border-dark-accent";
            tooltip = `${dateStr}: Upcoming`;
          }

          return (
            <div key={point.date.toISOString()} className="group relative flex h-full flex-1 flex-col items-center justify-end">
              {hasOrders && (
                <span className="mb-1 text-[10px] font-black text-role tabular-nums opacity-90 group-hover:opacity-100">
                  {point.orders}
                </span>
              )}
              <div
                className={cn("w-full rounded-t-md transition-all duration-200", barClass)}
                style={{ height: `${heightPercent}%` }}
                title={tooltip}
              />
            </div>
          );
        })}
      </div>
      <div className="mt-2 flex justify-between text-[10px] font-semibold text-text-muted">
        {labels.map((point) => (
          <span
            key={point.date.toISOString()}
            className={cn(
              point.isToday ? "font-black text-role underline underline-offset-4" : ""
            )}
          >
            {point.date.toLocaleDateString("en-KE", { day: "numeric", month: "short" })}
          </span>
        ))}
      </div>
    </div>
  );
}

export function RevenueAnalytics({ orders = [] }: { orders?: ApiOrder[] }) {
  const [tab, setTab] = useState<7 | 30>(7);
  const safeOrders = Array.isArray(orders) ? orders : [];
  const active = safeOrders.filter((order) => order && ACTIVE_STATUSES.has(order.status));
  const weekInfo = getCurrentWeekInfo();

  const filteredOrders = tab === 7
    ? active.filter((order) => {
        if (!order?.created_at) return false;
        const d = new Date(order.created_at);
        if (isNaN(d.getTime())) return false;
        return d >= weekInfo.startDate && d <= weekInfo.endDate;
      })
    : active.filter((order) => inLastDays(order?.created_at, 30));

  const revenue = filteredOrders.reduce((sum, order) => sum + paidValue(order), 0);
  const orderCount = filteredOrders.length;
  const products = new Map<string, number>();
  active.forEach((order) => {
    if (!Array.isArray(order?.items)) return;
    order.items.forEach((item) => {
      if (!item) return;
      const name = item.product_name || item.custom_name || "Unnamed product";
      const qty = typeof item.quantity === "number" ? item.quantity : 1;
      products.set(name, (products.get(name) ?? 0) + qty);
    });
  });
  const bestSelling = [...products.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);
  const maxProduct = Math.max(1, ...bestSelling.map(([, count]) => count || 1));

  return (
    <div className="grid gap-4 lg:grid-cols-[1.35fr_1fr]">
      <SectionCard>
        <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-role">Revenue trends</p>
            <h2 className="text-xl font-black text-text-primary">Revenue vs orders</h2>
            <p className="mt-0.5 text-xs font-semibold text-text-muted">
              {tab === 7 ? weekInfo.label : "Past 30 days"}
            </p>
          </div>
          <div className="flex rounded-lg bg-dark-secondary border border-dark-accent p-1">
            {([7, 30] as const).map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setTab(value)}
                className={cn(
                  "rounded-md px-3 py-1.5 text-xs font-bold transition-colors",
                  tab === value
                    ? "bg-dark-card border border-dark-accent text-text-primary shadow-sm"
                    : "text-text-muted hover:text-text-primary"
                )}
              >
                {value === 7 ? "7 days" : "30 days"}
              </button>
            ))}
          </div>
        </div>
        <RevenueChart orders={active} days={tab} />
        <div className="mt-5 grid grid-cols-2 gap-3 border-t border-dark-accent pt-4">
          <div><p className="text-xs text-text-muted">Revenue</p><p className="text-lg font-black text-text-primary">{fmtKES(revenue)}</p></div>
          <div><p className="text-xs text-text-muted">Orders</p><p className="text-lg font-black text-text-primary">{orderCount}</p></div>
        </div>
      </SectionCard>
      <SectionCard>
        <div className="mb-5"><p className="text-xs font-bold uppercase tracking-wider text-role">What sells</p><h2 className="text-xl font-black text-text-primary">Best-selling products</h2></div>
        {bestSelling.length === 0 ? <p className="text-sm text-text-muted">Product sales will appear here after your first order.</p> : <div className="space-y-4">{bestSelling.map(([name, count], index) => <div key={name}><div className="mb-1 flex justify-between gap-3 text-sm"><span className="truncate font-semibold text-text-primary">{index + 1}. {name}</span><span className="shrink-0 font-bold text-text-muted">{count} sold</span></div><div className="h-2 rounded-full bg-dark-secondary"><div className="h-2 rounded-full bg-role" style={{ width: `${(count / maxProduct) * 100}%` }} /></div></div>)}</div>}
      </SectionCard>
    </div>
  );
}

const PIPELINE = [
  { title: "Pending", statuses: ["submitted"], tone: "warning" },
  { title: "Packing", statuses: ["sourcing"], tone: "info" },
  { title: "Awaiting payment", statuses: ["locked", "debt_active"], tone: "role" },
  { title: "Completed", statuses: ["cleared"], tone: "success" },
] as const;

export function OrderPipeline({ orders = [] }: { orders?: ApiOrder[] }) {
  const safeOrders = Array.isArray(orders) ? orders : [];
  return (
    <div>
      <div className="mb-4">
        <p className="text-xs font-bold uppercase tracking-wider text-role">Workflow</p>
        <h2 className="text-xl font-black text-text-primary">Order pipeline</h2>
      </div>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {PIPELINE.map((column) => {
          const items = safeOrders.filter((order) => order && column.statuses.includes(order.status as never));
          return (
            <div key={column.title} className="rounded-2xl border border-dark-accent bg-dark-secondary/80 p-3.5 shadow-sm">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-black text-text-primary">{column.title}</h3>
                <span className="rounded-full border border-dark-accent bg-dark-tertiary px-2.5 py-0.5 text-xs font-black text-text-secondary">
                  {items.length}
                </span>
              </div>
              <div className="space-y-2">
                {items.slice(0, 5).map((order) => (
                  <Link
                    key={order.id}
                    href={`/seller/dashboard/orders/${order.id}/fulfill`}
                    className="block rounded-xl border border-dark-accent bg-dark-card p-3 shadow-xs transition hover:border-brand-gold/40 hover:bg-dark-tertiary/40"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-black text-text-primary">Order #{order.id}</span>
                      <ChevronRight size={14} className="text-text-muted" />
                    </div>
                    <p className="mt-1 truncate text-xs text-text-muted">{buyerDisplayName(order)}</p>
                    <p className="mt-2 text-xs font-bold text-brand-gold">{fmtKES(orderValue(order))}</p>
                  </Link>
                ))}
                {items.length > 5 && (
                  <p className="px-1 text-xs font-semibold text-text-muted">+{items.length - 5} more orders</p>
                )}
                {items.length === 0 && (
                  <p className="py-5 text-center text-xs text-text-muted">Nothing here</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function InventoryInsights({ products = [], onProductUpdated }: { products?: ApiProduct[]; onProductUpdated?: (product: ApiProduct) => void }) {
  const safeProducts = Array.isArray(products) ? products : [];
  const low = safeProducts.filter((product) => product && product.status !== "out_of_stock" && (product.stock_quantity ?? 0) <= 3);
  const out = safeProducts.filter((product) => product && (product.status === "out_of_stock" || (product.stock_quantity ?? 0) === 0));
  const [selected, setSelected] = useState<ApiProduct | null>(null);
  const [quantity, setQuantity] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const restock = async () => {
    if (!selected) return;
    const amount = Number(quantity);
    if (!Number.isInteger(amount) || amount <= 0) { setError("Enter a whole number greater than zero."); return; }
    setIsSaving(true); setError(null);
    try {
      const updated = await productsApi.update(selected.id, { stock_quantity: (selected.stock_quantity ?? 0) + amount, status: "available" });
      onProductUpdated?.(updated);
      setSelected(null); setQuantity("");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not update stock. Please try again.");
    } finally { setIsSaving(false); }
  };
  return <div><div className="mb-4 flex items-end justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-wider text-warning">Inventory alerts</p><h2 className="text-xl font-black text-foreground">Restock before sales stop</h2></div><Link href="/seller/dashboard/catalog" className="text-sm font-bold text-role-dark">View catalog <ChevronRight className="inline" size={14} /></Link></div><SectionCard className="p-0"><div className="divide-y divide-border">{[...low, ...out].length ? [...low, ...out].map((product) => { const stock = product.stock_quantity ?? 0; const isOut = stock === 0 || product.status === "out_of_stock"; return <div key={product.id} className="flex items-center gap-3 px-4 py-3.5 sm:px-5"><span className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-lg", isOut ? "bg-error/10 text-error" : "bg-warning/12 text-warning")}><Package size={17} /></span><div className="min-w-0 flex-1"><p className="truncate text-sm font-bold text-foreground">{product.name}</p><p className="text-xs text-muted-foreground">Stock: <strong className={isOut ? "text-error" : "text-warning"}>{stock}</strong></p></div><button type="button" onClick={() => { setSelected(product); setQuantity(""); setError(null); }} className="inline-flex min-h-11 items-center gap-1.5 rounded-lg border border-border bg-card px-3 text-xs font-black text-role-dark shadow-sm transition hover:-translate-y-0.5 hover:shadow-md focus-visible:ring-2 focus-visible:ring-ring"><span>Restock</span><ArrowRight size={14} /></button></div>; }) : <p className="px-5 py-6 text-sm text-muted-foreground">All products have healthy stock levels.</p>}</div></SectionCard>
    {selected && <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4 sm:items-center" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setSelected(null); }}><div role="dialog" aria-modal="true" aria-labelledby="restock-title" className="w-full max-w-md rounded-2xl border border-border bg-card p-5 text-card-foreground shadow-2xl sm:p-6"><div className="flex items-start justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-wider text-warning">Inventory update</p><h3 id="restock-title" className="mt-1 text-xl font-black text-foreground">Update stock</h3><p className="mt-1 text-sm text-muted-foreground">{selected.name} · Current stock: {selected.stock_quantity ?? 0}</p></div><button type="button" aria-label="Close restock dialog" onClick={() => setSelected(null)} className="min-h-11 min-w-11 rounded-lg text-2xl text-muted-foreground hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring">×</button></div><div className="mt-5 grid grid-cols-3 gap-2">{[5, 10, 20].map((amount) => <button key={amount} type="button" onClick={() => setQuantity(String(amount))} className={cn("min-h-11 rounded-lg border border-border text-sm font-black transition hover:border-role hover:bg-role-soft", quantity === String(amount) && "border-role bg-role-soft text-role-dark")}>+{amount}</button>)}</div><label htmlFor="restock-quantity" className="mt-5 block text-sm font-bold text-foreground">Quantity to add</label><input id="restock-quantity" inputMode="numeric" type="number" min="1" step="1" value={quantity} onChange={(event) => setQuantity(event.target.value)} className="mt-2 h-12 w-full rounded-lg border border-input bg-background px-3 text-base text-foreground outline-none focus:border-role focus:ring-2 focus:ring-role/20" />{error && <p role="alert" className="mt-2 text-sm font-semibold text-error">{error}</p>}<button type="button" disabled={isSaving} onClick={restock} className="mt-5 min-h-12 w-full rounded-lg bg-role-dark px-4 text-sm font-black text-white shadow-md transition hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60">{isSaving ? "Updating..." : "Update stock"}</button></div></div>}
  </div>;
}

export function CustomerIntelligence({ orders = [], relationships = [] }: { orders?: ApiOrder[]; relationships?: ApiRelationship[] }) {
  const safeOrders = Array.isArray(orders) ? orders : [];
  const safeRelationships = Array.isArray(relationships) ? relationships : [];
  const customers = new Map<string, { name: string; orders: number; value: number }>();
  safeOrders.filter((order) => order && ACTIVE_STATUSES.has(order.status)).forEach((order) => { const key = String(order.buyer ?? order.buyer_username ?? buyerDisplayName(order)); const current = customers.get(key) ?? { name: buyerDisplayName(order), orders: 0, value: 0 }; current.orders += 1; current.value += orderValue(order); customers.set(key, current); });
  const ranked = [...customers.values()].sort((a, b) => b.value - a.value).slice(0, 5);
  const repeat = [...customers.values()].filter((customer) => customer.orders > 1).length;
  return <SectionCard><div className="mb-5 flex flex-wrap items-end justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-wider text-role">Customer intelligence</p><h2 className="text-xl font-black text-text-primary">Know your buyers</h2></div><Link href="/seller/dashboard/buyers" className="text-sm font-bold text-role-dark">Manage buyers <ChevronRight className="inline" size={14} /></Link></div><div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4"><div className="rounded-xl border border-dark-accent bg-dark-secondary/60 p-3"><p className="text-xs text-text-muted">Total customers</p><p className="mt-1 text-xl font-black text-text-primary">{Math.max(customers.size, safeRelationships.filter((r) => r?.status === "approved").length)}</p></div><div className="rounded-xl border border-dark-accent bg-dark-secondary/60 p-3"><p className="text-xs text-text-muted">Repeat buyers</p><p className="mt-1 text-xl font-black text-text-primary">{repeat}</p></div><div className="rounded-xl border border-dark-accent bg-dark-secondary/60 p-3"><p className="text-xs text-text-muted">Customer lifetime value</p><p className="mt-1 text-xl font-black text-text-primary">{fmtKES(customers.size ? [...customers.values()].reduce((sum, customer) => sum + customer.value, 0) / customers.size : 0)}</p></div><div className="rounded-xl border border-dark-accent bg-dark-secondary/60 p-3"><p className="text-xs text-text-muted">Recent reviews</p><p className="mt-1 text-sm font-bold text-text-secondary">Coming soon</p></div></div>{ranked.length ? <div className="space-y-2">{ranked.map((customer, index) => <div key={customer.name} className="flex items-center gap-3 rounded-xl border border-dark-accent bg-dark-secondary/60 p-3"><Avatar name={customer.name} size="sm" colorClassName="bg-role-dark" /><span className="flex-1 truncate text-sm font-bold text-text-primary">{index + 1}. {customer.name}</span><span className="text-xs text-text-muted">{customer.orders} order{customer.orders === 1 ? "" : "s"}</span><span className="text-sm font-black tabular-nums text-brand-gold">{fmtKES(customer.value)}</span></div>)}</div> : <div className="flex items-center gap-2 text-sm text-text-muted"><Star size={16} /> Your most valuable customers will appear here after orders.</div>}</SectionCard>;
}
