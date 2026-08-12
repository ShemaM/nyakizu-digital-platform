"use client";

import { fmtKES, parsePrice, type ApiOrder } from "@/lib/api";

interface SalesInsightsProps {
  orders: ApiOrder[];
}

const TREND_DAYS = 14;

function buildDailyTrend(orders: ApiOrder[]) {
  const days: { key: string; label: string; value: number }[] = [];
  const today = new Date();
  for (let i = TREND_DAYS - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    days.push({
      key: d.toDateString(),
      label: d.toLocaleDateString("en-KE", { day: "numeric", month: "short" }),
      value: 0,
    });
  }
  const byKey = new Map(days.map((d) => [d.key, d]));
  for (const order of orders) {
    if (order.status === "cancelled") continue;
    const key = new Date(order.created_at).toDateString();
    const day = byKey.get(key);
    if (day) day.value += parsePrice(order.final_total ?? order.total_price);
  }
  return days;
}

function topBy(orders: ApiOrder[], extract: (order: ApiOrder) => { key: string; value: number }[]): { key: string; value: number }[] {
  const totals = new Map<string, number>();
  for (const order of orders) {
    if (order.status === "cancelled") continue;
    for (const { key, value } of extract(order)) {
      totals.set(key, (totals.get(key) ?? 0) + value);
    }
  }
  return [...totals.entries()]
    .map(([key, value]) => ({ key, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);
}

function RankedList({ title, rows, unit }: { title: string; rows: { key: string; value: number }[]; unit: "money" | "count" }) {
  const max = Math.max(1, ...rows.map((r) => r.value));
  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-wider text-text-muted mb-3">{title}</p>
      {rows.length === 0 ? (
        <p className="text-sm text-text-muted">Not enough data yet.</p>
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
 * Sales by day + top products/buyers — all computed client-side from the
 * seller's own order list (no new backend endpoint). "Sales" here means
 * order value placed per day, not cash collected — that's the ledger's job.
 * Plain tables, not charts — easier to read at a glance than a graph.
 */
export function SalesInsights({ orders }: SalesInsightsProps) {
  const trend = buildDailyTrend(orders);
  const recentTrend = [...trend].reverse();
  const hasAnyOrders = orders.some((o) => o.status !== "cancelled");

  const topProducts = topBy(orders, (order) =>
    (order.items ?? [])
      .filter((item) => !item.is_sourcing)
      .map((item) => ({ key: item.product_name || "Unnamed product", value: item.quantity }))
  );

  const topBuyers = topBy(orders, (order) => [
    { key: order.buyer_username || "Unknown buyer", value: 1 },
  ]);

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 sm:p-6 space-y-8">
      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-text-muted mb-1">Sales by day</p>
        <p className="text-sm text-text-muted mb-4">What buyers ordered each day, last {TREND_DAYS} days.</p>
        {hasAnyOrders ? (
          <div className="max-h-64 overflow-y-auto rounded-xl border border-slate-100">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-slate-50">
                <tr>
                  <th className="text-left font-bold text-text-muted px-3 py-2">Day</th>
                  <th className="text-right font-bold text-text-muted px-3 py-2">Order value</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentTrend.map((day) => (
                  <tr key={day.key}>
                    <td className="px-3 py-2 text-text-primary font-semibold">{day.label}</td>
                    <td className="px-3 py-2 text-right tabular-nums text-text-primary">
                      {day.value > 0 ? fmtKES(day.value) : <span className="text-text-muted">—</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="h-32 flex items-center justify-center text-sm text-text-muted">
            No orders yet — this will fill in once buyers start ordering.
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2 border-t border-slate-100">
        <RankedList title="Best-selling products" rows={topProducts} unit="count" />
        <RankedList title="Buyers who order the most" rows={topBuyers} unit="count" />
      </div>
    </div>
  );
}
