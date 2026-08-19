"use client";

import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import { CheckCircle, Clock, Download } from "lucide-react";
import { Logo } from "@/components/Logo";
import { orders, type ApiOrder, fmtKES, parsePrice, ApiError } from "@/lib/api";
import { LoadingScreen } from "@/components/LoadingScreen";

function formatDateTime(iso?: string): string {
  if (!iso) return "—";
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
  const [downloading, setDownloading] = useState(false);
  const articleRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!isNaN(orderId)) {
      loadOrder();
    }
  }, [orderId]);

  const loadOrder = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await orders.get(id);
      setOrder(data);
    } catch (err) {
      console.error("Failed to load order:", err);
      setError(err instanceof ApiError ? err.message : "Order not found.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!articleRef.current || downloading) return;
    setDownloading(true);
    try {
      const [{ default: html2canvas }, { default: jsPDF }] = await Promise.all([
        import("html2canvas-pro"),
        import("jspdf"),
      ]);
      const canvas = await html2canvas(articleRef.current, { scale: 2, backgroundColor: "#ffffff" });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({ unit: "px", format: [canvas.width, canvas.height] });
      pdf.addImage(imgData, "PNG", 0, 0, canvas.width, canvas.height);
      pdf.save(`Receipt-Order-${order?.id ?? orderId}.pdf`);
    } catch (err) {
      console.error("Could not create the receipt PDF:", err);
    } finally {
      setDownloading(false);
    }
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
            className="text-sm text-brand-gold-dark hover:underline cursor-pointer"
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
          onClick={handleDownload}
          disabled={downloading}
          className="flex cursor-pointer items-center gap-2 rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          <Download size={16} />
          {downloading ? "Preparing…" : "Download"}
        </button>
      </div>

      <article ref={articleRef} className="app-panel mx-auto max-w-md overflow-hidden rounded-lg print:shadow-none">
        <header className="bg-brand-gold px-6 py-5">
          <div className="flex items-center justify-between">
            <Logo size="sm" accent="#FFFFFF" inverted />
            <span className="text-xs font-bold uppercase tracking-wide text-white/80">
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
            <p className="text-sm font-bold text-slate-950">{order.buyer_full_name || order.buyer_username || "—"}</p>
            {order.buyer_phone && <p className="text-xs text-slate-500">{order.buyer_phone}</p>}
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
                  <span className={`leading-snug ${item.not_found ? "text-slate-400 line-through" : "text-slate-800"}`}>
                    {item.product_name || `Product #${item.product_id}`}
                  </span>
                  {item.not_found && (
                    <span className="block text-xs font-bold text-error mt-0.5">Not found</span>
                  )}
                </div>
                <div className="shrink-0 text-right">
                  {item.not_found ? (
                    <p className="font-bold text-error">—</p>
                  ) : item.unit_price == null ? (
                    <p className="font-bold text-brand-gold-dark">To be priced</p>
                  ) : (
                    <>
                      <p className="text-xs text-slate-400">
                        {fmtKES(item.unit_price)} × {item.quantity}
                      </p>
                      <p className="font-bold text-slate-950">{fmtKES(item.subtotal)}</p>
                    </>
                  )}
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
                <span className="text-brand-gold-dark">{fmtKES(order.final_total)}</span>
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

        {balance > 0 && order.seller_payment_info && (
          <section className="border-b border-slate-100 px-6 py-4">
            <p className="mb-3 text-xs font-bold uppercase tracking-wide text-slate-400">How to pay the balance</p>
            <div className="space-y-1.5">
              {order.seller_payment_info.till_number && (
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Till Number (Buy Goods)</span>
                  <span className="font-bold text-slate-800">{order.seller_payment_info.till_number}</span>
                </div>
              )}
              {order.seller_payment_info.pochi_number && (
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Pochi la Biashara</span>
                  <span className="font-bold text-slate-800">{order.seller_payment_info.pochi_number}</span>
                </div>
              )}
              {order.seller_payment_info.paybill_number && (
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Paybill</span>
                  <span className="font-bold text-slate-800">
                    {order.seller_payment_info.paybill_number}
                    {order.seller_payment_info.paybill_account && ` · Acc: ${order.seller_payment_info.paybill_account}`}
                  </span>
                </div>
              )}
              {order.seller_payment_info.send_money_number && (
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Send Money</span>
                  <span className="font-bold text-slate-800">{order.seller_payment_info.send_money_number}</span>
                </div>
              )}
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

