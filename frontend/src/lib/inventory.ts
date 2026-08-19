import type { ApiProduct } from "@/lib/api";

/**
 * Below this many units, a seller sees a "Low Stock" warning instead of a
 * plain "In Stock" badge. A flat number rather than a per-product setting —
 * simple enough for a seller to reason about at a glance, revisit if sellers
 * with very different order sizes need it configurable later.
 */
export const LOW_STOCK_THRESHOLD = 5;

export function isLowStock(product: Pick<ApiProduct, "status" | "stock_quantity">): boolean {
  return (
    product.status === "available" &&
    typeof product.stock_quantity === "number" &&
    product.stock_quantity > 0 &&
    product.stock_quantity <= LOW_STOCK_THRESHOLD
  );
}
