"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { fmtKES, parsePrice, type ApiOrder } from "@/lib/api";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { getStatusLabel, getStatusVariant, buyerDisplayName } from "@/lib/order-status";

interface SalesInsightsProps {
  orders: ApiOrder[];
}

function toInputValue(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

// Parsed with local year/month/day (not `new Date(string)`, which reads
// "yyyy-mm-dd" as UTC midnight and can land on the wrong day once shifted
// into a timezone behind UTC).
function parseInputValue(value: string): Date {
  const [y, m, d] = value.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function topBy(orders: ApiOrder[], extract: (order: ApiOrder) => { key: string; value: number }[]): { key: string; value: number }[] {
  const totals = new Map<string, number>();
  for (const order of orders) {
    for (const { key, value } of extract(order)) {
      totals.set(key, (totals.get(key) ?? 0) + value);
    }
  }
  return [...totals.entries()]
    .map(([key, value]) => ({ key, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);
}

/** A denser single line per order — used only inside the Sales card, so this day's orders
    don't visually repeat the full RecentOrders card already shown in the section above. */
function DayOrderRow({ order }: { order: ApiOrder }) {
  return (
    <Link
      href={`/seller/dashboard/orders/${order.id}/fulfill`}
      className="flex items-center gap-3 py-2.5 -mx-2 px-2 rounded-lg hover:bg-slate-50 transition-colors"
    >
      <Avatar name={buyerDisplayName(order)} size="sm" colorClassName="bg-role-dark" className="shrink-0" />
      <span className="flex-1 min-w-0 text-sm font-semibold text-text-primary truncate">{buyerDisplayName(order)}</span>
      <Badge variant={getStatusVariant(order.status)}>{getStatusLabel(order.status)}</Badge>
      <span className="text-sm font-black text-text-primary tabular-nums shrink-0">
        {fmtKES(parsePrice(order.final_total ?? order.total_price))}
      </span>
    </Link>
  );
}

function RankedList({ title, rows, unit }: { title: string; rows: { key: string; value: number }[]; unit: "money" | "count" }) {
  const max = Math.max(1, ...rows.map((r) => r.value));
  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-wider text-text-muted mb-3">{title}</p>
      {rows.length === 0 ? (
        <p className="text-sm text-text-muted">Nothing sold this day.</p>
      ) : (
        <div className="space-y-2.5">
          {rows.map((row) => (
            <div key={row.key}>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-semibold text-text-primary truncate pr-2">{row.key}</span>
                <span className="text-text-muted shrink-0 tabular-nums">
                  {unit === "money" ? fmtKES(row.value) : `${row.value} order${row.value !== 1 ? "s" : ""}`}
                </span>
              </div>
              <div className="h-1.5 rounded-full bg-slate-100">
                <div
                  className="h-1.5 rounded-full bg-role"
                  style={{ width: `${(row.value / max) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * A day at a time, not a 14-row table full of zeroes — pick a date (native
 * picker, defaults to today) and see that day's orders, total, and top
 * sellers. Empty days just say so instead of padding out a trend list.
 */
export function SalesInsights({ orders }: SalesInsightsProps) {
  const today = new Date();
  const [dateValue, setDateValue] = useState(() => toInputValue(today));
  const selectedDate = parseInputValue(dateValue);
  const isToday = isSameDay(selectedDate, today);

  const dayOrders = useMemo(() => {
    return orders
      .filter((o) => o.status !== "cancelled" && isSameDay(new Date(o.created_at), selectedDate))
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orders, dateValue]);

  const dayTotal = dayOrders.reduce((sum, o) => sum + parsePrice(o.final_total ?? o.total_price), 0);

  const topProducts = topBy(dayOrders, (order) =>
    (order.items ?? [])
      .filter((item) => !item.is_sourcing)
      .map((item) => ({ key: item.product_name || "Unnamed product", value: item.quantity }))
  );

  const topBuyers = topBy(dayOrders, (order) => [
    { key: buyerDisplayName(order), value: 1 },
  ]);

  function shiftDay(delta: number) {
    const next = new Date(selectedDate);
    next.setDate(next.getDate() + delta);
    if (next > today) return;
    setDateValue(toInputValue(next));
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 sm:p-6 space-y-6">
      {/* Date picker */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => shiftDay(-1)}
          aria-label="Previous day"
          className="w-9 h-9 shrink-0 rounded-full flex items-center justify-center text-text-secondary hover:bg-slate-100 transition-colors"
        >
          <ChevronLeft size={18} />
        </button>

        <label className="relative flex-1 min-w-0">
          <CalendarDays size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" aria-hidden="true" />
          <span className="sr-only">Day to view</span>
          <input
            type="date"
            value={dateValue}
            max={toInputValue(today)}
            onChange={(e) => e.target.value && setDateValue(e.target.value)}
            className="w-full rounded-full border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-3 text-sm font-semibold text-text-primary focus:outline-none focus:ring-2 focus:ring-role/40"
          />
        </label>

        <button
          type="button"
          onClick={() => shiftDay(1)}
          disabled={isToday}
          aria-label="Next day"
          className="w-9 h-9 shrink-0 rounded-full flex items-center justify-center text-text-secondary hover:bg-slate-100 transition-colors disabled:opacity-30 disabled:pointer-events-none"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      {!isToday && (
        <button type="button" onClick={() => setDateValue(toInputValue(today))} className="-mt-3 text-xs font-bold text-role hover:opacity-80">
          Jump to today
        </button>
      )}

      {/* Day summary */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        <div className="rounded-xl bg-slate-50 p-4">
          <p className="text-xs font-bold uppercase tracking-wider text-text-muted">Orders</p>
          <p className="text-2xl font-black text-text-primary mt-1 tabular-nums">{dayOrders.length}</p>
        </div>
        <div className="rounded-xl bg-slate-50 p-4">
          <p className="text-xs font-bold uppercase tracking-wider text-text-muted">Order value</p>
          <p className="text-2xl font-black text-text-primary mt-1 tabular-nums">{fmtKES(dayTotal)}</p>
        </div>
      </div>

      {dayOrders.length === 0 ? (
        <p className="text-sm text-text-muted text-center py-4">
          {isToday ? "No orders yet today." : "No orders on this day."}
        </p>
      ) : (
        <>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-text-muted mb-1">This day&apos;s orders</p>
            <div className="divide-y divide-slate-100">
              {dayOrders.map((order) => (
                <DayOrderRow key={order.id} order={order} />
              ))}
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2 border-t border-slate-100">
            <RankedList title="Best-selling products" rows={topProducts} unit="count" />
            <RankedList title="Buyers who ordered" rows={topBuyers} unit="count" />
          </div>
        </>
      )}
    </div>
  );
}
