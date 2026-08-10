"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ShoppingCart, Package, TrendingUp, Store, RefreshCw,
  ClipboardList, BookOpen, Settings, ChevronRight, Plus,
} from "lucide-react";
import { Container, Section, DashboardLayout } from "@/components/layouts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Avatar } from "@/components/ui/Avatar";
import { PageSkeleton } from "@/components/ui/LoadingState";
import { useAuth } from "@/lib/auth-context";
import { orders, relationships, type ApiOrder, type ApiRelationship, fmtKES, parsePrice, ApiError } from "@/lib/api";
import { getStatusLabel, orderTimelineSteps } from "@/lib/order-status";
import { cn } from "@/lib/cn";

const QUICK_ACTIONS = [
  { href: "/buyer/suppliers", label: "Browse Suppliers", Icon: Store },
  { href: "/buyer/lists/new", label: "New Order", Icon: ClipboardList },
  { href: "/buyer/debts", label: "What You Owe", Icon: BookOpen },
  { href: "/buyer/account", label: "My Account", Icon: Settings },
];

/** Tiny at-a-glance version of the order tracker — a Jumia-style dot strip. */
function MiniProgress({ status }: { status: string }) {
  if (status === "cancelled") {
    return <span className="text-xs font-semibold text-error">Cancelled</span>;
  }
  const steps = orderTimelineSteps(status);
  return (
    <div className="flex items-center gap-1" aria-hidden="true">
      {steps.map((step, i) => (
        <span
          key={i}
          className={cn(
            "h-1.5 rounded-full transition-colors",
            step.current ? "w-4 bg-role" : step.done ? "w-1.5 bg-success" : "w-1.5 bg-slate-200"
          )}
        />
      ))}
    </div>
  );
}

export default function BuyerDashboard() {
  const { user } = useAuth();
  const [orderList, setOrderList] = useState<ApiOrder[]>([]);
  const [relationshipList, setRelationshipList] = useState<ApiRelationship[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Guards against setting state after the user has already navigated
    // away (e.g. a quick tap to another tab before the fetch resolves) —
    // the request itself still completes, but its result is discarded
    // instead of updating a component that's no longer on screen.
    let cancelled = false;
    loadDashboardData(() => cancelled);
    return () => {
      cancelled = true;
    };
  }, []);

  const loadDashboardData = async (isCancelled: () => boolean = () => false) => {
    try {
      setIsLoading(true);
      setError(null);
      const [ordersData, relationsData] = await Promise.all([
        orders.list(),
        relationships.mine(),
      ]);
      if (isCancelled()) return;
      setOrderList(ordersData);
      setRelationshipList(relationsData);
    } catch (err) {
      if (isCancelled()) return;
      console.error("Buyer dashboard fetch error:", err);
      setError(err instanceof ApiError ? err.message : "We couldn't load your dashboard. Please try again.");
    } finally {
      if (!isCancelled()) setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout title="Dashboard">
        <PageSkeleton showKPIs listCount={3} />
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout title="Dashboard">
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center m-4 sm:m-6">
          <p className="text-red-700 font-medium mb-3">{error}</p>
          <button
            onClick={() => loadDashboardData()}
            className="flex items-center gap-1.5 text-xs font-semibold text-red-700 hover:text-red-800 cursor-pointer mx-auto bg-red-100 px-4 py-2 rounded-lg"
          >
            <RefreshCw size={14} /> Try Again
          </button>
        </div>
      </DashboardLayout>
    );
  }

  const activeOrders = orderList.filter((o) => !["cleared", "cancelled"].includes(o.status));
  const completedOrders = orderList.filter((o) => o.status === "cleared");
  const totalSpent = orderList.reduce((s, o) => s + parsePrice(o.amount_paid ?? 0), 0);
  const approvedSuppliers = relationshipList.filter((r) => r.status === "approved");

  const sellerNameById = new Map(relationshipList.map((r) => [r.seller_id, r.seller_name]));

  const recentOrders = [...orderList]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5);

  const firstName = (user?.full_name || user?.username || "there").split(" ")[0];
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  const stats = [
    { icon: ShoppingCart, label: "Active Orders", value: String(activeOrders.length) },
    { icon: Package, label: "Completed", value: String(completedOrders.length) },
    { icon: TrendingUp, label: "Total Spent", value: fmtKES(totalSpent) },
    { icon: Store, label: "Suppliers", value: String(approvedSuppliers.length) },
  ];

  return (
    <DashboardLayout title="Dashboard">
      <Section spacing="md">
        <Container size="xl">
          {/* Hero greeting */}
          <div className="relative mb-8 overflow-hidden rounded-2xl bg-gradient-to-br from-[rgb(var(--role))] to-[rgb(var(--role)/0.78)] p-6 sm:p-8 shadow-[0_12px_32px_-8px_rgb(var(--role)/0.4)]">
            <span
              className="absolute -right-10 -top-10 w-44 h-44 rounded-full bg-white/10"
              aria-hidden="true"
            />
            <span
              className="absolute right-10 bottom-[-3rem] w-28 h-28 rounded-full bg-white/10"
              aria-hidden="true"
            />
            <div className="relative flex flex-col sm:flex-row sm:items-end sm:justify-between gap-5">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-white">{greeting}, {firstName}</h1>
                <p className="text-sm text-white/80 mt-1.5">
                  Here&apos;s what&apos;s happening with your trade today.
                </p>
              </div>
              <Link
                href="/buyer/lists/new"
                className="inline-flex items-center justify-center gap-1.5 shrink-0 bg-white text-role font-semibold text-sm px-5 py-3 rounded-xl hover:bg-white/90 active:scale-[0.98] transition-all shadow-sm"
              >
                <Plus size={16} strokeWidth={2.5} /> New Order
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-8">
            {stats.map(({ icon: Icon, label, value }) => (
              <Card key={label}>
                <CardContent className="p-4 sm:p-5 flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-role-soft flex items-center justify-center shrink-0">
                    <Icon className="w-5 h-5 text-role" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xl sm:text-2xl font-bold text-text-primary leading-tight truncate">{value}</p>
                    <p className="text-xs text-text-muted font-medium truncate">{label}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Suppliers strip */}
          {approvedSuppliers.length > 0 && (
            <Card className="relative mb-8">
              <CardContent className="py-5 flex items-center gap-5 overflow-x-auto">
                <span className="text-label shrink-0">
                  My Suppliers
                </span>
                <div className="flex items-center gap-4">
                  {approvedSuppliers.slice(0, 8).map((rel) => (
                    <Link
                      key={rel.id}
                      href={`/buyer/suppliers/${rel.seller_id}/storefront`}
                      className="flex flex-col items-center gap-1.5 shrink-0 group"
                    >
                      <div className="rounded-full ring-2 ring-transparent group-hover:ring-role/30 transition-all">
                        <Avatar name={rel.seller_name} size="md" />
                      </div>
                      <span className="text-xs text-text-muted max-w-[64px] truncate">
                        {rel.seller_name}
                      </span>
                    </Link>
                  ))}
                </div>
                <Link
                  href="/buyer/suppliers"
                  className="ml-auto shrink-0 flex items-center gap-0.5 text-xs font-semibold text-role hover:opacity-80"
                >
                  View all <ChevronRight size={14} />
                </Link>
              </CardContent>
              {/* Fade cue — hints there's more to scroll to on desktop, where
                  the scrollbar itself may not be visible until hovered. */}
              <span
                className="pointer-events-none absolute right-0 top-0 bottom-0 w-10 rounded-r-2xl bg-gradient-to-l from-white to-transparent"
                aria-hidden="true"
              />
            </Card>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Quick Actions */}
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  {QUICK_ACTIONS.map(({ href, label, Icon }) => (
                    <Link
                      key={href}
                      href={href}
                      className="flex flex-col items-center justify-center gap-2 text-center p-4 rounded-xl bg-slate-50 hover:bg-role-soft border border-slate-100 hover:border-role/20 transition-all hover:scale-[1.02] active:scale-[0.98] group"
                    >
                      <Icon className="w-5 h-5 text-text-muted group-hover:text-role transition-colors" />
                      <span className="text-xs font-semibold text-text-secondary group-hover:text-role transition-colors">
                        {label}
                      </span>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-lg">Recent Orders</CardTitle>
                <CardDescription>Your last few orders</CardDescription>
              </CardHeader>
              <CardContent>
                {recentOrders.length === 0 ? (
                  <div className="py-8 text-center">
                    <div className="w-14 h-14 rounded-2xl bg-role-soft flex items-center justify-center mx-auto mb-3">
                      <ShoppingCart className="w-6 h-6 text-role" />
                    </div>
                    <p className="text-sm font-medium text-text-primary">No orders yet</p>
                    <p className="text-xs text-text-muted mt-1">Browse suppliers to place your first order.</p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {recentOrders.map((order) => {
                      const sellerName = sellerNameById.get(order.seller ?? -1) ?? "Supplier";
                      return (
                        <Link
                          key={order.id}
                          href={`/buyer/orders/${order.id}`}
                          className="flex items-center gap-3 py-3 border-b border-slate-100 last:border-0 hover:bg-slate-50 -mx-2 px-2 rounded-xl transition-colors"
                        >
                          <Avatar name={sellerName} size="sm" />
                          <div className="flex-1 min-w-0 space-y-1">
                            <p className="text-sm font-medium text-text-primary truncate">
                              Order #{order.id} · {sellerName}
                            </p>
                            <MiniProgress status={order.status} />
                          </div>
                          <div className="text-right space-y-0.5 shrink-0">
                            <p className="text-sm font-semibold text-role">
                              {fmtKES(order.final_total ?? order.total_price)}
                            </p>
                            <p className="text-xs text-text-muted">{getStatusLabel(order.status)}</p>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </Container>
      </Section>
    </DashboardLayout>
  );
}
