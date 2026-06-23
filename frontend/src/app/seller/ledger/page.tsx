"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { 
  BookOpen, Printer, Clock, CheckCircle, ChevronDown, ChevronUp, User, PlusCircle 
} from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { Avatar } from "@/components/ui/Avatar";
import { PageSkeleton } from "@/components/ui/LoadingState";
import { cn } from "@/lib/cn";
import { type ApiOrder, fmtKES, parsePrice } from "@/lib/api";

// Assuming your Django API includes these or we map them.
interface LedgerEntry {
  id: string;
  amount: number | string;
  method: string;
  reference?: string;
  note?: string;
  created_at: string;
}

// Extended ApiOrder for the ledger context
interface LedgerOrder extends ApiOrder {
  amount_paid: number | string;
  ledger_entries?: LedgerEntry[];
}

export default function LedgerPage() {
  const [orders, setOrders] = useState<LedgerOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Drill-down UI state
  const [expandedBuyer, setExpandedBuyer] = useState<string | null>(null);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  
  // Payment Form State
  const [form, setForm] = useState({ amount: "", method: "mpesa", reference: "", note: "" });
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ── API Data Fetching ───────────────────────────────────────────────
  useEffect(() => {
    async function loadLedger() {
      try {
        setIsLoading(true);
        // Using the exact Django endpoint for seller orders
        const res = await fetch("/api/orders/seller/");
        if (!res.ok) throw new Error("Failed to load ledger data");
        
        const data = await res.json();
        setOrders(data);
      } catch (error) {
        console.error("Ledger fetch error:", error);
      } finally {
        setIsLoading(false);
      }
    }
    loadLedger();
  }, []);

  // ── Data Processing: Per-Buyer Drill-Down ───────────────────────────
  const debtOrders = useMemo(() => {
    return orders.filter(o => ["locked", "debt_active"].includes(o.status));
  }, [orders]);

  const totalOwed = useMemo(() => {
    return debtOrders.reduce((sum, o) => {
      const total = parsePrice(o.total_price);
      const paid = parsePrice(o.amount_paid || 0);
      return sum + (total - paid);
    }, 0);
  }, [debtOrders]);

  // Group orders by buyer for the new creative layout
  const groupedByBuyer = useMemo(() => {
    const groups: Record<string, {
      buyerName: string;
      location: string;
      orders: LedgerOrder[];
      totalDebt: number;
    }> = {};

    debtOrders.forEach(order => {
      const buyerId = order.buyer_username; // Use buyer_username as a unique identifier for grouping
      const total = parsePrice(order.total_price);
      const paid = parsePrice(order.amount_paid || 0);
      const balance = total - paid;

      if (!groups[buyerId]) {
        groups[buyerId] = {
          buyerName: order.buyer_username,
          location: order.delivery_address || "No location",
          orders: [],
          totalDebt: 0,
        };
      }
      groups[buyerId].orders.push(order);
      groups[buyerId].totalDebt += balance;
    });

    return Object.values(groups).sort((a, b) => b.totalDebt - a.totalDebt);
  }, [debtOrders]);

  // ── Handlers ────────────────────────────────────────────────────────
  const handleRecordPayment = async () => {
    if (!selectedOrderId) return;
    
    setIsSubmitting(true);
    try {
      // In a real scenario, you'd POST to a ledger or payment endpoint.
      // E.g., POST /api/orders/<id>/payment/
      await fetch(`/api/orders/${selectedOrderId}/`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "record_payment",
          payment_data: form
        })
      });

      // Optimistically update UI or re-fetch
      setConfirmOpen(false);
      setSelectedOrderId(null);
      setForm({ amount: "", method: "mpesa", reference: "", note: "" });
      
      // Ideally re-fetch orders here:
      // loadLedger(); 
    } catch (error) {
      console.error("Failed to record payment", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <AppShell title="Ledger">
        <PageSkeleton showKPIs={false} listCount={4} />
      </AppShell>
    );
  }

  return (
    <AppShell title="Ledger">

      {/* ── Summary Hero (Dark Green & Amber) ─────────────────────────── */}
      {totalOwed > 0 ? (
        <div className="relative overflow-hidden bg-[#0a1f10] rounded-2xl p-6 shadow-xl animate-fade-in-up">
          <div className="absolute -top-12 -right-12 w-40 h-40 bg-amber-500/20 rounded-full blur-3xl" />
          <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03] mix-blend-overlay"></div>
          
          <div className="relative z-10">
            <p className="text-amber-500 text-xs font-bold uppercase tracking-widest flex items-center gap-2">
              <BookOpen size={14} /> Total Outstanding Debt
            </p>
            <p className="text-5xl font-black text-white mt-2 tabular-nums tracking-tighter">
              {fmtKES(totalOwed).replace("KES ", "")}
              <span className="text-xl text-gray-400 ml-1">KES</span>
            </p>
            <p className="text-gray-300 text-xs font-medium mt-2">
              Spread across <span className="text-amber-400 font-bold">{groupedByBuyer.length}</span> trusted buyers
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-[#0a1f10] border border-green-500/30 rounded-2xl p-5 shadow-lg animate-fade-in-up relative overflow-hidden">
          <div className="absolute inset-0 bg-green-500/5" />
          <div className="relative z-10 flex items-center gap-4">
            <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center border border-green-500/30">
              <CheckCircle size={24} className="text-green-400" />
            </div>
            <div>
              <p className="text-white font-bold text-sm">Ledger Balanced</p>
              <p className="text-gray-400 text-xs mt-0.5">All your buyers have cleared their debts.</p>
            </div>
          </div>
        </div>
      )}

      {/* ── Per-Buyer Drill-Down ──────────────────────────────────────── */}
      <div className="space-y-3 pt-4 animate-fade-in-up delay-100">
        {groupedByBuyer.length > 0 && (
          <div className="flex items-center gap-2 px-1 mb-2">
            <div className="w-1.5 h-4 bg-amber-500 rounded-full" />
            <h2 className="text-xs font-extrabold text-[#0a1f10] uppercase tracking-wider">Debts by Buyer</h2>
          </div>
        )}

        {groupedByBuyer.map((group, index) => {
          const isExpanded = expandedBuyer === group.buyerName;

          return (
            <div 
              key={group.buyerName} 
              className={cn(
                "bg-white rounded-2xl border transition-all duration-300 shadow-sm",
                isExpanded ? "border-amber-500/40 shadow-md" : "border-gray-100 hover:border-gray-300"
              )}
            >
              {/* Buyer Accordion Header */}
              <button 
                onClick={() => setExpandedBuyer(isExpanded ? null : group.buyerName)}
                className="w-full px-4 py-4 flex items-center justify-between text-left cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <Avatar name={group.buyerName} size="md" className="w-10 h-10 bg-[#0a1f10]/5 text-[#0a1f10] font-bold" />
                  <div>
                    <p className="text-sm font-bold text-[#0a1f10]">{group.buyerName}</p>
                    <p className="text-[11px] text-gray-500 mt-0.5">{group.orders.length} active order(s)</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-[10px] text-gray-400 font-extrabold uppercase tracking-wide">Owes You</p>
                    <p className="text-sm font-black text-amber-600">{fmtKES(group.totalDebt)}</p>
                  </div>
                  <div className="w-6 h-6 rounded-full bg-gray-50 flex items-center justify-center text-gray-400">
                    {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </div>
                </div>
              </button>

              {/* Expanded Orders List */}
              {isExpanded && (
                <div className="border-t border-gray-100 bg-gray-50/50 p-3 space-y-3 rounded-b-2xl">
                  {group.orders.map((order) => {
                    const total = parsePrice(order.total_price);
                    const paid = parsePrice(order.amount_paid || 0);
                    const balance = total - paid;
                    const pct = total ? Math.min(100, Math.round((paid / total) * 100)) : 0;

                    return (
                      <div key={order.id} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                        
                        {/* Order Header */}
                        <div className="px-4 pt-3 pb-2 flex items-start justify-between">
                          <div>
                            <p className="text-xs font-bold text-gray-800">Order #{order.id.toString().slice(0,6)}</p>
                            <p className="text-[10px] text-gray-400 mt-0.5">
                              {new Date(order.created_at).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex flex-col items-end gap-1">
                            <Badge status={order.status as any} />
                            <Link href={`/receipt/${order.id}`} target="_blank" className="flex items-center gap-1 text-[10px] font-bold text-blue-600 hover:underline">
                              <Printer size={10} /> Receipt
                            </Link>
                          </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="px-4 pb-3">
                          <div className="flex justify-between text-[10px] mb-1.5 font-bold uppercase tracking-wider">
                            <span className="text-gray-400">Repayment</span>
                            <span className={pct === 100 ? "text-green-600" : "text-amber-600"}>{pct}%</span>
                          </div>
                          <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                            <div
                              className={cn(
                                "h-1.5 rounded-full transition-all duration-700",
                                pct === 100 ? "bg-green-500" : "bg-amber-500"
                              )}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>

                        {/* Financials Grid */}
                        <div className="grid grid-cols-3 gap-0 border-t border-gray-100 bg-gray-50/30">
                          <div className="px-3 py-2 text-center border-r border-gray-100">
                            <p className="text-[9px] text-gray-400 font-extrabold uppercase">Invoice</p>
                            <p className="text-xs font-bold text-gray-900 mt-0.5">{fmtKES(total)}</p>
                          </div>
                          <div className="px-3 py-2 text-center border-r border-gray-100">
                            <p className="text-[9px] text-gray-400 font-extrabold uppercase">Paid</p>
                            <p className="text-xs font-bold text-green-600 mt-0.5">{fmtKES(paid)}</p>
                          </div>
                          <div className="px-3 py-2 text-center">
                            <p className="text-[9px] text-gray-400 font-extrabold uppercase">Balance</p>
                            <p className={cn("text-xs font-bold mt-0.5", balance > 0 ? "text-amber-600" : "text-green-600")}>
                              {fmtKES(balance)}
                            </p>
                          </div>
                        </div>

                        {/* Payment History Log */}
                        {order.ledger_entries && order.ledger_entries.length > 0 && (
                          <div className="border-t border-gray-100 px-4 py-2 bg-gray-50/50 space-y-1.5">
                            {order.ledger_entries.map((entry) => (
                              <div key={entry.id} className="flex justify-between items-center py-1">
                                <div>
                                  <p className="text-[10px] font-bold text-gray-700">
                                    {entry.method.toUpperCase()} <span className="text-gray-400 font-normal">· {entry.reference}</span>
                                  </p>
                                  <p className="text-[9px] text-gray-400 flex items-center gap-0.5">
                                    <Clock size={8} /> {new Date(entry.created_at).toLocaleDateString()}
                                  </p>
                                </div>
                                <span className="text-xs font-black text-green-700">+{fmtKES(parsePrice(entry.amount))}</span>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Payment Form Injection */}
                        <div className="border-t border-gray-100 p-3">
                          {selectedOrderId === String(order.id) ? (
                            <div className="bg-amber-50/50 border border-amber-100 rounded-xl p-3 space-y-3">
                              <p className="text-[11px] font-black text-amber-900 uppercase tracking-wide">Record Payment</p>
                              
                              <div className="grid grid-cols-2 gap-2">
                                <div>
                                  <label className="text-[10px] font-bold text-amber-800 mb-1 block">Amount (KES)</label>
                                  <input
                                    type="number"
                                    value={form.amount}
                                    onChange={(e) => setForm({ ...form, amount: e.target.value })}
                                    className="w-full bg-white border border-amber-200 rounded-lg px-2.5 py-1.5 text-xs focus:ring-2 focus:ring-amber-500 outline-none"
                                    placeholder={balance.toFixed(2).toString()}
                                  />
                                </div>
                                <div>
                                  <label className="text-[10px] font-bold text-amber-800 mb-1 block">Method</label>
                                  <select
                                    value={form.method}
                                    onChange={(e) => setForm({ ...form, method: e.target.value })}
                                    className="w-full bg-white border border-amber-200 rounded-lg px-2.5 py-1.5 text-xs focus:ring-2 focus:ring-amber-500 outline-none"
                                  > 
                                    <option value="mpesa">M-Pesa</option>
                                    <option value="cash">Cash</option>
                                  </select>
                                </div>
                              </div>

                              <div>
                                <label className="text-[10px] font-bold text-amber-800 mb-1 block">Reference / Code</label>
                                <input
                                  type="text"
                                  value={form.reference}
                                  onChange={(e) => setForm({ ...form, reference: e.target.value })}
                                  placeholder="e.g. QKL7X3R2P9"
                                  className="w-full bg-white border border-amber-200 rounded-lg px-2.5 py-1.5 text-xs focus:ring-2 focus:ring-amber-500 outline-none"
                                />
                              </div>

                              <div className="flex gap-2 pt-1">
                                <Button variant="secondary" size="sm" className="flex-1 text-[11px]" onClick={() => setSelectedOrderId(null)}>
                                  Cancel
                                </Button>
                                <Button size="sm" className="flex-1 text-[11px] bg-amber-500 hover:bg-amber-600 text-[#0a1f10] border-none font-bold" disabled={!form.amount} onClick={() => setConfirmOpen(true)}>
                                  Confirm
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <button
                              className="w-full py-2 bg-[#0a1f10]/5 hover:bg-[#0a1f10]/10 text-[#0a1f10] rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
                              onClick={() => { // Fix: Convert order.id to string for comparison
                                setSelectedOrderId(String(order.id));
                                setForm({ amount: balance.toString(), method: "mpesa", reference: "", note: "" });
                              }}
                            >
                              <PlusCircle size={14} /> Add Payment
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ── Confirm Dialog ──────────────────────────────────────────────── */}
      <Dialog
        open={confirmOpen}
        title="Confirm Payment Entry"
        message={`You are recording a payment of ${fmtKES(Number(form.amount))} via ${form.method.toUpperCase()} ${form.reference ? `(Ref: ${form.reference})` : ""}. This will update the ledger immutably.`}
        confirmLabel={isSubmitting ? "Saving..." : "Yes, record it"}
        onConfirm={handleRecordPayment}
        onCancel={() => !isSubmitting && setConfirmOpen(false)}
      />
    </AppShell>
  );
}