"use client";

import { useState } from "react";
import { Package, ChevronRight } from "lucide-react";
import { CategoryFilter } from "@/components/CategoryFilter";
import { CATEGORIES, formatKES, unitPrice, type Product } from "@/lib/dummy-data";
import { Badge } from "@/components/ui/Badge";

interface Props { products: Product[]; }

export function StoreProducts({ products }: Props) {
  const [activeCat, setActiveCat] = useState<string | null>(null);

  const availableCats = CATEGORIES.filter((cat) =>
    products.some((p) => p.categoryId === cat.id)
  );

  const grouped = CATEGORIES
    .filter((cat) => !activeCat || cat.id === activeCat)
    .map((cat) => {
      const catProducts = products.filter((p) => p.categoryId === cat.id);
      if (!catProducts.length) return null;
      const subgroups = cat.subcategories
        .map((sub) => ({ sub, products: catProducts.filter((p) => p.subcategoryId === sub.id) }))
        .filter((sg) => sg.products.length > 0);
      return { cat, subgroups };
    })
    .filter(Boolean) as { cat: typeof CATEGORIES[0]; subgroups: { sub: typeof CATEGORIES[0]["subcategories"][0]; products: Product[] }[] }[];

  return (
    <div className="space-y-5">
      <div className="sticky top-0 z-10 -mx-4 border-b border-slate-200/80 bg-surface/90 px-4 py-2 backdrop-blur-xl">
        <CategoryFilter
          categories={availableCats}
          active={activeCat}
          onChange={setActiveCat}
        />
      </div>

      {grouped.map(({ cat, subgroups }) => (
        <section key={cat.id} className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-sm font-extrabold text-slate-950">{cat.name}</span>
            <span className="text-xs text-slate-400">
              ({subgroups.reduce((s, sg) => s + sg.products.length, 0)} items)
            </span>
          </div>

          {subgroups.map(({ sub, products }) => (
            <div key={sub.id} className="space-y-2">
              <div className="flex items-center gap-1.5">
                <ChevronRight size={12} className="text-blue-500" />
                <span className="text-xs font-black text-blue-700 uppercase tracking-wide">
                  {sub.name}
                </span>
              </div>

              {products.map((p) => (
                <div key={p.id} className="app-panel rounded-lg p-3">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                      <Package size={16} className="text-slate-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm text-slate-950 leading-snug">{p.name}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{p.description}</p>
                      <div className="flex items-center justify-between mt-2 flex-wrap gap-1">
                        <div>
                          <span className="text-sm font-bold text-gray-900">
                            {formatKES(p.packPrice)}
                          </span>
                          <span className="text-xs text-slate-400 ml-1">/ {p.packSize}</span>
                        </div>
                        <span className="text-xs text-blue-700 font-bold">
                          {formatKES(unitPrice(p))} per piece
                        </span>
                      </div>
                      <div className="mt-1.5">
                        <Badge status={p.availability} />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </section>
      ))}
    </div>
  );
}
