import React from 'react';
import Link from 'next/link';

export const QuickActions: React.FC = () => {
  const actions = [
    { label: 'Add Product', href: '/seller/dashboard/catalog', primary: true },
    { label: 'My Products', href: '/seller/dashboard/catalog' },
    { label: 'Orders', href: '/seller/orders' },
    { label: 'Money', href: '/seller/ledger' },
    { label: 'Shop Settings', href: '/seller/account' },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
      {actions.map((action, idx) => (
        <Link
          key={idx}
          href={action.href}
          className={`p-4 text-center font-bold rounded-2xl text-xs sm:text-sm uppercase tracking-wider transition-all active:scale-[0.98] shadow-sm flex items-center justify-center ${
            action.primary 
              ? 'bg-[#0a1f10] text-white hover:bg-[#12361c] col-span-2 sm:col-span-1' 
              : 'bg-white text-[#0a1f10] border-2 border-[#0a1f10]/5 hover:bg-gray-50'
          }`}
        >
          {action.label}
        </Link>
      ))}
    </div>
  );
};
