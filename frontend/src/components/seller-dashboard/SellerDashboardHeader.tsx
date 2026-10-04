"use client";

import Link from "next/link";
import { Bell, Search, ShoppingBag, Users } from "lucide-react";
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
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  const newOrders = orders.filter((order) => order.status === "submitted").length;
  const awaitingPayment = orders.filter((order) => ["locked", "debt_active"].includes(order.status)).length;
  const confirmedPayments = orders.filter((order) => order.status === "cleared").length;
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
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-2xl font-black tracking-tight text-text-primary sm:text-3xl">{greeting}, {firstName}</p>
          <p className="mt-1 text-sm text-text-secondary">
            Your shop generated <strong className="text-text-primary">{fmtKES(todayRevenue)}</strong> today.
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-full bg-role-soft px-3 py-2 text-xs font-bold text-role-dark">
          <Bell size={15} aria-hidden="true" />
          {newOrders + awaitingPayment} need attention
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

      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        <Link href="/seller/dashboard/orders" className="rounded-xl bg-error/8 px-3 py-3 transition hover:bg-error/12">
          <div className="flex items-center gap-1.5 text-xs font-bold text-error"><ShoppingBag size={14} /> New orders</div>
          <p className="mt-1 text-xl font-black tabular-nums text-text-primary">{newOrders}</p>
        </Link>
        <Link href="/seller/dashboard/ledger" className="rounded-xl bg-warning/10 px-3 py-3 transition hover:bg-warning/15">
          <div className="flex items-center gap-1.5 text-xs font-bold text-warning"><Bell size={14} /> Awaiting payment</div>
          <p className="mt-1 text-xl font-black tabular-nums text-text-primary">{awaitingPayment}</p>
        </Link>
        <Link href="/seller/dashboard/ledger" className="rounded-xl bg-success/8 px-3 py-3 transition hover:bg-success/12">
          <div className="flex items-center gap-1.5 text-xs font-bold text-success"><Users size={14} /> Confirmed</div>
          <p className="mt-1 text-xl font-black tabular-nums text-text-primary">{confirmedPayments}</p>
        </Link>
      </div>
    </div>
  );
}
