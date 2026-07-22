"use client";

import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layouts";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { orders, type ApiOrder, fmtKES, parsePrice, ApiError } from "@/lib/api";
import { LoadingScreen } from "@/components/LoadingScreen";
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
      setError(err instanceof ApiError ? err.message : "Failed to load debts.");
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
      <DashboardLayout title="Debts">
        <div className="flex items-center justify-center h-[60vh]">
          <LoadingScreen />
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout title="Debts">
        <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
          <p className="text-error text-sm">{error}</p>
          <Button onClick={loadDebts} size="sm">Retry</Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Debts">
      <div className="space-y-6 p-4 sm:p-6">
        {/* Total Debt Summary */}
        <Card className="border-warning/20 bg-warning/5">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 mb-3">
              <AlertCircle className="w-6 h-6 text-warning" />
              <h2 className="text-lg font-bold text-white">Total Outstanding</h2>
            </div>
            <p className="text-3xl font-bold text-warning">{fmtKES(totalDebt)}</p>
            <p className="text-sm text-slate-400 mt-2">
              Across {debtOrders.length} order{debtOrders.length !== 1 ? "s" : ""} • {fmtKES(totalPaid)} paid so far
            </p>
          </CardContent>
        </Card>

        {/* Debt List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">Your Debts</h2>
            <Button variant="outline" size="sm" onClick={loadDebts}>
              <RefreshCw size={14} className="mr-1" /> Refresh
            </Button>
          </div>

          {debtOrders.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <Wallet className="w-12 h-12 mx-auto mb-3 text-slate-600" />
              <p className="text-sm">No outstanding debts.</p>
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
                  <Card key={order.id}>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div className="space-y-2 flex-1">
                          <div className="flex items-center gap-3">
                            <h3 className="font-bold text-white">Order #{order.id}</h3>
                            <Badge variant={order.status === "debt_active" ? "error" : "warning"} className="text-xs">
                              {order.status === "debt_active" ? "Partially Paid" : "Awaiting Payment"}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-slate-400">
                            <span>Total: {fmtKES(total)}</span>
                            <span>Paid: {fmtKES(paid)}</span>
                            <span className="text-error font-bold">Balance: {fmtKES(bal)}</span>
                          </div>
                          {/* Progress bar */}
                          <div className="w-full bg-slate-800 rounded-full h-2 mt-2">
                            <div
                              className="bg-brand-gold h-2 rounded-full transition-all"
                              style={{ width: `${Math.min(progress, 100)}%` }}
                            />
                          </div>
                          {order.payment_reference && (
                            <p className="text-xs text-slate-500">
                              Last payment: {order.payment_reference} ({order.payment_method?.toUpperCase()})
                            </p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
