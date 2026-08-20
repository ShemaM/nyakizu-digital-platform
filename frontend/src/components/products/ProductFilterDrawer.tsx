"use client";

import { useState } from "react";
import { X, Search, Plus } from "lucide-react";
import type { ApiCategory } from "@/lib/api";
import { cn } from "@/lib/cn";

interface ProductFilterDrawerProps {
  open: boolean;
  onClose: () => void;
  categoryList: ApiCategory[];
  categoryCounts: Map<number, number>;
  nameQuery: string;
  onNameQueryChange: (value: string) => void;
  selectedCategoryIds: Set<number>;
  onToggleCategory: (id: number) => void;
  onClear: () => void;
  /** Omit to hide the "add a category" affordance — only sellers manage the taxonomy. */
  onCreateCategory?: (name: string) => Promise<void>;
}

export function ProductFilterDrawer({
  open,
  onClose,
  categoryList,
  categoryCounts,
  nameQuery,
  onNameQueryChange,
  selectedCategoryIds,
  onToggleCategory,
  onClear,
  onCreateCategory,
}: ProductFilterDrawerProps) {
  const [newCategoryName, setNewCategoryName] = useState("");
  const [creating, setCreating] = useState(false);

  if (!open) return null;

  async function handleCreateCategory() {
    const name = newCategoryName.trim();
    if (!name || creating || !onCreateCategory) return;
    setCreating(true);
    try {
      await onCreateCategory(name);
      setNewCategoryName("");
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />

      <div
        role="dialog"
        aria-modal="true"
        aria-label="Filter products"
        className="relative flex h-full w-full max-w-sm flex-col bg-white shadow-2xl animate-scale-in"
        style={{ paddingTop: "env(safe-area-inset-top)", paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-slate-100 shrink-0">
          <h2 className="text-xl font-black text-text-primary">Filter Products</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close filters"
            className="w-9 h-9 rounded-full flex items-center justify-center text-text-secondary hover:bg-slate-100 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-6">
          <div>
            <label htmlFor="product-name-filter" className="block text-sm font-bold text-text-primary mb-2">
              Product Name
            </label>
            <div className="relative">
              <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" aria-hidden="true" />
              <input
                id="product-name-filter"
                type="text"
                value={nameQuery}
                onChange={(e) => onNameQueryChange(e.target.value)}
                placeholder="Search..."
                className="w-full rounded-xl border border-slate-200 bg-role-soft/40 py-3 pl-10 pr-3 text-sm font-medium text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-role/40"
              />
            </div>
          </div>

          <div>
            <p className="text-sm font-bold text-text-primary mb-2">Product Category</p>
            <div className="space-y-1">
              {categoryList.length === 0 && (
                <p className="text-sm text-text-muted py-2">
                  {onCreateCategory ? "No categories yet — add one below." : "No categories yet."}
                </p>
              )}
              {categoryList.map((category) => {
                const checked = selectedCategoryIds.has(category.id);
                const count = categoryCounts.get(category.id) ?? 0;
                return (
                  <label
                    key={category.id}
                    className="flex items-center gap-3 py-2 cursor-pointer select-none"
                  >
                    <span
                      className={cn(
                        "flex items-center justify-center w-5 h-5 rounded-md border-2 shrink-0 transition-colors",
                        checked ? "bg-role-dark border-role-dark" : "border-slate-300"
                      )}
                    >
                      {checked && (
                        <svg viewBox="0 0 16 16" fill="none" className="w-3 h-3" aria-hidden="true">
                          <path d="M3 8.5L6.2 11.5L13 4.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </span>
                    <input
                      type="checkbox"
                      className="sr-only"
                      checked={checked}
                      onChange={() => onToggleCategory(category.id)}
                    />
                    <span className="flex-1 text-sm font-medium text-text-primary">{category.name}</span>
                    <span className="text-xs font-semibold text-text-muted tabular-nums">{count}</span>
                  </label>
                );
              })}
            </div>

            {/* Custom category — seller-only (e.g. a phone accessories
                seller who starts stocking laptops). Buyers just filter. */}
            {onCreateCategory && (
              <div className="mt-3 flex items-center gap-2">
                <input
                  type="text"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleCreateCategory();
                    }
                  }}
                  placeholder="New category name"
                  className="flex-1 min-w-0 rounded-xl border border-dashed border-slate-300 bg-white py-2.5 px-3 text-sm font-medium text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-role/40"
                />
                <button
                  type="button"
                  onClick={handleCreateCategory}
                  disabled={!newCategoryName.trim() || creating}
                  className="shrink-0 flex items-center gap-1 rounded-xl bg-role-soft text-role-dark font-bold text-sm px-3 py-2.5 disabled:opacity-40 disabled:pointer-events-none transition-opacity"
                >
                  <Plus size={16} /> {creating ? "Adding…" : "Add"}
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3 px-5 py-4 border-t border-slate-100 shrink-0">
          <button
            type="button"
            onClick={onClear}
            className="flex-1 rounded-full border border-slate-200 text-text-secondary font-bold text-sm py-3 hover:bg-slate-50 transition-colors"
          >
            Clear
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-full bg-role-dark text-white font-bold text-sm py-3 shadow-md hover:opacity-90 transition-opacity"
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
}
