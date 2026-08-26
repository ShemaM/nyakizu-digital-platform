"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { DashboardLayout } from "@/components/layouts";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { orders, type ApiOrder, fmtKES, parsePrice, ApiError } from "@/lib/api";
import { buyerOrderLabel } from "@/lib/order-status";
import { PageSkeleton } from "@/components/ui/LoadingState";
import { AlertCircle, RefreshCw, Wallet } from "lucide-react";

export default function BuyerDebts() {
  const [debtOrders, setDebtOrders] = useState<ApiOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDebts();
  }, []);

  const loadDebts = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await orders.buyerDebts();
      setDebtOrders(data);
    } catch (err) {
      console.error("Failed to load debts:", err);
      setError(err instanceof ApiError ? err.message : "We couldn't load what you owe. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const totalDebt = debtOrders.reduce(
    (s, o) => s + parsePrice(o.balance ?? o.final_total ?? o.total_price),
    0
  );

  const totalPaid = debtOrders.reduce(
    (s, o) => s + parsePrice(o.amount_paid ?? 0),
    0
  );

  if (isLoading) {
    return (
      <DashboardLayout title="What You Owe">
        <div className="p-4 sm:p-6">
          <PageSkeleton showKPIs={false} listCount={3} />
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout title="What You Owe">
        <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
          <p className="text-error text-sm">{error}</p>
          <Button onClick={loadDebts} size="sm">Retry</Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="What You Owe">
      <div className="space-y-6 p-4 sm:p-6">
        {/* Total Debt Summary */}
        <Card className="border-warning/20 bg-warning/5">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 mb-3">
              <AlertCircle className="w-6 h-6 text-warning" />
              <h2 className="text-lg font-bold text-text-primary">Total You Owe</h2>
            </div>
            <p className="text-3xl font-bold text-warning">{fmtKES(totalDebt)}</p>
            <p className="text-sm text-text-secondary mt-2">
              Across {debtOrders.length} order{debtOrders.length !== 1 ? "s" : ""} • {fmtKES(totalPaid)} paid so far
            </p>
            {totalDebt > 0 && (
              <p className="text-caption text-text-muted mt-3 pt-3 border-t border-warning/15">
                Pay your seller via M-Pesa, then they record it here.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Debt List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-label">Orders you owe on</h2>
            <Button variant="outline" size="sm" onClick={loadDebts}>
              <RefreshCw size={14} className="mr-1" /> Refresh
            </Button>
          </div>

          {debtOrders.length === 0 ? (
            <div className="text-center py-12 text-text-muted">
              <Wallet className="w-12 h-12 mx-auto mb-3 text-slate-300" />
              <p className="text-sm">You don&apos;t owe anything.</p>
              <p className="text-xs mt-1">All your orders are paid in full.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {debtOrders.map((order) => {
                const total = parsePrice(order.final_total ?? order.total_price);
                const paid = parsePrice(order.amount_paid ?? 0);
                const bal = parsePrice(order.balance ?? total - paid);
                const progress = total > 0 ? (paid / total) * 100 : 0;

                return (
                  <Link key={order.id} href={`/buyer/orders/${order.id}`} className="block">
                    <Card interactive>
                      <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                          <div className="space-y-2 flex-1">
                            <div className="flex items-center gap-3">
                              <h3 className="font-bold text-text-primary">{buyerOrderLabel(order.seller_store_name, order.created_at)}</h3>
                              <Badge variant="warning" className="text-xs">
                                {order.status === "debt_active" ? "Part Paid" : "Not Paid Yet"}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-text-secondary">
                              <span>Total: {fmtKES(total)}</span>
                              <span>Paid: {fmtKES(paid)}</span>
                              <span className="text-error font-bold">You owe: {fmtKES(bal)}</span>
                            </div>
                            <ProgressBar percent={progress} tone="warning" className="mt-2" />
                            {order.payment_reference && (
                              <p className="text-xs text-text-muted">
                                Last payment: {order.payment_reference} ({order.payment_method?.toUpperCase()})
                              </p>
                            )}
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
      </div>
    </DashboardLayout>
  );
}
