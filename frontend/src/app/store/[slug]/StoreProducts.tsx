"use client";

import { useMemo, useState } from "react";
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

interface Props { products: ApiProduct[]; }

export function StoreProducts({ products }: Props) {
  const [activeCat, setActiveCat] = useState<string | null>(null);

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
      <div className="app-panel rounded-lg p-8 text-center">
        <Package size={28} className="mx-auto mb-2 text-slate-300" />
        <p className="text-body text-slate-500">This store has nothing listed yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="sticky top-0 z-10 -mx-4 border-b border-slate-200/80 bg-surface/90 px-4 py-2 backdrop-blur-xl">
        <CategoryFilter
          categories={categories}
          active={activeCat}
          onChange={setActiveCat}
        />
      </div>

      {grouped.map(({ name, products: groupProducts }) => (
        <section key={name} className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-body font-extrabold text-slate-950">{name}</span>
            <span className="text-caption text-slate-400">
              ({groupProducts.length} items)
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {groupProducts.map((p) => {
              const availability = availabilityFor(p);
              return (
                <div
                  key={p.id}
                  className="app-panel overflow-hidden rounded-lg transition hover:border-slate-300 hover:shadow-md"
                >
                  <div className="relative aspect-square bg-slate-100">
                    {p.image_url ? (
                      <Image
                        src={p.image_url}
                        alt={p.name}
                        fill
                        unoptimized
                        className="object-cover"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Package size={24} className="text-slate-300" />
                      </div>
                    )}
                    <span className="absolute top-2 left-2">
                      <Badge variant={availability.variant}>{availability.label}</Badge>
                    </span>
                  </div>
                  <div className="p-3">
                    <p className="font-bold text-body text-slate-950 leading-snug line-clamp-2">{p.name}</p>
                    <p className="mt-1.5 text-body font-black text-slate-950">{fmtKES(p.price)}</p>
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
