"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { MapPin, MessageSquare, Package, AlertCircle, CheckCircle2, Wallet, AlertTriangle } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Card, CardSection } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { Input } from "@/components/ui/Input";
import { InlineBanner } from "@/components/ui/InlineBanner";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Timeline } from "@/components/ui/Timeline";
import { PageSkeleton } from "@/components/ui/LoadingState";
import { PackingChecklist } from "@/components/seller-dashboard/PackingChecklist";
import { useToast } from "@/components/ui/Toast";
import { orders, type ApiOrder, fmtKES, parsePrice, ApiError } from "@/lib/api";
import { getStatusVariant, getStatusLabel, orderTimelineSteps } from "@/lib/order-status";

export default function FulfillOrderPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const orderId = parseInt(id);
  const { toast } = useToast();

  const [order, setOrder] = useState<ApiOrder | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form & Action states
  const [finalTotal, setFinalTotal] = useState("");
  const [confirmLock, setConfirmLock] = useState(false);
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Payment recording states — the seller logs whatever the buyer sent via
  // M-Pesa manually; there is no integrated payment gateway.
  const [payOpen, setPayOpen] = useState(false);
  const [payAmount, setPayAmount] = useState("");
  const [payRef, setPayRef] = useState("");
  const [payMethod, setPayMethod] = useState("mpesa");
  const [isPaySaving, setIsPaySaving] = useState(false);
  const [payTouched, setPayTouched] = useState(false);

  // ── Data Fetching ────────────────────────────────────────────────────────
  useEffect(() => {
    if (isNaN(orderId)) {
      setError("We could not find this order.");
      setIsLoading(false);
      return;
    }
    loadOrder();
  }, [orderId]);

  const loadOrder = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await orders.get(id);
      setOrder(data);
      setFinalTotal((data.final_total ?? data.total_price)?.toString() || "0");
    } catch (err) {
      console.error("Failed to load order:", err);
      setError(err instanceof ApiError ? err.message : "We could not find this order.");
    } finally {
      setIsLoading(false);
    }
  };

  // ── State Transitions ────────────────────────────────────────────────────
  const updateOrderStatus = async (newStatus: string, updatedTotal?: string) => {
    setIsSaving(true);
    try {
      const payload: { status: string; final_total?: string } = { status: newStatus };
      if (updatedTotal) payload.final_total = updatedTotal;

      const updatedOrder = await orders.update(orderId, payload);
      setOrder(updatedOrder);
    } catch (err) {
      console.error("Update error:", err);
      toast(err instanceof ApiError ? err.message : "We could not update this order. Please try again.", "error");
    } finally {
      setIsSaving(false);
      setConfirmLock(false);
    }
  };

  const handleStartSourcing = () => updateOrderStatus("sourcing");
  const handleLock = () => updateOrderStatus("locked", finalTotal);

  const handleCancel = async () => {
    setIsSaving(true);
    try {
      // Cancelling has side effects (releasing stock back to inventory) that
      // only the dedicated cancel endpoint performs — a generic status PATCH
      // would silently skip that.
      await orders.cancel(orderId);
      router.push("/seller/dashboard/orders");
    } catch (err) {
      console.error("Cancel error:", err);
      toast(err instanceof ApiError ? err.message : "We could not cancel this order. Please try again.", "error");
      setIsSaving(false);
      setConfirmCancel(false);
    }
  };

  // ── Payment Recording ────────────────────────────────────────────────────
  const openPayDialog = () => {
    if (!order) return;
    const bal = parsePrice(order.balance ?? order.final_total ?? order.total_price);
    setPayAmount(bal > 0 ? String(bal) : "");
    setPayRef("");
    setPayMethod("mpesa");
    setPayTouched(false);
    setPayOpen(true);
  };

  const payAmountNumber = parseFloat(payAmount);
  const payAmountError =
    !payAmount.trim() ? "Enter how much was received."
    : isNaN(payAmountNumber) || payAmountNumber <= 0 ? "Amount must be a number greater than 0."
    : null;
  const payRefError = !payRef.trim() ? "Enter the M-Pesa code or a reference for this payment." : null;
  const payFormInvalid = !!payAmountError || !!payRefError;

  const handleRecordPayment = async () => {
    setPayTouched(true);
    if (!order || payFormInvalid) return;
    setIsPaySaving(true);
    try {
      const updatedOrder = await orders.recordPayment(order.id, {
        amount: payAmountNumber,
        payment_reference: payRef.trim(),
        payment_method: payMethod,
      });
      setOrder(updatedOrder);
      setPayOpen(false);
      toast("Payment recorded.", "success");
    } catch (err) {
      console.error("Payment failed:", err);
      toast(err instanceof ApiError ? err.message : "We could not record this payment. Please try again.", "error");
    } finally {
      setIsPaySaving(false);
    }
  };

  // ── Rendering ────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <AppShell title="Order Details">
        <PageSkeleton showKPIs={false} listCount={3} />
      </AppShell>
    );
  }

  if (error || !order) {
    return (
      <AppShell title="Error">
        <div className="bg-error/5 border border-error/20 p-6 rounded-2xl text-center text-error">
          <AlertCircle className="mx-auto mb-2" />
          <p className="font-bold">{error || "We could not load this order."}</p>
          <Button variant="secondary" className="mt-4" onClick={() => router.push("/seller/dashboard/orders")}>
            Back to Orders
          </Button>
        </div>
      </AppShell>
    );
  }

  const isLocked = ["locked", "debt_active", "cleared"].includes(order.status);
  const canTakePayment = order.status === "locked" || order.status === "debt_active";
  const isCleared = order.status === "cleared";
  const isPacking = order.status === "sourcing";

  const displayTotal = parsePrice(order.final_total ?? order.total_price);
  const amountPaid = parsePrice(order.amount_paid ?? 0);
  const balance = parsePrice(order.balance ?? displayTotal - amountPaid);
  const paidProgress = displayTotal > 0 ? (amountPaid / displayTotal) * 100 : 0;

  const items = order.items ?? [];
  const packedCount = items.filter((i) => i.is_packed).length;
  const allPacked = items.length > 0 && packedCount === items.length;
  const knownItemsSubtotal = items.filter((i) => !i.is_sourcing).reduce((sum, i) => sum + parsePrice(i.subtotal), 0);
  const sourcingCount = items.filter((i) => i.is_sourcing).length;

  return (
    <AppShell title={order.buyer_username || "Unknown buyer"}>

      {/* ── Fulfillment Timeline ──────────────────────────────────────── */}
      <Card className="mb-4 animate-fade-in-up">
        <CardSection>
          <p className="text-label mb-2">Order Status</p>
          <Timeline steps={orderTimelineSteps(order.status, order.status_history)} />
        </CardSection>
      </Card>

      {/* ── Client Summary ────────────────────────────────────────────────── */}
      <Card className="animate-fade-in-up delay-75">
        <CardSection className="flex items-start justify-between gap-3">
          <div>
            {/* Buyer name is already the page title above — this line is just the reference number, for support/lookup purposes. */}
            <p className="text-xs font-bold text-text-muted uppercase tracking-wide">Order #{order.id}</p>
            <div className="flex items-center gap-1.5 text-xs text-text-muted mt-1.5 font-medium">
              <MapPin size={12} className="text-role shrink-0" />
              <span>{order.delivery_address || "No location provided"}</span>
            </div>
            <p className="text-xs text-text-muted mt-1 font-bold uppercase tracking-wide">
              Ordered {new Date(order.created_at).toLocaleDateString("en-KE")}
            </p>
          </div>
          <div className="flex flex-col items-end gap-1.5 shrink-0">
            <Badge variant={getStatusVariant(order.status)}>
              {getStatusLabel(order.status)}
            </Badge>
            {!isLocked && order.status !== "cancelled" && (
              <button
                onClick={() => setConfirmCancel(true)}
                className="text-xs font-bold text-error hover:opacity-80 uppercase tracking-wide cursor-pointer"
              >
                Cancel Order
              </button>
            )}
          </div>
        </CardSection>
      </Card>

      {/* ── Items List / Packing Checklist ──────────────────────────────────── */}
      <Card className="mt-3 animate-fade-in-up delay-100">
        <CardSection>
          <p className="text-xs font-black text-text-muted uppercase tracking-widest mb-4 flex items-center gap-2">
            <Package size={12} /> {order.status === "submitted" ? "Items Ordered" : "Packing Checklist"}
          </p>
          <PackingChecklist
            orderId={order.id}
            items={items}
            interactive={isPacking}
            onOrderUpdated={setOrder}
          />
        </CardSection>

        <CardSection className="border-t border-slate-100 bg-slate-50/50">
          <div className="flex justify-between items-center">
            <span className="text-xs font-black text-text-muted uppercase tracking-widest">
              {isLocked ? "Final Price" : "Initial Estimate"}
            </span>
            <span className="text-sm font-black text-text-primary">{fmtKES(displayTotal)}</span>
          </div>
        </CardSection>
      </Card>

      {/* ── Buyer Notes ────────────────────────────────────────────────────── */}
      {order.buyer_notes && (
        <Card className="mt-3 border-warning/20 bg-warning/5">
          <CardSection className="flex items-start gap-2.5">
            <MessageSquare size={16} className="text-warning mt-0.5 shrink-0" />
            <div>
              <p className="text-xs font-black text-warning uppercase tracking-widest mb-1">Buyer Notes</p>
              <p className="text-sm text-text-primary font-medium">{order.buyer_notes}</p>
            </div>
          </CardSection>
        </Card>
      )}

      {/* ── Invoice Adjustment (Locking) ──────────────────────────────────── */}
      {!isLocked && (
        <Card className="mt-3">
          <CardSection>
            <p className="text-xs font-black text-text-muted uppercase tracking-widest mb-3">Set Final Price</p>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-text-primary">
                Final Total (KES) — Edit if you had to source items elsewhere
              </label>
              <input
                type="number"
                value={finalTotal}
                onChange={(e) => setFinalTotal(e.target.value)}
                disabled={order.status === "submitted"}
                className="w-full border-2 border-slate-100 rounded-xl px-4 py-3 text-sm font-bold text-text-primary focus:outline-none focus:border-role focus:ring-4 focus:ring-role/10 disabled:bg-slate-50 disabled:text-slate-400 transition-all"
              />
            </div>
          </CardSection>
        </Card>
      )}

      {isLocked && !isCleared && (
        <InlineBanner tone="locked" className="mt-3">
          Final price secured at {fmtKES(displayTotal)}. Waiting on payment from the buyer.
        </InlineBanner>
      )}

      {/* ── Payment Tracking ─────────────────────────────────────────────── */}
      {isLocked && (
        <Card className="mt-3">
          <CardSection>
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-black text-text-muted uppercase tracking-widest flex items-center gap-2">
                <Wallet size={12} /> Payment
              </p>
              {isCleared && (
                <Badge variant="success">
                  <CheckCircle2 size={12} className="mr-1" /> Paid in Full
                </Badge>
              )}
            </div>

            <ProgressBar percent={paidProgress} tone={isCleared ? "success" : "warning"} />

            <div className="flex items-center justify-between text-xs mt-2.5 font-bold">
              <span className="text-text-muted">Paid: <span className="text-text-primary">{fmtKES(amountPaid)}</span></span>
              {!isCleared && <span className="text-error">Owing: {fmtKES(balance)}</span>}
            </div>

            {order.payment_reference && (
              <p className="text-xs text-text-muted mt-2">
                Last reference: <span className="font-bold text-text-secondary">{order.payment_reference}</span>
                {order.payment_method && ` (${order.payment_method.replace("_", " ").toUpperCase()})`}
              </p>
            )}

            {canTakePayment && (
              <Button
                variant="dark"
                className="w-full rounded-xl font-black text-sm py-3 h-auto mt-4"
                onClick={openPayDialog}
              >
                Record Payment Received
              </Button>
            )}

            {!canTakePayment && !isCleared && (
              <p className="text-xs text-text-muted mt-3">
                Ask the buyer to pay via M-Pesa, then record what you received above.
              </p>
            )}
          </CardSection>
        </Card>
      )}

      {/* ── Action Buttons ────────────────────────────────────────────────── */}
      <div className="space-y-2 py-4">
        {order.status === "submitted" && (
          <Button
            variant="role"
            className="w-full rounded-xl font-black text-sm py-4 h-auto"
            loading={isSaving}
            onClick={handleStartSourcing}
          >
            Start Packing & Sourcing
          </Button>
        )}

        {order.status === "sourcing" && (
          <>
            {!allPacked && (
              <p className="flex items-center gap-1.5 text-xs font-semibold text-text-muted justify-center pb-1">
                <AlertTriangle size={12} className="text-warning shrink-0" />
                {packedCount} of {items.length} items packed — you can still lock the price now if you're ready.
              </p>
            )}
            <Button
              variant="dark"
              className="w-full rounded-xl font-black text-sm py-4 h-auto"
              onClick={() => setConfirmLock(true)}
            >
              Lock Price & Alert Buyer
            </Button>
          </>
        )}
      </div>

      {/* ── Confirmation Dialogs ──────────────────────────────────────────── */}
      <Dialog
        open={confirmLock}
        title="Lock Final Price?"
        confirmLabel={isSaving ? "Locking..." : "Yes, Lock Price"}
        onConfirm={handleLock}
        onCancel={() => !isSaving && setConfirmLock(false)}
      >
        <div className="space-y-3">
          <p className="text-body leading-relaxed text-text-secondary">
            The buyer will be billed this total. This cannot be undone.
          </p>
          <div className="rounded-xl border border-slate-100 divide-y divide-slate-100 overflow-hidden">
            {items.filter((i) => !i.is_sourcing).map((item) => (
              <div key={item.id} className="flex items-center justify-between gap-3 px-3 py-2 text-sm">
                <span className="text-text-primary truncate">{item.quantity}× {item.product_name || "Item"}</span>
                <span className="text-text-secondary font-semibold shrink-0">{fmtKES(item.subtotal)}</span>
              </div>
            ))}
            {sourcingCount > 0 && (
              <div className="flex items-center justify-between gap-3 px-3 py-2 text-sm bg-warning/5">
                <span className="text-text-muted">{sourcingCount} sourced item{sourcingCount !== 1 ? "s" : ""} (priced below)</span>
              </div>
            )}
          </div>
          <div className="flex justify-between items-baseline text-sm text-text-muted">
            <span>Known items subtotal</span>
            <span className="font-semibold text-text-secondary">{fmtKES(knownItemsSubtotal)}</span>
          </div>
          <div className="flex justify-between items-baseline pt-1 border-t border-slate-100">
            <span className="text-body font-bold text-text-primary">Final total to bill</span>
            <span className="text-title font-bold text-role">{fmtKES(Number(finalTotal) || 0)}</span>
          </div>
        </div>
      </Dialog>

      <Dialog
        open={confirmCancel}
        title="Cancel Order?"
        message="Are you sure you want to cancel this order? The buyer will be notified immediately."
        confirmLabel={isSaving ? "Cancelling..." : "Yes, Cancel Order"}
        variant="danger"
        onConfirm={handleCancel}
        onCancel={() => !isSaving && setConfirmCancel(false)}
      />

      {/* ── Record Payment Dialog ────────────────────────────────────────── */}
      <Dialog
        open={payOpen}
        title={`Record Payment — ${order.buyer_username || "Unknown buyer"}`}
        message="Log what they sent you via M-Pesa. The balance owed updates automatically."
        confirmLabel={isPaySaving ? "Saving..." : "Record Payment"}
        confirmDisabled={isPaySaving}
        onConfirm={handleRecordPayment}
        onCancel={() => !isPaySaving && setPayOpen(false)}
      >
        <div className="space-y-3 mt-3">
          <div>
            <Input
              label="Amount Received (KES)"
              type="number"
              value={payAmount}
              onChange={(e) => setPayAmount(e.target.value)}
              onBlur={() => setPayTouched(true)}
              error={payTouched ? payAmountError ?? undefined : undefined}
            />
            {!payAmountError && payAmountNumber > balance && balance > 0 && (
              <p className="text-xs text-warning font-semibold mt-1.5">
                That's more than the {fmtKES(balance)} still owed — double check before saving.
              </p>
            )}
          </div>
          <Input
            label="Payment Reference (e.g. M-Pesa code)"
            type="text"
            value={payRef}
            onChange={(e) => setPayRef(e.target.value)}
            onBlur={() => setPayTouched(true)}
            placeholder="SAB2XYZ123"
            error={payTouched ? payRefError ?? undefined : undefined}
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
    </AppShell>
  );
}
