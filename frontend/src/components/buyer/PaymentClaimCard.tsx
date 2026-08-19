"use client";

import { useState } from "react";
import { Wallet, Send, Clock } from "lucide-react";
import { Card, CardSection } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { orders, fmtKES, ApiError, type ApiOrder, type ApiPaymentClaim } from "@/lib/api";

interface PaymentClaimCardProps {
  order: ApiOrder;
  balance: number;
  onOrderUpdated: (order: ApiOrder) => void;
}

function formatSubmittedAt(iso: string): string {
  return new Date(iso).toLocaleString("en-KE", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Lets the buyer tell the seller "I paid — here's the code" straight from
 * the app instead of a WhatsApp message or a phone call. Doesn't mark the
 * order as paid on its own — the seller still checks their M-Pesa and
 * confirms it. Only shown once a price is locked (there's nothing to pay
 * before that).
 */
export function PaymentClaimCard({ order, balance, onOrderUpdated }: PaymentClaimCardProps) {
  const { toast } = useToast();
  const [amount, setAmount] = useState(balance > 0 ? String(balance) : "");
  const [reference, setReference] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const claims: ApiPaymentClaim[] = order.payment_claims ?? [];
  const payInfo = order.seller_payment_info;
  const payRows = payInfo
    ? [
        payInfo.till_number && { label: "Till Number (Buy Goods)", value: payInfo.till_number },
        payInfo.pochi_number && { label: "Pochi la Biashara", value: payInfo.pochi_number },
        payInfo.paybill_number && {
          label: "Paybill",
          value: payInfo.paybill_account ? `${payInfo.paybill_number} · Acc: ${payInfo.paybill_account}` : payInfo.paybill_number,
        },
        payInfo.send_money_number && { label: "Send Money", value: payInfo.send_money_number },
      ].filter((row): row is { label: string; value: string } => !!row)
    : [];

  async function handleSubmit() {
    const amountNumber = parseFloat(amount);
    if (!amount.trim() || isNaN(amountNumber) || amountNumber <= 0) {
      toast("Enter how much you paid.", "error");
      return;
    }
    if (!reference.trim()) {
      toast("Enter the M-Pesa code.", "error");
      return;
    }
    setSubmitting(true);
    try {
      const updated = await orders.submitPaymentClaim(order.id, amountNumber, reference.trim());
      onOrderUpdated(updated);
      setReference("");
      toast("Sent to the seller. They'll check and confirm it.", "success");
    } catch (err) {
      toast(err instanceof ApiError ? err.message : "Could not send that payment code.", "error");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Card>
      <CardSection>
        <p className="text-label mb-1 flex items-center gap-2">
          <Wallet size={14} className="text-role" /> Tell Us You&apos;ve Paid
        </p>
        <p className="text-xs text-text-muted mb-3">
          Paid the seller on M-Pesa? Send the code here so they know to check for it.
        </p>

        {payRows.length > 0 && (
          <div className="mb-3 rounded-xl border border-role/20 bg-role-soft/40 px-3.5 py-3 space-y-1.5">
            <p className="text-xs font-bold text-role uppercase tracking-wide">Pay To</p>
            {payRows.map((row) => (
              <div key={row.label} className="flex items-center justify-between gap-3 text-xs">
                <span className="text-text-muted">{row.label}</span>
                <span className="font-bold text-text-primary">{row.value}</span>
              </div>
            ))}
          </div>
        )}

        <div className="space-y-2.5">
          <div>
            <label className="text-xs font-bold text-text-primary block mb-1">Amount You Paid (KES)</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-semibold text-text-primary focus:outline-none focus:ring-2 focus:ring-role/40"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-text-primary block mb-1">M-Pesa Code</label>
            <input
              type="text"
              value={reference}
              onChange={(e) => setReference(e.target.value.toUpperCase())}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleSubmit();
                }
              }}
              placeholder="e.g. UHF3QYNX5"
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-semibold text-text-primary placeholder:font-normal placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-role/40"
            />
          </div>
          <Button className="w-full rounded-xl gap-1.5" onClick={handleSubmit} disabled={submitting}>
            <Send size={14} /> {submitting ? "Sending…" : "Send to Seller"}
          </Button>
        </div>

        {claims.length > 0 && (
          <div className="mt-4 pt-3 border-t border-slate-100 space-y-2">
            <p className="text-xs font-bold text-text-muted uppercase tracking-wide">What You&apos;ve Sent</p>
            {claims.map((claim) => (
              <div key={claim.id} className="flex items-center justify-between gap-3 text-xs bg-role-soft/40 rounded-lg px-3 py-2">
                <div className="min-w-0">
                  <p className="font-bold text-text-primary">{fmtKES(claim.amount)} · {claim.reference}</p>
                  <p className="text-text-muted flex items-center gap-1 mt-0.5">
                    <Clock size={10} /> {formatSubmittedAt(claim.submitted_at)}
                  </p>
                </div>
                <span className="shrink-0 text-warning font-bold">Waiting for seller</span>
              </div>
            ))}
          </div>
        )}
      </CardSection>
    </Card>
  );
}
