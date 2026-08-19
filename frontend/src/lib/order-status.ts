import type { BadgeProps } from "@/components/ui/Badge";
import type { ApiOrderStatusEvent, ApiOrderItem } from "@/lib/api";

type BadgeVariant = NonNullable<BadgeProps["variant"]>;

/**
 * True while any sourcing line still has no price — a "not_found" line is
 * excluded since it's been resolved (it just isn't happening), not pending.
 * Used to stop a totals display from presenting a partial sum as if it were
 * the real order total before the seller has actually priced everything.
 */
export function hasUnpricedItems(items: ApiOrderItem[]): boolean {
  return items.some((item) => item.unit_price == null && !item.not_found);
}

const VARIANT_MAP: Record<string, BadgeVariant> = {
  submitted: "warning",
  sourcing: "info",
  locked: "default",
  debt_active: "error",
  cleared: "success",
  cancelled: "error",
  pending: "warning",
  draft: "outline",
};

// Short words for badges/lists — plain Kenyan English, not system jargon.
const LABEL_MAP: Record<string, string> = {
  submitted: "New",
  sourcing: "Packing",
  locked: "Ready",
  debt_active: "You Owe",
  cleared: "Paid",
  cancelled: "Cancelled",
  pending: "Pending",
  draft: "Draft",
};

/** The buyer's real name for display — falls back to their username, then a generic label, since no order should show a raw system login as if it were a person's name. */
export function buyerDisplayName(order: { buyer_full_name?: string; buyer_username?: string }): string {
  return order.buyer_full_name || order.buyer_username || "Unknown buyer";
}

/** Just the buyer's first name — for short, personal copy like "Shema Says They Paid" where the full name would be too long. */
export function buyerFirstName(order: { buyer_full_name?: string; buyer_username?: string }): string {
  return buyerDisplayName(order).split(" ")[0];
}

export interface StatusExplanation {
  headline: string;
  body: string;
}

/**
 * The buyer's "what's happening, and what do I do" card — the thing a
 * first-time, non-technical buyer actually needs right after sending an
 * order: confirmation it went somewhere real, what happens next, and
 * whether they need to act now or just wait. Payment instructions
 * themselves live in PaymentClaimCard/DebtDateCard — this stays a short
 * status explanation so it doesn't repeat them.
 */
export function buyerStatusExplanation(status: string, sellerName: string): StatusExplanation {
  const seller = sellerName || "The seller";
  switch (status) {
    case "submitted":
      return {
        headline: `Sent to ${seller}`,
        body: `${seller} has been told about your order and will start packing it soon. You don't need to do anything right now. We'll let you know here and by email the moment they start.`,
      };
    case "sourcing":
      return {
        headline: `${seller} is packing your order`,
        body: "Some items may need to be sourced and priced first. You'll see the final total here once that's ready. No action needed from you yet.",
      };
    case "locked":
      return {
        headline: "Your price is confirmed",
        body: `${seller} has set the final price. It's time to pay. See how below, then tell us so ${seller} can check for it.`,
      };
    case "debt_active":
      return {
        headline: "Partly paid",
        body: `You've paid some of this order. Pay the rest whenever you can. ${seller} will be notified as soon as you do.`,
      };
    case "cleared":
      return {
        headline: "Fully paid",
        body: "This order is settled. Nothing more to do. Thank you for trading with us.",
      };
    case "cancelled":
      return {
        headline: "Order cancelled",
        body: `This order was cancelled. If that's a surprise, talk to ${seller} directly.`,
      };
    default:
      return { headline: "", body: "" };
  }
}

export function getStatusVariant(status: string): BadgeVariant {
  return VARIANT_MAP[status] ?? "default";
}

export function getStatusLabel(status: string): string {
  return LABEL_MAP[status] ?? status;
}

/** Ordered progression used to render the order Timeline component. */
export const ORDER_PROGRESSION = ["submitted", "sourcing", "locked", "cleared"] as const;

// Short, plain words for the horizontal order tracker — elementary English,
// not business jargon, since this is what the buyer reads first.
const TRACKER_LABELS = [
  "Order Placed",
  "Confirmed",
  "Ready",
  "Paid",
];

function formatEventDate(iso: string): string {
  return new Date(iso).toLocaleString("en-KE", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export interface TrackerStep {
  label: string;
  done: boolean;
  current: boolean;
  date?: string;
}

/**
 * Builds the buyer-facing order tracker: one row per stage in
 * ORDER_PROGRESSION, each marked done/current, with a real date once
 * status_history has an event for that stage. "debt_active" reads as
 * "still on the Ready stage, working toward Paid" — it isn't its own
 * tracker row since the buyer is really just waiting to finish paying.
 */
export function orderTimelineSteps(status: string, statusHistory?: ApiOrderStatusEvent[]): TrackerStep[] {
  if (status === "cancelled") {
    return [{ label: "Order Cancelled", done: true, current: true }];
  }

  const effectiveStatus = status === "debt_active" ? "locked" : status;
  const currentIndex = ORDER_PROGRESSION.indexOf(effectiveStatus as (typeof ORDER_PROGRESSION)[number]);

  const dateByStatus = new Map<string, string>();
  for (const event of statusHistory ?? []) {
    const key = event.status === "debt_active" ? "locked" : event.status;
    if (!dateByStatus.has(key)) dateByStatus.set(key, event.created_at);
  }

  return ORDER_PROGRESSION.map((stepStatus, i) => {
    const done = currentIndex >= 0 && i <= currentIndex;
    const rawDate = dateByStatus.get(stepStatus);
    return {
      label: TRACKER_LABELS[i],
      done,
      current: i === currentIndex,
      date: rawDate ? formatEventDate(rawDate) : undefined,
    };
  });
}
