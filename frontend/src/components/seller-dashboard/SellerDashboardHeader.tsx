"use client";

import Link from "next/link";
import { ArrowRight, Bell, CheckCircle2, Package, Search, ShoppingBag, Users } from "lucide-react";
import { fmtKES, type ApiOrder, type ApiProduct, type ApiRelationship } from "@/lib/api";
import { buyerDisplayName } from "@/lib/order-status";

interface SellerDashboardHeaderProps {
  sellerName: string;
  todayRevenue: number;
  orders: ApiOrder[];
  products: ApiProduct[];
  relationships: ApiRelationship[];
  query: string;
  onQueryChange: (value: string) => void;
}

export function SellerDashboardHeader({
  sellerName,
  todayRevenue,
  orders,
  products,
  relationships,
  query,
  onQueryChange,
}: SellerDashboardHeaderProps) {
  const firstName = sellerName.split(" ")[0];
  const newOrders = orders.filter((order) => order.status === "submitted").length;
  const awaitingPayment = orders.filter((order) => ["locked", "debt_active"].includes(order.status)).length;
  const confirmedPayments = orders.filter((order) => order.status === "cleared").length;
  const outOfStock = products.filter((product) => product.status === "out_of_stock" || (product.stock_quantity ?? 0) === 0).length;
  const lowStock = products.filter((product) => product.status !== "out_of_stock" && (product.stock_quantity ?? 0) > 0 && (product.stock_quantity ?? 0) <= 3).length;
  const buyerRequests = relationships.filter((relationship) => relationship.status === "pending").length;
  const priorities = [
    { count: newOrders, label: "Orders awaiting processing", href: "/seller/dashboard/orders", icon: ShoppingBag, tone: "text-error bg-error/8" },
    { count: outOfStock + lowStock, label: "Products need restocking", href: "/seller/dashboard/catalog", icon: Package, tone: "text-warning bg-warning/10" },
    { count: awaitingPayment, label: "Payments awaiting confirmation", href: "/seller/dashboard/ledger", icon: Bell, tone: "text-warning bg-warning/10" },
    { count: buyerRequests, label: "Buyer requests pending", href: "/seller/dashboard/buyers", icon: Users, tone: "text-info bg-info/8" },
  ].filter((priority) => priority.count > 0);
  const matches = query.trim().length < 2 ? [] : [
    ...products.filter((product) => product.name.toLowerCase().includes(query.toLowerCase())).slice(0, 3).map((product) => ({
      href: `/seller/dashboard/catalog/new?id=${product.id}`,
      label: product.name,
      type: "Product",
    })),
    ...orders.filter((order) => buyerDisplayName(order).toLowerCase().includes(query.toLowerCase())).slice(0, 3).map((order) => ({
      href: `/seller/dashboard/orders/${order.id}/fulfill`,
      label: `Order #${order.id} · ${buyerDisplayName(order)}`,
      type: "Order",
    })),
    ...relationships.filter((relationship) => (relationship.buyer_name || "").toLowerCase().includes(query.toLowerCase())).slice(0, 3).map((relationship) => ({
      href: "/seller/dashboard/buyers",
      label: relationship.buyer_name || "Buyer",
      type: "Buyer",
    })),
  ].slice(0, 6);

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-role">Today's priorities</p>
            <h1 className="mt-1 text-2xl font-black tracking-tight text-foreground sm:text-3xl">Run your shop with confidence, {firstName}</h1>
            <p className="mt-1 text-sm text-muted-foreground">You collected <strong className="text-foreground">{fmtKES(todayRevenue)}</strong> today.</p>
          </div>
          <CheckCircle2 className="text-success" size={24} aria-label="Dashboard priorities" />
        </div>
        <div className="mt-5 grid gap-2 sm:grid-cols-2">
          {priorities.length ? priorities.map(({ count, label, href, icon: Icon, tone }) => (
            <Link key={label} href={href} className={`group flex min-h-12 items-center justify-between gap-3 rounded-xl border border-border px-3 py-2.5 text-sm font-bold transition hover:-translate-y-0.5 hover:shadow-md focus-visible:ring-2 focus-visible:ring-ring ${tone}`}>
              <span className="flex items-center gap-2"><Icon size={17} aria-hidden="true" /><span>{count} {label}</span></span>
              <ArrowRight size={16} className="shrink-0 transition-transform group-hover:translate-x-0.5" />
            </Link>
          )) : <p className="text-sm font-semibold text-muted-foreground">No urgent actions right now. Your shop is in good shape.</p>}
        </div>
      </div>

      <div className="relative">
        <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={18} aria-hidden="true" />
        <label htmlFor="seller-global-search" className="sr-only">Search orders, products, and buyers</label>
        <input
          id="seller-global-search"
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder="Search orders, products, buyers..."
          className="h-12 w-full rounded-xl border border-slate-200 bg-white pl-11 pr-4 text-sm text-text-primary shadow-sm outline-none transition focus:border-role focus:ring-2 focus:ring-role/20"
        />
        {matches.length > 0 && (
          <div className="absolute left-0 right-0 top-14 z-30 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl">
            {matches.map((match) => (
              <Link key={`${match.type}-${match.href}-${match.label}`} href={match.href} className="flex items-center justify-between gap-3 border-b border-slate-100 px-4 py-3 text-sm hover:bg-role-soft/50">
                <span className="truncate font-semibold text-text-primary">{match.label}</span>
                <span className="shrink-0 text-xs font-bold text-text-muted">{match.type}</span>
              </Link>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
        {[
          { label: "New orders", count: newOrders, href: "/seller/dashboard/orders", icon: ShoppingBag, active: "border-error bg-error/8 text-error" },
          { label: "Awaiting payment", count: awaitingPayment, href: "/seller/dashboard/ledger", icon: Bell, active: "border-warning bg-warning/10 text-warning" },
          { label: "Confirmed", count: confirmedPayments, href: "/seller/dashboard/ledger", icon: CheckCircle2, active: "border-success bg-success/8 text-success" },
        ].map(({ label, count, href, icon: Icon, active }) => (
          <Link key={label} href={href} className={`group flex min-h-14 items-center justify-between rounded-xl border px-4 py-3 transition hover:-translate-y-0.5 hover:shadow-md focus-visible:ring-2 focus-visible:ring-ring ${active}`}>
            <span className="flex items-center gap-2 text-sm font-bold"><Icon size={17} aria-hidden="true" />{label}</span>
            <span className="flex items-center gap-2 text-xl font-black tabular-nums text-foreground">{count}<ArrowRight size={16} className="text-muted-foreground transition-transform group-hover:translate-x-0.5" /></span>
          </Link>
        ))}
      </div>
    </div>
  );
}
