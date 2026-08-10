"use client";

import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { fmtKES, parsePrice, type ApiOrder } from "@/lib/api";

interface SalesInsightsProps {
  orders: ApiOrder[];
}

const TREND_DAYS = 14;
const ROLE_COLOR = "rgb(var(--role, 124 58 237))";

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
 * Sales trend + top products/buyers — all computed client-side from the
 * seller's own order list (no new backend endpoint). "Sales" here means
 * order value placed per day, not cash collected — that's the ledger's job.
 */
export function SalesInsights({ orders }: SalesInsightsProps) {
  const trend = buildDailyTrend(orders);
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
        <p className="text-xs font-bold uppercase tracking-wider text-text-muted mb-1">Sales trend</p>
        <p className="text-sm text-text-muted mb-4">Order value placed per day, last {TREND_DAYS} days.</p>
        {hasAnyOrders ? (
          <div className="h-48 -ml-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trend} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="salesFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={ROLE_COLOR} stopOpacity={0.25} />
                    <stop offset="100%" stopColor={ROLE_COLOR} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} stroke="#F1F5F9" />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 11, fill: "#6B6459" }}
                  axisLine={false}
                  tickLine={false}
                  interval={2}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "#6B6459" }}
                  axisLine={false}
                  tickLine={false}
                  width={40}
                  tickFormatter={(v) => (v >= 1000 ? `${Math.round(v / 1000)}k` : String(v))}
                />
                <Tooltip
                  formatter={(value) => [fmtKES(Number(value) || 0), "Order value"]}
                  contentStyle={{ borderRadius: 12, border: "1px solid #F1F5F9", fontSize: 12 }}
                />
                <Area type="monotone" dataKey="value" stroke={ROLE_COLOR} strokeWidth={2} fill="url(#salesFill)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-32 flex items-center justify-center text-sm text-text-muted">
            No orders yet — the trend will appear once buyers start ordering.
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2 border-t border-slate-100">
        <RankedList title="Top products (by units ordered)" rows={topProducts} unit="count" />
        <RankedList title="Top buyers (by order count)" rows={topBuyers} unit="count" />
      </div>
    </div>
  );
}
