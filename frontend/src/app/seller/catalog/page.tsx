"use client";

import { useState, useEffect } from "react";
import { 
  Package, Copy, Check, ExternalLink, Plus, 
  Globe, ShieldCheck, EyeOff, AlertCircle, Search 
} from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { CategoryFilter } from "@/components/CategoryFilter";
import { cn } from "@/lib/cn";

// ── Types ─────────────────────────────────────────────────────
interface Category {
  id: string;
  name: string;
}

interface Product {
  id: string;
  categoryId: string;
  name: string;
  packPrice: number;
  packSize: number;
  stockQuantity: number;
  availability: "available" | "low_stock" | "out_of_stock";
  visibility: "public" | "trusted" | "hidden";
  addedAt: string;
}

interface UserProfile {
  id: string;
  username: string;
  store_slug?: string; // Assuming nested or included store info
}

export default function CatalogPage() {
  // ── State ───────────────────────────────────────────────────
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  
  const [isLoading, setIsLoading] = useState(true);
  const [activeCat, setActiveCat] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [copied, setCopied] = useState(false);

  // ── Real API Integration ────────────────────────────────────
  useEffect(() => {
    async function fetchCatalogData() {
      try {
        setIsLoading(true);
        
        // Using your exact Django REST URLs
        const [profileRes, prodRes, catRes] = await Promise.all([
          fetch("/api/accounts/me/"),
          fetch("/api/products/mine/"),       // Authenticated seller's own products
          fetch("/api/products/categories/")  // List categories
        ]);

        if (profileRes.ok && prodRes.ok && catRes.ok) {
          setProfile(await profileRes.json());
          setProducts(await prodRes.json());
          setCategories(await catRes.json());
        }
      } catch (error) {
        console.error("Failed to fetch catalog data:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchCatalogData();
  }, []);

  const handleVisibilityChange = async (productId: string, newVisibility: Product["visibility"]) => {
    // Optimistic UI update
    setProducts(prev => prev.map(p => 
      p.id === productId ? { ...p, visibility: newVisibility } : p
    ));

    try {
      // Seller update via the main detail endpoint
      await fetch(`/api/products/${productId}/`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ visibility: newVisibility })
      });
    } catch (error) {
      console.error("Failed to update visibility", error);
      // Revert logic on failure would go here
    }
  };

  const copyLink = () => {
    if (!profile?.store_slug) return;
    const storeUrl = `${window.location.origin}/store/${profile.store_slug}`;
    navigator.clipboard.writeText(storeUrl).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // ── Derived Data ────────────────────────────────────────────
  const storeUrl = profile?.store_slug ? `${window.location.origin}/store/${profile.store_slug}` : "";
  const lowStockCount = products.filter(p => p.stockQuantity < 5 && p.stockQuantity > 0).length;

  const filteredProducts = products.filter(p => {
    const matchesCat = !activeCat || p.categoryId === activeCat;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const grouped = categories
    .filter(cat => !activeCat || cat.id === activeCat)
    .map(cat => ({
      cat,
      products: filteredProducts.filter(p => p.categoryId === cat.id),
    }))
    .filter(g => g.products.length > 0);

  // ── Loading State ───────────────────────────────────────────
  if (isLoading) {
    return (
      <AppShell title="My Products">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0a1f10]"></div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell
      title="My Products"
      headerRight={
        <Button size="sm" className="gap-1.5 text-xs bg-amber-500 hover:bg-amber-600 text-[#0a1f10] font-bold border-none">
          <Plus size={13} /> Add Item
        </Button>
      }
    >
      {/* ── Creative Hero: Store Link & Alerts (Dark Green/Amber Palette) ── */}
      <div className="bg-[#0a1f10] rounded-2xl p-5 space-y-4 shadow-lg animate-fade-in-up relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl"></div>
        
        <div className="relative z-10 flex justify-between items-start">
          <div>
            <h2 className="text-sm font-bold text-amber-500">Your Storefront</h2>
            <p className="text-xs text-gray-300 mt-1 max-w-[80%]">
              Share this link with your hawkers. Only approved buyers see private stock.
            </p>
          </div>
          {lowStockCount > 0 && (
            <div className="flex items-center gap-1.5 bg-amber-500/20 text-amber-400 px-2.5 py-1 rounded-lg text-xs font-bold border border-amber-500/30">
              <AlertCircle size={14} />
              {lowStockCount} low stock
            </div>
          )}
        </div>

        {storeUrl ? (
          <>
            <div className="bg-white/10 border border-white/20 rounded-xl px-3 py-2.5 flex items-center justify-between gap-3 backdrop-blur-sm relative z-10">
              <p className="text-xs text-gray-200 font-mono truncate flex-1">{storeUrl}</p>
              <button
                onClick={copyLink}
                className={cn(
                  "shrink-0 flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg transition-all",
                  copied
                    ? "bg-green-500/20 text-green-400"
                    : "bg-amber-500 text-[#0a1f10] hover:bg-amber-400"
                )}
              >
                {copied ? <Check size={14} /> : <Copy size={14} />}
                {copied ? "Copied" : "Copy"}
              </button>
            </div>
            <div className="relative z-10 pt-1">
              <a
                href={storeUrl} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-amber-400 hover:text-amber-300 font-medium"
              >
                <ExternalLink size={12} /> Preview public view
              </a>
            </div>
          </>
        ) : (
          <div className="text-xs text-gray-400 bg-white/5 p-2 rounded-lg border border-white/10">
            Store link unavailable. Complete your store setup.
          </div>
        )}
      </div>

      {/* ── Search & Filters ────────────────────────────────────────────── */}
      <div className="sticky top-[57px] z-20 bg-surface -mx-4 px-4 py-3 border-b border-gray-200/60 space-y-3">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input 
            type="text"
            placeholder="Search SKUs or product names..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0a1f10]/20"
          />
        </div>
        <CategoryFilter
          categories={categories.filter(c => products.some(p => p.categoryId === c.id))}
          active={activeCat}
          onChange={setActiveCat}
        />
      </div>

      {/* ── Product Groups ──────────────────────────────────────────────── */}
      {grouped.map(({ cat, products }, gi) => (
        <section key={cat.id} className={cn("space-y-3 pt-2", gi > 0 && "animate-fade-in-up")}>
          <div className="flex items-center gap-2 px-1">
            <div className="w-1.5 h-4 bg-amber-500 rounded-full" />
            <h2 className="text-xs font-extrabold text-[#0a1f10] uppercase tracking-wider">{cat.name}</h2>
            <span className="text-xs text-gray-500 font-medium">({products.length})</span>
          </div>

          <div className="space-y-3">
            {products.map((p) => (
              <div
                key={p.id}
                className={cn(
                  "bg-white rounded-2xl border p-4 transition-all duration-200",
                  p.visibility === "hidden" ? "border-gray-200 opacity-60" : "border-gray-100 shadow-sm hover:border-amber-500/30 hover:shadow-md"
                )}
              >
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-xl bg-[#0a1f10]/5 flex items-center justify-center shrink-0 border border-[#0a1f10]/10">
                    <Package size={20} className="text-[#0a1f10]" />
                  </div>

                  <div className="flex-1 min-w-0 space-y-2">
                    <p className="text-sm font-bold text-[#0a1f10] leading-snug truncate">{p.name}</p>

                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-bold text-gray-900">
                        KES {p.packPrice.toLocaleString()}
                      </span>
                      <span className="text-xs text-gray-400">/ {p.packSize} pcs</span>
                      <span className="text-[10px] text-amber-700 font-bold bg-amber-50 px-1.5 py-0.5 rounded-md border border-amber-100">
                        KES {(p.packPrice / p.packSize).toLocaleString()} ea
                      </span>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={cn(
                        "text-[11px] px-2 py-0.5 rounded-md font-bold",
                        p.stockQuantity === 0 ? "bg-red-50 text-red-600" :
                        p.stockQuantity < 5 ? "bg-amber-50 text-amber-600" :
                        "bg-green-50 text-green-700"
                      )}>
                        {p.stockQuantity} in stock
                      </span>
                      <Badge status={p.availability as any} />
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between gap-2">
                  <div className="flex bg-gray-100/80 rounded-lg p-1">
                    <button
                      onClick={() => handleVisibilityChange(p.id, "public")}
                      className={cn(
                        "flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[10px] font-bold transition-all",
                        p.visibility === "public" ? "bg-white text-[#0a1f10] shadow-sm" : "text-gray-500 hover:text-gray-700"
                      )}
                    >
                      <Globe size={12} /> Public
                    </button>
                    <button
                      onClick={() => handleVisibilityChange(p.id, "trusted")}
                      className={cn(
                        "flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[10px] font-bold transition-all",
                        p.visibility === "trusted" ? "bg-white text-amber-600 shadow-sm" : "text-gray-500 hover:text-gray-700"
                      )}
                    >
                      <ShieldCheck size={12} /> Trusted
                    </button>
                    <button
                      onClick={() => handleVisibilityChange(p.id, "hidden")}
                      className={cn(
                        "flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[10px] font-bold transition-all",
                        p.visibility === "hidden" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
                      )}
                    >
                      <EyeOff size={12} /> Hidden
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      ))}

      {filteredProducts.length === 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center shadow-sm mt-8">
          <div className="w-16 h-16 bg-[#0a1f10]/5 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-[#0a1f10]/10">
            <Package size={28} className="text-[#0a1f10]/40" />
          </div>
          <p className="text-sm font-bold text-[#0a1f10]">No products found</p>
          <p className="text-xs text-gray-500 mt-1 max-w-[200px] mx-auto">
            Add your first accessory pack to start trading.
          </p>
        </div>
      )}
    </AppShell>
  );
}