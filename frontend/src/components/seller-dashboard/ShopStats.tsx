import React from 'react';

interface ShopStatsProps {
  totalProducts: number;
  newOrders: number;
  moneyOwed: number;
  totalBuyers: number;
}

export const ShopStats: React.FC<ShopStatsProps> = ({
  totalProducts,
  newOrders,
  moneyOwed,
  totalBuyers,
}) => {
  const stats = [
    { label: 'My Products', value: totalProducts, color: 'text-slate-100' },
    { label: 'New Orders', value: newOrders, color: 'text-amber-400' },
    { label: 'Money Owed', value: `KES ${moneyOwed.toLocaleString('en-KE')}`, color: 'text-rose-400' },
    { label: 'Buyers', value: totalBuyers, color: 'text-emerald-400' },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, idx) => (
        <div key={idx} className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl shadow-sm">
          <span className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1">
            {stat.label}
          </span>
          <span className={`text-xl md:text-2xl font-black ${stat.color}`}>
            {stat.value}
          </span>
        </div>
      ))}
    </div>
  );
};
