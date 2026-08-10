"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { orders, type ApiOrder, type ApiOrderItem, fmtKES, ApiError } from "@/lib/api";
import { Badge } from "@/components/ui/Badge";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { useToast } from "@/components/ui/Toast";
import { cn } from "@/lib/cn";

interface PackingChecklistProps {
  orderId: number;
  items: ApiOrderItem[];
  /** Only interactive while the order is actually in "sourcing" — otherwise this renders as a read-only record. */
  interactive: boolean;
  onOrderUpdated: (order: ApiOrder) => void;
}

/**
 * The seller's physical packing checklist — tick each line off as it goes
 * into the bag. Persisted server-side (OrderItem.is_packed) so it survives
 * a refresh or switching devices mid-pack, not just local component state.
 */
export function PackingChecklist({ orderId, items, interactive, onOrderUpdated }: PackingChecklistProps) {
  const { toast } = useToast();
  const [togglingId, setTogglingId] = useState<number | null>(null);

  const packedCount = items.filter((i) => i.is_packed).length;
  const allPacked = items.length > 0 && packedCount === items.length;

  async function handleToggle(item: ApiOrderItem) {
    if (!interactive || togglingId !== null) return;
    setTogglingId(item.id);
    try {
      const updated = await orders.toggleItemPacked(orderId, item.id);
      onOrderUpdated(updated);
    } catch (err) {
      toast(err instanceof ApiError ? err.message : "Could not update packing status.", "error");
    } finally {
      setTogglingId(null);
    }
  }

  return (
    <div>
      {interactive && (
        <div className="flex items-center justify-between gap-3 mb-3">
          <p className="text-xs font-bold text-text-secondary">
            {packedCount} of {items.length} packed
          </p>
          {allPacked && (
            <Badge variant="success">
              <Check size={11} className="mr-1" /> Ready to lock price
            </Badge>
          )}
        </div>
      )}
      {interactive && <ProgressBar percent={items.length ? (packedCount / items.length) * 100 : 0} tone={allPacked ? "success" : "role"} className="mb-4" />}

      <div className="space-y-1">
        {items.map((item) => {
          const isPacked = !!item.is_packed;
          const isToggling = togglingId === item.id;
          return (
            <label
              key={item.id}
              className={cn(
                "flex items-center gap-3 p-2.5 rounded-xl transition-colors",
                interactive && "cursor-pointer hover:bg-slate-50",
                !interactive && "cursor-default"
              )}
            >
              <button
                type="button"
                role="checkbox"
                aria-checked={isPacked}
                aria-label={`Mark ${item.product_name || "item"} as ${isPacked ? "not packed" : "packed"}`}
                disabled={!interactive || isToggling}
                onClick={() => handleToggle(item)}
                className={cn(
                  "w-6 h-6 rounded-lg border-2 flex items-center justify-center shrink-0 transition-all",
                  isPacked ? "bg-success border-success text-white" : "border-slate-300 bg-white",
                  !interactive && "opacity-70"
                )}
              >
                {isPacked && <Check size={14} strokeWidth={3} />}
              </button>

              <div className="flex-1 min-w-0">
                <span
                  className={cn(
                    "text-sm font-bold leading-snug",
                    isPacked ? "text-text-muted line-through" : "text-text-primary"
                  )}
                >
                  {item.product_name || `Product #${item.product_id}`}
                </span>
                {item.is_sourcing && (
                  <Badge variant="warning" className="ml-2 align-middle">
                    Getting this item
                  </Badge>
                )}
              </div>

              <div className="text-right shrink-0">
                {item.is_sourcing ? (
                  <Badge variant="warning">Price not set yet</Badge>
                ) : (
                  <>
                    <p className="text-sm font-black text-text-primary">× {item.quantity}</p>
                    <p className="text-xs text-text-muted font-bold">{fmtKES(item.unit_price)} ea</p>
                  </>
                )}
              </div>
            </label>
          );
        })}
      </div>
    </div>
  );
}
