"use client";

import { useState } from "react";
import { CalendarClock, Pencil } from "lucide-react";
import { Card, CardSection } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useToast } from "@/components/ui/Toast";
import { orders, ApiError, type ApiOrder } from "@/lib/api";

interface DebtDateCardProps {
  order: ApiOrder;
  onOrderUpdated: (order: ApiOrder) => void;
}

function formatDate(iso: string): string {
  return new Date(iso + "T00:00:00").toLocaleDateString("en-KE", { day: "numeric", month: "short", year: "numeric" });
}

function todayInputValue(): string {
  return new Date().toISOString().slice(0, 10);
}

/**
 * Asks the buyer to set a date for the remaining balance — framed purely as
 * bookkeeping ("so we can keep good records"), never as pressure. Nothing
 * here blocks the buyer or changes what they owe; it's the same trust-first
 * tone as "debts can be corrected, never erased" elsewhere in the app.
 */
export function DebtDateCard({ order, onOrderUpdated }: DebtDateCardProps) {
  const { toast } = useToast();
  const [editing, setEditing] = useState(false);
  const [date, setDate] = useState(order.expected_payment_date ?? "");
  const [saving, setSaving] = useState(false);

  const hasDate = !!order.expected_payment_date;

  async function handleSave() {
    if (!date) {
      toast("Pick a date first.", "error");
      return;
    }
    setSaving(true);
    try {
      const updated = await orders.update(order.id, { expected_payment_date: date });
      onOrderUpdated(updated);
      setEditing(false);
      toast("Saved. Thank you.", "success");
    } catch (err) {
      toast(err instanceof ApiError ? err.message : "Could not save that date.", "error");
    } finally {
      setSaving(false);
    }
  }

  if (!editing && hasDate) {
    return (
      <Card>
        <CardSection className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <span className="flex items-center justify-center w-9 h-9 rounded-full bg-role-soft text-role shrink-0">
              <CalendarClock size={16} />
            </span>
            <div className="min-w-0">
              <p className="text-sm font-bold text-text-primary">
                You said you&apos;d pay by {formatDate(order.expected_payment_date!)}
              </p>
              {order.is_payment_late ? (
                <p className="text-xs text-text-muted mt-0.5">
                  That date has passed. No trouble, just update it whenever you know.
                </p>
              ) : (
                <p className="text-xs text-text-muted mt-0.5">Just for our records. Not a deadline.</p>
              )}
            </div>
          </div>
          <div className="shrink-0 flex items-center gap-2">
            {order.is_payment_late && <Badge variant="warning">Late</Badge>}
            <button
              type="button"
              onClick={() => {
                setDate(order.expected_payment_date ?? "");
                setEditing(true);
              }}
              aria-label="Change the date"
              className="w-8 h-8 rounded-full flex items-center justify-center text-text-muted hover:bg-slate-100 hover:text-text-primary transition-colors"
            >
              <Pencil size={14} />
            </button>
          </div>
        </CardSection>
      </Card>
    );
  }

  return (
    <Card>
      <CardSection>
        <p className="text-label mb-1 flex items-center gap-2">
          <CalendarClock size={14} className="text-role" /> When can you pay the rest?
        </p>
        <p className="text-xs text-text-muted mb-3">
          This is just so we can keep good records. It is not to rush you. Pick any date that works for you.
        </p>
        <div className="flex items-center gap-2">
          <input
            type="date"
            value={date}
            min={todayInputValue()}
            onChange={(e) => setDate(e.target.value)}
            className="flex-1 rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-semibold text-text-primary focus:outline-none focus:ring-2 focus:ring-role/40"
          />
          <Button variant="role" className="shrink-0" onClick={handleSave} loading={saving}>
            Save
          </Button>
          {hasDate && (
            <Button variant="ghost" className="shrink-0" onClick={() => setEditing(false)} disabled={saving}>
              Cancel
            </Button>
          )}
        </div>
      </CardSection>
    </Card>
  );
}
