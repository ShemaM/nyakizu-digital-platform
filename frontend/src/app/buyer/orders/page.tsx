"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { DashboardLayout } from "@/components/layouts";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { orders, relationships, type ApiOrder, type ApiRelationship, fmtKES, ApiError } from "@/lib/api";
import { getStatusLabel, getStatusVariant, orderTimelineSteps } from "@/lib/order-status";
import { LoadingScreen } from "@/components/LoadingScreen";
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

export default function BuyerOrdersPage() {
  const [orderList, setOrderList] = useState<ApiOrder[]>([]);
  const [relationshipList, setRelationshipList] = useState<ApiRelationship[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const [ordersData, relationsData] = await Promise.all([
        orders.list(),
        relationships.mine().catch(() => []),
      ]);
      setOrderList(ordersData);
      setRelationshipList(relationsData);
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
        <div className="flex items-center justify-center h-[60vh]">
          <LoadingScreen />
        </div>
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

  const sellerNameById = new Map(relationshipList.map((r) => [r.seller_id, r.seller_name]));

  return (
    <DashboardLayout title="Orders">
      <div className="space-y-6 p-4 sm:p-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-text-primary">Your Orders</h2>
          <Button asChild>
            <Link href="/buyer/suppliers">New Order</Link>
          </Button>
        </div>

        {orderList.length === 0 ? (
          <div className="text-center py-12 text-text-muted">
            <p className="text-sm">You have no orders yet.</p>
            <p className="text-xs mt-1">Find a supplier and send your first order.</p>
            <Button className="mt-4" size="sm" asChild>
              <Link href="/buyer/suppliers">Browse Suppliers</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {orderList.map((order) => {
              const itemCount = order.items?.length ?? 0;
              const sellerName = sellerNameById.get(order.seller ?? -1) ?? "Supplier";
              return (
                <Link key={order.id} href={`/buyer/orders/${order.id}`} className="block">
                  <Card interactive>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-3">
                            <h3 className="font-bold text-text-primary">Order #{order.id}</h3>
                            <Badge variant={getStatusVariant(order.status)} className="text-xs">
                              {getStatusLabel(order.status)}
                            </Badge>
                          </div>
                          <p className="text-sm text-text-muted">{sellerName}</p>
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
