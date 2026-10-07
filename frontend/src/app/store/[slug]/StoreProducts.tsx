"use client";

import { useMemo, useState, useEffect } from "react";
import Image from "next/image";
import { Package } from "lucide-react";
import { CategoryFilter } from "@/components/CategoryFilter";
import { Badge } from "@/components/ui/Badge";
import { fmtKES, type ApiProduct } from "@/lib/api";

function availabilityFor(product: ApiProduct): { variant: "success" | "warning" | "error"; label: string } {
  if (product.status === "available") return { variant: "success", label: "Available" };
  if (product.availability_label === "can_be_sourced") return { variant: "warning", label: "Can be sourced" };
  return { variant: "error", label: "Not available" };
}

/** Falls back to the placeholder icon on a broken URL instead of the browser's alt-text-over-broken-icon default. */
function ProductImage({ src, alt }: { src?: string; alt: string }) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div className="absolute inset-0 flex items-center justify-center">
        <Package size={24} className="text-slate-300" />
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill
      unoptimized
      className="object-cover transition-transform duration-300 group-hover:scale-105"
      onError={() => setFailed(true)}
    />
  );
}

interface Props { products: ApiProduct[]; }

export function StoreProducts({ products }: Props) {
  const [activeCat, setActiveCat] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const hash = window.location.hash;
    const searchParams = new URLSearchParams(window.location.search);
    const productId = searchParams.get("product") || (hash.startsWith("#product-") ? hash.replace("#product-", "") : null);
    if (!productId) return;

    const timer = setTimeout(() => {
      const el = document.getElementById(`product-${productId}`);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        el.classList.add("ring-2", "ring-brand-gold", "shadow-brand");
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [products]);

  const categories = useMemo(() => {
    const seen = new Map<string, string>();
    for (const p of products) {
      const name = p.category_name || "Other";
      seen.set(String(p.category ?? name), name);
    }
    return Array.from(seen, ([id, name]) => ({ id, name }));
  }, [products]);

  const grouped = useMemo(() => {
    const byCategory = new Map<string, { name: string; products: ApiProduct[] }>();
    for (const p of products) {
      const name = p.category_name || "Other";
      const key = String(p.category ?? name);
      if (activeCat && activeCat !== key) continue;
      if (!byCategory.has(key)) byCategory.set(key, { name, products: [] });
      byCategory.get(key)!.products.push(p);
    }
    return Array.from(byCategory.values());
  }, [products, activeCat]);

  if (products.length === 0) {
    return (
      <div className="rounded-2xl border border-dark-accent bg-dark-card p-8 text-center">
        <Package size={28} className="mx-auto mb-2 text-text-muted" />
        <p className="text-body text-text-secondary">This store has nothing listed yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="sticky top-0 z-10 -mx-4 border-b border-dark-accent bg-dark-primary/90 px-4 py-2 backdrop-blur-xl">
        <CategoryFilter
          categories={categories}
          active={activeCat}
          onChange={setActiveCat}
        />
      </div>

      {grouped.map(({ name, products: groupProducts }) => (
        <section key={name} className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-body font-extrabold text-text-primary">{name}</span>
            <span className="text-caption text-text-muted">
              ({groupProducts.length} item{groupProducts.length === 1 ? "" : "s"})
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {groupProducts.map((p) => {
              const availability = availabilityFor(p);
              return (
                <div
                  key={p.id}
                  id={`product-${p.id}`}
                  className="group overflow-hidden rounded-2xl border border-dark-accent bg-dark-card transition hover:border-brand-gold/40 hover:shadow-card-elevated"
                >
                  <div className="relative aspect-square overflow-hidden bg-dark-secondary">
                    <ProductImage src={p.image_url} alt={p.name} />
                    <span className="absolute top-2 left-2">
                      <Badge variant={availability.variant}>{availability.label}</Badge>
                    </span>
                  </div>
                  <div className="p-3">
                    <p className="font-bold text-body text-text-primary leading-snug line-clamp-2">{p.name}</p>
                    <p className="mt-1.5 text-body font-black text-brand-gold">{fmtKES(p.price)}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
