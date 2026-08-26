"use client";

import { Suspense, useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { DashboardLayout } from "@/components/layouts";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { orders, type ApiOrder, fmtKES, ApiError } from "@/lib/api";
import { getStatusLabel, getStatusVariant, orderTimelineSteps, buyerOrderLabel } from "@/lib/order-status";
import { PageSkeleton } from "@/components/ui/LoadingState";
import { cn } from "@/lib/cn";

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

const FILTERS = [
  { key: "all", label: "All" },
  { key: "active", label: "Active" },
  { key: "completed", label: "Completed" },
] as const;

type FilterKey = (typeof FILTERS)[number]["key"];

function matchesFilter(status: string, filter: FilterKey): boolean {
  if (filter === "active") return !["cleared", "cancelled"].includes(status);
  if (filter === "completed") return status === "cleared";
  return true;
}

export default function BuyerOrdersPage() {
  return (
    <Suspense
      fallback={
        <DashboardLayout title="Orders">
          <PageSkeleton showKPIs={false} listCount={4} />
        </DashboardLayout>
      }
    >
      <BuyerOrdersContent />
    </Suspense>
  );
}

function BuyerOrdersContent() {
  const searchParams = useSearchParams();
  const rawFilter = searchParams.get("status");
  const activeFilter: FilterKey = rawFilter === "active" || rawFilter === "completed" ? rawFilter : "all";
  const [orderList, setOrderList] = useState<ApiOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const ordersData = await orders.list();
      setOrderList(ordersData);
    } catch (err) {
      console.error("Failed to load orders:", err);
      setError(err instanceof ApiError ? err.message : "We couldn't load your orders. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout title="Orders">
        <PageSkeleton showKPIs={false} listCount={4} />
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout title="Orders">
        <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
          <p className="text-error text-sm">{error}</p>
          <Button onClick={loadOrders} size="sm">Retry</Button>
        </div>
      </DashboardLayout>
    );
  }

  const filteredOrders = orderList.filter((o) => matchesFilter(o.status, activeFilter));

  return (
    <DashboardLayout title="Orders">
      <div className="space-y-6 p-4 sm:p-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-text-primary">Your Orders</h2>
          <Button asChild>
            <Link href="/buyer/suppliers">New Order</Link>
          </Button>
        </div>

        {orderList.length > 0 && (
          <div className="flex items-center gap-2">
            {FILTERS.map(({ key, label }) => (
              <Link
                key={key}
                href={key === "all" ? "/buyer/orders" : `/buyer/orders?status=${key}`}
                className={cn(
                  "px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors",
                  activeFilter === key
                    ? "bg-role text-white"
                    : "bg-slate-100 text-text-muted hover:bg-slate-200"
                )}
              >
                {label}
              </Link>
            ))}
          </div>
        )}

        {orderList.length === 0 ? (
          <div className="text-center py-12 text-text-muted">
            <p className="text-sm">You have no orders yet.</p>
            <p className="text-xs mt-1">Find a supplier and send your first order.</p>
            <Button className="mt-4" size="sm" asChild>
              <Link href="/buyer/suppliers">Browse Suppliers</Link>
            </Button>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="text-center py-12 text-text-muted">
            <p className="text-sm">No {activeFilter} orders.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => {
              const itemCount = order.items?.length ?? 0;
              const sellerName = order.seller_store_name || "Supplier";
              return (
                <Link key={order.id} href={`/buyer/orders/${order.id}`} className="block">
                  <Card interactive>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-3">
                            <h3 className="font-bold text-text-primary">{buyerOrderLabel(sellerName, order.created_at)}</h3>
                            <Badge variant={getStatusVariant(order.status)} className="text-xs">
                              {getStatusLabel(order.status)}
                            </Badge>
                          </div>
                          <MiniProgress status={order.status} />
                        </div>
                        <div className="text-right space-y-1 shrink-0">
                          <p className="font-bold text-role text-lg">
                            {fmtKES(order.final_total ?? order.total_price)}
                          </p>
                          <p className="text-xs text-text-muted">
                            {itemCount} item{itemCount !== 1 ? "s" : ""}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
