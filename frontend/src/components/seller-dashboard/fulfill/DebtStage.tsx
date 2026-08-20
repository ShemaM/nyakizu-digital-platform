"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Wallet, CalendarClock, Pencil } from "lucide-react";
import { Card, CardSection } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useToast } from "@/components/ui/Toast";
import { PackedItemsHistory } from "./PackedItemsHistory";
import { orders, fmtKES, ApiError, type ApiOrder, type ApiOrderItem } from "@/lib/api";
import { buyerFirstName } from "@/lib/order-status";

interface DebtStageProps {
  order: ApiOrder;
  items: ApiOrderItem[];
  onOrderUpdated: (order: ApiOrder) => void;
  amountPaid: number;
  balance: number;
  paidProgress: number;
}

function formatDate(iso: string): string {
  return new Date(iso + "T00:00:00").toLocaleDateString("en-KE", { day: "numeric", month: "short", year: "numeric" });
}

function todayInputValue(): string {
  return new Date().toISOString().slice(0, 10);
}

/**
 * The seller already recorded a first payment and a balance is still owing.
 * From here on, tracking and requesting the rest of the money happens on
 * the Payments page, not here — this screen only shows where things stand
 * and points the seller there, so it doesn't turn into a second place to
 * record payments. The one thing that IS editable here is the payment date
 * — useful when it was agreed by phone/WhatsApp rather than through the app.
 */
export function DebtStage({ order, items, onOrderUpdated, amountPaid, balance, paidProgress }: DebtStageProps) {
  const { toast } = useToast();
  const [editingDate, setEditingDate] = useState(false);
  const [date, setDate] = useState(order.expected_payment_date ?? "");
  const [saving, setSaving] = useState(false);
  const buyerName = buyerFirstName(order);

  async function handleSaveDate() {
    if (!date) {
      toast("Pick a date first.", "error");
      return;
    }
    setSaving(true);
    try {
      const updated = await orders.update(order.id, { expected_payment_date: date });
      onOrderUpdated(updated);
      setEditingDate(false);
      toast("Saved.", "success");
    } catch (err) {
      toast(err instanceof ApiError ? err.message : "Could not save that date.", "error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[rgb(var(--role))] to-[rgb(var(--role)/0.8)] p-6 mt-3 shadow-[0_12px_32px_-8px_rgb(var(--role)/0.4)] animate-fade-in-up delay-75">
        <span className="absolute -right-10 -top-10 w-40 h-40 rounded-full bg-white/10" aria-hidden="true" />
        <p className="relative text-xs font-bold uppercase tracking-wider text-white/70">Still Owing</p>
        <p className="relative text-2xl sm:text-3xl font-bold text-white mt-1">{fmtKES(balance)}</p>
      </div>

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

          <p className="text-xs text-text-muted mt-3">
            You already recorded a first payment for this order. Go to Payments to check new M-Pesa codes from the buyer or ask for the rest.
          </p>

          <Link
            href="/seller/dashboard/ledger"
            className="w-full flex items-center justify-center gap-1.5 rounded-xl font-black text-sm py-3 h-auto mt-4 bg-role-dark text-white hover:opacity-90 transition-opacity"
          >
            Go to Payments <ArrowRight size={16} />
          </Link>
        </CardSection>
      </Card>

      {/* Payment date — set by the buyer normally, but editable here too in
          case it was agreed by phone/WhatsApp instead of through the app.
          For records only, same as the buyer's own version of this. */}
      <Card className="mt-3 animate-fade-in-up delay-150">
        <CardSection>
          <p className="text-xs font-black text-text-muted uppercase tracking-widest mb-3 flex items-center gap-2">
            <CalendarClock size={12} /> Payment Date
          </p>

          {!editingDate && order.expected_payment_date ? (
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm font-bold text-text-primary">
                  {buyerName} said {formatDate(order.expected_payment_date)}
                </p>
                <p className="text-xs text-text-muted mt-0.5">For your records. Not a deadline.</p>
              </div>
              <div className="shrink-0 flex items-center gap-2">
                {order.is_payment_late && <Badge variant="warning">Late</Badge>}
                <button
                  type="button"
                  onClick={() => {
                    setDate(order.expected_payment_date ?? "");
                    setEditingDate(true);
                  }}
                  aria-label="Change the date"
                  className="w-8 h-8 rounded-full flex items-center justify-center text-text-muted hover:bg-slate-100 hover:text-text-primary transition-colors"
                >
                  <Pencil size={14} />
                </button>
              </div>
            </div>
          ) : !editingDate ? (
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm text-text-muted">{buyerName} hasn&apos;t set a date yet.</p>
              <Button variant="outline" size="sm" onClick={() => setEditingDate(true)}>
                Set one
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={date}
                min={todayInputValue()}
                onChange={(e) => setDate(e.target.value)}
                className="flex-1 rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-semibold text-text-primary focus:outline-none focus:ring-2 focus:ring-role/40"
              />
              <Button variant="role" className="shrink-0" onClick={handleSaveDate} loading={saving}>
                Save
              </Button>
              <Button variant="ghost" className="shrink-0" onClick={() => setEditingDate(false)} disabled={saving}>
                Cancel
              </Button>
            </div>
          )}
        </CardSection>
      </Card>

      <PackedItemsHistory orderId={order.id} items={items} onOrderUpdated={onOrderUpdated} />
    </>
  );
}
