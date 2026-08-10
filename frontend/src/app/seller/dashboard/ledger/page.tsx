"use client";

import { useState, useEffect } from "react";
import { AppShell } from "@/components/AppShell";
import { Container, Section } from "@/components/layouts";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { Dialog } from "@/components/ui/Dialog";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { PageSkeleton } from "@/components/ui/LoadingState";
import { orders, type ApiOrder, fmtKES, parsePrice, ApiError } from "@/lib/api";
import { useToast } from "@/components/ui/Toast";
import { RefreshCw, Wallet, CheckCircle, TrendingUp, AlertCircle } from "lucide-react";

export default function SellerLedger() {
  const { toast } = useToast();
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
      setError(err instanceof ApiError ? err.message : "We could not load your payments.");
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
      toast(err instanceof ApiError ? err.message : "Payment failed.", "error");
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
      <AppShell title="Payments">
        <PageSkeleton showKPIs listCount={4} />
      </AppShell>
    );
  }

  if (error) {
    return (
      <AppShell title="Payments">
        <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
          <p className="text-error text-sm">{error}</p>
          <Button onClick={loadLedger} size="sm">Retry</Button>
        </div>
      </AppShell>
    );
  }

  const STAT_CARDS = [
    { label: "Total received", value: fmtKES(totalReceived), raw: totalReceived, Icon: TrendingUp, color: "text-success", bg: "bg-success/12" },
    { label: "Still owed to you", value: fmtKES(totalOwed), raw: totalOwed, Icon: AlertCircle, color: "text-error", bg: "bg-error/12" },
    { label: "Total orders", value: String(ledgerOrders.length), raw: ledgerOrders.length, Icon: Wallet, color: "text-role", bg: "bg-role-soft" },
  ].filter((card) => card.raw > 0); // zero is not shown

  return (
    <AppShell title="Payments">
      <Section spacing="md">
        <Container size="xl" className="space-y-8">
          <SectionHeading
            eyebrow="Payments"
            title="Money owed to you"
            description="Track what buyers owe you and record payments as they come in."
            action={
              <Button variant="outline" size="lg" onClick={loadLedger} className="gap-2">
                <RefreshCw size={16} /> Refresh
              </Button>
            }
          />

          {/* Summary Cards */}
          {STAT_CARDS.length > 0 && (
            <div className={`grid gap-4 ${STAT_CARDS.length === 1 ? "grid-cols-1" : STAT_CARDS.length === 2 ? "grid-cols-2" : "sm:grid-cols-3"}`}>
              {STAT_CARDS.map(({ label, value, Icon, color, bg }) => (
                <Card key={label}>
                  <CardContent className="p-5 sm:p-6 flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${bg}`}>
                      <Icon className={`w-6 h-6 ${color}`} />
                    </div>
                    <div className="min-w-0">
                      <p className={`text-xl sm:text-2xl font-black truncate ${color}`}>{value}</p>
                      <p className="text-xs sm:text-sm font-semibold text-text-muted">{label}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Transactions */}
          <div>
            <SectionHeading title="All payments" description="Every order where the price is final and you're tracking payment." />

            {ledgerOrders.length === 0 ? (
              <div className="bg-white border border-slate-100 rounded-2xl p-12 text-center text-text-muted flex flex-col items-center justify-center min-h-[260px]">
                <Wallet className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                <p className="text-body font-bold text-text-secondary">No orders to track yet</p>
                <p className="text-caption text-text-muted mt-1">Orders will show up here once you and the buyer agree on a final price.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {ledgerOrders.map((order) => {
                  const total = parsePrice(order.final_total ?? order.total_price);
                  const paid = parsePrice(order.amount_paid ?? 0);
                  const bal = parsePrice(order.balance ?? total - paid);
                  const isCleared = order.status === "cleared";
                  const progress = total > 0 ? (paid / total) * 100 : 0;

                  return (
                    <Card key={order.id}>
                      <CardContent className="p-5 sm:p-6">
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                          <div className="space-y-1.5 flex-1 min-w-0">
                            <div className="flex items-center gap-3 flex-wrap">
                              <h3 className="text-body font-bold text-text-primary">{order.buyer_username || "Unknown buyer"}</h3>
                              <Badge variant={isCleared ? "success" : order.status === "debt_active" ? "error" : "warning"}>
                                {isCleared ? "Paid" : order.status === "debt_active" ? "Debt" : "Partial"}
                              </Badge>
                            </div>
                            {!isCleared && <ProgressBar percent={progress} tone="warning" className="max-w-xs mt-2" />}
                            <div className="flex items-center gap-4 text-caption text-text-muted mt-2">
                              <span>Total: {fmtKES(total)}</span>
                              <span>Paid: {fmtKES(paid)}</span>
                              {!isCleared && <span className="text-error font-bold">Balance: {fmtKES(bal)}</span>}
                            </div>
                            {order.payment_reference && (
                              <p className="text-caption text-text-muted">
                                Ref: {order.payment_reference}
                              </p>
                            )}
                          </div>
                          <div className="shrink-0">
                            {!isCleared && (
                              <Button size="lg" onClick={() => openPay(order)} className="gap-1.5">
                                <CheckCircle size={16} /> Record Payment
                              </Button>
                            )}
                            {isCleared && (
                              <Badge variant="success">
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
        </Container>
      </Section>

      {/* Payment Dialog */}
      {payOrder && (
        <Dialog
          open={payOpen}
          title={`Record Payment — ${payOrder.buyer_username || "Unknown buyer"}`}
          message="Log what they sent you. The balance owed updates automatically."
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
                className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm text-text-primary"
              >
                <option value="mpesa">M-Pesa</option>
                <option value="cash">Cash</option>
                <option value="bank_transfer">Bank Transfer</option>
              </select>
            </div>
          </div>
        </Dialog>
      )}
    </AppShell>
  );
}
