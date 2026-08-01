"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, Package, Edit2, Archive, Eye, CheckCircle2, AlertCircle } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { PageSkeleton } from "@/components/ui/LoadingState";
import { products, ApiError, fmtKES } from "@/lib/api";

export default function SellerCatalogPage() {
  const router = useRouter();
  const [productList, setProductList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("all");

  useEffect(() => {
    loadCatalog();
  }, []);

  const loadCatalog = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await products.mine();
      // Safely unpack paginated or list formats
      setProductList(Array.isArray(data) ? data : (data?.results || data?.products || []));
    } catch (err) {
      console.error("Catalog load error:", err);
      setError(err instanceof ApiError ? err.message : "Failed to load products.");
    } finally {
      setIsLoading(false);
    }
  };

  const filteredProducts = productList.filter((product) => {
    if (filterStatus === "all") return true;
    return product.status === filterStatus;
  });

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "available": return "success";
      case "draft": return "outline";
      case "out_of_stock": return "error";
      default: return "default";
    }
  };

  if (isLoading) {
    return (
      <AppShell title="My Catalog" showLogo>
        <PageSkeleton showKPIs={false} listCount={4} />
      </AppShell>
    );
  }

  return (
    <AppShell title="My Catalog" showLogo>
      <div className="space-y-6">
        {/* Header Action Row */}
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 backdrop-blur-md">
          <div>
            <h1 className="text-xl font-black text-slate-100 tracking-tight">Product Catalog</h1>
            <p className="text-xs text-slate-400 mt-1">Manage items, stock statuses, and storefront visibility.</p>
          </div>
          <Button onClick={() => router.push("/seller/dashboard/catalog/new")} variant="default" size="default" className="bg-amber-500 text-[#0a1f10] font-bold hover:bg-amber-600 gap-2 shrink-0 self-start sm:self-center cursor-pointer">
            <Plus size={16} /> Add New Product
          </Button>
        </div>

        {/* Filters Panel */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          {["all", "available", "draft", "out_of_stock"].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider border transition-all shrink-0 ${
                filterStatus === status
                  ? "bg-slate-100 text-[#0a1f10] border-slate-100 shadow"
                  : "bg-slate-900/60 text-slate-400 border-slate-800 hover:text-slate-200"
              }`}
            >
              {status.replace("_", " ")}
            </button>
          ))}
        </div>

        {error && (
          <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl p-4 text-xs font-semibold flex items-center gap-2">
            <AlertCircle size={16} /> {error}
          </div>
        )}

        {/* Product Grid */}
        {filteredProducts.length === 0 ? (
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-12 text-center text-slate-400 flex flex-col items-center justify-center min-h-[300px]">
            <Package size={40} className="text-slate-600 mb-3" />
            <p className="text-sm font-bold text-slate-200">No items found</p>
            <p className="text-xs text-slate-500 mt-1">Try changing your active filter status or create a new item above.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredProducts.map((product) => (
              <div key={product.id} className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex gap-4 hover:border-slate-700 transition-all group shadow-sm">
                {/* Visual Placeholder Frame */}
                <div className="w-20 h-20 bg-slate-800/60 rounded-xl border border-slate-700 flex items-center justify-center text-slate-500 shrink-0 relative overflow-hidden">
                  {product.image ? (
                    <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                  ) : (
                    <Package size={24} className="group-hover:scale-110 transition-transform" />
                  )}
                </div>

                {/* Info Elements */}
                <div className="flex-1 min-w-0 flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-sm font-bold text-slate-100 truncate group-hover:text-amber-400 transition-colors">
                        {product.name}
                      </h3>
                      <Badge variant={getStatusBadgeVariant(product.status)}>
                        {product.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{product.description || "No description provided."}</p>
                  </div>

                  <div className="flex items-center justify-between gap-4 pt-2 border-t border-slate-800/60 mt-2">
                    <span className="text-sm font-black text-slate-200">
                      {fmtKES(product.price)}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <button className="p-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 rounded-lg transition-colors cursor-pointer" title="Preview Product">
                        <Eye size={14} />
                      </button>
                      <button className="p-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 rounded-lg transition-colors cursor-pointer" title="Edit Product">
                        <Edit2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
