"use client";

import { useState } from "react";
import { Check, X, RotateCcw, Tag } from "lucide-react";
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
 * A sourcing line that turns out unavailable that day gets marked "Not
 * Found" instead — it's excluded from "all packed" since it never will be.
 * A sourcing line that came in with no price gets one here, right where
 * the seller is already looking — feeding straight into the order total.
 */
export function PackingChecklist({ orderId, items, interactive, onOrderUpdated }: PackingChecklistProps) {
  const { toast } = useToast();
  const [togglingId, setTogglingId] = useState<number | null>(null);
  const [priceDrafts, setPriceDrafts] = useState<Record<number, string>>({});
  const [savingPriceId, setSavingPriceId] = useState<number | null>(null);

  const packableItems = items.filter((i) => !i.not_found);
  const packedCount = packableItems.filter((i) => i.is_packed).length;
  const allPacked = packableItems.length > 0 && packedCount === packableItems.length;

  async function handleTogglePacked(item: ApiOrderItem) {
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

  async function handleToggleNotFound(item: ApiOrderItem) {
    if (!interactive || togglingId !== null) return;
    setTogglingId(item.id);
    try {
      const updated = await orders.toggleItemNotFound(orderId, item.id);
      onOrderUpdated(updated);
    } catch (err) {
      toast(err instanceof ApiError ? err.message : "Could not update this item.", "error");
    } finally {
      setTogglingId(null);
    }
  }

  async function handleSetPrice(item: ApiOrderItem) {
    const raw = priceDrafts[item.id];
    const price = parseFloat(raw);
    if (!raw || isNaN(price) || price < 0) {
      toast("Enter a valid price first.", "error");
      return;
    }
    setSavingPriceId(item.id);
    try {
      const updated = await orders.setItemPrice(orderId, item.id, price);
      onOrderUpdated(updated);
      setPriceDrafts((prev) => {
        const next = { ...prev };
        delete next[item.id];
        return next;
      });
      toast(`Priced "${item.product_name}" at ${fmtKES(price)}.`, "success");
    } catch (err) {
      toast(err instanceof ApiError ? err.message : "Could not set that price.", "error");
    } finally {
      setSavingPriceId(null);
    }
  }

  return (
    <div>
      {interactive && (
        <div className="flex items-center justify-between gap-3 mb-3">
          <p className="text-xs font-bold text-text-secondary">
            {packedCount} of {packableItems.length} packed
          </p>
          {allPacked && (
            <Badge variant="success">
              <Check size={11} className="mr-1" /> Ready to lock price
            </Badge>
          )}
        </div>
      )}
      {interactive && <ProgressBar percent={packableItems.length ? (packedCount / packableItems.length) * 100 : 0} tone={allPacked ? "success" : "role"} className="mb-4" />}

      <div className="space-y-1">
        {items.map((item) => {
          const isPacked = !!item.is_packed;
          const isNotFound = !!item.not_found;
          const isToggling = togglingId === item.id;
          const needsPrice = item.is_sourcing && !isNotFound && item.unit_price == null;
          const isSavingPrice = savingPriceId === item.id;

          return (
            <div key={item.id} className="rounded-xl overflow-hidden">
              <div
                className={cn(
                  "flex items-center gap-3 p-2.5 transition-colors",
                  isNotFound && "opacity-70"
                )}
              >
                <button
                  type="button"
                  role="checkbox"
                  aria-checked={isPacked}
                  aria-label={`Mark ${item.product_name || "item"} as ${isPacked ? "not packed" : "packed"}`}
                  disabled={!interactive || isToggling || isNotFound}
                  onClick={() => handleTogglePacked(item)}
                  className={cn(
                    "w-6 h-6 rounded-lg border-2 flex items-center justify-center shrink-0 transition-all",
                    interactive && !isNotFound && "cursor-pointer hover:bg-slate-50",
                    isPacked ? "bg-success border-success text-white" : "border-slate-300 bg-white",
                    (!interactive || isNotFound) && "opacity-70"
                  )}
                >
                  {isPacked && <Check size={14} strokeWidth={3} />}
                </button>

                <div className="flex-1 min-w-0">
                  <span
                    className={cn(
                      "text-sm font-bold leading-snug",
                      isNotFound || isPacked ? "text-text-muted line-through" : "text-text-primary"
                    )}
                  >
                    {item.product_name || `Product #${item.product_id}`}
                  </span>
                  {isNotFound ? (
                    <Badge variant="error" className="ml-2 align-middle">Not Found</Badge>
                  ) : (
                    item.is_sourcing && (
                      <Badge variant={item.unit_price != null ? "success" : "warning"} className="ml-2 align-middle">
                        {item.unit_price != null ? "Sourced" : "Sourcing"}
                      </Badge>
                    )
                  )}
                </div>

                <div className="text-right shrink-0 flex items-center gap-2">
                  {!needsPrice && (
                    <div>
                      <p className="text-sm font-black text-text-primary">× {item.quantity}</p>
                      {item.unit_price != null && (
                        <p className="text-xs text-text-muted font-bold">{fmtKES(item.unit_price)} ea</p>
                      )}
                    </div>
                  )}
                  {item.is_sourcing && interactive && (
                    <button
                      type="button"
                      onClick={() => handleToggleNotFound(item)}
                      disabled={isToggling}
                      className={cn(
                        "flex items-center gap-1 text-[11px] font-bold px-2 py-1.5 rounded-lg transition-colors shrink-0",
                        isNotFound
                          ? "bg-role-soft text-role-dark hover:opacity-80"
                          : "bg-error/10 text-error hover:bg-error/15"
                      )}
                    >
                      {isNotFound ? (
                        <>
                          <RotateCcw size={11} /> Undo
                        </>
                      ) : (
                        <>
                          <X size={11} /> Not Found
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>

              {needsPrice && interactive && (
                <div className="flex items-center gap-2 px-2.5 pb-2.5 pl-11">
                  <div className="relative flex-1">
                    <Tag size={13} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" aria-hidden="true" />
                    <input
                      type="number"
                      min={0}
                      step="0.01"
                      value={priceDrafts[item.id] ?? ""}
                      onChange={(e) => setPriceDrafts((prev) => ({ ...prev, [item.id]: e.target.value }))}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleSetPrice(item);
                        }
                      }}
                      placeholder={`Price per unit for ${item.quantity} pc${item.quantity !== 1 ? "s" : ""} (KES)`}
                      className="w-full rounded-lg border border-warning/30 bg-warning/5 py-2 pl-8 pr-3 text-sm font-semibold text-text-primary placeholder:text-text-muted placeholder:font-normal focus:outline-none focus:ring-2 focus:ring-role/40"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => handleSetPrice(item)}
                    disabled={isSavingPrice || !priceDrafts[item.id]}
                    className="shrink-0 rounded-lg bg-role-dark text-white text-xs font-bold px-3 py-2 disabled:opacity-40 disabled:pointer-events-none transition-opacity"
                  >
                    {isSavingPrice ? "Saving…" : "Set price"}
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
