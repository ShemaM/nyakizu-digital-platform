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

const POLL_MS = 45000;

/**
 * Plain-language "things that need you" alerts shown from the header bell.
 * Deliberately derived from existing status fields (submitted orders,
 * pending buyer requests, unpaid debts) rather than a stored read/unread
 * flag — an alert only clears once the seller/buyer actually acts on it
 * (e.g. starts packing, approves the buyer), which is a truer signal for
 * this audience than "has been seen".
 */
export function useActionAlerts() {
  const { user } = useAuth();
  const [alerts, setAlerts] = useState<ActionAlert[]>([]);

  const refresh = useCallback(async () => {
    if (!user) {
      setAlerts([]);
      setAppBadge(0);
      return;
    }

    try {
      if (user.role === "seller") {
        const [orderList, relationshipList] = await Promise.all([
          orders.sellerList(),
          relationships.mine(),
        ]);

        const newOrders = orderList.filter((o) => o.status === "submitted");
        const pendingBuyers = relationshipList.filter((r) => r.status === "pending");
        // "Late" here means past the buyer's own promised date — informational,
        // never a demand, same tone as the debt-date feature itself.
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
        const debtOrders = await orders.buyerDebts();
        const owing = debtOrders.filter((o) => parsePrice(o.balance ?? 0) > 0);
        const late = owing.filter((o) => o.is_payment_late);

        const next: ActionAlert[] = [];
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
      // Best-effort — a failed poll just means the bell stays as it was.
    }
  }, [user]);

  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, POLL_MS);
    return () => clearInterval(interval);
  }, [refresh]);

  return { alerts, refresh };
}
