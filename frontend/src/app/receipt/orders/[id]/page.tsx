"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { CheckCircle, Clock, Printer } from "lucide-react";
import { Logo } from "@/components/Logo";
import { orders, type ApiOrder, fmtKES, parsePrice, ApiError } from "@/lib/api";
import { LoadingScreen } from "@/components/LoadingScreen";

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("en-KE", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-KE", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

const statusLabels: Record<string, string> = {
  submitted: "Submitted — awaiting packing",
  sourcing: "Being sourced & packed",
  locked: "Invoice confirmed",
  debt_active: "Invoice confirmed — balance owed",
  cleared: "Fully paid & settled",
  cancelled: "Cancelled",
};

export default function ReceiptPage() {
  const { id } = useParams<{ id: string }>();
  const orderId = parseInt(id);

  const [order, setOrder] = useState<ApiOrder | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isNaN(orderId)) {
      loadOrder();
    }
  }, [orderId]);

  const loadOrder = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await orders.get(orderId);
      setOrder(data);
    } catch (err) {
      console.error("Failed to load order:", err);
      setError(err instanceof ApiError ? err.message : "Order not found.");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-surface">
        <LoadingScreen />
      </main>
    );
  }

  if (error || !order) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-surface px-6">
        <div className="text-center">
          <p className="text-slate-500 mb-4">{error || "Receipt not found."}</p>
          <button
            onClick={loadOrder}
            className="text-sm text-blue-600 hover:underline cursor-pointer"
          >
            Try again
          </button>
        </div>
      </main>
    );
  }

  const paid = parsePrice(order.amount_paid ?? 0);
  const total = parsePrice(order.final_total ?? order.total_price);
  const balance = parsePrice(order.balance ?? total - paid);
  const isCleared = order.status === "cleared";

  return (
    <main className="min-h-screen bg-surface px-4 py-8">
      <div className="mx-auto mb-4 flex max-w-md justify-end gap-2 no-print">
        <button
          onClick={handlePrint}
          className="flex cursor-pointer items-center gap-2 rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50"
        >
          <Printer size={16} />
          Print
        </button>
      </div>

      <article className="app-panel mx-auto max-w-md overflow-hidden rounded-lg print:shadow-none">
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
                ORDER-{String(order.id).padStart(6, "0")}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Status:{" "}
                <span className="font-semibold text-slate-700">
                  {statusLabels[order.status] ?? order.status}
                </span>
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
            <p className="text-sm font-bold text-slate-950">{order.buyer_username || "—"}</p>
            <p className="text-xs text-slate-500">{order.delivery_address || "No address"}</p>
          </div>
          <div>
            <p className="mb-1 text-xs font-bold uppercase tracking-wide text-slate-400">Order date</p>
            <p className="text-sm font-bold text-slate-950">{formatDate(order.created_at)}</p>
            <p className="text-xs text-slate-500">{formatDateTime(order.created_at)}</p>
          </div>
        </section>

        <section className="space-y-1.5 border-b border-slate-100 bg-slate-50 px-6 py-3">
          <div className="flex justify-between gap-3 text-xs">
            <span className="flex items-center gap-1 text-slate-400">
              <Clock size={10} />
              Order created
            </span>
            <span className="text-right font-semibold text-slate-700">{formatDateTime(order.created_at)}</span>
          </div>
          <div className="flex justify-between gap-3 text-xs">
            <span className="flex items-center gap-1 text-slate-400">
              <Clock size={10} />
              Last updated
            </span>
            <span className="text-right font-semibold text-slate-700">{formatDateTime(order.updated_at)}</span>
          </div>
        </section>

        <section className="border-b border-slate-100 px-6 py-4">
          <p className="mb-3 text-xs font-bold uppercase tracking-wide text-slate-400">Items</p>
          <div className="space-y-3">
            {order.items.map((item, i) => (
              <div key={i} className="flex items-start justify-between gap-3 text-sm">
                <div className="min-w-0 flex-1">
                  <span className="leading-snug text-slate-800">
                    {item.product_name || `Product #${item.product_id}`}
                  </span>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-xs text-slate-400">
                    {fmtKES(item.unit_price)} × {item.quantity}
                  </p>
                  <p className="font-bold text-slate-950">{fmtKES(item.subtotal)}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 space-y-1.5 border-t border-dashed border-slate-200 pt-3">
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Order total</span>
              <span className="font-semibold">{fmtKES(order.total_price)}</span>
            </div>
            {order.final_total && (
              <div className="flex justify-between text-sm font-black">
                <span className="text-slate-800">Final invoice total</span>
                <span className="text-blue-700">{fmtKES(order.final_total)}</span>
              </div>
            )}
          </div>
        </section>

        {paid > 0 && (
          <section className="border-b border-slate-100 px-6 py-4">
            <p className="mb-3 text-xs font-bold uppercase tracking-wide text-slate-400">Payment records</p>
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-3 text-sm">
                <div>
                  <p className="font-bold text-slate-700">
                    {order.payment_method === "mpesa" ? "M-Pesa" : order.payment_method || "Payment"}
                    {order.payment_reference && (
                      <span className="ml-1 text-xs font-normal text-slate-400">- {order.payment_reference}</span>
                    )}
                  </p>
                </div>
                <span className="shrink-0 font-black text-green-700">{fmtKES(paid)}</span>
              </div>
            </div>

            <div className="mt-3 space-y-1 border-t border-dashed border-slate-200 pt-3">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Total paid</span>
                <span className="font-semibold text-green-700">{fmtKES(paid)}</span>
              </div>
              <div className="flex justify-between text-sm font-black">
                <span className={balance > 0 ? "text-amber-700" : "text-green-700"}>
                  {balance > 0 ? "Balance remaining" : "Fully settled"}
                </span>
                <span className={balance > 0 ? "text-amber-700" : "text-green-700"}>
                  {fmtKES(balance)}
                </span>
              </div>
            </div>
          </section>
        )}

        {order.buyer_notes && (
          <section className="border-b border-slate-100 px-6 py-4">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-400 mb-1">Buyer notes</p>
            <p className="text-sm text-slate-700">{order.buyer_notes}</p>
          </section>
        )}

        {order.sourcing_notes && (
          <section className="border-b border-slate-100 px-6 py-4">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-400 mb-1">Seller notes</p>
            <p className="text-sm text-slate-700">{order.sourcing_notes}</p>
          </section>
        )}

        <footer className="space-y-1 px-6 py-4 text-center">
          <p className="text-xs text-slate-400">Generated on {formatDate(new Date().toISOString())}</p>
          <p className="text-xs text-slate-400">Nyakizu Digital Marketplace</p>
        </footer>
      </article>

      <style jsx global>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; }
        }
      `}</style>
    </main>
  );
}

