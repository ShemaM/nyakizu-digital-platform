"use client";

import { useParams } from "next/navigation";
import { CheckCircle, Clock, Download } from "lucide-react";
import { Logo } from "@/components/Logo";
import {
  getOrderBySlug, formatKES, formatDateTime, formatDate,
  remainingBalance, SELLERS,
} from "@/lib/dummy-data";
import { downloadReceipt } from "@/lib/generate-receipt";

export default function ReceiptPage() {
  const { slug } = useParams<{ slug: string }>();
  const order = getOrderBySlug(slug);

  if (!order) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-surface">
        <p className="text-slate-500">Receipt not found.</p>
      </main>
    );
  }

  const seller = SELLERS.find((s) => s.id === order.sellerId);
  const balance = remainingBalance(order);
  const paid = (order.finalTotal ?? 0) - balance;
  const isCleared = order.status === "cleared";

  const statusLabel: Record<string, string> = {
    submitted: "Submitted - awaiting packing",
    sourcing: "Being sourced & packed",
    locked: "Invoice confirmed",
    debt_active: "Invoice confirmed - balance owed",
    cleared: "Fully paid & settled",
    cancelled: "Cancelled",
  };

  const timeline = [
    { label: "Order created", ts: order.createdAt },
    { label: "Submitted", ts: order.submittedAt },
    { label: "Sourcing started", ts: order.sourcingStartedAt },
    { label: "Invoice finalised", ts: order.lockedAt },
  ].filter((x) => x.ts);

  return (
    <main className="min-h-screen bg-surface px-4 py-8">
      <div className="mx-auto mb-4 flex max-w-md justify-end">
        <button
          onClick={() => downloadReceipt(order)}
          className="flex cursor-pointer items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-bold text-white shadow-[0_12px_24px_rgba(37,99,235,0.18)] transition-colors hover:bg-blue-700"
        >
          <Download size={16} />
          Download receipt (PDF)
        </button>
      </div>

      <article className="app-panel mx-auto max-w-md overflow-hidden rounded-lg">
        <header className="bg-slate-950 px-6 py-5">
          <div className="flex items-center justify-between">
            <Logo size="sm" inverted />
            <span className="text-xs font-bold uppercase tracking-wide text-white/60">
              Digital Receipt
            </span>
          </div>
        </header>

        <section className="border-b border-slate-100 px-6 py-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Order reference</p>
              <p className="mt-0.5 font-mono text-sm font-bold text-slate-800">
                {order.slug.toUpperCase()}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Status: <span className="font-semibold text-slate-700">{statusLabel[order.status]}</span>
              </p>
            </div>
            {isCleared && (
              <span className="flex shrink-0 items-center gap-1 rounded-full bg-green-100 px-2.5 py-1 text-xs font-bold text-green-700">
                <CheckCircle size={12} />
                Paid in full
              </span>
            )}
          </div>
        </section>

        <section className="grid grid-cols-2 gap-4 border-b border-slate-100 px-6 py-4">
          <div>
            <p className="mb-1 text-xs font-bold uppercase tracking-wide text-slate-400">Buyer</p>
            <p className="text-sm font-bold text-slate-950">{order.buyerName}</p>
            <p className="text-xs text-slate-500">{order.buyerLocation}</p>
          </div>
          <div>
            <p className="mb-1 text-xs font-bold uppercase tracking-wide text-slate-400">Seller</p>
            <p className="text-sm font-bold text-slate-950">{seller?.storeName}</p>
            <p className="text-xs text-slate-500">{seller?.location}</p>
            {seller?.mpesa && <p className="mt-0.5 text-xs text-slate-400">M-Pesa: {seller.mpesa}</p>}
          </div>
        </section>

        {timeline.length > 0 && (
          <section className="space-y-1.5 border-b border-slate-100 bg-slate-50 px-6 py-3">
            {timeline.map(({ label, ts }) => (
              <div key={label} className="flex justify-between gap-3 text-xs">
                <span className="flex items-center gap-1 text-slate-400">
                  <Clock size={10} />
                  {label}
                </span>
                <span className="text-right font-semibold text-slate-700">{formatDateTime(ts!)}</span>
              </div>
            ))}
          </section>
        )}

        <section className="border-b border-slate-100 px-6 py-4">
          <p className="mb-3 text-xs font-bold uppercase tracking-wide text-slate-400">Items</p>
          <div className="space-y-3">
            {order.items.map((item, i) => (
              <div key={i} className="flex items-start justify-between gap-3 text-sm">
                <div className="min-w-0 flex-1">
                  <span className="leading-snug text-slate-800">{item.name}</span>
                  {item.isSourcing && (
                    <span className="ml-1.5 rounded-full bg-amber-100 px-1.5 py-0.5 text-xs font-bold text-amber-700">
                      Sourced
                    </span>
                  )}
                </div>
                {!item.isSourcing && (
                  <div className="shrink-0 text-right">
                    <p className="text-xs text-slate-400">{formatKES(item.unitPrice)} x {item.quantity}</p>
                    <p className="font-bold text-slate-950">{formatKES(item.subtotal)}</p>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="mt-4 space-y-1.5 border-t border-dashed border-slate-200 pt-3">
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Estimate total</span>
              <span className="font-semibold">{formatKES(order.draftTotal)}</span>
            </div>
            {order.finalTotal && (
              <div className="flex justify-between text-sm font-black">
                <span className="text-slate-800">Final invoice total</span>
                <span className="text-blue-700">{formatKES(order.finalTotal)}</span>
              </div>
            )}
          </div>
        </section>

        {order.ledgerEntries.length > 0 && (
          <section className="border-b border-slate-100 px-6 py-4">
            <p className="mb-3 text-xs font-bold uppercase tracking-wide text-slate-400">Payment records</p>
            <div className="space-y-3">
              {order.ledgerEntries.map((entry) => (
                <div key={entry.id} className="flex items-start justify-between gap-3 text-sm">
                  <div>
                    <p className="font-bold text-slate-700">
                      {entry.method === "mpesa" ? "M-Pesa" : entry.method}
                      {entry.reference && <span className="ml-1 text-xs font-normal text-slate-400">- {entry.reference}</span>}
                    </p>
                    {entry.note && <p className="text-xs text-slate-400">{entry.note}</p>}
                    <p className="text-xs text-slate-400">{formatDateTime(entry.recordedAt)}</p>
                  </div>
                  <span className="shrink-0 font-black text-green-700">{formatKES(entry.amount)}</span>
                </div>
              ))}
            </div>

            <div className="mt-3 space-y-1 border-t border-dashed border-slate-200 pt-3">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Total paid</span>
                <span className="font-semibold text-green-700">{formatKES(paid)}</span>
              </div>
              <div className="flex justify-between text-sm font-black">
                <span className={balance > 0 ? "text-amber-700" : "text-green-700"}>
                  {balance > 0 ? "Balance remaining" : "Fully settled"}
                </span>
                <span className={balance > 0 ? "text-amber-700" : "text-green-700"}>
                  {formatKES(balance)}
                </span>
              </div>
            </div>
          </section>
        )}

        <footer className="space-y-1 px-6 py-4 text-center">
          <p className="text-xs text-slate-400">Generated on {formatDate(new Date().toISOString())}</p>
          <p className="text-xs text-slate-400">Nyakizu Digital Marketplace - nyakizu.co.ke</p>
        </footer>
      </article>
    </main>
  );
}
