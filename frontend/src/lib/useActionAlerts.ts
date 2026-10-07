"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { orders, relationships, parsePrice } from "@/lib/api";
import { setAppBadge } from "@/lib/push";

export interface ActionAlert {
  id: string;
  count: number;
  text: string;
  href: string;
}

const POLL_MS = 6000;

/**
 * Plain-language "things that need you" alerts shown from the header bell.
 * Deliberately derived from live status fields:
 * - For sellers: new submitted orders, pending buyer requests, unpaid debts.
 * - For buyers: approved store access requests, orders ready to pay, overdue payments.
 * Automatically polls silently in the background and refreshes immediately on tab focus.
 */
export function useActionAlerts() {
  const { user } = useAuth();
  const [alerts, setAlerts] = useState<ActionAlert[]>([]);

  const acknowledgeAlert = useCallback((alertId: string) => {
    if (!user) return;
    if (alertId.startsWith("approval-")) {
      const relId = parseInt(alertId.replace("approval-", ""), 10);
      if (!isNaN(relId)) {
        try {
          const ackKey = `acknowledged_approvals_${user.id}`;
          const raw = localStorage.getItem(ackKey);
          const current: number[] = raw ? JSON.parse(raw) : [];
          if (!current.includes(relId)) {
            current.push(relId);
            localStorage.setItem(ackKey, JSON.stringify(current));
          }
        } catch {}
      }
    }
    setAlerts((prev) => {
      const filtered = prev.filter((a) => a.id !== alertId);
      setAppBadge(filtered.reduce((s, a) => s + a.count, 0));
      return filtered;
    });
  }, [user]);

  const refresh = useCallback(async () => {
    if (!user) {
      setAlerts([]);
      setAppBadge(0);
      return;
    }

    try {
      if (user.role === "seller") {
        const [orderList, relationshipList] = await Promise.all([
          orders.sellerList().catch(() => []),
          relationships.mine().catch(() => []),
        ]);

        const newOrders = orderList.filter((o) => o.status === "submitted");
        const pendingBuyers = relationshipList.filter((r) => r.status === "pending");
        const lateDebts = orderList.filter((o) => o.is_payment_late);

        const next: ActionAlert[] = [];
        if (newOrders.length > 0) {
          next.push({
            id: "new-orders",
            count: newOrders.length,
            text: newOrders.length === 1 ? "1 new order needs packing" : `${newOrders.length} new orders need packing`,
            href: "/seller/dashboard/orders",
          });
        }
        if (pendingBuyers.length > 0) {
          next.push({
            id: "buyer-requests",
            count: pendingBuyers.length,
            text: pendingBuyers.length === 1 ? "1 buyer wants to join your shop" : `${pendingBuyers.length} buyers want to join your shop`,
            href: "/seller/dashboard/buyers",
          });
        }
        if (lateDebts.length > 0) {
          next.push({
            id: "late-debts",
            count: lateDebts.length,
            text: lateDebts.length === 1 ? "1 payment date has passed" : `${lateDebts.length} payment dates have passed`,
            href: "/seller/dashboard/ledger",
          });
        }
        setAlerts(next);
        setAppBadge(next.reduce((s, a) => s + a.count, 0));
      } else if (user.role === "buyer") {
        const [debtOrders, relationshipList] = await Promise.all([
          orders.buyerDebts().catch(() => []),
          relationships.mine().catch(() => []),
        ]);
        const owing = debtOrders.filter((o) => parsePrice(o.balance ?? 0) > 0);
        const late = owing.filter((o) => o.is_payment_late);

        // Check for approved relationships that haven't been dismissed yet
        let acknowledgedIds: number[] = [];
        try {
          const ackKey = `acknowledged_approvals_${user.id}`;
          const raw = localStorage.getItem(ackKey);
          if (raw) acknowledgedIds = JSON.parse(raw);
        } catch {}

        const unacknowledgedApprovals = relationshipList.filter(
          (r) => r.status === "approved" && !acknowledgedIds.includes(r.id)
        );

        const next: ActionAlert[] = [];

        // Add newly approved seller alerts for the buyer
        for (const rel of unacknowledgedApprovals) {
          const storeName = rel.seller_name || "Supplier";
          const storePath = rel.seller_username ? `/store/${rel.seller_username}` : `/buyer/suppliers`;
          next.push({
            id: `approval-${rel.id}`,
            count: 1,
            text: `${storeName} approved your request! Tap to order`,
            href: storePath,
          });
        }

        if (owing.length > 0) {
          next.push({
            id: "debts",
            count: owing.length,
            text: owing.length === 1 ? "1 order is ready — pay now" : `${owing.length} orders are ready — pay now`,
            href: "/buyer/debts",
          });
        }
        if (late.length > 0) {
          next.push({
            id: "late-debts",
            count: late.length,
            text: late.length === 1 ? "1 payment date has passed" : `${late.length} payment dates have passed`,
            href: "/buyer/debts",
          });
        }
        setAlerts(next);
        setAppBadge(next.reduce((s, a) => s + a.count, 0));
      } else {
        setAlerts([]);
        setAppBadge(0);
      }
    } catch {
      // Best-effort — a failed poll keeps current alerts
    }
  }, [user]);

  useEffect(() => {
    refresh();
    const interval = setInterval(() => {
      if (typeof document !== "undefined" && document.hidden) return;
      refresh();
    }, POLL_MS);

    const onVisible = () => {
      if (typeof document !== "undefined" && !document.hidden) {
        refresh();
      }
    };
    const onFocus = () => {
      refresh();
    };

    if (typeof window !== "undefined") {
      window.addEventListener("visibilitychange", onVisible);
      window.addEventListener("focus", onFocus);
    }

    return () => {
      clearInterval(interval);
      if (typeof window !== "undefined") {
        window.removeEventListener("visibilitychange", onVisible);
        window.removeEventListener("focus", onFocus);
      }
    };
  }, [refresh]);

  return { alerts, refresh, acknowledgeAlert };
}
