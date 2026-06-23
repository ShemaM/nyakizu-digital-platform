"use client";

import { useState } from "react";
import Link from "next/link";
import { Package, MapPin, ChevronRight } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { CategoryFilter } from "@/components/CategoryFilter";
import { SELLERS, PRODUCTS, CATEGORIES, formatKES, unitPrice, formatDate } from "@/lib/dummy-data";

export default function StorefrontPage() {
  const seller   = SELLERS[0];
  const products = PRODUCTS.filter((p) => p.sellerId === seller.id);

  const [activeCat, setActiveCat] = useState<string | null>(null);

  // Only show categories that have products
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
    }).filter(Boolean) as { cat: typeof CATEGORIES[0]; subgroups: { sub: typeof CATEGORIES[0]["subcategories"][0]; products: typeof PRODUCTS }[] }[];

  return (
    <AppShell
      title={seller.storeName}
      headerRight={
        <Link href="/buyer/lists/new">
          <Button size="sm" className="rounded-lg bg-white text-blue-600 hover:bg-blue-50 font-bold text-xs">
            + New order
          </Button>
        </Link>
      }
    >
      {/* Store info */}
      <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 space-y-1">
        <div className="flex items-center gap-1 text-xs text-gray-500">
          <MapPin size={12} /><span>{seller.location}</span>
        </div>
        <p className="text-xs text-gray-600">{seller.description}</p>
        <p className="text-xs text-gray-400">Member since {formatDate(seller.joinedDate)}</p>
      </div>

      {/* Horizontal category filter */}
      <div className="sticky top-[53px] z-20 bg-gray-50 -mx-4 px-4 py-2 border-b border-gray-100 shadow-sm">
        <CategoryFilter
          categories={availableCats}
          active={activeCat}
          onChange={setActiveCat}
        />
      </div>

      {/* Products */}
      {grouped.map(({ cat, subgroups }) => (
        <section key={cat.id} className="space-y-3">
          <div className="flex items-center gap-2 px-1 pt-1">
            <span className="text-sm font-extrabold text-gray-800">{cat.name}</span>
            <span className="text-xs text-gray-400">
              ({subgroups.reduce((s, sg) => s + sg.products.length, 0)} items)
            </span>
          </div>

          {subgroups.map(({ sub, products }) => (
            <div key={sub.id} className="space-y-2">
              <div className="flex items-center gap-1.5 px-1">
                <ChevronRight size={12} className="text-blue-400" />
                <span className="text-xs font-semibold text-blue-600 uppercase tracking-wide">
                  {sub.name}
                </span>
              </div>

              {products.map((p) => (
                <Card key={p.id}>
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center shrink-0">
                      <Package size={18} className="text-gray-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-gray-900 leading-snug">{p.name}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{p.description}</p>
                      <div className="flex items-center justify-between mt-2 flex-wrap gap-1">
                        <div>
                          <span className="text-sm font-bold text-gray-900">
                            {formatKES(p.packPrice)}
                          </span>
                          <span className="text-xs text-gray-400 ml-1">/ {p.packSize}</span>
                        </div>
                        <span className="text-xs font-medium text-blue-600">
                          {formatKES(unitPrice(p))} per piece
                        </span>
                      </div>
                      <div className="flex items-center justify-between mt-1.5">
                        <Badge status={p.availability} />
                        <span className="text-xs text-gray-400">Added {formatDate(p.addedAt)}</span>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ))}
        </section>
      ))}
    </AppShell>
  );
}
