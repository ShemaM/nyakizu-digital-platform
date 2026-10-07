"use client";

import { useState } from "react";
import Image from "next/image";
import { ImagePlus, Tag, CheckCircle2, Info } from "lucide-react";
import { QuantityStepper } from "@/components/ui/QuantityStepper";
import { ProductDetailModal } from "@/components/products/ProductDetailModal";
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
 * it straight to the cart. Tapping the card opens the full product details
 * and description modal.
 */
export function BuyerProductCard({ product, qty, onIncrease, onDecrease }: BuyerProductCardProps) {
  const [imageFailed, setImageFailed] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);

  return (
    <>
      <div
        className={cn(
          "bg-white dark:bg-dark-card border shadow-sm rounded-2xl overflow-hidden flex flex-col transition-all group",
          qty > 0
            ? "border-role/40 ring-1 ring-role/15"
            : "border-slate-100 dark:border-dark-accent hover:border-role/30 hover:shadow-md"
        )}
      >
        {/* Clickable Card Header & Image */}
        <button
          type="button"
          onClick={() => setDetailsOpen(true)}
          className="text-left w-full cursor-pointer focus:outline-none flex flex-col flex-1"
          aria-label={`View details and description for ${product.name}`}
        >
          <div className="relative w-full aspect-[4/3] bg-dark-secondary overflow-hidden">
            {product.image_url && !imageFailed ? (
              <Image
                src={product.image_url}
                alt={product.name}
                fill
                unoptimized
                className="object-cover transition-transform duration-300 group-hover:scale-105"
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

          <div className="p-3.5 flex-1 flex flex-col gap-2 w-full">
            {product.category_name && (
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-text-muted">
                <Tag size={12} aria-hidden="true" /> {product.category_name}
              </span>
            )}
            <h3 className="text-body font-bold text-text-primary leading-snug line-clamp-2 group-hover:text-role transition-colors">
              {product.name}
            </h3>

            {product.description && (
              <p className="text-xs text-text-muted line-clamp-1 italic">
                {product.description}
              </p>
            )}

            <div className="mt-auto pt-1 flex items-center justify-between">
              <span className="text-body-lg font-black text-role">{fmtKES(product.price)}</span>
              <span className="inline-flex items-center gap-0.5 text-[11px] font-semibold text-text-muted opacity-80 group-hover:opacity-100 group-hover:text-role transition-all">
                <Info size={11} /> Details
              </span>
            </div>
          </div>
        </button>

        {/* Quantity Stepper - isolated from card click */}
        <div
          className="px-3.5 pb-3.5 pt-0 flex justify-end"
          onClick={(e) => e.stopPropagation()}
        >
          <QuantityStepper qty={qty} onIncrease={onIncrease} onDecrease={onDecrease} />
        </div>
      </div>

      {/* Product Detail Modal with full description, attributes, and order controls */}
      <ProductDetailModal
        product={product}
        open={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        qty={qty}
        onIncrease={onIncrease}
        onDecrease={onDecrease}
      />
    </>
  );
}
