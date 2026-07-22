"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { DashboardLayout } from "@/components/layouts";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { orders, type ApiOrder, fmtKES, ApiError } from "@/lib/api";
import { LoadingScreen } from "@/components/LoadingScreen";

function statusBadge(status: string) {
  const map: Record<string, { variant: "default" | "success" | "warning" | "error" | "info" | "outline"; label: string }> = {
    pending:    { variant: "warning", label: "Pending" },
    submitted:  { variant: "warning", label: "Submitted" },
    sourcing:   { variant: "info",    label: "Sourcing" },
    locked:     { variant: "default", label: "Locked" },
    debt_active:{ variant: "error",   label: "Debt" },
    cleared:    { variant: "success", label: "Cleared" },
    cancelled:  { variant: "error",   label: "Cancelled" },
  };
  return map[status] || { variant: "default", label: status };
}

export default function BuyerOrdersPage() {
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
      const data = await orders.list();
      setOrderList(data);
    } catch (err) {
      console.error("Failed to load orders:", err);
      setError(err instanceof ApiError ? err.message : "Failed to load orders.");
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

  return (
    <DashboardLayout title="Orders">
      <div className="space-y-6 p-4 sm:p-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-white">Your Orders</h2>
          <Button asChild>
            <Link href="/buyer/suppliers">New Order</Link>
          </Button>
        </div>

        {orderList.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            <p className="text-sm">No orders yet.</p>
            <p className="text-xs mt-1">Browse suppliers and place your first order.</p>
            <Button className="mt-4" size="sm" asChild>
              <Link href="/buyer/suppliers">Browse Suppliers</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {orderList.map((order) => {
              const sb = statusBadge(order.status);
              const itemCount = order.items?.length ?? 0;
              return (
                <Card key={order.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-3">
                          <h3 className="font-bold text-white">Order #{order.id}</h3>
                          <Badge variant={sb.variant} className="text-xs">
                            {sb.label}
                          </Badge>
                        </div>
                        <p className="text-sm text-slate-400">
                          {order.buyer_username || "Unknown supplier"}
                        </p>
                      </div>
                      <div className="text-right space-y-1">
                        <p className="font-bold text-brand-gold text-lg">
                          {fmtKES(order.total_price)}
                        </p>
                        <p className="text-xs text-slate-500">
                          {itemCount} item{itemCount !== 1 ? "s" : ""}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
