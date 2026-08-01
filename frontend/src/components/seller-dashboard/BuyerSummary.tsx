import React from 'react';

interface BuyerSummaryProps {
  newRequests: number;
  myBuyers: number;
}

export const BuyerSummary: React.FC<BuyerSummaryProps> = ({ newRequests, myBuyers }) => {
  return (
    <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800 shadow-sm h-full">
      <h3 className="text-xs font-extrabold text-slate-300 uppercase tracking-wider mb-4">Buyers</h3>
      <div className="space-y-3 text-xs">
        <div className="p-3 bg-amber-500/10 rounded-xl flex justify-between items-center border border-amber-500/20">
          <span className="font-medium text-amber-200">New buyer requests:</span>
          <span className="bg-amber-500 text-[#0a1f10] font-black px-2.5 py-0.5 rounded-full text-xs">{newRequests}</span>
        </div>
        <div className="p-3 bg-slate-800/50 border border-slate-800 rounded-xl flex justify-between items-center">
          <span className="text-slate-400">My buyers:</span>
          <span className="font-black text-slate-100 text-base">{myBuyers}</span>
        </div>
      </div>
    </div>
  );
};
