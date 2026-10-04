"use client";

import Link from "next/link";
import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { PageSkeleton } from "@/components/ui/LoadingState";
import { orders, type ApiOrder, fmtKES, parsePrice, ApiError } from "@/lib/api";
import { useToast } from "@/components/ui/Toast";
import { useAuth } from "@/lib/auth-context";
import { buyerDisplayName } from "@/lib/order-status";
import {
  AlertCircle, BellRing, Check, CheckCircle, ChevronLeft,
  Clock, CreditCard, MessageSquareText, Pencil, Search, Wallet,
} from "lucide-react";

type PaymentFilter = "all" | "outstanding" | "verification" | "paid";

function formatClaimTime(iso: string): string {
  return new Date(iso).toLocaleString("en-KE", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
}

export default function SellerLedgerPage() {
  return (
    <Suspense fallback={<AppShell title="Payments"><PageSkeleton showKPIs={false} listCount={4} /></AppShell>}>
      <SellerLedger />
    </Suspense>
  );
}

function SellerLedger() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const payOrderIdParam = searchParams.get("pay");
  const { toast } = useToast();
  const { user } = useAuth();
  const [ledgerOrders, setLedgerOrders] = useState<ApiOrder[]>([]);
  const [filter, setFilter] = useState<PaymentFilter>("all");
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [payOrder, setPayOrder] = useState<ApiOrder | null>(null);
  const [payAmount, setPayAmount] = useState("");
  const [payRef, setPayRef] = useState("");
  const [payMethod, setPayMethod] = useState("mpesa");
  const [payClaimId, setPayClaimId] = useState<number | undefined>(undefined);
  const [paySaving, setPaySaving] = useState(false);
  const [remindingId, setRemindingId] = useState<number | null>(null);
  const [openingPayId, setOpeningPayId] = useState<number | null>(null);

  useEffect(() => { loadLedger(); }, []);

  const loadLedger = async () => {
    try {
      setIsLoading(true);
      setError(null);
      setLedgerOrders(await orders.sellerLedger());
    } catch (err) {
      console.error("Failed to load ledger:", err);
      setError(err instanceof ApiError ? err.message : "We could not load your payments.");
    } finally {
      setIsLoading(false);
    }
  };

  const openPay = async (order: ApiOrder, prefill?: { amount: number; reference: string; claimId?: number }) => {
    setOpeningPayId(order.id);
    let freshOrder = order;
    try {
      freshOrder = await orders.get(String(order.id));
    } catch {
      // Use the visible order if the status check cannot reach the API.
    } finally {
      setOpeningPayId(null);
    }
    if (!["locked", "debt_active"].includes(freshOrder.status)) {
      toast("This order was already paid. The list has been updated.", "info");
      await loadLedger();
      return;
    }
    setPayOrder(freshOrder);
    const balance = parsePrice(freshOrder.balance ?? freshOrder.final_total ?? freshOrder.total_price);
    setPayAmount(prefill ? String(prefill.amount) : String(balance));
    setPayRef(prefill?.reference || "");
    setPayClaimId(prefill?.claimId);
    setPayMethod("mpesa");
    router.push(`/seller/dashboard/ledger?pay=${freshOrder.id}`);
  };

  const handlePay = async () => {
    if (!payOrder) return;
    setPaySaving(true);
    try {
      await orders.recordPayment(payOrder.id, {
        amount: parseFloat(payAmount), payment_reference: payRef, payment_method: payMethod, claim_id: payClaimId,
      });
      router.push("/seller/dashboard/ledger");
      await loadLedger();
    } catch (err) {
      toast(err instanceof ApiError ? err.message : "Payment could not be recorded.", "error");
      if (err instanceof ApiError && err.status === 400) {
        router.push("/seller/dashboard/ledger");
        await loadLedger();
      }
    } finally {
      setPaySaving(false);
    }
  };

  const handleRemind = async (order: ApiOrder) => {
    setRemindingId(order.id);
    try {
      await orders.requestPayment(order.id);
      toast("Payment reminder sent to the buyer.", "success");
    } catch (err) {
      toast(err instanceof ApiError ? err.message : "We could not send the reminder.", "error");
    } finally {
      setRemindingId(null);
    }
  };

  const getPaymentState = (order: ApiOrder) => {
    const hasClaim = (order.payment_claims ?? []).some((claim) => !claim.resolved);
    if (hasClaim) return "verification";
    if (order.status === "cleared") return "paid";
    return "outstanding";
  };

  const totals = useMemo(() => {
    const received = ledgerOrders.reduce((sum, order) => sum + parsePrice(order.amount_paid ?? 0), 0);
    const outstanding = ledgerOrders.filter((order) => order.status !== "cleared")
      .reduce((sum, order) => sum + parsePrice(order.balance ?? order.final_total ?? order.total_price), 0);
    return { received, outstanding };
  }, [ledgerOrders]);

  const counts = useMemo(() => ({
    all: ledgerOrders.length,
    outstanding: ledgerOrders.filter((order) => getPaymentState(order) === "outstanding").length,
    verification: ledgerOrders.filter((order) => getPaymentState(order) === "verification").length,
    paid: ledgerOrders.filter((order) => getPaymentState(order) === "paid").length,
  }), [ledgerOrders]);

  const visibleOrders = useMemo(() => {
    const query = search.trim().toLowerCase();
    return ledgerOrders.filter((order) => {
      const matchesFilter = filter === "all" || getPaymentState(order) === filter;
      const matchesSearch = !query || buyerDisplayName(order).toLowerCase().includes(query)
        || String(order.id).includes(query)
        || (order.payment_reference || "").toLowerCase().includes(query);
      return matchesFilter && matchesSearch;
    });
  }, [filter, ledgerOrders, search]);

  const pendingVerification = ledgerOrders.flatMap((order) => (order.payment_claims ?? [])
    .filter((claim) => !claim.resolved).map((claim) => ({ order, claim })));
  const sellerProfile = user?.seller_profile;
  const paymentDetailRows = sellerProfile ? [
    sellerProfile.mpesa_till_number && { label: "Till Number", value: sellerProfile.mpesa_till_number },
    sellerProfile.mpesa_pochi_number && { label: "Pochi la Biashara", value: sellerProfile.mpesa_pochi_number },
    sellerProfile.mpesa_paybill_number && { label: "Paybill", value: sellerProfile.mpesa_paybill_account ? `${sellerProfile.mpesa_paybill_number} · Acc: ${sellerProfile.mpesa_paybill_account}` : sellerProfile.mpesa_paybill_number },
    sellerProfile.mpesa_send_money_number && { label: "Send Money", value: sellerProfile.mpesa_send_money_number },
  ].filter((row): row is { label: string; value: string } => !!row) : [];

  if (isLoading) return <AppShell title="Payments"><PageSkeleton showKPIs={false} listCount={4} /></AppShell>;
  if (error) return <AppShell title="Payments"><div className="flex min-h-[50vh] flex-col items-center justify-center gap-4"><p className="text-sm text-error">{error}</p><Button onClick={loadLedger} size="sm">Try again</Button></div></AppShell>;

  if (payOrderIdParam && payOrder) {
    return (
      <AppShell title="Record Payment">
        <div className="mx-auto max-w-xl space-y-5 p-4 sm:p-6">
          <button type="button" onClick={() => router.push("/seller/dashboard/ledger")} disabled={paySaving} className="inline-flex min-h-11 items-center gap-1 text-sm font-bold text-role disabled:opacity-50"><ChevronLeft size={16} /> Back to payments</button>
          <div><p className="text-xs font-black uppercase tracking-widest text-role">Payment action</p><h1 className="mt-1 text-2xl font-black text-foreground">Record payment</h1><p className="mt-1 text-sm text-muted-foreground">{buyerDisplayName(payOrder)} · {payClaimId != null ? "Check the buyer's reference before confirming." : "Log what the buyer sent you."}</p></div>
          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm space-y-4">
            <Input label="Amount (KES)" type="number" value={payAmount} onChange={(event) => setPayAmount(event.target.value)} />
            <Input label="Payment reference (e.g. M-Pesa code)" value={payRef} onChange={(event) => setPayRef(event.target.value)} placeholder="SAB2XYZ123" />
            <label className="block text-sm font-bold text-foreground" htmlFor="ledger-pay-method">Payment method</label>
            <select id="ledger-pay-method" value={payMethod} onChange={(event) => setPayMethod(event.target.value)} className="h-11 w-full rounded-lg border border-input bg-background px-3 text-base text-foreground"><option value="mpesa">M-Pesa</option><option value="cash">Cash</option><option value="bank_transfer">Bank transfer</option></select>
            <Button className="min-h-12 w-full" size="lg" onClick={handlePay} disabled={paySaving}>{paySaving ? "Saving payment..." : "Confirm and record payment"}</Button>
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell title="Payments">
      <main className="mx-auto max-w-6xl space-y-6 pb-24">
        <header className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6">
          <div><p className="text-xs font-black uppercase tracking-widest text-role">Seller payments</p><h1 className="mt-1 text-2xl font-black tracking-tight text-foreground sm:text-3xl">Know what to collect next</h1><p className="mt-1 max-w-2xl text-sm text-muted-foreground">Verify reported payments, follow up outstanding balances, and keep every order accounted for.</p></div>
          <div className="relative max-w-lg"><Search size={17} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search buyers, orders, or references..." className="h-12 w-full rounded-lg border border-input bg-background pl-10 pr-3 text-base text-foreground outline-none focus:border-role focus:ring-2 focus:ring-role/20" /></div>
        </header>

        {paymentDetailRows.length === 0 ? (
          <section className="rounded-2xl border-2 border-warning/40 bg-warning/10 p-5 shadow-sm sm:p-6"><div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><div className="flex gap-3"><AlertCircle className="mt-0.5 shrink-0 text-warning" size={23} /><div><h2 className="text-lg font-black text-foreground">Payment method not configured</h2><p className="mt-1 text-sm text-muted-foreground">Buyers cannot easily pay you until you add payment details.</p></div></div><Link href="/seller/dashboard/account" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-role-dark px-4 text-sm font-black text-white transition hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-ring"><CreditCard size={16} /> Add payment method</Link></div></section>
        ) : (
          <section className="rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-5"><div className="mb-3 flex items-center justify-between gap-3"><p className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-muted-foreground"><Wallet size={14} /> Payment method</p><Link href="/seller/dashboard/account" className="inline-flex min-h-10 items-center gap-1 text-xs font-bold text-role hover:opacity-80"><Pencil size={12} /> Edit</Link></div><div className="grid gap-2 sm:grid-cols-2">{paymentDetailRows.map((row) => <div key={row.label} className="flex items-center justify-between gap-3 rounded-lg bg-muted/40 px-3 py-2 text-sm"><span className="text-muted-foreground">{row.label}</span><span className="font-bold text-foreground">{row.value}</span></div>)}</div></section>
        )}

        {pendingVerification.length > 0 && (
          <section className="space-y-3"><div className="flex items-end justify-between gap-3"><div><p className="text-xs font-black uppercase tracking-widest text-warning">Verification required</p><h2 className="mt-1 text-xl font-black text-foreground">{pendingVerification.length} payment{pendingVerification.length === 1 ? "" : "s"} reported by buyers</h2></div><button type="button" onClick={() => setFilter("verification")} className="hidden min-h-10 items-center text-sm font-bold text-role hover:underline sm:inline-flex">View all</button></div><div className="grid gap-3">{pendingVerification.map(({ order, claim }) => <div key={claim.id} className="rounded-2xl border-2 border-warning/40 bg-warning/10 p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md sm:p-5"><div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><MessageSquareText size={17} className="text-warning" /><h3 className="font-black text-foreground">{buyerDisplayName(order)}</h3><span className="rounded-full border border-warning/30 bg-warning/15 px-2.5 py-1 text-xs font-black text-warning">Verification required</span></div><div className="mt-3 grid gap-1 text-sm text-muted-foreground sm:grid-cols-3 sm:gap-4"><span><strong className="text-foreground">Amount:</strong> {fmtKES(parsePrice(claim.amount))}</span><span><strong className="text-foreground">Reference:</strong> {claim.reference}</span><span><strong className="text-foreground">Date:</strong> {formatClaimTime(claim.submitted_at)}</span></div></div><Button variant="role" className="min-h-11 shrink-0 gap-2" loading={openingPayId === order.id} onClick={() => openPay(order, { amount: Number(claim.amount), reference: claim.reference, claimId: claim.id })}><CheckCircle size={16} /> Verify payment</Button></div></div>)}</div></section>
        )}

        {counts.outstanding > 0 && <section className="rounded-2xl border border-error/25 bg-error/5 p-5 shadow-sm sm:p-6"><div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-xs font-black uppercase tracking-widest text-error">Outstanding payments</p><p className="mt-1 text-3xl font-black tabular-nums text-foreground">{fmtKES(totals.outstanding)} <span className="text-base font-bold text-muted-foreground">owed to you</span></p><p className="mt-1 text-sm text-muted-foreground">{counts.outstanding} buyer{counts.outstanding === 1 ? "" : "s"} need follow-up.</p></div><button type="button" onClick={() => setFilter("outstanding")} className="inline-flex min-h-11 items-center justify-center rounded-lg border border-error/30 bg-card px-4 text-sm font-black text-error transition hover:-translate-y-0.5 hover:shadow focus-visible:ring-2 focus-visible:ring-ring">View outstanding balances</button></div></section>}

        <section className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6"><div className="mb-4 flex items-center gap-2"><Wallet size={18} className="text-role" /><h2 className="text-lg font-black text-foreground">Payment summary</h2></div><div className="grid divide-y divide-border sm:grid-cols-3 sm:divide-x sm:divide-y-0"><div className="pb-4 sm:px-5 sm:py-1 sm:first:pl-0 sm:pb-1"><p className="text-2xl font-black tabular-nums text-success">{fmtKES(totals.received)}</p><p className="mt-1 text-sm font-semibold text-muted-foreground">Received</p></div><div className="py-4 sm:px-5 sm:py-1"><p className="text-2xl font-black tabular-nums text-error">{fmtKES(totals.outstanding)}</p><p className="mt-1 text-sm font-semibold text-muted-foreground">Outstanding</p></div><div className="pt-4 sm:px-5 sm:py-1 sm:last:pr-0"><p className="text-2xl font-black tabular-nums text-role">{ledgerOrders.length}</p><p className="mt-1 text-sm font-semibold text-muted-foreground">Orders tracked</p></div></div></section>

        <section className="space-y-4"><div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-xs font-black uppercase tracking-widest text-muted-foreground">Payment history</p><h2 className="mt-1 text-xl font-black text-foreground">Choose what needs action</h2></div><div className="flex gap-2 overflow-x-auto pb-1">{(["all", "outstanding", "verification", "paid"] as PaymentFilter[]).map((key) => <button key={key} type="button" onClick={() => setFilter(key)} className={`min-h-11 shrink-0 rounded-lg border px-3 text-sm font-black transition focus-visible:ring-2 focus-visible:ring-ring ${filter === key ? "border-role-dark bg-role-dark text-white shadow-sm" : "border-border bg-card text-muted-foreground hover:border-role hover:text-foreground"}`}>{key === "all" ? "All" : key === "outstanding" ? "Outstanding" : key === "verification" ? "Verification" : "Paid"} <span className="ml-1 opacity-75">({counts[key]})</span></button>)}</div></div>
          {visibleOrders.length === 0 ? <div className="rounded-2xl border border-border bg-card p-12 text-center shadow-sm"><Wallet className="mx-auto mb-3 text-muted-foreground" size={40} /><p className="font-bold text-foreground">{ledgerOrders.length === 0 ? "No payments to track yet" : "No payments match this view"}</p><p className="mt-1 text-sm text-muted-foreground">{ledgerOrders.length === 0 ? "Orders will appear here once a final price is agreed." : "Try another filter or search term."}</p></div> : <div className="space-y-3">{visibleOrders.map((order) => <PaymentCard key={order.id} order={order} state={getPaymentState(order)} openingPayId={openingPayId} remindingId={remindingId} onVerify={openPay} onRecord={openPay} onRemind={handleRemind} />)}</div>}
        </section>
      </main>
    </AppShell>
  );
}

function PaymentCard({ order, state, openingPayId, remindingId, onVerify, onRecord, onRemind }: {
  order: ApiOrder;
  state: Exclude<PaymentFilter, "all">;
  openingPayId: number | null;
  remindingId: number | null;
  onVerify: (order: ApiOrder, prefill: { amount: number; reference: string; claimId?: number }) => void;
  onRecord: (order: ApiOrder) => void;
  onRemind: (order: ApiOrder) => void;
}) {
  const total = parsePrice(order.final_total ?? order.total_price);
  const paid = parsePrice(order.amount_paid ?? 0);
  const balance = parsePrice(order.balance ?? total - paid);
  const claim = (order.payment_claims ?? []).find((item) => !item.resolved);
  const isPaid = state === "paid";
  const statusLabel = state === "verification" ? "Verification required" : isPaid ? "Paid" : order.status === "debt_active" ? "Awaiting payment" : "Outstanding";
  const statusClass = state === "verification" ? "bg-warning/15 text-warning border-warning/30" : isPaid ? "bg-success/15 text-success border-success/30" : "bg-error/10 text-error border-error/30";
  return (
    <article className="rounded-2xl border border-border bg-card p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md sm:p-6">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><h3 className="text-lg font-black text-foreground">{buyerDisplayName(order)}</h3><span className={`rounded-full border px-2.5 py-1 text-xs font-black ${statusClass}`}>{statusLabel}</span></div><p className="mt-1 text-xs font-semibold text-muted-foreground">Order #{order.id} · {new Date(order.created_at).toLocaleDateString("en-KE", { day: "numeric", month: "short", year: "numeric" })}</p>{!isPaid ? <><p className="mt-4 text-3xl font-black tabular-nums text-error">{fmtKES(balance)} <span className="text-base font-bold text-muted-foreground">Outstanding</span></p><div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground"><span>Total: <strong className="text-foreground">{fmtKES(total)}</strong></span><span>Paid: <strong className="text-foreground">{fmtKES(paid)}</strong></span></div><div className="mt-3 h-2 max-w-md overflow-hidden rounded-full bg-muted" aria-label={`${Math.round(total ? (paid / total) * 100 : 0)} percent paid`}><div className="h-full rounded-full bg-role-dark transition-all" style={{ width: `${Math.min(100, total ? (paid / total) * 100 : 0)}%` }} /></div></> : <p className="mt-4 text-2xl font-black tabular-nums text-success">{fmtKES(paid)} <span className="text-base font-bold text-muted-foreground">Received</span></p>}{claim && <p className="mt-3 flex items-center gap-1.5 text-sm font-bold text-warning"><Clock size={14} /> Buyer reported {fmtKES(parsePrice(claim.amount))} · {claim.reference}</p>}</div>
        <div className="flex shrink-0 flex-col items-stretch gap-2 sm:flex-row lg:flex-col lg:items-stretch">{claim && <Button variant="role" className="min-h-11 gap-2" loading={openingPayId === order.id} onClick={() => onVerify(order, { amount: Number(claim.amount), reference: claim.reference, claimId: claim.id })}><Check size={16} /> Verify payment</Button>}{!isPaid && !claim && <Button variant="role" className="min-h-11 gap-2" loading={openingPayId === order.id} onClick={() => onRecord(order)}><CheckCircle size={16} /> Record payment</Button>}{!isPaid && order.status === "debt_active" && <Button variant="outline" className="min-h-11 gap-2" loading={remindingId === order.id} onClick={() => onRemind(order)}><BellRing size={15} /> Send reminder</Button>}{isPaid && <span className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-success/30 bg-success/10 px-4 text-sm font-black text-success"><CheckCircle size={16} /> Payment complete</span>}</div>
      </div>
    </article>
  );
}
