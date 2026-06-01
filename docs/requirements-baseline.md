# Nyakizu Digital Market Requirements Baseline

## 1. Project Understanding

Nyakizu Digital Market is a mobile-first Progressive Web App for trusted phone accessories trade among Banyamulenge wholesalers, hawkers, and resellers in Kenya. The project does not try to replace existing community trade practices. It digitizes the records and workflows traders already use: supplier relationships, product catalogs, sourcing requests, fulfillment, M-Pesa payment verification, and credit/debt ledgers.

The first version should focus on the wholesaler-hawker relationship. Public marketplace discovery is secondary. The core product value is asymmetric: the buyer gets a fast digital shopping list experience, while the seller gets operational control, protected inventory intelligence, and an append-only financial ledger.

## 2. Product Vision

To provide a trusted, low-data, mobile-first platform that helps hawkers submit structured shopping lists and sourcing requests while helping wholesalers control fulfillment, invoices, payments, debt records, and private stock information.

## 3. MVP Scope

The MVP includes:

- User registration and login.
- Role-based access for admin/moderator, verified wholesaler, and hawker/reseller.
- Seller verification by admin.
- Seller storefront and structured product catalog.
- Free seller storefront links that wholesalers can share through WhatsApp.
- Internal seller inventory with exact stock visible only to the seller.
- Buyer-facing availability labels instead of exact stock quantities.
- Trusted supplier relationship between hawkers and wholesalers.
- Digital shopping list submission from trusted supplier catalogs.
- Sourcing notes for uncatalogued buyer requests.
- Seller-controlled fulfillment, sourcing, and final invoice adjustment.
- Order lifecycle with locking immediately after submission.
- Seller-entered M-Pesa payment receipt records after external payment verification.
- Wholesaler-controlled credit/debt ledger with partial payments and due dates.
- Offline draft records and pending sync behavior for selected actions.
- Basic admin dashboard for verification and core reference data.
- Audit logs for sensitive business actions.

Out of MVP:

- Multi-seller cart.
- Full open marketplace browsing.
- Buyer request board.
- QR code walk-in stock checking.
- Ratings and reviews.
- SMS notifications.
- Advanced promotions.
- Dispatch fee calculator.
- Advanced analytics.
- Price alerts.
- Automated stock reservation.
- Direct M-Pesa API integration.

## 4. Stakeholders

| Stakeholder | Interest |
| --- | --- |
| Hawker / reseller | Uses seller links, builds digital shopping lists, adds sourcing notes, views debts. |
| Verified wholesaler | Manages catalog, buyer access, fulfillment, sourced items, private stock, payments, and credit. |
| Admin / moderator | Verifies sellers, manages categories/models, audits disputes, moderates platform trust. |
| Academic supervisors | Need clear requirements, design, implementation evidence, testing, and evaluation. |
| Community traders | Need a system that respects existing trust and avoids exposing sensitive trade data. |

## 5. User Roles And Permissions

| Capability | Admin | Verified Wholesaler | Hawker / Reseller |
| --- | --- | --- | --- |
| Register and login | Yes | Yes | Yes |
| Request seller verification | No | Yes | No |
| Approve/reject seller verification | Yes | No | No |
| Manage categories, brands, models | Yes | Limited/requested | No |
| Manage product catalog | No | Yes | No |
| View exact internal stock | No, except audited support if approved | Yes, own stock only | No |
| Browse trusted suppliers | No | No | Yes |
| Place orders | No | Optional buyer mode later | Yes |
| Process orders | No | Yes | No |
| Submit payment reference | No | Optional future buyer evidence upload | Deferred |
| Record externally received payment | No | Yes | No |
| Create credit/debt entries | No | Yes | No |
| View own credit balance | No | Yes, per buyer | Yes, own debts only |
| Review disputes/audit logs | Yes | Limited own records | Limited own records |

## 6. Functional Requirements

Each requirement has an initial priority: Must, Should, Could, or Deferred.

| ID | Requirement | Priority |
| --- | --- | --- |
| FR-001 | The system shall allow users to register and log in securely. | Must |
| FR-002 | The system shall assign users role-based permissions. | Must |
| FR-003 | The system shall allow a user to request wholesaler verification. | Must |
| FR-004 | The system shall allow admins to approve or reject seller verification requests. | Must |
| FR-005 | The system shall prevent unverified sellers from appearing in buyer-facing supplier areas. | Must |
| FR-006 | The system shall allow verified wholesalers to create and update storefront profiles. | Must |
| FR-007 | The system shall support a structured product hierarchy: category, product type, brand family, device model, SKU/variant. | Must |
| FR-008 | The system shall allow sellers to define price, pack size, minimum order quantity, visibility, and availability label per product. | Must |
| FR-009 | The system shall store exact stock quantity privately for seller use. | Must |
| FR-010 | The system shall hide exact stock quantity from buyers. | Must |
| FR-011 | The system shall show buyer-facing availability labels such as Available, Available on Request, Can Be Sourced, Limited, Confirm with Seller, and Unavailable. | Must |
| FR-012 | The system shall allow hawkers to request or follow trusted wholesalers. | Must |
| FR-013 | The system shall allow wholesalers to approve, reject, or manage trusted buyer relationships. | Must |
| FR-014 | The system shall make My Suppliers the primary buyer browsing experience. | Must |
| FR-015 | The system shall allow buyers to create digital shopping lists from a trusted supplier catalog. | Must |
| FR-016 | The system shall allow buyers to add sourcing notes for uncatalogued items before submission. | Must |
| FR-017 | The system shall lock buyer edits immediately after shopping list submission. | Must |
| FR-018 | The system shall support order states: Draft, Submitted, Sourcing & Packing, Locked & Updated, Debt Active, Cleared, and Cancelled. | Must |
| FR-019 | The system shall display seller M-Pesa payment instructions to buyers. | Must |
| FR-020 | The system shall allow sellers to manually record externally received M-Pesa payments after verification outside the system. | Must |
| FR-021 | The system shall allow sellers to update the final invoice total to include sourced uncatalogued items. | Must |
| FR-022 | The system shall support seller-controlled credit sales with buyer, order, final amount due, due date, status, and payment history. | Must |
| FR-023 | The system shall support seller-entered partial payment recording. | Must |
| FR-024 | The system shall calculate remaining balances, overdue status, and cleared status from append-only ledger entries. | Must |
| FR-025 | The system shall make credit and payment records append-only, using correction entries for mistakes. | Must |
| FR-026 | The system shall allow selected offline draft actions, including draft shopping lists and sourcing notes. | Should |
| FR-027 | The system shall sync pending offline actions when connectivity returns. | Should |
| FR-028 | The system shall mark offline data clearly using statuses such as Draft, Saved Offline, Pending Sync, Submitted, Sourcing & Packing, Locked & Updated, Debt Active, and Cleared. | Should |
| FR-029 | The system shall require internet connectivity for final order submission, verification approval, public discovery, and admin actions. | Must |
| FR-030 | The system shall keep audit logs for verification, order status changes, payment confirmations, credit entries, and corrections. | Must |
| FR-031 | The system shall provide basic admin management for categories, brands, device models, and seller verification. | Must |
| FR-032 | The system shall allow wholesalers to share storefront URLs through external channels such as WhatsApp. | Must |
| FR-033 | The system shall cache the application shell and last-synced catalog data for low-network use. | Should |

## 7. Non-Functional Requirements

| ID | Requirement | Priority |
| --- | --- | --- |
| NFR-001 | The interface shall be mobile-first and usable on budget Android smartphones. | Must |
| NFR-002 | Core pages shall be optimized for low data usage and fast loading. | Must |
| NFR-003 | The system shall preserve selected user actions during weak or lost connectivity. | Should |
| NFR-004 | The system shall use secure authentication and authorization for all protected data. | Must |
| NFR-005 | The system shall enforce HTTPS in deployed environments. | Must |
| NFR-006 | The system shall validate all user input on client and server. | Must |
| NFR-007 | Debt records, buyer relationships, seller-recorded payment receipts, and private stock quantities shall only be visible to authorized users. | Must |
| NFR-008 | Important business actions shall be auditable. | Must |
| NFR-009 | The interface shall use readable text, clear buttons, sufficient contrast, and simple language. | Must |
| NFR-010 | The architecture shall allow future expansion to public discovery, analytics, SMS, and M-Pesa integration. | Should |

## 8. Core Business Rules

- Exact stock quantity is private and visible only to the seller.
- Buyers see availability labels, not exact stock counts.
- Trusted supplier relationships come before open seller discovery.
- A seller must be verified before appearing in buyer-facing areas.
- A submitted shopping list becomes locked immediately and cannot be edited by the buyer.
- The seller controls fulfillment, sourcing, final invoice adjustment, and ledger updates.
- Payment happens outside the platform in the MVP; the seller records verified payments after receiving external confirmation such as M-Pesa SMS.
- Credit and payment records are append-only. Mistakes are handled through correction entries.
- Offline-created records are drafts or pending sync until confirmed online.
- Debt records are visible only to the buyer, seller, and authorized admin review workflows.

## 9. Key Workflows

### Phase 1: Digital Shopping List

1. Hawker logs in.
2. Hawker opens a trusted supplier storefront, often through a shared link or My Suppliers.
3. Hawker selects catalog items.
4. Hawker browses product catalog and availability labels.
5. Hawker adds sourcing notes for uncatalogued requests if needed.
6. Hawker submits the digital shopping list.
7. System locks buyer edits.

### Phase 2: Fulfillment And Sourcing

1. Wholesaler receives order.
2. Wholesaler packs standard catalog items.
3. Wholesaler sources requested uncatalogued items where possible.
4. Wholesaler updates final invoice total.
5. Wholesaler marks the order ready for payment or credit handling.

### Phase 3: Financial Ledger

1. Buyer pays outside the system through M-Pesa or receives credit approval.
2. Wholesaler verifies the external payment evidence.
3. Wholesaler records the amount received.
4. System appends the payment entry to the ledger.
5. System calculates the remaining debt and due date.
6. Credit status changes to Cleared when fully settled.

### Offline Draft Order

1. Buyer loses or has weak internet.
2. Buyer creates a draft shopping list from last-synced catalog data.
3. System marks the order as Saved Offline or Pending Sync.
4. Buyer reconnects.
5. System syncs the submitted list and waits for seller fulfillment.

## 10. Initial Data Entities

- User
- Role
- SellerVerificationRequest
- SellerProfile
- BuyerSellerRelationship
- Category
- ProductType
- BrandFamily
- DeviceModel
- ProductVariant
- SellerProduct
- InventoryRecord
- AvailabilityStatus
- Order
- OrderItem
- SourcingNote
- InvoiceAdjustment
- SellerPaymentReceipt
- CreditLedgerEntry
- CreditPaymentEntry
- AuditLog
- OfflineSyncQueue

## 11. Open Requirements Questions

- What exact seller verification data should be collected?
- Should a wholesaler be allowed to act as a buyer from another wholesaler in MVP?
- Should buyers need seller approval before seeing prices, or only before ordering?
- Which product categories are mandatory for the first demo dataset?
- What payment reference fields are required from M-Pesa messages?
- Should buyers be able to upload optional payment evidence later, or should MVP remain seller-entry only?
- How should disputes be raised and reviewed in MVP?
- How much Background Sync behavior is required for the semester prototype versus a real deployment?
- Which languages should the first interface support: English only, Kiswahili, Kinyamulenge, or mixed?
- What academic deliverables are required by the institution: SRS, SDD, test report, user manual, final report, presentation, source code, deployment?
