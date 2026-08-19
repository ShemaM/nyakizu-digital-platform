import Link from "next/link";
import { CheckCircle2, Download, Wallet, Package } from "lucide-react";
import { Card, CardSection } from "@/components/ui/Card";
import { fmtKES, parsePrice, type ApiOrder } from "@/lib/api";

interface DoneStageProps {
  order: ApiOrder;
}

function formatPaidDate(order: ApiOrder): string {
  const clearedEvent = (order.status_history ?? []).find((e) => e.status === "cleared");
  const iso = clearedEvent?.created_at ?? order.updated_at;
  if (!iso) return "";
  return new Date(iso).toLocaleString("en-KE", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
}

/** Fully paid — the order is finished. Shows the paid-in-full confirmation plus the two things worth reviewing afterward: what was paid, and what was in the order. */
export function DoneStage({ order }: DoneStageProps) {
  const displayTotal = parsePrice(order.final_total ?? order.total_price);
  const amountPaid = parsePrice(order.amount_paid ?? displayTotal);
  const paidDate = formatPaidDate(order);
  const items = order.items ?? [];

  return (
    <>
      <Card className="mt-3 animate-fade-in-up delay-75">
        <CardSection className="flex flex-col items-center text-center py-8">
          <span className="flex items-center justify-center w-14 h-14 rounded-full bg-success/12 text-success mb-3">
            <CheckCircle2 size={28} />
          </span>
          <p className="text-lg font-black text-text-primary">Paid in Full</p>
          <p className="text-sm text-text-muted mt-1">{fmtKES(displayTotal)}. This order is done.</p>
          <Link
            href={`/receipt/orders/${order.id}`}
            target="_blank"
            className="flex items-center gap-1.5 text-sm font-bold text-role hover:opacity-80 mt-4"
          >
            <Download size={14} /> View Receipt
          </Link>
        </CardSection>
      </Card>

      <Card className="mt-3 animate-fade-in-up delay-100">
        <CardSection>
          <p className="text-xs font-black text-text-muted uppercase tracking-widest mb-3 flex items-center gap-2">
            <Wallet size={12} /> Payment
          </p>
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-text-muted">Amount paid</span>
              <span className="font-black text-success">{fmtKES(amountPaid)}</span>
            </div>
            {order.payment_method && (
              <div className="flex items-center justify-between">
                <span className="text-text-muted">Method</span>
                <span className="font-bold text-text-primary">
                  {order.payment_method === "mpesa" ? "M-Pesa" : order.payment_method.replace("_", " ")}
                </span>
              </div>
            )}
            {order.payment_reference && (
              <div className="flex items-center justify-between">
                <span className="text-text-muted">Reference</span>
                <span className="font-bold text-text-primary">{order.payment_reference}</span>
              </div>
            )}
            {paidDate && (
              <div className="flex items-center justify-between">
                <span className="text-text-muted">Paid on</span>
                <span className="font-bold text-text-primary">{paidDate}</span>
              </div>
            )}
          </div>
        </CardSection>
      </Card>

      <Card className="mt-3 animate-fade-in-up delay-150">
        <CardSection>
          <p className="text-xs font-black text-text-muted uppercase tracking-widest mb-3 flex items-center gap-2">
            <Package size={12} /> Items
          </p>
          <div className="divide-y divide-slate-100">
            {items.map((item) => (
              <div key={item.id} className="flex items-center justify-between gap-3 py-2.5 text-sm">
                <span className="text-text-primary font-semibold truncate">
                  {item.quantity}× {item.product_name || item.custom_name || "Item"}
                </span>
                <span className="text-text-secondary font-bold shrink-0">{fmtKES(item.subtotal ?? 0)}</span>
              </div>
            ))}
          </div>
        </CardSection>
      </Card>
    </>
  );
}
