# UI Blueprint

## Nyakizu Digital Market

Student: Nzabakamira Shema Manasse  
Course: SWE3090XA - Software Engineering Project I  
Date: June 2026

## Document Note

This UI blueprint describes the first screens and user interface structure before frontend development starts. It follows the brand identity guide and keeps the design student-friendly, mobile-first, and easy to explain during academic presentation.

## 1. UI Goals

The user interface should:

- Work well on budget Android smartphones.
- Help buyers create shopping lists quickly.
- Help sellers control fulfillment, invoice updates, and ledger records.
- Keep exact stock quantities hidden from buyers.
- Show clear status labels for submitted, sourcing, debt, cleared, and offline states.
- Use simple business language instead of complex accounting terms.

## 2. Main Navigation Model

The app should use role-based navigation. Each role sees a different main dashboard.

### Buyer Navigation

Primary buyer tabs or links:

- My Suppliers.
- Shopping Lists.
- Debts.
- Account.

### Seller Navigation

Primary seller tabs or links:

- Dashboard.
- Catalog.
- Orders.
- Ledger.
- Storefront.

### Admin Navigation

Primary admin tabs or links:

- Verification.
- Taxonomy.
- Audit Logs.
- Account.

## 3. Shared UI Components

These components should be reused across screens.

| Component | Purpose |
| --- | --- |
| App Header | Shows Nyakizu name, role context, and account menu. |
| Status Badge | Shows Draft, Submitted, Sourcing, Debt Active, Cleared, Pending Sync. |
| Product Card | Shows product name, price, pack size, and availability label. |
| Order Summary Card | Shows total, status, seller/buyer, and key action. |
| Money Display | Shows KES amounts clearly. |
| Empty State | Explains when no suppliers, orders, or debts exist. |
| Confirmation Dialog | Confirms important seller actions. |
| Offline Banner | Warns when user is offline or seeing cached data. |

## 4. Buyer Screens

### 4.1 Buyer Dashboard: My Suppliers

Purpose:

The first buyer screen should focus on trusted suppliers, not public marketplace discovery.

Main content:

- List of approved wholesalers.
- Store name.
- Verification badge.
- Last catalog sync time.
- Button/link to open storefront.
- Empty state if no suppliers exist.

Primary action:

- Open supplier storefront.

Status notes:

- Use blue for verified supplier.
- Use amber if catalog data is based on last sync.

Requirements:

- FR-015, FR-016, FR-017.

### 4.2 Buyer Storefront

Purpose:

Allow a buyer to browse a trusted wholesaler's catalog.

Main content:

- Store name and seller contact summary.
- Category filters.
- Product cards.
- Availability labels.
- Shopping list counter.

Important rule:

- Do not show exact stock quantity.

Product card fields:

- Product name.
- Price in KES.
- Pack size.
- Availability label.
- Add button.

Requirements:

- FR-008 to FR-014.

### 4.3 Shopping List Builder

Purpose:

Allow buyer to review catalog items before submission.

Main content:

- Selected items.
- Quantity controls.
- Draft total.
- Sourcing notes box.
- Offline status label if saved locally.

Primary action:

- Submit Shopping List.

Important note:

- Before submission, show a simple reminder: "Final price may change after seller sources requested items."

Requirements:

- FR-018 to FR-023.

### 4.4 Sourcing Notes

Purpose:

Let buyer request uncatalogued items before submitting the list.

Main content:

- Text area for notes.
- Example placeholder: "Example: Kindly get me two Bluetooth radios."
- Save note action.

Rules:

- Notes can be edited while the order is Draft.
- Notes cannot be edited after submission.

Requirements:

- FR-020, FR-024.

### 4.5 Submitted Order View

Purpose:

Show buyer the locked order and seller progress.

Main content:

- Order status.
- Submitted items.
- Sourcing notes.
- Draft total.
- Final invoice total when seller updates it.
- Ledger/debt summary when available.

Important state:

- Show "This list has been submitted and cannot be changed."

Requirements:

- FR-024, FR-029, FR-036.

### 4.6 Buyer Debt View

Purpose:

Let buyer view their own debt records.

Main content:

- Seller name.
- Order reference.
- Final invoice total.
- Amount paid.
- Balance remaining.
- Due date.
- Status badge: Debt Active, Overdue, Cleared.

Important rule:

- Buyer can view debt but cannot create payment entries.

Requirements:

- FR-030 to FR-036.

## 5. Seller Screens

### 5.1 Seller Dashboard

Purpose:

Give the wholesaler a quick business overview.

Main content:

- New submitted lists.
- Orders in Sourcing & Packing.
- Active debt total.
- Recently cleared orders.
- Pending buyer access requests.

Primary actions:

- Open Orders.
- Open Ledger.
- Manage Catalog.

Requirements:

- FR-016, FR-025, FR-030 to FR-036.

### 5.2 Storefront Management

Purpose:

Allow seller to manage the storefront and sharing link.

Main content:

- Store name.
- Description.
- WhatsApp phone.
- M-Pesa phone.
- Shareable URL.
- Copy link button.

Requirements:

- FR-008, FR-009.

### 5.3 Catalog Management

Purpose:

Allow seller to manage products and internal stock.

Main content:

- Product list.
- Add product button.
- Price.
- Pack size.
- Minimum order quantity.
- Visibility.
- Availability label.
- Exact stock field for seller only.

Important rule:

- Exact stock can appear here because this is a seller-only screen.

Requirements:

- FR-010 to FR-014.

### 5.4 Submitted Orders

Purpose:

Show seller incoming shopping lists.

Main content:

- Buyer name.
- Submitted time.
- Draft total.
- Sourcing notes preview.
- Status badge.

Primary action:

- Open order.

Requirements:

- FR-025.

### 5.5 Fulfillment Screen

Purpose:

Allow seller to pack items, source special requests, and finalize invoice.

Main content:

- Catalog items requested.
- Sourcing notes.
- Button to mark Sourcing & Packing.
- Invoice adjustment list.
- Add adjustment form.
- Final total.

Important rule:

- Seller controls this screen.

Requirements:

- FR-026 to FR-029.

### 5.6 Ledger Screen

Purpose:

Allow seller to record external payments and manage debt records.

Main content:

- Order final total.
- Existing ledger entries.
- Amount received input.
- Payment method.
- External reference note.
- Due date field.
- Balance remaining.

Rules:

- Seller creates payment entries.
- Entries are append-only.
- Corrections appear as new entries.

Requirements:

- FR-030 to FR-036.

## 6. Admin Screens

### 6.1 Seller Verification

Purpose:

Allow admin to approve or reject seller verification requests.

Main content:

- Pending requests.
- Business name.
- Business location.
- Contact number.
- Approve button.
- Reject button.
- Admin note.

Requirements:

- FR-005 to FR-007.

### 6.2 Taxonomy Management

Purpose:

Allow admin to manage product categories and device models.

Main content:

- Categories.
- Product types.
- Brand families.
- Device models.
- Add/edit forms.

Requirements:

- FR-010, FR-042.

### 6.3 Audit Logs

Purpose:

Allow admin to review sensitive business actions.

Main content:

- Actor.
- Action.
- Target type.
- Time.
- Summary.

Requirements:

- FR-043, FR-044.

## 7. Status Badge Rules

| Status | Color | Meaning |
| --- | --- | --- |
| Draft | Gray | Buyer is still preparing the list. |
| Pending Sync | Amber | Saved locally and waiting for internet. |
| Submitted | Blue | Sent to seller and locked. |
| Sourcing & Packing | Amber | Seller is gathering items. |
| Locked & Updated | Blue | Seller finalized invoice updates. |
| Debt Active | Amber | Balance remains unpaid. |
| Cleared | Green | Full payment has been recorded. |
| Cancelled | Red | Order was stopped. |

## 8. First Mobile Wireframe Notes

These are text wireframes to guide coding.

### Buyer My Suppliers

```text
[Header: Nyakizu]
[Offline banner if needed]

My Suppliers
[Supplier Card]
  Store name + Verified badge
  Last synced time
  [Open Store]

[Bottom Nav: Suppliers | Lists | Debts | Account]
```

### Buyer Shopping List

```text
[Header: Shopping List]

Items
[Item row] Name, quantity, amount

Sourcing Notes
[Text area]

Draft Total: KES 0
[Submit Shopping List]
```

### Seller Fulfillment

```text
[Header: Order #]
[Status badge]

Buyer Items
[Item rows]

Sourcing Notes
[Note card]

Invoice Adjustments
[Adjustment rows]
[Add Adjustment]

Final Total: KES 0
[Mark Ready / Record Payment]
```

### Seller Ledger

```text
[Header: Ledger]

Final Total: KES 0
Paid: KES 0
Balance: KES 0

Record Payment
[Amount input]
[Payment method]
[Reference note]
[Due date]
[Save Payment Entry]

Ledger History
[Append-only entry rows]
```

## 9. Accessibility Checks

Before demo, confirm:

- Buttons are easy to tap on mobile.
- Money values are readable.
- Status labels use text, not color alone.
- Buyer screens never expose exact stock.
- Forms have clear labels.
- Offline states are clearly shown.
- Important seller actions ask for confirmation.

## 10. Traceability

| UI Area | Main Requirements |
| --- | --- |
| Buyer My Suppliers | FR-015 to FR-017 |
| Buyer Storefront | FR-008 to FR-014 |
| Shopping List Builder | FR-018 to FR-023 |
| Submitted Order View | FR-024, FR-029 |
| Buyer Debt View | FR-036 |
| Seller Dashboard | FR-025, FR-030 to FR-036 |
| Catalog Management | FR-010 to FR-014 |
| Fulfillment Screen | FR-026 to FR-029 |
| Ledger Screen | FR-030 to FR-036 |
| Admin Verification | FR-005 to FR-007 |
| Admin Taxonomy | FR-042 |
| Audit Logs | FR-043, FR-044 |

