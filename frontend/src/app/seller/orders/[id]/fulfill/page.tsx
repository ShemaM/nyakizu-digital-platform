"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { 
  MapPin, Lock, MessageSquare, CheckCircle2, 
  Clock, Package, ShieldCheck, AlertCircle 
} from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Card, CardSection } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { PageSkeleton } from "@/components/ui/LoadingState";
import { type ApiOrder, fmtKES, parsePrice } from "@/lib/api";
import { cn } from "@/lib/cn";

// Timeline definition matching the concept note's immutable flow
const ORDER_STATES = [
  { id: "submitted", label: "Pending", icon: Clock },
  { id: "sourcing", label: "Packing", icon: Package },
  { id: "locked", label: "Locked", icon: Lock },
  { id: "cleared", label: "Cleared", icon: ShieldCheck },
];

export default function FulfillOrderPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [order, setOrder] = useState<ApiOrder | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form & Action states
  const [finalTotal, setFinalTotal] = useState("");
  const [confirmLock, setConfirmLock] = useState(false);
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // ── Data Fetching ────────────────────────────────────────────────────────
  useEffect(() => {
    async function loadOrder() {
      try {
        setIsLoading(true);
        const res = await fetch(`/api/orders/${id}/`);
        if (!res.ok) throw new Error("Order not found or access denied.");
        const data = await res.json();
        setOrder(data);
        setFinalTotal(data.total_price?.toString() || "0");
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    }
    loadOrder();
  }, [id]);

  // ── State Transitions ────────────────────────────────────────────────────
  const updateOrderStatus = async (newStatus: string, updatedTotal?: string) => {
    setIsSaving(true);
    try {
      const payload: any = { status: newStatus };
      if (updatedTotal) payload.total_price = updatedTotal;

      const res = await fetch(`/api/orders/${id}/`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to update order");
      
      const updatedOrder = await res.json();
      setOrder(updatedOrder);
      
      if (newStatus === "cancelled") {
        router.push("/seller/orders");
      }
    } catch (err) {
      console.error("Update error:", err);
      alert("Failed to update the order. Please try again.");
    } finally {
      setIsSaving(false);
      setConfirmLock(false);
      setConfirmCancel(false);
    }
  };

  const handleStartSourcing = () => updateOrderStatus("sourcing");
  const handleLock = () => updateOrderStatus("locked", finalTotal);
  const handleCancel = () => updateOrderStatus("cancelled");

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
        <div className="bg-red-50 border border-red-200 p-6 rounded-2xl text-center text-red-700">
          <AlertCircle className="mx-auto mb-2" />
          <p className="font-bold">{error || "Failed to load order"}</p>
          <Button variant="secondary" className="mt-4" onClick={() => router.push("/seller/orders")}>
            Back to Orders
          </Button>
        </div>
      </AppShell>
    );
  }

  const isLocked = ["locked", "debt_active", "cleared"].includes(order.status);
  const currentStepIndex = ORDER_STATES.findIndex(s => 
    s.id === order.status || (order.status === "debt_active" && s.id === "locked")
  );

  return (
    <AppShell title={`Order #${order.id.toString().slice(0, 6)}`}>
      
      {/* ── State Machine Timeline (Creative Layout) ────────────────────── */}
      <div className="bg-[#0a1f10] rounded-2xl p-5 mb-4 shadow-lg animate-fade-in-up relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03] mix-blend-overlay"></div>
        <div className="relative z-10">
          <p className="text-amber-500 text-[10px] font-black uppercase tracking-widest mb-4">Fulfillment Status</p>
          
          <div className="flex items-center justify-between relative">
            {/* Timeline Background Line */}
            <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gray-800 -translate-y-1/2 z-0" />
            {/* Active Timeline Line */}
            <div 
              className="absolute top-1/2 left-0 h-0.5 bg-amber-500 -translate-y-1/2 z-0 transition-all duration-500"
              style={{ width: currentStepIndex >= 0 ? `${(currentStepIndex / (ORDER_STATES.length - 1)) * 100}%` : "0%" }}
            />

            {ORDER_STATES.map((step, index) => {
              const isCompleted = index <= currentStepIndex;
              const isActive = index === currentStepIndex;
              const Icon = step.icon;

              return (
                <div key={step.id} className="relative z-10 flex flex-col items-center gap-2">
                  <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-300",
                    isActive ? "bg-amber-500 border-amber-500 text-[#0a1f10] shadow-[0_0_15px_rgba(245,158,11,0.5)] scale-110" :
                    isCompleted ? "bg-amber-500/20 border-amber-500 text-amber-500" :
                    "bg-[#0a1f10] border-gray-700 text-gray-600"
                  )}>
                    <Icon size={14} strokeWidth={isActive ? 3 : 2} />
                  </div>
                  <span className={cn(
                    "text-[10px] font-bold uppercase tracking-wider absolute -bottom-5 w-max text-center transition-colors",
                    isActive ? "text-amber-500" : isCompleted ? "text-gray-300" : "text-gray-600"
                  )}>
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>
          <div className="h-5" /> {/* Spacer for absolute text */}
        </div>
      </div>

      {/* ── Client Summary ────────────────────────────────────────────────── */}
      <div className="bg-white border border-gray-100 shadow-sm rounded-xl px-4 py-4 flex items-start justify-between gap-3 animate-fade-in-up delay-75">
        <div>
          <p className="text-sm font-black text-[#0a1f10]">{order.buyer_username || "Unknown Buyer"}</p>
          <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-1 font-medium">
            <MapPin size={12} className="text-amber-500" />
            <span>{order.delivery_address || "No location provided"}</span>
          </div>
          <p className="text-[10px] text-gray-400 mt-1 font-bold uppercase tracking-wide">
            Ordered {new Date(order.created_at).toLocaleDateString()}
          </p>
        </div>
        <div className="flex flex-col items-end gap-1.5">          <Badge status={order.status as any} />
          {!isLocked && order.status !== "cancelled" && (
            <button
              onClick={() => setConfirmCancel(true)}
              className="text-[10px] font-bold text-red-500 hover:text-red-700 uppercase tracking-wide cursor-pointer"
            >
              Cancel Order
            </button>
          )}
        </div>
      </div>

      {/* ── Items List ────────────────────────────────────────────────────── */}
      <Card className="mt-3 animate-fade-in-up delay-100">
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
          <Package size={12} /> Items Ordered
        </p>
        <div className="space-y-4">
          {order.items?.map((item: any, i: number) => (
            <div key={i} className="flex justify-between items-start gap-3">
              <div className="flex-1 min-w-0">
                <span className="text-sm font-bold text-[#0a1f10] leading-snug">{item.product_name || `Product #${item.product_id}`}</span>
                {/* Simulated sourcing flag if applicable to your API */}
                {item.is_sourcing && (
                  <span className="ml-2 text-[9px] font-black bg-amber-100 text-amber-700 px-2 py-0.5 rounded-md uppercase tracking-wider">
                    Sourcing Req
                  </span>
                )}
              </div>
              <div className="text-right shrink-0">
                {item.is_sourcing ? (
                  <span className="text-[11px] font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded-md">Price TBC</span>
                ) : (
                  <>
                    <p className="text-sm font-black text-[#0a1f10]">× {item.quantity}</p>
                    <p className="text-[10px] text-gray-400 font-bold">{fmtKES(item.unit_price)} ea</p>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>

        <CardSection className="mt-4 border-t border-gray-100 bg-gray-50/50 -mx-4 px-4 py-3">
          <div className="flex justify-between items-center">
            <span className="text-[11px] font-black text-gray-500 uppercase tracking-widest">Initial Estimate</span>
            <span className="text-sm font-black text-gray-900">{fmtKES(order.total_price)}</span>
          </div>
        </CardSection>
      </Card>

      {/* ── Buyer Notes & Sourcing Details ────────────────────────────────── */}
      {order.buyer_notes && (
        <Card className="mt-3 border-amber-200 bg-amber-50/30">
          <div className="flex items-start gap-2.5">
            <MessageSquare size={16} className="text-amber-500 mt-0.5 shrink-0" />
            <div>
              <p className="text-[10px] font-black text-amber-800 uppercase tracking-widest mb-1">Buyer Notes</p>
              <p className="text-sm text-amber-950 font-medium">{order.buyer_notes}</p>
            </div>
          </div>
        </Card>
      )}

      {/* ── Invoice Adjustment (Locking) ──────────────────────────────────── */}
      {!isLocked && (
        <Card className="mt-3">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Set Final Price</p>
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-[#0a1f10]">
              Final Total (KES) — Edit if you had to source items elsewhere
            </label>
            <input
              type="number"
              value={finalTotal}
              onChange={(e) => setFinalTotal(e.target.value)}
              disabled={order.status === "submitted"}
              className="w-full border-2 border-gray-100 rounded-xl px-4 py-3 text-sm font-bold text-[#0a1f10] focus:outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 disabled:bg-gray-50 disabled:text-gray-400 transition-all"
            />
          </div>
        </Card>
      )}

      {isLocked && (
        <div className="mt-3 flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-4">
          <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
            <Lock size={14} className="text-amber-700" />
          </div>
          <div>
            <p className="text-xs font-black text-amber-900 uppercase tracking-wider">Invoice Locked</p>
            <p className="text-sm text-amber-800 font-medium mt-0.5">
              Final price secured at <span className="font-black">{fmtKES(Number(finalTotal))}</span>.
            </p>
          </div>
        </div>
      )}

      {/* ── Action Buttons ────────────────────────────────────────────────── */}
      <div className="space-y-2 py-4">
        {order.status === "submitted" && (
          <Button 
            className="w-full rounded-xl bg-amber-500 hover:bg-amber-400 text-[#0a1f10] font-black text-sm py-4 border-none shadow-lg shadow-amber-500/20" 
            loading={isSaving} 
            onClick={handleStartSourcing}
          >
            Start Packing & Sourcing
          </Button>
        )}
        
        {order.status === "sourcing" && (
          <Button 
            className="w-full rounded-xl bg-[#0a1f10] hover:bg-gray-900 text-white font-black text-sm py-4 border-none shadow-lg" 
            onClick={() => setConfirmLock(true)}
          >
            Lock Price & Alert Buyer
          </Button>
        )}
      </div>

      {/* ── Confirmation Dialogs ──────────────────────────────────────────── */}
      <Dialog
        open={confirmLock}
        title="Lock Final Price?"
        message={`The buyer will be billed a final total of ${fmtKES(Number(finalTotal))}. This creates an immutable ledger entry and cannot be reversed.`}
        confirmLabel={isSaving ? "Locking..." : "Yes, Lock Invoice"}
        onConfirm={handleLock}
        onCancel={() => !isSaving && setConfirmLock(false)}
      />

      <Dialog
        open={confirmCancel}
        title="Cancel Order?"
        message="Are you sure you want to cancel this order? The buyer will be notified immediately."
        confirmLabel={isSaving ? "Cancelling..." : "Yes, Cancel Order"}
        variant="danger"
        onConfirm={handleCancel}
        onCancel={() => !isSaving && setConfirmCancel(false)}
      />
    </AppShell>
  );
}