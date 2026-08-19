"use client";

import { useState } from "react";
import { ChevronDown, Package } from "lucide-react";
import { Card, CardSection } from "@/components/ui/Card";
import { PackingChecklist } from "@/components/seller-dashboard/PackingChecklist";
import type { ApiOrder, ApiOrderItem } from "@/lib/api";
import { cn } from "@/lib/cn";

interface PackedItemsHistoryProps {
  orderId: number;
  items: ApiOrderItem[];
  onOrderUpdated: (order: ApiOrder) => void;
}

/**
 * The finished packing checklist, once it's no longer the main thing on
 * screen — tucked behind a tap so it doesn't push payment (the thing the
 * seller actually needs to act on now) further down the page. Still here
 * if they need to double-check what went into the order.
 */
export function PackedItemsHistory({ orderId, items, onOrderUpdated }: PackedItemsHistoryProps) {
  const [open, setOpen] = useState(false);

  return (
    <Card className="mt-3 animate-fade-in-up delay-150">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between gap-3 px-5 py-4 sm:px-8 cursor-pointer"
      >
        <span className="text-xs font-black text-text-muted uppercase tracking-widest flex items-center gap-2">
          <Package size={12} /> What Was Packed
        </span>
        <ChevronDown size={16} className={cn("text-text-muted transition-transform", open && "rotate-180")} />
      </button>
      {open && (
        <CardSection className="border-t border-slate-100">
          <PackingChecklist orderId={orderId} items={items} interactive={false} onOrderUpdated={onOrderUpdated} />
        </CardSection>
      )}
    </Card>
  );
}
