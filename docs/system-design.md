# System Design Document

## Nyakizu Digital Market

Student: Nzabakamira Shema Manasse  
Student ID: 668852  
Course: SWE3090XA - Software Engineering Project I  
Date: June 2026

## Document Note

This design document explains how the system will be built at a student-project level. It connects the SRS requirements to the planned architecture, database entities, API resources, user roles, order lifecycle, ledger rules, and offline behavior.

## 1. Design Goals

The system design is guided by the following goals:

- Keep the first version realistic for a semester project.
- Make the buyer experience simple and mobile-first.
- Give the wholesaler control over fulfillment, sourcing, invoice totals, and ledger records.
- Protect sensitive business information, especially exact stock quantities and debt records.
- Support weak-network environments through offline drafts and pending sync.
- Keep every important workflow traceable to requirements and tests.

## 2. High-Level Architecture

Nyakizu Digital Market uses a decoupled web application architecture.

```text
Mobile Browser / PWA
        |
        v
Next.js Frontend
        |
        v
Django REST Framework API
        |
        v
PostgreSQL Database
```

### 2.1 Frontend Layer

Technology:

- Next.js App Router.
- TypeScript.
- Tailwind CSS.
- Service Worker through `next-pwa`.
- IndexedDB for local draft and pending sync storage.

Main responsibilities:

- Render mobile-first user interface.
- Show storefronts and product catalog.
- Support shopping list drafts.
- Show offline status labels.
- Communicate with the backend API.
- Hide UI controls that a user role cannot use.

Important note: frontend role checks improve user experience, but backend authorization is the real security control.

### 2.2 Backend Layer

Technology:

- Django.
- Django REST Framework.
- JWT authentication.
- PostgreSQL database.

Main responsibilities:

- Authenticate users.
- Enforce role-based access control.
- Store business records.
- Hide exact stock quantities from buyers.
- Lock submitted shopping lists.
- Validate seller-only ledger actions.
- Maintain append-only ledger history.
- Keep audit logs.

### 2.3 Database Layer

Technology:

- PostgreSQL.

Main responsibilities:

- Store users, roles, products, orders, sourcing notes, invoice adjustments, ledger entries, audit logs, and offline sync references.
- Enforce relational integrity through foreign keys.
- Support reliable calculations for totals and balances.

## 3. Main Modules

| Module | Purpose | Main Requirements |
| --- | --- | --- |
| Authentication | Register, login, logout, JWT sessions. | FR-001 to FR-004 |
| Seller Verification | Allow admin to verify wholesalers. | FR-005 to FR-007 |
| Storefront | Let verified sellers publish shareable storefronts. | FR-008, FR-009 |
| Catalog | Manage structured phone accessories products. | FR-010 to FR-014 |
| Relationships | Manage trusted buyer access. | FR-015 to FR-017 |
| Shopping List | Buyer builds and submits shopping lists. | FR-018 to FR-023 |
| Fulfillment | Seller sources items and updates invoice. | FR-024 to FR-029 |
| Ledger | Seller records payments and credit balances. | FR-030 to FR-036 |
| Offline | Cache app shell and save drafts locally. | FR-037 to FR-041 |
| Admin and Audit | Manage taxonomy and review sensitive actions. | FR-042 to FR-044 |

## 4. Role-Based Access Control

| Action | Admin | Wholesaler | Hawker |
| --- | --- | --- | --- |
| Register and login | Yes | Yes | Yes |
| Request verification | No | Yes | No |
| Approve seller verification | Yes | No | No |
| Manage platform taxonomy | Yes | Limited future request | No |
| Create storefront | No | Yes, if verified | No |
| Share storefront URL | No | Yes | No |
| Manage own catalog | No | Yes | No |
| View exact stock | No, except audited support workflow | Own stock only | No |
| Request trusted access | No | No | Yes |
| Approve trusted buyer | No | Yes | No |
| Create shopping list | No | No | Yes |
| Add sourcing notes | No | No | Yes, before submission |
| Edit submitted list | No | No | No |
| Update fulfillment status | No | Yes | No |
| Add invoice adjustment | No | Yes | No |
| Record seller payment receipt | No | Yes | No |
| View own debt | No | Seller side of own buyers | Own debts only |
| Review audit logs | Yes | Limited own activity | Limited own activity |

## 5. Data Model

This is the first logical data model. It may be refined during implementation.

### 5.1 User And Verification Entities

```text
User
- id
- full_name
- phone_number
- email
- password_hash
- role
- created_at
- updated_at

SellerVerificationRequest
- id
- user_id
- business_name
- business_location
- phone_number
- status
- admin_note
- reviewed_by
- reviewed_at
- created_at
```

### 5.2 Storefront And Relationship Entities

```text
SellerProfile
- id
- user_id
- store_name
- slug
- description
- whatsapp_phone
- mpesa_phone
- is_verified
- created_at
- updated_at

BuyerSellerRelationship
- id
- buyer_id
- seller_id
- status
- approved_at
- created_at
```

Relationship statuses:

- Pending.
- Approved.
- Rejected.
- Blocked.

### 5.3 Catalog Entities

```text
Category
- id
- name

ProductType
- id
- category_id
- name

BrandFamily
- id
- name

DeviceModel
- id
- brand_family_id
- name

ProductVariant
- id
- category_id
- product_type_id
- brand_family_id
- device_model_id
- name

SellerProduct
- id
- seller_id
- product_variant_id
- price
- pack_size
- minimum_order_quantity
- visibility
- availability_label
- created_at
- updated_at

InventoryRecord
- id
- seller_product_id
- exact_quantity
- updated_by
- updated_at
```

Important rule: `InventoryRecord.exact_quantity` is never returned to buyer-facing API responses.

### 5.4 Order And Fulfillment Entities

```text
Order
- id
- buyer_id
- seller_id
- status
- draft_total
- final_total
- locked_at
- submitted_at
- created_at
- updated_at

OrderItem
- id
- order_id
- seller_product_id
- quantity
- unit_price_snapshot
- line_total

SourcingNote
- id
- order_id
- note_text
- created_by
- created_at

InvoiceAdjustment
- id
- order_id
- description
- amount
- created_by
- created_at
```

Order statuses:

- Draft.
- Submitted.
- Sourcing & Packing.
- Locked & Updated.
- Debt Active.
- Cleared.
- Cancelled.

### 5.5 Ledger And Audit Entities

```text
CreditLedgerEntry
- id
- order_id
- seller_id
- buyer_id
- entry_type
- amount
- balance_after
- due_date
- note
- created_by
- created_at

SellerPaymentReceipt
- id
- order_id
- seller_id
- buyer_id
- amount_received
- payment_method
- external_reference_note
- created_by
- created_at

AuditLog
- id
- actor_id
- action
- target_type
- target_id
- summary
- created_at
```

Ledger entry types:

- Charge.
- Payment.
- Correction.
- Due Date Update.
- Cleared.

Important rule: ledger entries are append-only. If a mistake happens, the seller creates a correction entry instead of editing old records.

### 5.6 Offline Entity

```text
OfflineSyncQueueItem
- local_id
- user_id
- action_type
- payload
- status
- created_at
- last_attempt_at
```

Offline statuses:

- Draft.
- Saved Offline.
- Pending Sync.
- Synced.
- Failed.

## 6. Order State Machine

```text
Draft
  -> Submitted
  -> Sourcing & Packing
  -> Locked & Updated
  -> Debt Active
  -> Cleared

Submitted, Sourcing & Packing, Locked & Updated
  -> Cancelled
```

### State Rules

- Draft can be edited by the buyer.
- Submitted is locked to buyer edits.
- Sourcing & Packing is controlled by the seller.
- Locked & Updated means the seller has finalized invoice changes.
- Debt Active means unpaid balance exists.
- Cleared means the seller has recorded full payment.
- Cancelled records the order as stopped but does not delete history.

## 7. Ledger Rules

The ledger exists to reduce disputes and protect trust.

Rules:

- Only the seller can create payment receipt entries in the MVP.
- Buyers can view their own debt records but cannot create payment records.
- Ledger entries cannot be silently edited or deleted.
- Corrections are recorded as new entries.
- Every ledger entry stores who created it and when.
- The system recalculates balance after each charge, payment, or correction.
- When balance is zero, the debt can be marked Cleared.
- When due date passes and balance is above zero, the debt becomes Overdue.

## 8. API Resource Plan

This is not the final API specification. It is the first resource plan for implementation.

| Resource | Example Endpoint | Purpose |
| --- | --- | --- |
| Auth | `/api/auth/register/` | Register user. |
| Auth | `/api/auth/login/` | Login and receive token. |
| Verification | `/api/seller-verifications/` | Submit and review seller verification. |
| Storefront | `/api/storefronts/{slug}/` | View seller storefront. |
| Catalog | `/api/seller-products/` | Manage seller products. |
| Relationships | `/api/relationships/` | Request and approve trusted access. |
| Orders | `/api/orders/` | Create and view orders. |
| Orders | `/api/orders/{id}/submit/` | Submit and lock shopping list. |
| Fulfillment | `/api/orders/{id}/fulfillment/` | Seller updates fulfillment state. |
| Invoice | `/api/orders/{id}/adjustments/` | Seller adds invoice adjustments. |
| Ledger | `/api/orders/{id}/ledger/` | View ledger for allowed users. |
| Payment Receipts | `/api/orders/{id}/payments/` | Seller records external payment. |
| Audit | `/api/audit-logs/` | Admin or limited audit review. |

## 9. Offline Design

Offline support should be useful but simple for the semester MVP.

### Cache Strategy

| Data | Strategy |
| --- | --- |
| App shell | Cache-first. |
| Tailwind/CSS assets | Cache-first. |
| Last-synced catalog | Network-first, fallback to cache. |
| Draft shopping lists | Store in IndexedDB. |
| Submitted actions while offline | Store as Pending Sync. |

### Offline Flow

1. Buyer opens the app after previous successful load.
2. Service Worker loads cached app shell.
3. Buyer uses last-synced catalog data.
4. Buyer creates draft shopping list.
5. Draft is saved in IndexedDB.
6. If buyer tries to submit while offline, action is marked Pending Sync.
7. When network returns, the app attempts to sync with the backend.
8. User sees whether the sync succeeded or failed.

Important note: seller confirmation is still required after sync because catalog availability may be stale.

## 10. Security Design

Security controls:

- JWT authentication for protected API access.
- Backend role checks for every protected action.
- Seller ownership checks for catalog, stock, invoice, and ledger actions.
- Relationship checks before buyer views confidential storefront data.
- Hidden exact stock quantities in buyer-facing serializers.
- Append-only ledger model.
- Audit logs for sensitive actions.
- Input validation for amounts, quantities, phone numbers, and notes.
- HTTPS in deployed environments.
- No M-Pesa PINs or account credentials stored.

## 11. UI Design Direction

The interface should be simple and mobile-first.

Core screens:

- Login and registration.
- Buyer My Suppliers.
- Seller storefront.
- Product catalog.
- Shopping list builder.
- Sourcing notes input.
- Submitted order detail.
- Seller fulfillment dashboard.
- Invoice adjustment form.
- Ledger and debt status.
- Admin verification dashboard.

Color use:

- Green for cleared, successful, or paid states.
- Blue for trust, seller verification, and ledger stability.
- Amber for pending sync, sourcing, active debt, and attention states.

## 12. Test Mapping

| Design Area | Requirement IDs | Test Focus |
| --- | --- | --- |
| Authentication | FR-001 to FR-004 | Register, login, logout, role restriction. |
| Verification | FR-005 to FR-007 | Unverified seller hidden until approved. |
| Catalog Privacy | FR-012 to FR-014 | Buyer cannot see exact stock. |
| Sourcing Notes | FR-020 | Buyer creates note, seller views note. |
| Order Locking | FR-024 | Buyer cannot edit after submit. |
| Invoice Adjustment | FR-027 to FR-029 | Seller updates final total. |
| Ledger | FR-030 to FR-036 | Seller records payment, buyer only views own debt. |
| Offline | FR-037 to FR-041 | Draft survives offline and status labels are shown. |
| Audit | FR-043 to FR-044 | Sensitive actions create audit logs. |

## 13. Design Risks

| Risk | Response |
| --- | --- |
| Offline sync becomes too complex | Keep MVP focused on draft saving and simple pending sync. |
| Ledger rules become confusing | Keep seller-only writes and append-only corrections. |
| Product catalog becomes too detailed | Start with a small taxonomy for demo data. |
| Buyers misunderstand sourced item pricing | Clearly show that final sourced prices are confirmed by seller. |
| Stock data leaks through API | Use separate seller and buyer serializers and permission tests. |

