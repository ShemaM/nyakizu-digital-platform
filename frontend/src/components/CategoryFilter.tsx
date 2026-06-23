"use client";

import { clsx } from "clsx";

interface Category { id: string; name: string; }

interface Props {
  categories: Category[];
  active: string | null;
  onChange: (id: string | null) => void;
}

export function CategoryFilter({ categories, active, onChange }: Props) {
  return (
    <div className="flex gap-2 overflow-x-auto py-1 scrollbar-none">
      <button
        onClick={() => onChange(null)}
        className={clsx(
          "shrink-0 rounded-full border px-4 py-1.5 text-xs font-bold transition-all cursor-pointer",
          active === null
            ? "bg-slate-950 text-white border-slate-950 shadow-sm"
            : "bg-white/80 text-slate-600 border-slate-200 hover:bg-white hover:border-slate-300"
        )}
      >
        All
      </button>
      {categories.map((cat) => (
        <button
          key={cat.id}
          onClick={() => onChange(active === cat.id ? null : cat.id)}
          className={clsx(
            "shrink-0 rounded-full border px-4 py-1.5 text-xs font-bold transition-all cursor-pointer whitespace-nowrap",
            active === cat.id
              ? "bg-slate-950 text-white border-slate-950 shadow-sm"
              : "bg-white/80 text-slate-600 border-slate-200 hover:bg-white hover:border-slate-300"
          )}
        >
          {cat.name}
        </button>
      ))}
    </div>
  );
}
