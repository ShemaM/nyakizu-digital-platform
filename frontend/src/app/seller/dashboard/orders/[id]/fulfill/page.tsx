"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Card, CardSection } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { Input } from "@/components/ui/Input";
import { OrderTracker } from "@/components/ui/OrderTracker";
import { PageSkeleton } from "@/components/ui/LoadingState";
import { OrderSummaryHeader } from "@/components/seller-dashboard/fulfill/OrderSummaryHeader";
import { NewOrderStage } from "@/components/seller-dashboard/fulfill/NewOrderStage";
import { PackingStage } from "@/components/seller-dashboard/fulfill/PackingStage";
import { PaymentStage } from "@/components/seller-dashboard/fulfill/PaymentStage";
import { DebtStage } from "@/components/seller-dashboard/fulfill/DebtStage";
import { DoneStage } from "@/components/seller-dashboard/fulfill/DoneStage";
import { CancelledStage } from "@/components/seller-dashboard/fulfill/CancelledStage";
import { useToast } from "@/components/ui/Toast";
import { orders, type ApiOrder, fmtKES, parsePrice, ApiError } from "@/lib/api";
import { orderTimelineSteps, hasUnpricedItems, buyerDisplayName, buyerFirstName } from "@/lib/order-status";

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
  // Once the seller edits the suggested total by hand, stop overwriting it —
  // otherwise pricing one more sourced item would silently wipe out an
  // intentional adjustment (a discount, a delivery fee, etc).
  const [finalTotalTouched, setFinalTotalTouched] = useState(false);
  const [confirmLock, setConfirmLock] = useState(false);
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Payment recording states — the seller logs whatever the buyer sent via
  // M-Pesa manually; there is no integrated payment gateway.
  const [payOpen, setPayOpen] = useState(false);
  const [payAmount, setPayAmount] = useState("");
  const [payRef, setPayRef] = useState("");
  const [payMethod, setPayMethod] = useState("mpesa");
  const [payClaimId, setPayClaimId] = useState<number | undefined>(undefined);
  const [isOpeningPay, setIsOpeningPay] = useState(false);
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
      setFinalTotalTouched(false);
    } catch (err) {
      console.error("Failed to load order:", err);
      setError(err instanceof ApiError ? err.message : "We could not find this order.");
    } finally {
      setIsLoading(false);
    }
  };

  // Keep the suggested final total in step as the seller prices sourced
  // items one at a time — until they've actually typed in the field
  // themselves, at which point their edit wins.
  useEffect(() => {
    if (!order || finalTotalTouched) return;
    if (["locked", "debt_active", "cleared"].includes(order.status)) return;
    setFinalTotal((order.final_total ?? order.total_price)?.toString() || "0");
  }, [order, finalTotalTouched]);

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
  const openPayDialog = async (prefill?: { amount: number; reference: string; claimId?: number }) => {
    if (!order) return;

    // Always refetch first, even for a specific claim tapped straight off
    // the screen — the claim could have just been resolved from another
    // tab/session (e.g. the seller also has the Payments page open), and
    // recording a payment against an already-resolved claim would double
    // it up. This mirrors the same refetch the generic button already did.
    setIsOpeningPay(true);
    let freshOrder = order;
    try {
      freshOrder = await orders.get(id);
      setOrder(freshOrder);
    } catch {
      // Couldn't refresh — fall back to what we already have rather than blocking the seller.
    } finally {
      setIsOpeningPay(false);
    }

    const stillPendingClaim = prefill?.claimId != null
      ? (freshOrder.payment_claims ?? []).find((c) => c.id === prefill.claimId && !c.resolved)
      : undefined;

    if (prefill && stillPendingClaim) {
      setPayAmount(String(prefill.amount));
      setPayRef(prefill.reference);
      setPayClaimId(prefill.claimId);
      setPayMethod("mpesa");
      setPayTouched(false);
      setPayOpen(true);
      return;
    }

    if (prefill && !stillPendingClaim) {
      toast("That payment was already handled. Showing the latest balance instead.", "info");
    }

    const pendingClaim = (freshOrder.payment_claims ?? []).find((c) => !c.resolved);
    if (pendingClaim) {
      setPayAmount(String(pendingClaim.amount));
      setPayRef(pendingClaim.reference);
      setPayClaimId(pendingClaim.id);
    } else {
      const bal = parsePrice(freshOrder.balance ?? freshOrder.final_total ?? freshOrder.total_price);
      setPayAmount(bal > 0 ? String(bal) : "");
      setPayRef("");
      setPayClaimId(undefined);
    }
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
        claim_id: payClaimId,
      });
      setOrder(updatedOrder);
      setPayOpen(false);
      toast("Payment saved.", "success");
    } catch (err) {
      console.error("Payment failed:", err);
      toast(err instanceof ApiError ? err.message : "We could not save this payment. Please try again.", "error");
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
  // The first payment confirmation happens here, on "locked". Once that
  // creates a debt ("debt_active"), further payments are recorded on the
  // Payments page instead — see DebtStage below.
  const canTakePayment = order.status === "locked";

  const displayTotal = parsePrice(order.final_total ?? order.total_price);
  const amountPaid = parsePrice(order.amount_paid ?? 0);
  const balance = parsePrice(order.balance ?? displayTotal - amountPaid);
  const paidProgress = displayTotal > 0 ? (amountPaid / displayTotal) * 100 : 0;

  const items = order.items ?? [];
  const packableItems = items.filter((i) => !i.not_found);
  const packedCount = packableItems.filter((i) => i.is_packed).length;
  const allPacked = packableItems.length > 0 && packedCount === packableItems.length;
  const knownItemsSubtotal = items.filter((i) => !i.is_sourcing).reduce((sum, i) => sum + parsePrice(i.subtotal), 0);
  const sourcingCount = items.filter((i) => i.is_sourcing && !i.not_found).length;
  const notFoundCount = items.filter((i) => i.not_found).length;
  // True unpriced lines (custom sourcing requests) — total_price only ever
  // sums what has a real price, so this stops that number from being shown
  // as a complete "estimate" while some items still cost nothing on paper.
  const pendingPricing = !isLocked && hasUnpricedItems(items);
  const pendingCount = items.filter((i) => i.unit_price == null && !i.not_found).length;

  return (
    <AppShell title={buyerDisplayName(order)}>
      <OrderSummaryHeader
        order={order}
        canCancel={!isLocked && order.status !== "cancelled"}
        onCancelClick={() => setConfirmCancel(true)}
      />

      <Card className="mt-3 animate-fade-in-up delay-50">
        <CardSection>
          <OrderTracker steps={orderTimelineSteps(order.status, order.status_history)} />
        </CardSection>
      </Card>

      {order.status === "submitted" && (
        <NewOrderStage items={items} onStart={handleStartSourcing} isSaving={isSaving} />
      )}

      {order.status === "sourcing" && (
        <PackingStage
          orderId={order.id}
          items={items}
          onOrderUpdated={setOrder}
          packedCount={packedCount}
          packableCount={packableItems.length}
          allPacked={allPacked}
          displayTotal={displayTotal}
          pendingPricing={pendingPricing}
          pendingCount={pendingCount}
          onSendPrice={() => setConfirmLock(true)}
        />
      )}

      {order.status === "locked" && (
        <PaymentStage
          orderId={order.id}
          buyerName={buyerFirstName(order)}
          items={items}
          onOrderUpdated={setOrder}
          displayTotal={displayTotal}
          amountPaid={amountPaid}
          balance={balance}
          paidProgress={paidProgress}
          canTakePayment={canTakePayment}
          paymentReference={order.payment_reference}
          paymentMethod={order.payment_method}
          paymentClaims={order.payment_claims}
          onRecordPayment={openPayDialog}
          openingPayment={isOpeningPay}
        />
      )}

      {order.status === "debt_active" && (
        <DebtStage
          order={order}
          items={items}
          onOrderUpdated={setOrder}
          amountPaid={amountPaid}
          balance={balance}
          paidProgress={paidProgress}
        />
      )}

      {order.status === "cleared" && <DoneStage order={order} />}

      {order.status === "cancelled" && <CancelledStage />}

      {/* ── Confirmation Dialogs ──────────────────────────────────────────── */}
      <Dialog
        open={confirmLock}
        title="Send price to buyer?"
        confirmLabel={isSaving ? "Sending…" : "Yes, Send It"}
        onConfirm={handleLock}
        onCancel={() => !isSaving && setConfirmLock(false)}
      >
        <div className="space-y-3">
          <p className="text-body leading-relaxed text-text-secondary">
            The buyer will pay this amount. You can&apos;t change it after you send it.
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
            {notFoundCount > 0 && (
              <div className="flex items-center justify-between gap-3 px-3 py-2 text-sm bg-error/5">
                <span className="text-error font-semibold">{notFoundCount} item{notFoundCount !== 1 ? "s" : ""} not found. Won&apos;t be charged</span>
              </div>
            )}
          </div>
          <div className="flex justify-between items-baseline text-sm text-text-muted">
            <span>Items with a price</span>
            <span className="font-semibold text-text-secondary">{fmtKES(knownItemsSubtotal)}</span>
          </div>
          <div className="space-y-1.5 pt-1 border-t border-slate-100">
            <label htmlFor="final-total" className="text-xs font-bold text-text-primary">Total to charge (KES)</label>
            <input
              id="final-total"
              type="number"
              value={finalTotal}
              onChange={(e) => {
                setFinalTotal(e.target.value);
                setFinalTotalTouched(true);
              }}
              className="w-full border-2 border-slate-100 rounded-xl px-4 py-3 text-lg font-black text-role focus:outline-none focus:border-role focus:ring-4 focus:ring-role/10 transition-all"
            />
          </div>
        </div>
      </Dialog>

      <Dialog
        open={confirmCancel}
        title="Cancel this order?"
        message="The buyer will be told right away."
        confirmLabel={isSaving ? "Cancelling…" : "Yes, Cancel It"}
        variant="danger"
        onConfirm={handleCancel}
        onCancel={() => !isSaving && setConfirmCancel(false)}
      />

      {/* ── Record Payment Dialog ────────────────────────────────────────── */}
      <Dialog
        open={payOpen}
        title={`Payment from ${buyerDisplayName(order)}`}
        message={
          payClaimId != null
            ? "Filled in from what the buyer told us. Check your M-Pesa matches, then save."
            : "No message from the buyer for this yet. We've filled in the full balance owed. Change it if they paid something else, and add the M-Pesa code yourself."
        }
        confirmLabel={isPaySaving ? "Saving…" : "Save Payment"}
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
                That&apos;s more than the {fmtKES(balance)} still owed. Check before saving.
              </p>
            )}
            {!payAmountError && (
              payAmountNumber >= balance ? (
                <p className="text-xs text-success font-bold mt-1.5 flex items-center gap-1">
                  <CheckCircle2 size={12} /> This pays it off. No debt left.
                </p>
              ) : (
                <p className="text-xs text-warning font-bold mt-1.5">
                  This leaves {fmtKES(balance - payAmountNumber)} still owing.
                </p>
              )
            )}
          </div>
          <Input
            label="M-Pesa Code (or payment reference)"
            type="text"
            value={payRef}
            onChange={(e) => setPayRef(e.target.value)}
            onBlur={() => setPayTouched(true)}
            placeholder="SAB2XYZ123"
            error={payTouched ? payRefError ?? undefined : undefined}
          />
          <div className="space-y-1">
            <label htmlFor="pay-method" className="text-label">How They Paid</label>
            <select
              id="pay-method"
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
