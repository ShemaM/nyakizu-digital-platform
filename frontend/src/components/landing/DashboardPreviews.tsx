"use client";

import {
  Bell, Store, BadgeCheck, ShoppingBag, Users, Wallet, Plus, Package,
  Home, SlidersHorizontal,
} from "lucide-react";

/**
 * Real numbers from Nyakizu's own verified sample accounts:
 * - Seller: shemanzabakamira@gmail.com (Sample Shop · Nairobi CBD)
 * - Buyer: kimdreadlockskitengela@gmail.com (Kim Dreadlocks Kitengela)
 * 
 * Accurately models the live dashboard UI:
 * - Seller dashboard: Today's Priorities, Run your shop with confidence,
 *   Status cards (New orders, Awaiting pay, Confirmed), Quick actions, Real catalog.
 * - Buyer dashboard: Golden greeting card, 4 key stats (Active Orders,
 *   Completed, Total Spent, Suppliers), Make a New Order action, Recent orders list.
 */

function MiniBottomNav({ items }: { items: { Icon: typeof Home; active?: boolean }[] }) {
  return (
    <div className="mt-auto flex items-center justify-around bg-dark-secondary border-t border-dark-accent py-2 px-1">
      {items.map(({ Icon, active }, i) => (
        <span
          key={i}
          className={`flex items-center justify-center w-5 h-5 rounded-full ${active ? "bg-brand-gold text-slate-950" : "text-text-muted"}`}
        >
          <Icon size={10} strokeWidth={2.5} />
        </span>
      ))}
    </div>
  );
}

function RoleTag({ label }: { label: string }) {
  return (
    <span className="inline-block rounded-full bg-brand-gold/15 text-brand-gold border border-brand-gold/30 text-[6px] font-black uppercase tracking-wider px-2 py-0.5">
      {label}
    </span>
  );
}

/** shemanzabakamira@gmail.com — Sample Shop, Nairobi CBD. */
export function SellerScreenPreview() {
  return (
    <div className="flex flex-col h-full bg-dark-primary select-none text-[8px]">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between px-3 pt-5 pb-1.5 shrink-0">
        <span className="w-4 h-4 rounded-full bg-brand-gold flex items-center justify-center text-slate-950 font-black text-[7px]">S</span>
        <RoleTag label="Seller" />
        <Bell size={10} className="text-text-secondary" />
      </div>

      <div className="flex-1 px-2.5 space-y-1.5 overflow-hidden">
        {/* Today's Priorities / Shop Welcome Card */}
        <div className="rounded-xl border border-dark-accent bg-dark-card p-2 shadow-xs">
          <p className="text-[6px] font-black uppercase tracking-wider text-brand-gold">Today&apos;s priorities</p>
          <p className="font-extrabold text-text-primary text-[9px] leading-tight mt-0.5">Run your shop with confidence, Sample</p>
          <div className="flex items-center gap-1 mt-1 text-text-muted text-[6.5px]">
            <Store size={7} className="text-brand-gold shrink-0" />
            <span className="font-semibold text-text-secondary truncate">Sample Shop · Nairobi CBD</span>
            <BadgeCheck size={7} className="text-emerald-500 shrink-0" />
          </div>
          <div className="mt-1.5 pt-1 border-t border-dark-accent/60 flex items-center justify-between text-[6.5px]">
            <span className="text-text-muted">Collected today:</span>
            <span className="font-black text-emerald-400">KES 0</span>
          </div>
        </div>

        {/* 3 Status indicators (matches SellerDashboardHeader) */}
        <div className="grid grid-cols-3 gap-1">
          <div className="bg-dark-card rounded-lg border border-dark-accent p-1 text-center">
            <p className="font-black text-text-primary text-[9px] leading-none">0</p>
            <p className="text-text-muted text-[5.5px] font-bold mt-0.5">New orders</p>
          </div>
          <div className="bg-dark-card rounded-lg border border-dark-accent p-1 text-center">
            <p className="font-black text-amber-400 text-[9px] leading-none">0</p>
            <p className="text-text-muted text-[5.5px] font-bold mt-0.5">Awaiting pay</p>
          </div>
          <div className="bg-dark-card rounded-lg border border-dark-accent p-1 text-center">
            <p className="font-black text-emerald-400 text-[9px] leading-none">5</p>
            <p className="text-text-muted text-[5.5px] font-bold mt-0.5">Confirmed</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-1">
          <div className="bg-brand-gold rounded-lg py-1 px-1.5 flex items-center justify-center gap-1 shadow-xs">
            <Plus size={8} className="text-slate-950 font-black" />
            <span className="text-slate-950 font-black text-[6.5px]">Add Product</span>
          </div>
          <div className="bg-dark-card border border-dark-accent rounded-lg py-1 px-1.5 flex items-center justify-center gap-1">
            <Package size={8} className="text-brand-gold" />
            <span className="text-text-secondary font-bold text-[6.5px]">Catalog (11)</span>
          </div>
        </div>

        {/* Real Live Catalog */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-text-muted text-[6px] font-bold uppercase tracking-wider">Live Catalog</span>
            <span className="text-emerald-400 font-mono text-[5.5px] font-bold">11 Items Active</span>
          </div>
          <div className="space-y-1">
            {[
              { name: "A2 Core Cover Silicon", price: "KES 120", stock: "In Stock" },
              { name: "Hot 8 Screen Protectors", price: "KES 34", stock: "In Stock" },
            ].map((p) => (
              <div key={p.name} className="bg-dark-card rounded-lg border border-dark-accent p-1 flex items-center gap-1.5">
                <span className="w-4 h-4 rounded bg-dark-secondary flex items-center justify-center shrink-0">
                  <Package size={7} className="text-brand-gold" />
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-text-primary font-semibold text-[6.5px] truncate leading-tight">{p.name}</p>
                  <p className="text-[5.5px] text-emerald-500 font-medium">{p.stock}</p>
                </div>
                <span className="text-brand-gold font-black text-[6.5px] shrink-0">{p.price}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <MiniBottomNav items={[{ Icon: Home, active: true }, { Icon: ShoppingBag }, { Icon: Package }, { Icon: Wallet }]} />
    </div>
  );
}

/** kimdreadlockskitengela@gmail.com — Kim Dreadlocks Kitengela. */
export function BuyerScreenPreview() {
  return (
    <div className="flex flex-col h-full bg-dark-primary select-none text-[8px]">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between px-3 pt-5 pb-1.5 shrink-0">
        <span className="w-4 h-4 rounded-full bg-brand-gold flex items-center justify-center text-slate-950 font-black text-[7px]">B</span>
        <RoleTag label="Buyer" />
        <SlidersHorizontal size={9} className="text-text-secondary" />
      </div>

      <div className="flex-1 px-2.5 space-y-1.5 overflow-hidden">
        {/* Real Golden Hero Greeting Card (matches buyer/page.tsx) */}
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-brand-gold to-amber-500 p-2 shadow-xs text-slate-950">
          <p className="font-black text-[9px] leading-tight">Good evening, Kim</p>
          <p className="text-[6px] font-semibold text-slate-950/80 mt-0.5 leading-tight">
            Here&apos;s what&apos;s happening with your trade today.
          </p>
        </div>

        {/* 4 Key Stats Grid (matches buyer/page.tsx: Active Orders, Completed, Total Spent, Suppliers) */}
        <div className="grid grid-cols-2 gap-1">
          <div className="bg-dark-card rounded-lg border border-dark-accent p-1.5">
            <p className="font-black text-text-primary text-[9.5px] leading-none">0</p>
            <p className="text-text-muted text-[6px] font-semibold mt-0.5">Active Orders</p>
          </div>
          <div className="bg-dark-card rounded-lg border border-dark-accent p-1.5">
            <p className="font-black text-emerald-400 text-[9.5px] leading-none">1</p>
            <p className="text-text-muted text-[6px] font-semibold mt-0.5">Completed</p>
          </div>
          <div className="bg-dark-card rounded-lg border border-dark-accent p-1.5">
            <p className="font-black text-brand-gold text-[9.5px] leading-none">KES 154</p>
            <p className="text-text-muted text-[6px] font-semibold mt-0.5">Total Spent</p>
          </div>
          <div className="bg-dark-card rounded-lg border border-dark-accent p-1.5">
            <p className="font-black text-blue-400 text-[9.5px] leading-none">1</p>
            <p className="text-text-muted text-[6px] font-semibold mt-0.5">Suppliers</p>
          </div>
        </div>

        {/* Primary CTA (matches buyer/page.tsx Make a New Order button) */}
        <div className="flex items-center justify-center gap-1 rounded-lg bg-brand-gold py-1.5 px-2 text-slate-950 font-black text-[7px] shadow-xs">
          <Plus size={8} strokeWidth={3} />
          <span>Make a New Order</span>
        </div>

        {/* Recent Orders Card (matches buyer/page.tsx) */}
        <div>
          <p className="text-text-muted text-[6px] font-bold uppercase tracking-wider mb-1">Recent Order</p>
          <div className="bg-dark-card rounded-lg border border-dark-accent p-1.5 space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-text-primary text-[7px] truncate">Sample Shop</span>
              <span className="text-emerald-400 font-black text-[7px]">KES 154</span>
            </div>
            {/* Mini Progress Strip: 4 dots for timeline steps */}
            <div className="flex items-center gap-1 py-0.5">
              <span className="h-1 w-2.5 rounded-full bg-emerald-500" />
              <span className="h-1 w-1 rounded-full bg-emerald-500" />
              <span className="h-1 w-1 rounded-full bg-emerald-500" />
              <span className="h-1 w-1 rounded-full bg-emerald-500" />
              <span className="ml-auto text-[5.5px] font-bold text-emerald-400">Cleared</span>
            </div>
            <p className="text-[5.5px] text-text-muted truncate">A2 Cover + Hot 8 Protectors</p>
          </div>
        </div>
      </div>

      <MiniBottomNav items={[{ Icon: Home, active: true }, { Icon: ShoppingBag }, { Icon: Store }, { Icon: Users }]} />
    </div>
  );
}
