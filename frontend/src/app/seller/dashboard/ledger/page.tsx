"use client";

import Link from "next/link";
import { Suspense, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { Container, Section } from "@/components/layouts";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { PageSkeleton } from "@/components/ui/LoadingState";
import { orders, type ApiOrder, fmtKES, parsePrice, ApiError } from "@/lib/api";
import { useToast } from "@/components/ui/Toast";
import { useAuth } from "@/lib/auth-context";
import { buyerDisplayName, buyerFirstName } from "@/lib/order-status";
import { RefreshCw, Wallet, CheckCircle, TrendingUp, AlertCircle, MessageSquareText, Clock, BellRing, Pencil, ChevronLeft } from "lucide-react";

function formatClaimTime(iso: string): string {
  return new Date(iso).toLocaleString("en-KE", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
}

export default function SellerLedgerPage() {
  return (
    <Suspense
      fallback={
        <AppShell title="Payments">
          <PageSkeleton showKPIs listCount={4} />
        </AppShell>
      }
    >
      <SellerLedger />
    </Suspense>
  );
}

function SellerLedger() {
  const router = useRouter();
  const searchParams = useSearchParams();
  // "Record Payment" used to be a Dialog with three form fields — on a
  // phone that's a keyboard fighting for the same space the confirm
  // buttons need. A full page (this same route, ?pay=<order id>) gives it
  // room and gets bottom-nav clearance the normal way, like every other
  // page — no fixed-position overlay to fight a mobile browser's toolbar.
  const payOrderIdParam = searchParams.get("pay");
  const { toast } = useToast();
  const { user } = useAuth();
  const [ledgerOrders, setLedgerOrders] = useState<ApiOrder[]>([]);
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

  useEffect(() => {
    loadLedger();
  }, []);

  const loadLedger = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await orders.sellerLedger();
      setLedgerOrders(data);
    } catch (err) {
      console.error("Failed to load ledger:", err);
      setError(err instanceof ApiError ? err.message : "We could not load your payments.");
    } finally {
      setIsLoading(false);
    }
  };

  const openPay = async (order: ApiOrder, prefill?: { amount: number; reference: string; claimId?: number }) => {
    // The list on screen can go stale — e.g. this same order was just paid
    // off from the fulfill page in another tab, or a second claim landed
    // after this page loaded. Re-check the real status before opening the
    // dialog rather than trusting whatever's already in memory.
    setOpeningPayId(order.id);
    let freshOrder = order;
    try {
      freshOrder = await orders.get(String(order.id));
    } catch {
      // Couldn't refresh — fall back to what we already have rather than blocking the seller.
    } finally {
      setOpeningPayId(null);
    }

    if (!["locked", "debt_active"].includes(freshOrder.status)) {
      toast("This order was already paid. Refreshing.", "info");
      await loadLedger();
      return;
    }

    setPayOrder(freshOrder);
    if (prefill) {
      setPayAmount(String(prefill.amount));
      setPayRef(prefill.reference);
      setPayClaimId(prefill.claimId);
    } else {
      const bal = parsePrice(freshOrder.balance ?? freshOrder.final_total ?? freshOrder.total_price);
      setPayAmount(String(bal));
      setPayRef("");
      setPayClaimId(undefined);
    }
    setPayMethod("mpesa");
    router.push(`/seller/dashboard/ledger?pay=${freshOrder.id}`);
  };

  const handlePay = async () => {
    if (!payOrder) return;
    setPaySaving(true);
    try {
      await orders.recordPayment(payOrder.id, {
        amount: parseFloat(payAmount),
        payment_reference: payRef,
        payment_method: payMethod,
        claim_id: payClaimId,
      });
      router.push("/seller/dashboard/ledger");
      await loadLedger();
    } catch (err) {
      console.error("Payment failed:", err);
      toast(err instanceof ApiError ? err.message : "Payment failed.", "error");
      // The order's real status moved out from under us (e.g. already paid
      // off elsewhere) — resync the list so the stale card doesn't linger.
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
      toast("Reminder sent to the buyer.", "success");
    } catch (err) {
      console.error("Reminder failed:", err);
      toast(err instanceof ApiError ? err.message : "We could not send the reminder.", "error");
    } finally {
      setRemindingId(null);
    }
  };

  const totalOwed = ledgerOrders
    .filter((o) => o.status !== "cleared")
    .reduce((s, o) => s + parsePrice(o.balance ?? o.final_total ?? o.total_price), 0);

  const totalReceived = ledgerOrders
    .filter((o) => o.status === "cleared" || parsePrice(o.amount_paid ?? 0) > 0)
    .reduce((s, o) => s + parsePrice(o.amount_paid ?? 0), 0);

  // "Money expected" — groups open debts by when the buyer said they'd
  // pay, so the seller can plan around it (e.g. "KES 40,000 due this week"
  // before committing to a big restock) instead of just seeing one flat
  // owed total with no sense of timing.
  const debtOrders = ledgerOrders.filter((o) => o.status === "debt_active");
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const inNDays = (n: number) => {
    const d = new Date(today);
    d.setDate(d.getDate() + n);
    return d;
  };
  const forecastBuckets: { key: string; label: string; tone: "error" | "warning" | "role" | "default"; orders: ApiOrder[] }[] = [
    { key: "late", label: "Late", tone: "error", orders: [] },
    { key: "today", label: "Today", tone: "warning", orders: [] },
    { key: "week", label: "This week", tone: "role", orders: [] },
    { key: "later", label: "Later", tone: "default", orders: [] },
    { key: "none", label: "No date yet", tone: "default", orders: [] },
  ];
  for (const order of debtOrders) {
    if (!order.expected_payment_date) {
      forecastBuckets[4].orders.push(order);
      continue;
    }
    const due = new Date(order.expected_payment_date + "T00:00:00");
    if (order.is_payment_late || due < today) forecastBuckets[0].orders.push(order);
    else if (due.getTime() === today.getTime()) forecastBuckets[1].orders.push(order);
    else if (due < inNDays(7)) forecastBuckets[2].orders.push(order);
    else forecastBuckets[3].orders.push(order);
  }
  const visibleForecastBuckets = forecastBuckets.filter((b) => b.orders.length > 0);
  const bucketSum = (bucketOrders: ApiOrder[]) =>
    bucketOrders.reduce((s, o) => s + parsePrice(o.balance ?? o.final_total ?? o.total_price), 0);

  const sellerProfile = user?.seller_profile;
  const paymentDetailRows = sellerProfile
    ? [
        sellerProfile.mpesa_till_number && { label: "Till Number", value: sellerProfile.mpesa_till_number },
        sellerProfile.mpesa_pochi_number && { label: "Pochi la Biashara", value: sellerProfile.mpesa_pochi_number },
        sellerProfile.mpesa_paybill_number && {
          label: "Paybill",
          value: sellerProfile.mpesa_paybill_account
            ? `${sellerProfile.mpesa_paybill_number} · Acc: ${sellerProfile.mpesa_paybill_account}`
            : sellerProfile.mpesa_paybill_number,
        },
        sellerProfile.mpesa_send_money_number && { label: "Send Money", value: sellerProfile.mpesa_send_money_number },
      ].filter((row): row is { label: string; value: string } => !!row)
    : [];

  if (isLoading) {
    return (
      <AppShell title="Payments">
        <PageSkeleton showKPIs listCount={4} />
      </AppShell>
    );
  }

  if (error) {
    return (
      <AppShell title="Payments">
        <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
          <p className="text-error text-sm">{error}</p>
          <Button onClick={loadLedger} size="sm">Retry</Button>
        </div>
      </AppShell>
    );
  }

  const STAT_CARDS = [
    { label: "Total received", value: fmtKES(totalReceived), Icon: TrendingUp, color: "text-success", bg: "bg-success/12" },
    { label: "Still owed to you", value: fmtKES(totalOwed), Icon: AlertCircle, color: "text-error", bg: "bg-error/12" },
    { label: "Total orders", value: String(ledgerOrders.length), Icon: Wallet, color: "text-role", bg: "bg-role-soft" },
  ];

  return (
    <AppShell title={payOrderIdParam && payOrder ? `Record Payment` : "Payments"}>
      {!payOrderIdParam && (
      <Section spacing="md">
        <Container size="xl" className="space-y-8">
          <SectionHeading
            eyebrow="Payments"
            title="Money owed to you"
            description="Track what buyers owe you and record payments as they come in."
            action={
              <Button variant="outline" size="lg" onClick={loadLedger} className="gap-2">
                <RefreshCw size={16} /> Refresh
              </Button>
            }
          />

          {/* Your payment details — pulled straight from Account, so the
              seller doesn't have to leave this page to check what buyers
              see when it's time to pay. */}
          <Card>
            <CardContent className="p-5 sm:p-6">
              <div className="flex items-center justify-between gap-3 mb-3">
                <p className="text-xs font-black text-text-muted uppercase tracking-widest flex items-center gap-2">
                  <Wallet size={12} /> Your Payment Details
                </p>
                <Link
                  href="/seller/dashboard/account"
                  className="flex items-center gap-1 text-xs font-bold text-role hover:opacity-80 shrink-0"
                >
                  <Pencil size={11} /> Edit
                </Link>
              </div>
              {paymentDetailRows.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5">
                  {paymentDetailRows.map((row) => (
                    <div key={row.label} className="flex items-center justify-between gap-3 text-sm">
                      <span className="text-text-muted">{row.label}</span>
                      <span className="font-bold text-text-primary">{row.value}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-text-muted">
                  You haven&apos;t added how buyers should pay you yet.{" "}
                  <Link href="/seller/dashboard/account" className="font-bold text-role hover:opacity-80">
                    Add it now
                  </Link>
                  .
                </p>
              )}
            </CardContent>
          </Card>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {STAT_CARDS.map(({ label, value, Icon, color, bg }) => (
              <Card key={label}>
                <CardContent className="p-5 sm:p-6 flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${bg}`}>
                    <Icon className={`w-6 h-6 ${color}`} />
                  </div>
                  <div className="min-w-0">
                    <p className={`text-xl sm:text-2xl font-black truncate ${color}`}>{value}</p>
                    <p className="text-xs sm:text-sm font-semibold text-text-muted">{label}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Money expected — when open debts are due, not just how much */}
          {visibleForecastBuckets.length > 0 && (
            <div>
              <SectionHeading
                title="Money expected"
                description="What's still owed, grouped by when buyers said they'd pay. Useful before a big restock."
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {visibleForecastBuckets.map((bucket) => (
                  <Card key={bucket.key}>
                    <CardContent className="p-4 sm:p-5">
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <Badge variant={bucket.tone}>{bucket.label}</Badge>
                        <span className="text-xs font-bold text-text-muted">
                          {bucket.orders.length} order{bucket.orders.length !== 1 ? "s" : ""}
                        </span>
                      </div>
                      <p className="text-xl font-black text-text-primary tabular-nums">{fmtKES(bucketSum(bucket.orders))}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Transactions */}
          <div>
            <SectionHeading title="All payments" description="Every order where the price is final and you're tracking payment." />

            {ledgerOrders.length === 0 ? (
              <div className="bg-white border border-slate-100 rounded-2xl p-12 text-center text-text-muted flex flex-col items-center justify-center min-h-[260px]">
                <Wallet className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                <p className="text-body font-bold text-text-secondary">No orders to track yet</p>
                <p className="text-caption text-text-muted mt-1">Orders will show up here once you and the buyer agree on a final price.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {ledgerOrders.map((order) => {
                  const total = parsePrice(order.final_total ?? order.total_price);
                  const paid = parsePrice(order.amount_paid ?? 0);
                  const bal = parsePrice(order.balance ?? total - paid);
                  const isCleared = order.status === "cleared";
                  const progress = total > 0 ? (paid / total) * 100 : 0;
                  const pendingClaims = (order.payment_claims ?? []).filter((c) => !c.resolved);

                  return (
                    <Card key={order.id}>
                      <CardContent className="p-5 sm:p-6">
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                          <div className="space-y-1.5 flex-1 min-w-0">
                            <div className="flex items-center gap-3 flex-wrap">
                              <h3 className="text-body font-bold text-text-primary">{buyerDisplayName(order)}</h3>
                              <Badge variant={isCleared ? "success" : order.status === "debt_active" ? "error" : "warning"}>
                                {isCleared ? "Paid" : order.status === "debt_active" ? "Debt" : "Partial"}
                              </Badge>
                            </div>
                            {!isCleared && <ProgressBar percent={progress} tone="warning" className="max-w-xs mt-2" />}
                            <div className="flex items-center gap-4 text-caption text-text-muted mt-2">
                              <span>Total: {fmtKES(total)}</span>
                              <span>Paid: {fmtKES(paid)}</span>
                              {!isCleared && <span className="text-error font-bold">Balance: {fmtKES(bal)}</span>}
                            </div>
                            {order.payment_reference && (
                              <p className="text-caption text-text-muted">
                                Ref: {order.payment_reference}
                              </p>
                            )}
                            {order.status === "debt_active" && order.expected_payment_date && (
                              <p className="text-caption text-text-muted flex items-center gap-1.5">
                                Expected {new Date(order.expected_payment_date + "T00:00:00").toLocaleDateString("en-KE", { day: "numeric", month: "short" })}
                                {order.is_payment_late && <Badge variant="error">Late</Badge>}
                              </p>
                            )}
                          </div>
                          <div className="shrink-0 flex flex-col items-stretch sm:items-end gap-2">
                            {!isCleared && (
                              <Button
                                variant={pendingClaims.length > 0 ? "outline" : "default"}
                                size={pendingClaims.length > 0 ? "sm" : "lg"}
                                className="gap-1.5"
                                loading={openingPayId === order.id}
                                onClick={() => openPay(order)}
                              >
                                <CheckCircle size={16} /> {pendingClaims.length > 0 ? "Record a different payment" : "Record Payment"}
                              </Button>
                            )}
                            {order.status === "debt_active" && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="gap-1.5"
                                loading={remindingId === order.id}
                                onClick={() => handleRemind(order)}
                              >
                                <BellRing size={14} /> Remind Buyer
                              </Button>
                            )}
                            {isCleared && (
                              <Badge variant="success">
                                <CheckCircle size={12} className="mr-1" /> Paid
                              </Badge>
                            )}
                          </div>
                        </div>

                        {pendingClaims.length > 0 && (
                          <div className="mt-4 pt-4 border-t border-slate-100 space-y-2.5">
                            <p className="text-xs font-black text-warning uppercase tracking-widest flex items-center gap-2">
                              <MessageSquareText size={12} /> {buyerFirstName(order)} Says They Paid
                            </p>
                            {pendingClaims.map((claim) => (
                              <div key={claim.id} className="rounded-xl border-2 border-warning/30 bg-warning/5 p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                <div className="min-w-0">
                                  <p className="text-lg font-black text-text-primary">{fmtKES(claim.amount)}</p>
                                  <p className="text-sm font-bold text-text-secondary">{claim.reference}</p>
                                  <p className="text-[11px] text-text-muted flex items-center gap-1 mt-0.5">
                                    <Clock size={10} /> Sent {formatClaimTime(claim.submitted_at)}
                                  </p>
                                </div>
                                <Button
                                  variant="role"
                                  size="sm"
                                  className="shrink-0"
                                  loading={openingPayId === order.id}
                                  onClick={() => openPay(order, { amount: Number(claim.amount), reference: claim.reference, claimId: claim.id })}
                                >
                                  Check M-Pesa &amp; Confirm
                                </Button>
                              </div>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </Container>
      </Section>
      )}

      {/* Record Payment — a full page instead of a Dialog: three form
          fields plus an on-screen keyboard is a poor fit for a modal
          sharing the screen with the bottom nav. */}
      {payOrderIdParam && payOrder && (
        <div className="p-4 sm:p-6 max-w-xl mx-auto space-y-4">
          <button
            type="button"
            onClick={() => router.push("/seller/dashboard/ledger")}
            disabled={paySaving}
            className="inline-flex items-center gap-1 text-sm font-bold text-role disabled:opacity-50"
          >
            <ChevronLeft size={16} /> Back
          </button>
          <div>
            <h2 className="text-xl font-black text-text-primary">Record Payment for {buyerDisplayName(payOrder)}</h2>
            <p className="text-sm text-text-secondary mt-1">
              {payClaimId != null
                ? "Filled in from what the buyer told us. Check your M-Pesa matches, then save."
                : "Log what they sent you. The balance owed updates automatically."}
            </p>
          </div>
          <div className="space-y-3">
            <Input
              label="Amount (KES)"
              type="number"
              value={payAmount}
              onChange={(e) => setPayAmount(e.target.value)}
            />
            <Input
              label="Payment Reference (e.g. M-Pesa code)"
              type="text"
              value={payRef}
              onChange={(e) => setPayRef(e.target.value)}
              placeholder="SAB2XYZ123"
            />
            <div className="space-y-1">
              <label htmlFor="ledger-pay-method" className="text-label">Payment Method</label>
              <select
                id="ledger-pay-method"
                value={payMethod}
                onChange={(e) => setPayMethod(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm text-text-primary"
              >
                <option value="mpesa">M-Pesa</option>
                <option value="cash">Cash</option>
                <option value="bank_transfer">Bank Transfer</option>
              </select>
            </div>
          </div>
          <Button className="w-full rounded-xl" size="lg" onClick={handlePay} disabled={paySaving}>
            {paySaving ? "Saving..." : "Record Payment"}
          </Button>
        </div>
      )}
    </AppShell>
  );
}
