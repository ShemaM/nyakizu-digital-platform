import { Wallet, MessageSquareText, Clock, CheckCircle2 } from "lucide-react";
import { Card, CardSection } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { PackedItemsHistory } from "./PackedItemsHistory";
import { fmtKES, type ApiOrder, type ApiOrderItem, type ApiPaymentClaim } from "@/lib/api";

interface PaymentStageProps {
  orderId: number;
  buyerName: string;
  items: ApiOrderItem[];
  onOrderUpdated: (order: ApiOrder) => void;
  displayTotal: number;
  amountPaid: number;
  balance: number;
  paidProgress: number;
  canTakePayment: boolean;
  paymentReference?: string;
  paymentMethod?: string;
  paymentClaims?: ApiPaymentClaim[];
  onRecordPayment: (prefill?: { amount: number; reference: string; claimId?: number }) => void;
  /** True while re-checking for a fresh buyer claim before opening the generic dialog. */
  openingPayment?: boolean;
}

function formatClaimTime(iso: string): string {
  return new Date(iso).toLocaleString("en-KE", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
}

/**
 * The order is packed and priced — the only job left is getting paid.
 * When the buyer has told us they paid, that claim IS the main thing on
 * this screen — big, first, and directly tappable — not a footnote next
 * to a generic "record payment" button. Nothing about packing shows here
 * by default; it's one tap away in PackedItemsHistory if needed.
 */
export function PaymentStage({
  orderId,
  buyerName,
  items,
  onOrderUpdated,
  displayTotal,
  amountPaid,
  balance,
  paidProgress,
  canTakePayment,
  paymentReference,
  paymentMethod,
  paymentClaims = [],
  onRecordPayment,
  openingPayment = false,
}: PaymentStageProps) {
  const pendingClaims = paymentClaims.filter((c) => !c.resolved);
  const hasPendingClaims = pendingClaims.length > 0;

  return (
    <>
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[rgb(var(--role))] to-[rgb(var(--role)/0.8)] p-6 mt-3 shadow-[0_12px_32px_-8px_rgb(var(--role)/0.4)] animate-fade-in-up delay-75">
        <span className="absolute -right-10 -top-10 w-40 h-40 rounded-full bg-white/10" aria-hidden="true" />
        <p className="relative text-xs font-bold uppercase tracking-wider text-white/70">Price Sent, Waiting to Be Paid</p>
        <p className="relative text-2xl sm:text-3xl font-bold text-white mt-1">{fmtKES(displayTotal)}</p>
      </div>

      {hasPendingClaims && (
        <div className="mt-3 space-y-2.5 animate-fade-in-up delay-90">
          <p className="text-xs font-black text-warning uppercase tracking-widest flex items-center gap-2 px-1">
            <MessageSquareText size={12} /> {buyerName} Says They Paid. Check This First
          </p>
          {pendingClaims.map((claim) => (
            <div key={claim.id} className="rounded-2xl border-2 border-warning/30 bg-warning/5 p-4 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xl font-black text-text-primary">{fmtKES(claim.amount)}</p>
                  <p className="text-sm font-bold text-text-secondary mt-0.5">{claim.reference}</p>
                  <p className="text-[11px] text-text-muted flex items-center gap-1 mt-1">
                    <Clock size={10} /> Sent {formatClaimTime(claim.submitted_at)}
                  </p>
                </div>
              </div>
              <Button
                variant="role"
                className="w-full rounded-xl font-black text-sm py-3 h-auto mt-3"
                loading={openingPayment}
                onClick={() => onRecordPayment({ amount: Number(claim.amount), reference: claim.reference, claimId: claim.id })}
              >
                Check M-Pesa &amp; Confirm
              </Button>
            </div>
          ))}
          <p className="text-[11px] text-text-muted px-1">
            Open your M-Pesa messages, match the amount and code, then confirm.
          </p>
        </div>
      )}

      <Card className="mt-3 animate-fade-in-up delay-100">
        <CardSection>
          <p className="text-xs font-black text-text-muted uppercase tracking-widest mb-3 flex items-center gap-2">
            <Wallet size={12} /> Payment
          </p>

          <ProgressBar percent={paidProgress} tone="warning" />

          <div className="flex items-center justify-between text-xs mt-2.5 font-bold">
            <span className="text-text-muted">Paid: <span className="text-text-primary">{fmtKES(amountPaid)}</span></span>
            <span className="text-error">Owing: {fmtKES(balance)}</span>
          </div>

          {paymentReference && (
            <p className="text-xs text-text-muted mt-2">
              Last payment: <span className="font-bold text-text-secondary">{paymentReference}</span>
              {paymentMethod && ` (${paymentMethod.replace("_", " ").toUpperCase()})`}
            </p>
          )}

          {canTakePayment ? (
            <Button
              variant={hasPendingClaims ? "secondary" : "dark"}
              className="w-full rounded-xl font-black text-sm py-3 h-auto mt-4"
              loading={openingPayment}
              onClick={() => onRecordPayment()}
            >
              {hasPendingClaims ? "Or Record a Different Payment" : "Record Payment Received"}
            </Button>
          ) : (
            <p className="text-xs text-text-muted mt-3 flex items-center gap-1.5">
              <CheckCircle2 size={14} className="text-success shrink-0" /> Ask the buyer to pay. Then write it down here.
            </p>
          )}
        </CardSection>
      </Card>

      <PackedItemsHistory orderId={orderId} items={items} onOrderUpdated={onOrderUpdated} />
    </>
  );
}
