import React from 'react';

interface SellerHeaderProps {
  shopName: string;
  sellerName: string;
  location: string;
  status: string;
}

export const SellerHeader: React.FC<SellerHeaderProps> = ({
  shopName,
  sellerName,
  location,
  status,
}) => {
  return (
    <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 flex flex-col sm:flex-row justify-between sm:items-center gap-4 shadow-sm backdrop-blur-md">
      <div>
        <span className="text-[10px] font-extrabold uppercase tracking-widest text-amber-500 block mb-0.5">
          Your Shop
        </span>
        <h1 className="text-xl md:text-2xl font-black text-slate-100 tracking-tight">
          {shopName}
        </h1>
        <p className="text-xs text-slate-400 mt-1 font-medium">
          Seller: <span className="text-slate-300 font-semibold">{sellerName}</span> • {location}
        </p>
      </div>
      <div className="self-start sm:self-center">
        <span className="inline-flex items-center px-3 py-1 text-xs font-bold rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase tracking-wider">
          ● {status.toLowerCase() === 'approved' ? 'Active Store' : status}
        </span>
      </div>
    </div>
  );
};
