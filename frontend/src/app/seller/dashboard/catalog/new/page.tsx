"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, AlertCircle } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/Button";
import { products } from "@/lib/api";

export default function NewProductPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    price: "",
    description: "",
    status: "available",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isLoading) return; // Prevent double-submissions from jamming the router
    if (!formData.name || !formData.price) {
      setError("Product name and price are required.");
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      const payload = {
        name: formData.name.trim(),
        price: parseFloat(formData.price),
        description: formData.description.trim() || "",
        status: formData.status,
      };

      await products.create(payload);
      
      // Navigate away smoothly without locking up the server-side cache router
      router.push("/seller/dashboard/catalog");
    } catch (err: any) {
      console.error("Caught form exception:", err);
      setError(err?.message || "An unexpected network error occurred.");
      setIsLoading(false); // Make sure to turn off loading state only on failure
    }
  };

  return (
    <AppShell title="Add Product" showLogo>
      <div className="space-y-6 max-w-2xl mx-auto">
        <button 
          type="button"
          onClick={() => router.push("/seller/dashboard/catalog")}
          className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400 hover:text-slate-200 transition-colors border-none bg-transparent cursor-pointer"
        >
          <ArrowLeft size={14} /> Back to Catalog
        </button>

        <div>
          <h1 className="text-xl font-black text-slate-100 tracking-tight">Add New Product</h1>
          <p className="text-xs text-slate-400 mt-1">Introduce a new wholesale item to your trusted marketplace network.</p>
        </div>

        {error && (
          <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl p-4 text-xs font-semibold flex items-center gap-2">
            <AlertCircle size={16} /> <span>Error: {error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 backdrop-blur-md">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Product Name *</label>
            <input 
              type="text"
              placeholder="e.g., iPhone 13 Pro Clear Case"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 focus:border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-600 outline-none transition-all"
              disabled={isLoading}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Wholesale Price (KES) *</label>
              <input 
                type="number"
                placeholder="0.00"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 focus:border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-600 outline-none transition-all"
                disabled={isLoading}
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Initial Visibility Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 focus:border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-100 outline-none transition-all cursor-pointer"
                disabled={isLoading}
              >
                <option value="available">Available (Visible to buyers)</option>
                <option value="draft">Draft (Private setup)</option>
                <option value="out_of_stock">Out of Stock</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Description / Specifications</label>
            <textarea 
              rows={3}
              placeholder="Provide batch details or accessory specifications..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 focus:border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-600 outline-none transition-all resize-none"
              disabled={isLoading}
            />
          </div>

          <div className="pt-4 flex justify-end">
            <Button 
              type="submit" 
              loading={isLoading}
              className="bg-amber-500 text-[#0a1f10] font-bold hover:bg-amber-600 gap-2 w-full sm:w-auto px-6 cursor-pointer"
            >
              Save Product
            </Button>
          </div>
        </form>
      </div>
    </AppShell>
  );
}
