"use client";

import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layouts";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { Dialog } from "@/components/ui/Dialog";
import { orders, type ApiOrder, fmtKES, parsePrice, ApiError } from "@/lib/api";
import { LoadingScreen } from "@/components/LoadingScreen";
import { RefreshCw, Wallet, CheckCircle } from "lucide-react";

export default function SellerLedger() {
  const [ledgerOrders, setLedgerOrders] = useState<ApiOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [payOpen, setPayOpen] = useState(false);
  const [payOrder, setPayOrder] = useState<ApiOrder | null>(null);
  const [payAmount, setPayAmount] = useState("");
  const [payRef, setPayRef] = useState("");
  const [payMethod, setPayMethod] = useState("mpesa");
  const [paySaving, setPaySaving] = useState(false);

  useEffect(() => {
    loadLedger();
  }, []);

  const loadLedger = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await orders.sellerLedger();
      setLedgerOrders(data);
    } catch (err) {
      console.error("Failed to load ledger:", err);
      setError(err instanceof ApiError ? err.message : "Failed to load ledger.");
    } finally {
      setIsLoading(false);
    }
  };

  const openPay = (order: ApiOrder) => {
    const bal = parsePrice(order.balance ?? order.final_total ?? order.total_price);
    setPayOrder(order);
    setPayAmount(String(bal));
    setPayRef("");
    setPayMethod("mpesa");
    setPayOpen(true);
  };

  const handlePay = async () => {
    if (!payOrder) return;
    setPaySaving(true);
    try {
      await orders.recordPayment(payOrder.id, {
        amount: parseFloat(payAmount),
        payment_reference: payRef,
        payment_method: payMethod,
      });
      setPayOpen(false);
      await loadLedger();
    } catch (err) {
      console.error("Payment failed:", err);
      alert(err instanceof ApiError ? err.message : "Payment failed.");
    } finally {
      setPaySaving(false);
    }
  };

  const totalOwed = ledgerOrders
    .filter((o) => o.status !== "cleared")
    .reduce((s, o) => s + parsePrice(o.balance ?? o.final_total ?? o.total_price), 0);

  const totalReceived = ledgerOrders
    .filter((o) => o.status === "cleared" || parsePrice(o.amount_paid ?? 0) > 0)
    .reduce((s, o) => s + parsePrice(o.amount_paid ?? 0), 0);

  if (isLoading) {
    return (
      <DashboardLayout title="Payment Ledger">
        <div className="flex items-center justify-center h-[60vh]">
          <LoadingScreen />
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout title="Payment Ledger">
        <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
          <p className="text-error text-sm">{error}</p>
          <Button onClick={loadLedger} size="sm">Retry</Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Payment Ledger">
      <div className="space-y-6 p-4 sm:p-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                Total Received
              </p>
              <p className="text-2xl font-bold text-brand-gold">{fmtKES(totalReceived)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                Outstanding
              </p>
              <p className="text-2xl font-bold text-error">{fmtKES(totalOwed)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                Orders
              </p>
              <p className="text-2xl font-bold text-white">{ledgerOrders.length}</p>
            </CardContent>
          </Card>
        </div>

        {/* Transactions */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">Ledger</h2>
            <Button variant="outline" size="sm" onClick={loadLedger}>
              <RefreshCw size={14} className="mr-1" /> Refresh
            </Button>
          </div>

          {ledgerOrders.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <Wallet className="w-12 h-12 mx-auto mb-3 text-slate-600" />
              <p className="text-sm">No ledger entries yet.</p>
              <p className="text-xs mt-1">Orders will appear here once prices are locked.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {ledgerOrders.map((order) => {
                const total = parsePrice(order.final_total ?? order.total_price);
                const paid = parsePrice(order.amount_paid ?? 0);
                const bal = parsePrice(order.balance ?? total - paid);
                const isCleared = order.status === "cleared";

                return (
                  <Card key={order.id}>
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1 flex-1">
                          <div className="flex items-center gap-3">
                            <h3 className="font-bold text-white">Order #{order.id}</h3>
                            <Badge variant={isCleared ? "success" : order.status === "debt_active" ? "error" : "warning"} className="text-xs">
                              {isCleared ? "Cleared" : order.status === "debt_active" ? "Debt" : "Locked"}
                            </Badge>
                          </div>
                          <p className="text-sm text-slate-400">
                            {order.buyer_username || "Unknown buyer"}
                          </p>
                          <div className="flex items-center gap-4 text-xs text-slate-500">
                            <span>Total: {fmtKES(total)}</span>
                            <span>Paid: {fmtKES(paid)}</span>
                            {!isCleared && <span className="text-error font-bold">Balance: {fmtKES(bal)}</span>}
                          </div>
                          {order.payment_reference && (
                            <p className="text-xs text-slate-500">
                              Ref: {order.payment_reference}
                            </p>
                          )}
                        </div>
                        <div className="text-right shrink-0">
                          {!isCleared && (
                            <Button size="sm" onClick={() => openPay(order)}>
                              <CheckCircle size={14} className="mr-1" /> Record Payment
                            </Button>
                          )}
                          {isCleared && (
                            <Badge variant="success" className="text-xs">
                              <CheckCircle size={12} className="mr-1" /> Paid
                            </Badge>
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

      {/* Payment Dialog */}
      {payOrder && (
        <Dialog
          open={payOpen}
          title={`Record Payment — Order #${payOrder.id}`}
          message={`Record a payment received from ${payOrder.buyer_username || "buyer"}.`}
          confirmLabel={paySaving ? "Saving..." : "Record Payment"}
          onConfirm={handlePay}
          onCancel={() => setPayOpen(false)}
        >
          <div className="space-y-3 mt-3">
            <Input
              label="Amount (KES)"
              type="number"
              value={payAmount}
              onChange={(e) => setPayAmount(e.target.value)}
            />
            <Input
              label="Payment Reference (e.g. M-Pesa code)"
              type="text"
              value={payRef}
              onChange={(e) => setPayRef(e.target.value)}
              placeholder="SAB2XYZ123"
            />
            <div className="space-y-1">
              <label className="text-label">Payment Method</label>
              <select
                value={payMethod}
                onChange={(e) => setPayMethod(e.target.value)}
                className="w-full rounded-lg border border-slate-700 bg-slate-900/50 px-4 py-2 text-sm text-slate-100"
              >
                <option value="mpesa">M-Pesa</option>
                <option value="cash">Cash</option>
                <option value="bank_transfer">Bank Transfer</option>
              </select>
            </div>
          </div>
        </Dialog>
      )}
    </DashboardLayout>
  );
}
