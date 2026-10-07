"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { X, Tag, CheckCircle2, ImagePlus, Plus, Layers } from "lucide-react";
import { QuantityStepper } from "@/components/ui/QuantityStepper";
import { Button } from "@/components/ui/Button";
import { fmtKES, parsePrice, type ApiProduct } from "@/lib/api";
import { cn } from "@/lib/cn";

export interface ProductDetailModalProps {
  product: ApiProduct | null;
  open: boolean;
  onClose: () => void;
  qty?: number;
  onIncrease?: () => void;
  onDecrease?: () => void;
}

export function ProductDetailModal({
  product,
  open,
  onClose,
  qty = 0,
  onIncrease,
  onDecrease,
}: ProductDetailModalProps) {
  const [imageFailed, setImageFailed] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);

  // Reset image error state whenever a different product is opened
  useEffect(() => {
    setImageFailed(false);
  }, [product?.id]);

  // Focus trap, Escape key dismiss, and body scroll lock
  useEffect(() => {
    if (!open) return;

    previouslyFocused.current = document.activeElement as HTMLElement | null;
    const panel = panelRef.current;
    if (panel) {
      panel.focus();
    }

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
      previouslyFocused.current?.focus();
    };
  }, [open, onClose]);

  if (!open || !product) return null;

  const itemTotal = parsePrice(product.price) * qty;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      {/* Dimmed backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Dialog Content */}
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="product-detail-title"
        tabIndex={-1}
        className={cn(
          "relative flex flex-col w-full sm:max-w-md max-h-[90dvh]",
          "bg-white dark:bg-dark-card border border-slate-100 dark:border-dark-accent",
          "rounded-t-3xl sm:rounded-3xl shadow-2xl animate-scale-in outline-none overflow-hidden"
        )}
      >
        {/* Mobile handle indicator */}
        <div className="mx-auto mt-2.5 h-1.5 w-12 rounded-full bg-slate-200 dark:bg-dark-accent sm:hidden shrink-0" />

        {/* Header bar with Category & Close button */}
        <div className="flex items-center justify-between px-5 pt-3.5 pb-2.5 shrink-0 border-b border-slate-100/80 dark:border-dark-accent/60">
          <div className="flex items-center gap-2 flex-wrap">
            {product.category_name && (
              <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold bg-slate-100 dark:bg-dark-tertiary text-text-secondary">
                <Tag size={12} className="text-role" /> {product.category_name}
              </span>
            )}
            <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
              <CheckCircle2 size={12} /> Available
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close product details"
            className="w-8 h-8 rounded-full flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-slate-100 dark:hover:bg-dark-tertiary transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable details body */}
        <div className="flex-1 overflow-y-auto overscroll-contain p-5 space-y-4">
          {/* Large Hero Image */}
          <div className="relative aspect-[4/3] rounded-2xl bg-slate-100 dark:bg-dark-secondary overflow-hidden border border-slate-100 dark:border-dark-accent/60">
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
              <div className="absolute inset-0 flex flex-col items-center justify-center text-text-muted gap-2">
                <ImagePlus size={36} className="text-slate-300 dark:text-dark-accent" />
                <span className="text-xs font-medium">No preview image</span>
              </div>
            )}
          </div>

          {/* Product Title and Price */}
          <div className="space-y-1">
            <h2
              id="product-detail-title"
              className="text-xl sm:text-2xl font-black text-text-primary leading-tight"
            >
              {product.name}
            </h2>
            <div className="flex items-baseline gap-2 pt-0.5">
              <span className="text-2xl font-black text-role tracking-tight">
                {fmtKES(product.price)}
              </span>
              <span className="text-xs font-semibold text-text-muted uppercase tracking-wide">
                Wholesale Price
              </span>
            </div>
          </div>

          {/* Description Section */}
          <div className="space-y-1.5 pt-1">
            <h3 className="text-xs font-bold uppercase tracking-wider text-text-muted flex items-center gap-1.5">
              <span>Description</span>
            </h3>
            {product.description && product.description.trim() ? (
              <div className="text-sm text-text-secondary leading-relaxed whitespace-pre-line bg-slate-50 dark:bg-dark-tertiary/60 p-4 rounded-2xl border border-slate-100 dark:border-dark-accent/60">
                {product.description}
              </div>
            ) : (
              <div className="text-xs text-text-muted italic bg-slate-50 dark:bg-dark-tertiary/40 p-3 rounded-xl border border-slate-100 dark:border-dark-accent/40">
                No description provided by the wholesaler for this product.
              </div>
            )}
          </div>

          {/* Specifications / Attribute Values */}
          {product.attribute_values && product.attribute_values.length > 0 && (
            <div className="space-y-2 pt-1">
              <h3 className="text-xs font-bold uppercase tracking-wider text-text-muted flex items-center gap-1.5">
                <Layers size={13} className="text-role" />
                <span>Product Specifications</span>
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {product.attribute_values.map((attr) => (
                  <div
                    key={attr.id}
                    className="p-3 rounded-xl bg-slate-50 dark:bg-dark-tertiary/60 border border-slate-100 dark:border-dark-accent/60 text-xs"
                  >
                    <span className="block text-text-muted font-medium truncate">
                      {attr.attribute_name}
                    </span>
                    <span className="block font-bold text-text-primary mt-0.5 truncate">
                      {attr.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Action Footer (Order controls if in buyer order mode) */}
        {onIncrease && onDecrease ? (
          <div
            className="border-t border-slate-100 dark:border-dark-accent bg-slate-50/70 dark:bg-dark-secondary/70 p-4 shrink-0"
            style={{ paddingBottom: "calc(1rem + env(safe-area-inset-bottom))" }}
          >
            {qty > 0 ? (
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-xs font-bold text-text-muted uppercase tracking-wider">
                    In Your Order
                  </div>
                  <div className="text-base font-black text-text-primary">
                    {qty} {qty === 1 ? "unit" : "units"} &middot;{" "}
                    <span className="text-role">{fmtKES(itemTotal)}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <QuantityStepper
                    qty={qty}
                    onIncrease={onIncrease}
                    onDecrease={onDecrease}
                  />
                  <Button
                    variant="role"
                    size="sm"
                    onClick={onClose}
                    className="h-11 px-4 text-xs font-bold rounded-xl"
                  >
                    Done
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Button
                  variant="role"
                  className="flex-1 h-12 rounded-xl font-bold flex items-center justify-center gap-2 shadow-sm"
                  onClick={() => {
                    onIncrease();
                  }}
                >
                  <Plus size={18} />
                  Add to Order &middot; {fmtKES(product.price)}
                </Button>
                <Button
                  variant="outline"
                  className="h-12 px-4 rounded-xl font-bold text-xs"
                  onClick={onClose}
                >
                  Close
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div
            className="border-t border-slate-100 dark:border-dark-accent bg-slate-50/70 dark:bg-dark-secondary/70 p-4 shrink-0 flex justify-end"
            style={{ paddingBottom: "calc(1rem + env(safe-area-inset-bottom))" }}
          >
            <Button variant="secondary" onClick={onClose} className="w-full sm:w-auto">
              Close
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

