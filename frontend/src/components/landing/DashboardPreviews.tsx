import {
  Bell, Store, BadgeCheck, ShoppingBag, Users, Wallet, Plus, Package,
  Home, Layers, SlidersHorizontal, ImagePlus, ShoppingCart, Tag,
} from "lucide-react";

/**
 * Real numbers from Nyakizu's own sample accounts (shemanzabakamira@gmail.com
 * the seller, kimdreadlockskitengela@gmail.com the buyer) — pulled from the
 * database, not invented. What can't honestly be shown on a public marketing
 * page (other real buyers' names/order history) is left out; everything
 * shown here is either the account owner's own data or already-public
 * catalog info. This is still hand-built markup, not a screen capture —
 * there's no way to screenshot a live session from here — so swap in real
 * device screenshots later if you want pixel-perfect accuracy.
 */

function MiniBottomNav({ items }: { items: { Icon: typeof Home; active?: boolean }[] }) {
  return (
    <div className="mt-auto flex items-center justify-around bg-text-primary py-2 px-1">
      {items.map(({ Icon, active }, i) => (
        <span
          key={i}
          className={`flex items-center justify-center w-5 h-5 rounded-full ${active ? "bg-brand-gold" : ""}`}
        >
          <Icon size={10} strokeWidth={2.5} className={active ? "text-white" : "text-white/40"} />
        </span>
      ))}
    </div>
  );
}

function RoleTag({ label }: { label: string }) {
  return (
    <span className="inline-block rounded-full bg-text-primary text-white text-[6px] font-black uppercase tracking-wider px-2 py-0.5">
      {label}
    </span>
  );
}

/** shemanzabakamira@gmail.com — Sample Shop, Nairobi. */
export function SellerScreenPreview() {
  return (
    <div className="flex flex-col h-full bg-dark-primary">
      <div className="flex items-center justify-between px-3 pt-6 pb-2 shrink-0">
        <span className="w-5 h-5 rounded-full bg-brand-gold flex items-center justify-center text-white font-bold text-[7px]">S</span>
        <RoleTag label="Seller" />
        <Bell size={11} className="text-text-secondary" />
      </div>

      <div className="flex-1 px-3 pt-1.5 space-y-1.5 overflow-hidden">
        <div>
          <p className="font-extrabold text-text-primary text-[10px] leading-tight">Good evening, Sample</p>
          <div className="flex items-center gap-1 mt-0.5 text-text-secondary">
            <Store size={8} />
            <span className="font-semibold text-[7.5px]">Sample Shop · Nairobi</span>
            <BadgeCheck size={8} className="text-info" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-1.5">
          <div className="bg-white rounded-lg border border-slate-100 p-1.5">
            <span className="flex items-center justify-center w-4 h-4 rounded-full bg-orange-100 mb-1">
              <ShoppingBag size={8} className="text-orange-600" />
            </span>
            <p className="font-black text-text-primary text-[11px] leading-none">0</p>
            <p className="text-text-muted text-[6.5px] font-semibold mt-0.5">New Orders</p>
          </div>
          <div className="bg-white rounded-lg border border-slate-100 p-1.5">
            <span className="flex items-center justify-center w-4 h-4 rounded-full bg-blue-100 mb-1">
              <Users size={8} className="text-blue-600" />
            </span>
            <p className="font-black text-text-primary text-[11px] leading-none">0</p>
            <p className="text-text-muted text-[6.5px] font-semibold mt-0.5">Buyer Requests</p>
          </div>
        </div>

        <div className="bg-white border border-slate-100 rounded-lg p-1.5 flex items-center gap-1.5">
          <span className="flex items-center justify-center w-4 h-4 rounded-full bg-success/10 shrink-0">
            <Wallet size={8} className="text-success" />
          </span>
          <div className="min-w-0">
            <p className="font-black text-success text-[9.5px] leading-none">All paid up</p>
            <p className="text-text-muted text-[6.5px] font-semibold mt-0.5">Money Owed</p>
          </div>
        </div>

        {/* Business overview — real lifetime numbers */}
        <div className="grid grid-cols-3 gap-1">
          {[
            { label: "Orders", value: "5" },
            { label: "Made", value: "13.2K" },
            { label: "Products", value: "11" },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-lg border border-slate-100 py-1.5 text-center">
              <p className="font-black text-text-primary text-[9px] leading-none">{s.value}</p>
              <p className="text-text-muted text-[6px] font-bold mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Your products — real catalog */}
        <div>
          <p className="text-text-muted text-[6.5px] font-bold uppercase tracking-wide mb-1">Your Products</p>
          <div className="space-y-1">
            {[
              { name: "A2 Core Cover Silicon", price: "KES 120" },
              { name: "Hot 8 Screen Protectors", price: "KES 34" },
            ].map((p) => (
              <div key={p.name} className="bg-white rounded-md border border-slate-100 p-1 flex items-center gap-1.5">
                <span className="w-4 h-4 rounded bg-dark-secondary flex items-center justify-center shrink-0">
                  <ImagePlus size={7} className="text-text-muted" />
                </span>
                <span className="flex-1 min-w-0 text-text-primary font-semibold text-[6.5px] truncate">{p.name}</span>
                <span className="text-brand-gold-dark font-black text-[6.5px] shrink-0">{p.price}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-1.5">
          <div className="bg-brand-gold rounded-lg p-1.5 flex flex-col items-center gap-0.5">
            <Plus size={9} className="text-white" />
            <span className="text-white font-bold text-[6.5px]">Add Product</span>
          </div>
          <div className="bg-white border border-slate-100 rounded-lg p-1.5 flex flex-col items-center gap-0.5">
            <Package size={9} className="text-brand-gold-dark" />
            <span className="text-text-primary font-bold text-[6.5px]">My Products</span>
          </div>
        </div>
      </div>

      <MiniBottomNav items={[{ Icon: Home, active: true }, { Icon: Layers }, { Icon: ShoppingBag }, { Icon: Store }]} />
    </div>
  );
}

/** kimdreadlockskitengela@gmail.com — browsing Sample Shop, an approved supplier of theirs. */
export function BuyerScreenPreview() {
  return (
    <div className="flex flex-col h-full bg-dark-primary">
      <div className="flex items-center justify-between px-3 pt-6 pb-2 shrink-0">
        <span className="w-5 h-5 rounded-full bg-brand-gold flex items-center justify-center text-white font-bold text-[7px]">B</span>
        <RoleTag label="Buyer" />
        <SlidersHorizontal size={10} className="text-text-secondary" />
      </div>

      <div className="flex-1 px-3 pt-1.5 space-y-1.5 overflow-hidden">
        <div>
          <p className="font-extrabold text-text-primary text-[9px] leading-tight">Order from Sample Shop</p>
          <p className="text-text-muted text-[6.5px] font-semibold mt-0.5">An approved supplier of yours</p>
        </div>

        <div className="flex items-center gap-1">
          <span className="shrink-0 rounded-full bg-brand-gold text-white text-[6.5px] font-bold px-2 py-1">All</span>
          <span className="shrink-0 flex items-center gap-0.5 rounded-full bg-white border border-slate-200 text-text-secondary text-[6.5px] font-bold px-2 py-1">
            <Tag size={7} /> Covers
          </span>
        </div>

        <div className="grid grid-cols-2 gap-1.5">
          {[
            { name: "A2 Core Cover Silicon", price: "KES 120" },
            { name: "Camon 40 Pro Cover", price: "KES 120" },
          ].map((p) => (
            <div key={p.name} className="bg-white rounded-lg border border-slate-100 overflow-hidden">
              <div className="aspect-[4/3] bg-dark-secondary flex items-center justify-center">
                <ImagePlus size={12} className="text-text-muted" />
              </div>
              <div className="p-1.5 space-y-1">
                <p className="font-bold text-text-primary text-[6.5px] leading-tight line-clamp-1">{p.name}</p>
                <div className="flex items-center justify-between">
                  <span className="font-black text-brand-gold-dark text-[7px]">{p.price}</span>
                  <span className="flex items-center justify-center w-4 h-4 rounded-full bg-brand-gold">
                    <Plus size={7} className="text-white" />
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div>
          <p className="text-text-muted text-[6.5px] font-bold uppercase tracking-wide mb-1">Your Order</p>
          <div className="bg-white rounded-lg border border-slate-100 divide-y divide-dashed divide-slate-200 p-1">
            {[
              { name: "A2 Core Cover Silicon", qty: 1, sub: "120" },
              { name: "Hot 8 Screen Protectors", qty: 1, sub: "34" },
            ].map((row) => (
              <div key={row.name} className="flex items-center justify-between py-1 first:pt-0 last:pb-0">
                <span className="text-text-primary font-semibold text-[6px] truncate pr-1">{row.qty}× {row.name}</span>
                <span className="text-text-secondary font-bold text-[6px] shrink-0">KES {row.sub}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="px-3 pb-1.5 shrink-0">
        <div className="flex items-center justify-between rounded-lg bg-brand-gold px-2.5 py-1.5">
          <span className="flex items-center gap-1 text-white font-bold text-[7px]">
            <ShoppingCart size={9} /> 2 items
          </span>
          <span className="text-white font-black text-[7.5px]">KES 154</span>
        </div>
      </div>

      <MiniBottomNav items={[{ Icon: Home, active: true }, { Icon: Store }, { Icon: Package }, { Icon: Users }]} />
    </div>
  );
}
