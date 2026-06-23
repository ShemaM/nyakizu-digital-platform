# Nyakizu Digital Market Refined Concept Note

Nyakizu Digital Market is a B2B, mobile-optimized, offline-first web application for trusted phone accessories trade. It targets wholesalers, hawkers, and resellers who already depend on WhatsApp, M-Pesa, notebooks, and relationship-based credit.

The refined product model is asymmetric:

- Buyers receive a simple digital shopping list experience.
- Sellers receive strict operational control over catalog visibility, sourcing, invoice totals, payments, and debt records.

## Core Product Decisions

- The system is a web app, not an app-store-first mobile app.
- Wholesalers can create free storefronts and share URLs through WhatsApp.
- Trusted supplier relationships come before open marketplace discovery.
- Buyers never see exact stock quantities.
- Buyers may add sourcing notes for uncatalogued items before submitting a list.
- Submitted lists are locked immediately.
- Sellers control sourcing, fulfillment, final invoice totals, and ledger entries.
- M-Pesa payments remain outside the system in the MVP.
- The ledger is append-only and wholesaler-controlled.
- Offline support uses Service Workers, IndexedDB, and a pending sync queue.

## Three-Phase Operational Flow

### 1. Digital Shopping List

The hawker browses a trusted wholesaler storefront, selects catalog items, adds optional sourcing notes for uncatalogued requests, and submits the list. The system locks the submitted list.

### 2. Fulfillment And Sourcing

The wholesaler reviews the submitted list, packs standard catalog items, sources special requests where possible, updates the final invoice total, and marks the order ready.

### 3. Financial Ledger

The buyer pays outside the system or receives credit. The wholesaler records verified payment amounts, due dates, and credit activity. The system appends ledger entries and calculates remaining debt.

## Order Lifecycle

| State | Meaning |
| --- | --- |
| Draft | Hawker is building the list, including offline drafts. |
| Submitted | List has been sent to the wholesaler and is locked to buyer edits. |
| Sourcing & Packing | Wholesaler is gathering catalog and uncatalogued items. |
| Locked & Updated | Seller has finalized invoice amounts. |
| Debt Active | Partial payment or credit exists with remaining balance. |
| Cleared | Full payment has been recorded and the debt is settled. |
| Cancelled | Order was cancelled according to seller-controlled business rules. |

## Data Classification

| Data Element | Classification | Access |
| --- | --- | --- |
| Platform taxonomy | Public | Authenticated users. |
| Availability labels | Confidential | Trusted hawkers for that wholesaler. |
| Sourcing notes | Confidential | The buyer and wholesaler involved. |
| Exact stock quantities | Restricted | Owning wholesaler only. |
| Credit and debt ledger | Restricted | The specific hawker, wholesaler, and authorized audit workflows. |

