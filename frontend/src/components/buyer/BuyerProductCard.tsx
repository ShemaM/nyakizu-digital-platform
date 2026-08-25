"use client";

import { useState } from "react";
import Image from "next/image";
import { ImagePlus, Tag, CheckCircle2 } from "lucide-react";
import { QuantityStepper } from "@/components/ui/QuantityStepper";
import { fmtKES, type ApiProduct } from "@/lib/api";
import { cn } from "@/lib/cn";

interface BuyerProductCardProps {
  product: ApiProduct;
  qty: number;
  onIncrease: () => void;
  onDecrease: () => void;
}

/**
 * The seller's own catalog card, minus everything seller-only (stock count,
 * Edit, delete) — buyers get a photo, category, price, and a stepper to add
 * it straight to the cart. Only truly in-stock products ever reach this
 * card (the caller filters to availability_label === "available"); anything
 * a seller doesn't currently stock is a special-request sourcing item
 * instead, not a browsable-but-unavailable catalog card.
 */
export function BuyerProductCard({ product, qty, onIncrease, onDecrease }: BuyerProductCardProps) {
  const [imageFailed, setImageFailed] = useState(false);

  return (
    <div
      className={cn(
        "bg-white border shadow-sm rounded-2xl overflow-hidden flex flex-col transition-all",
        qty > 0 ? "border-role/40 ring-1 ring-role/15" : "border-slate-100"
      )}
    >
      <div className="relative aspect-[4/3] bg-dark-secondary overflow-hidden">
        {product.image_url && !imageFailed ? (
          <Image
            src={product.image_url}
            alt={product.name}
            fill
            unoptimized
            className="object-cover"
            onError={() => setImageFailed(true)}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-text-muted">
            <ImagePlus size={24} />
          </div>
        )}
        <span className="absolute top-2.5 right-2.5 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold shadow-sm bg-success text-white">
          <CheckCircle2 size={12} /> Available
        </span>
      </div>

      <div className="p-3.5 flex-1 flex flex-col gap-2.5">
        {product.category_name && (
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-text-muted">
            <Tag size={12} aria-hidden="true" /> {product.category_name}
          </span>
        )}
        <h3 className="text-body font-bold text-text-primary leading-snug line-clamp-2">{product.name}</h3>

        {/* Stacked, not side-by-side — on a 2-column grid at phone widths
            (~150px per card) the price and a qty>0 stepper (two 44px tap
            targets plus the count) don't fit on one line without wrapping. */}
        <div className="mt-auto flex flex-col gap-2 pt-1">
          <span className="text-body-lg font-black text-role">{fmtKES(product.price)}</span>
          <div className="flex justify-end">
            <QuantityStepper qty={qty} onIncrease={onIncrease} onDecrease={onDecrease} />
          </div>
        </div>
      </div>
    </div>
  );
}
