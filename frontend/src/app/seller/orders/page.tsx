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

export default function SellerOrdersPage() {
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
      const data = await orders.sellerList();
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
        <h2 className="text-2xl font-bold text-white">Manage Orders</h2>

        {orderList.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            <p className="text-sm">No orders yet.</p>
            <p className="text-xs mt-1">Orders will appear here when buyers submit them.</p>
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
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-3">
                          <h3 className="font-bold text-white">Order #{order.id}</h3>
                          <Badge variant={sb.variant} className="text-xs">
                            {sb.label}
                          </Badge>
                        </div>
                        <p className="text-sm text-slate-400">
                          {order.buyer_username || "Unknown buyer"} • {itemCount} item{itemCount !== 1 ? "s" : ""}
                        </p>
                      </div>
                      <div className="text-right space-y-3 mr-4">
                        <p className="font-bold text-brand-gold text-lg">
                          {fmtKES(order.total_price)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/seller/orders/${order.id}/fulfill`}>
                            View Details
                          </Link>
                        </Button>
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
