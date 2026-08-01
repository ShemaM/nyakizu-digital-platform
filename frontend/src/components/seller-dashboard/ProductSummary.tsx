import React from 'react';
import Link from 'next/link';

interface ProductSummaryProps {
  total: number;
  active: number;
  draft: number;
}

export const ProductSummary: React.FC<ProductSummaryProps> = ({ total, active, draft }) => {
  return (
    <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800 shadow-sm flex flex-col justify-between h-full">
      <div>
        <h3 className="text-xs font-extrabold text-slate-300 uppercase tracking-wider mb-4">Product Summary</h3>
        <div className="space-y-3 text-xs text-slate-300">
          <div className="flex justify-between border-b border-slate-800/60 pb-2">
            <span className="text-slate-400">Total products:</span>
            <span className="font-bold text-slate-100">{total}</span>
          </div>
          <div className="flex justify-between border-b border-slate-800/60 pb-2">
            <span className="text-slate-400">Active products:</span>
            <span className="font-bold text-emerald-400">{active}</span>
          </div>
          <div className="flex justify-between pb-1">
            <span className="text-slate-400">Draft products:</span>
            <span className="font-bold text-slate-500">{draft}</span>
          </div>
        </div>
      </div>
      <Link 
        href="/seller/dashboard/catalog" 
        className="mt-5 block text-center bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold py-2.5 rounded-xl text-xs border border-slate-700 uppercase tracking-wider transition-colors"
      >
        View Products
      </Link>
    </div>
  );
};
