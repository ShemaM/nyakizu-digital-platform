import React from 'react';

interface MoneySummaryProps {
  moneyOwed: string | number;
  paidMoney: string | number;
}

export const MoneySummary: React.FC<MoneySummaryProps> = ({ moneyOwed, paidMoney }) => {
  const formatMoney = (amount: string | number) => {
    if (typeof amount === 'string' && amount.includes('KES')) return amount;
    return `KES ${Number(amount).toLocaleString('en-KE')}`;
  };

  return (
    <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800 shadow-sm h-full">
      <h3 className="text-xs font-extrabold text-slate-300 uppercase tracking-wider mb-4">Money Section</h3>
      <div className="space-y-3 text-xs">
        <div className="flex justify-between border-b border-slate-800/60 pb-2">
          <span className="text-slate-400">Money Owed:</span>
          <span className="font-bold text-rose-400">{formatMoney(moneyOwed)}</span>
        </div>
        <div className="flex justify-between pt-1">
          <span className="text-slate-400">Paid:</span>
          <span className="font-bold text-emerald-400">{formatMoney(paidMoney)}</span>
        </div>
      </div>
    </div>
  );
};
