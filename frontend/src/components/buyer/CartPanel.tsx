"use client";

import { useState } from "react";
import Image from "next/image";
import { ShoppingCart, ImagePlus, Plus, PackageSearch } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { QuantityStepper } from "@/components/ui/QuantityStepper";
import { fmtKES } from "@/lib/api";

export interface CartItem {
  /** Stable key: `p-<productId>` for a catalog item, `c-<localId>` for a sourcing request. */
  key: string;
  productId?: number;
  name: string;
  /** Null for a sourcing item — there's no catalog price to charge until the seller quotes one. */
  price: number | null;
  qty: number;
  imageUrl?: string | null;
}

interface CartPanelProps {
  items: CartItem[];
  total: number;
  hasUnpriced: boolean;
  onIncrease: (key: string) => void;
  onDecrease: (key: string) => void;
  onAddSourcingItem: (name: string, qty: number) => void;
  onSubmit: () => void;
  submitting: boolean;
  isOnline: boolean;
}

/**
 * A receipt-style line: name + unit price on top (with the subtotal
 * right-aligned), the qty stepper on its own row below. Squeezing the
 * stepper (two 44px tap targets) onto the same line as the name used to
 * crush product names down to 2-3 characters on phone-width screens —
 * this keeps the name fully readable regardless of viewport width.
 */
function ReceiptRow({ item, onIncrease, onDecrease }: { item: CartItem; onIncrease: () => void; onDecrease: () => void }) {
  const isCustom = item.productId == null;
  return (
    <div className="py-3">
      <div className="flex items-start gap-3">
        <div className="relative w-11 h-11 rounded-xl bg-dark-secondary overflow-hidden shrink-0">
          {item.imageUrl ? (
            <Image src={item.imageUrl} alt={item.name} fill unoptimized className="object-cover" />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-text-muted">
              {isCustom ? <PackageSearch size={16} /> : <ImagePlus size={16} />}
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-text-primary leading-snug">{item.name}</p>
          {isCustom ? (
            <span className="inline-block mt-0.5 text-xs font-bold text-warning">To be priced by seller</span>
          ) : (
            <p className="text-xs text-text-muted mt-0.5 tabular-nums">{fmtKES(item.price)} each</p>
          )}
        </div>
        <div className="shrink-0 text-right">
          {isCustom ? (
            <span className="text-xs font-bold text-text-muted">—</span>
          ) : (
            <span className="text-sm font-black text-text-primary tabular-nums">{fmtKES((item.price ?? 0) * item.qty)}</span>
          )}
        </div>
      </div>
      <div className="mt-2 flex justify-end">
        <QuantityStepper qty={item.qty} onIncrease={onIncrease} onDecrease={onDecrease} />
      </div>
    </div>
  );
}

export function CartPanel({
  items,
  total,
  hasUnpriced,
  onIncrease,
  onDecrease,
  onAddSourcingItem,
  onSubmit,
  submitting,
  isOnline,
  className,
}: CartPanelProps & { className?: string }) {
  const [sourceName, setSourceName] = useState("");
  const [sourceQty, setSourceQty] = useState(1);
  const itemCount = items.reduce((s, i) => s + i.qty, 0);

  function handleAddSourcingItem() {
    const name = sourceName.trim();
    if (!name) return;
    onAddSourcingItem(name, Math.max(1, sourceQty));
    setSourceName("");
    setSourceQty(1);
  }

  return (
    <div className={className}>
      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center py-10 px-4">
          <div className="w-14 h-14 rounded-2xl bg-role-soft flex items-center justify-center mb-3">
            <ShoppingCart className="w-6 h-6 text-role" />
          </div>
          <p className="text-body font-bold text-text-secondary">Your cart is empty</p>
          <p className="text-caption text-text-muted mt-1">Tap + on a product, or ask us to source something below.</p>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wide text-text-muted px-0.5">
            <span>Item</span>
            <span>Subtotal</span>
          </div>
          <div className="divide-y divide-dashed divide-slate-200">
            {items.map((item) => (
              <ReceiptRow key={item.key} item={item} onIncrease={() => onIncrease(item.key)} onDecrease={() => onDecrease(item.key)} />
            ))}
          </div>
        </>
      )}

      {/* Ask the seller to source something not in their catalog */}
      <div className="pt-4 mt-1 border-t border-dashed border-slate-200">
        <label htmlFor="source-item-name" className="block text-xs font-bold uppercase tracking-wide text-text-muted mb-2">
          Can&apos;t find it? Ask us to source it
        </label>
        <div className="flex items-center gap-2">
          <input
            id="source-item-name"
            type="text"
            value={sourceName}
            onChange={(e) => setSourceName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleAddSourcingItem();
              }
            }}
            placeholder="e.g. iPhone 13 Silicone Cover"
            className="flex-1 min-w-0 rounded-xl border border-slate-200 bg-white py-2.5 px-3 text-base font-medium text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-role/40"
          />
          <input
            type="number"
            min={1}
            value={sourceQty}
            onChange={(e) => setSourceQty(Math.max(1, parseInt(e.target.value) || 1))}
            aria-label="Quantity"
            className="w-16 shrink-0 rounded-xl border border-slate-200 bg-white py-2.5 px-2 text-base font-medium text-text-primary text-center focus:outline-none focus:ring-2 focus:ring-role/40"
          />
          <button
            type="button"
            onClick={handleAddSourcingItem}
            disabled={!sourceName.trim()}
            aria-label="Add to order"
            className="shrink-0 flex items-center justify-center w-11 h-11 rounded-xl bg-role-soft text-role-dark disabled:opacity-40 disabled:pointer-events-none transition-opacity"
          >
            <Plus size={18} />
          </button>
        </div>
      </div>

      {items.length > 0 && (
        <>
          <div className="pt-4 mt-1 border-t border-dashed border-slate-300 space-y-1.5">
            <div className="flex justify-between items-baseline text-xs text-text-muted">
              <span>{itemCount} item{itemCount !== 1 ? "s" : ""}</span>
            </div>
            <div className="flex justify-between items-baseline">
              <span className="text-sm font-bold text-text-secondary">Total</span>
              <span className="text-lg font-black text-role tabular-nums">{fmtKES(total)}</span>
            </div>
            {hasUnpriced && (
              <p className="text-xs text-warning font-semibold">+ items the seller still needs to price</p>
            )}
          </div>
          <Button className="w-full rounded-xl mt-3" size="lg" onClick={onSubmit} disabled={submitting}>
            {submitting ? "Sending…" : isOnline ? "Send this order" : "Save order (offline)"}
          </Button>
        </>
      )}
    </div>
  );
}
