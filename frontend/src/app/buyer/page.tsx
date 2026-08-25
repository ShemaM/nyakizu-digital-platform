"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ShoppingCart, Package, TrendingUp, Store, RefreshCw, Plus,
} from "lucide-react";
import { Container, Section, DashboardLayout } from "@/components/layouts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Avatar } from "@/components/ui/Avatar";
import { PageSkeleton } from "@/components/ui/LoadingState";
import { useAuth } from "@/lib/auth-context";
import { orders, relationships, type ApiOrder, type ApiRelationship, fmtKES, parsePrice, ApiError } from "@/lib/api";
import { getStatusLabel, orderTimelineSteps } from "@/lib/order-status";
import { cn } from "@/lib/cn";

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
        <div className="bg-error/10 border border-error/20 rounded-2xl p-6 text-center m-4 sm:m-6">
          <p className="text-error font-medium mb-3">{error}</p>
          <button
            onClick={() => loadDashboardData()}
            className="flex items-center gap-1.5 text-xs font-semibold text-error hover:text-error/80 cursor-pointer mx-auto bg-error/10 px-4 py-2 rounded-lg"
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
    { icon: ShoppingCart, label: "Active Orders", value: String(activeOrders.length), href: "/buyer/orders?status=active" },
    { icon: Package, label: "Completed", value: String(completedOrders.length), href: "/buyer/orders?status=completed" },
    { icon: TrendingUp, label: "Total Spent (KES)", value: totalSpent.toLocaleString("en-KE"), href: "/buyer/orders" },
    { icon: Store, label: "Suppliers", value: String(approvedSuppliers.length), href: "/buyer/suppliers" },
  ];

  return (
    <DashboardLayout title="Dashboard">
      <Section spacing="md">
        <Container size="xl">
          {/* Hero greeting — just the greeting. The primary action used to
              live inside this card too, competing with it for attention;
              now it's its own clear next step right below. */}
          <div className="relative mb-4 overflow-hidden rounded-2xl bg-gradient-to-br from-[rgb(var(--role))] to-[rgb(var(--role)/0.78)] p-6 sm:p-8 shadow-[0_12px_32px_-8px_rgb(var(--role)/0.4)]">
            <span
              className="absolute -right-10 -top-10 w-44 h-44 rounded-full bg-white/10"
              aria-hidden="true"
            />
            <span
              className="absolute right-10 bottom-[-3rem] w-28 h-28 rounded-full bg-white/10"
              aria-hidden="true"
            />
            <div className="relative">
              <h2 className="text-2xl sm:text-3xl font-bold text-white">{greeting}, {firstName}</h2>
              <p className="text-sm text-white/80 mt-1.5">
                Here&apos;s what&apos;s happening with your trade today.
              </p>
            </div>
          </div>

          <Link
            href="/buyer/lists/new"
            className="mb-8 flex items-center justify-center gap-1.5 w-full bg-role text-white font-semibold text-sm px-5 py-3.5 rounded-xl hover:opacity-90 active:scale-[0.98] transition-all shadow-sm"
          >
            <Plus size={16} strokeWidth={2.5} /> New Order
          </Link>

          {/* Stats — each one is a real link to where that number comes
              from, not just a readout. Value line drops "KES" (the label
              carries it instead) so a 5-figure total doesn't get truncated
              in the 2-column mobile grid. */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-8">
            {stats.map(({ icon: Icon, label, value, href }) => (
              <Link key={label} href={href} className="block">
                <Card interactive>
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
              </Link>
            ))}
          </div>

          <div className="grid grid-cols-1">
            {/* Recent Activity */}
            <Card>
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
