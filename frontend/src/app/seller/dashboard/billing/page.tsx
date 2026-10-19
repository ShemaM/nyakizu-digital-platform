"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowDownLeft, ArrowLeft, ArrowUpRight, BadgeCheck, Banknote,
  CreditCard, Info, ReceiptText, ShieldCheck, Wallet,
} from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { PageSkeleton } from "@/components/ui/LoadingState";
import { ApiError, fmtKES, sellerBilling, type SellerBillingHistory } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";

type Tab = "ledger" | "topups";

const movementLabels: Record<SellerBillingHistory["ledger"][number]["kind"], string> = {
  fee_charged: "Per-order fee",
  fee_refunded: "Fee refunded",
  top_up: "Credit top-up",
  adjustment: "Account adjustment",
};

function dateTime(value: string) {
  return new Date(value).toLocaleString("en-KE", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

export default function SellerBillingPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [history, setHistory] = useState<SellerBillingHistory | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>("ledger");

  useEffect(() => {
    if (authLoading) return;
    if (!user || user.role !== "seller" || user.seller_profile?.approval_status !== "approved") {
      setLoading(false);
      return;
    }
    sellerBilling.history().then(setHistory).catch((reason: unknown) => {
      if (reason instanceof ApiError && reason.status === 403) {
        setError("Billing history becomes available after your shop is approved.");
      } else {
        setError(reason instanceof Error ? reason.message : "Billing history could not be loaded.");
      }
    }).finally(() => setLoading(false));
  }, [authLoading, user]);

  if (authLoading || !user || (loading && !history && !error)) {
    return <AppShell title="Billing"><PageSkeleton showKPIs listCount={4} /></AppShell>;
  }

  if (user.role === "seller" && user.seller_profile?.approval_status !== "approved") {
    return <AppShell title="Billing"><div className="mx-auto max-w-2xl space-y-3 py-12 text-center"><ShieldCheck className="mx-auto text-muted-foreground" size={34} /><h2 className="text-xl font-black text-foreground">Billing is available after approval</h2><p className="text-sm text-muted-foreground">Once your shop is approved, this page will show your fee statement and seller credit history.</p></div></AppShell>;
  }

  const summary = history?.summary;
  const fee = summary?.fee_schedule;
  const credit = Number(summary?.credit_kes ?? 0);
  const allowance = fee?.free_orders_allowance ?? 3;
  const used = summary?.free_orders_used ?? 0;
  const usedFree = Math.min(used, allowance);

  return (
    <AppShell title="Billing">
      <main className="mx-auto max-w-5xl space-y-8 pb-8">
        <div>
          <Link href="/seller/dashboard" className="mb-4 inline-flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-foreground"><ArrowLeft size={14} /> Seller dashboard</Link>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div><p className="text-xs font-bold uppercase tracking-[0.18em] text-role">Seller account</p><h1 className="mt-1 text-3xl font-black tracking-tight text-foreground">Billing & fees</h1><p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">Your per-order service fees, free order allowance, and seller credit statement.</p></div>
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-2 text-xs font-semibold text-muted-foreground"><BadgeCheck size={14} className="text-role" />{summary?.account_number || "Seller billing account"}</span>
          </div>
        </div>

        {error && <div role="alert" className="rounded-2xl border border-warning/25 bg-warning/5 p-4 text-sm text-foreground">{error}<button type="button" onClick={() => { setLoading(true); setError(null); sellerBilling.history().then(setHistory).catch(() => setError("Billing history could not be loaded. Please try again.")).finally(() => setLoading(false)); }} className="ml-3 font-bold text-role underline">Retry</button></div>}

        {summary && fee && <>
          <section aria-label="Seller billing summary" className="grid gap-3 sm:grid-cols-2">
            <article className={`rounded-2xl border p-5 ${credit < 0 ? "border-error/25 bg-error/5" : "border-border bg-card"}`}><div className="flex items-center justify-between"><p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Seller credit balance</p><Wallet size={17} className={credit < 0 ? "text-error" : "text-role"} /></div><p className={`mt-3 text-3xl font-black tabular-nums ${credit < 0 ? "text-error" : "text-foreground"}`}>{fmtKES(summary.credit_kes)}</p><p className="mt-2 text-xs text-muted-foreground">{credit < 0 ? "Amount currently owed for service fees" : "Prepaid credit available for service fees"}</p></article>
            <article className="rounded-2xl border border-border bg-card p-5"><div className="flex items-center justify-between"><p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Free order allowance</p><ReceiptText size={17} className="text-role" /></div><p className="mt-3 text-3xl font-black tabular-nums text-foreground">{summary.free_orders_remaining}<span className="ml-1 text-base font-semibold text-muted-foreground">left</span></p><div className="mt-3 flex gap-1.5" aria-label={`${usedFree} of ${allowance} free orders used`}>{Array.from({ length: allowance }, (_, index) => <span key={index} className={`h-1.5 flex-1 rounded-full ${index < usedFree ? "bg-role" : "bg-muted"}`} />)}</div><p className="mt-2 text-xs text-muted-foreground">{used} of {allowance} free eligible orders used</p></article>
          </section>

          <section className="rounded-2xl border border-border bg-card p-5 sm:p-6">
            <div className="flex items-start gap-3"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-role-soft text-role"><Info size={17} /></span><div className="min-w-0 flex-1"><h2 className="font-bold text-foreground">How your fees work</h2><p className="mt-1 text-sm leading-6 text-muted-foreground">Your first {allowance} eligible orders are free. After that, a service fee is recorded when an order is locked. There is no recurring subscription charge.</p></div></div>
            <div className="mt-5 grid gap-3 border-t border-border pt-4 sm:grid-cols-3"><FeeFact label="Rate" value={`${fee.rate_percent}%`} /><FeeFact label="Minimum fee" value={fmtKES(fee.min_fee_kes)} /><FeeFact label="Maximum fee" value={fmtKES(fee.max_fee_kes)} /></div>
            <div className={`mt-4 rounded-xl px-4 py-3 text-xs leading-5 ${summary.charging_enabled ? "bg-success/8 text-muted-foreground" : "bg-warning/8 text-muted-foreground"}`}><span className="font-bold text-foreground">{summary.charging_enabled ? "Per-order charging is active." : "New per-order charging is currently off."}</span> {summary.charging_enabled ? "Fees apply to eligible orders after your free allowance." : "Your existing statement remains available; orders are not currently adding new fees."}</div>
          </section>

          <section className="space-y-4">
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end"><div><h2 className="text-xl font-black text-foreground">Billing history</h2><p className="mt-1 text-sm text-muted-foreground">These are Nyakizu service fees and seller-credit movements, separate from buyer payments for your orders.</p></div><div role="tablist" aria-label="Seller billing record type" className="inline-flex w-fit rounded-xl border border-border bg-muted/40 p-1"><button type="button" role="tab" aria-selected={tab === "ledger"} onClick={() => setTab("ledger")} className={`rounded-lg px-3.5 py-2 text-xs font-bold ${tab === "ledger" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"}`}>Fee ledger</button><button type="button" role="tab" aria-selected={tab === "topups"} onClick={() => setTab("topups")} className={`rounded-lg px-3.5 py-2 text-xs font-bold ${tab === "topups" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"}`}>M-Pesa top-ups</button></div></div>
            {loading && <p className="border-y border-border py-8 text-center text-sm text-muted-foreground">Loading statement…</p>}
            {!loading && tab === "ledger" && <div className="divide-y divide-border border-y border-border">{history?.ledger.length ? history.ledger.map((entry) => {
              const debit = entry.amount_kes.startsWith("-");
              const Icon = debit ? ArrowDownLeft : ArrowUpRight;
              return <article key={entry.id} className="flex items-center gap-3 py-4"><span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${debit ? "bg-warning/10 text-warning" : "bg-success/10 text-success"}`}><Icon size={18} /></span><div className="min-w-0 flex-1"><p className="truncate text-sm font-bold text-foreground">{movementLabels[entry.kind]}{entry.order_id ? ` · Order #${entry.order_id}` : ""}</p><p className="mt-1 truncate text-xs text-muted-foreground">{entry.note || dateTime(entry.created_at)}{entry.note ? ` · ${dateTime(entry.created_at)}` : ""}</p></div><div className="shrink-0 text-right"><p className={`text-sm font-black tabular-nums ${debit ? "text-warning" : "text-success"}`}>{debit ? "−" : "+"}{fmtKES(entry.amount_kes.replace(/^-/, ""))}</p><p className="mt-1 text-[10px] text-muted-foreground">Balance {fmtKES(entry.balance_after_kes)}</p></div></article>;
            }) : <Empty message="No billing ledger movements yet." />}</div>}
            {!loading && tab === "topups" && <div className="divide-y divide-border border-y border-border">{history?.payments.length ? history.payments.map((payment) => <article key={payment.id} className="flex items-center gap-3 py-4"><span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${payment.status === "success" ? "bg-success/10 text-success" : payment.status === "failed" ? "bg-error/10 text-error" : "bg-warning/10 text-warning"}`}><CreditCard size={18} /></span><div className="min-w-0 flex-1"><p className="truncate text-sm font-bold text-foreground">M-Pesa credit top-up</p><p className="mt-1 truncate text-xs text-muted-foreground">{payment.reference} · {dateTime(payment.created_at)}</p></div><div className="shrink-0 text-right"><p className="text-sm font-black tabular-nums text-foreground">{fmtKES(payment.amount_kes)}</p><p className={`mt-1 text-[10px] font-bold uppercase ${payment.status === "success" ? "text-success" : payment.status === "failed" ? "text-error" : "text-warning"}`}>{payment.status}</p></div></article>) : <Empty message="No M-Pesa top-ups recorded." />}</div>}
          </section>
        </>}
      </main>
    </AppShell>
  );
}

function FeeFact({ label, value }: { label: string; value: string }) {
  return <div className="rounded-xl bg-muted/50 p-3"><p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{label}</p><p className="mt-1 text-sm font-black text-foreground">{value}</p></div>;
}

function Empty({ message }: { message: string }) {
  return <div className="border-y border-border py-10 text-center"><Banknote className="mx-auto mb-2 text-muted-foreground" size={24} /><p className="text-sm font-semibold text-foreground">{message}</p><p className="mt-1 text-xs text-muted-foreground">Your service billing activity will show here.</p></div>;
}
