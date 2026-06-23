# ERD And API Specification

## Nyakizu Digital Market

Student: Nzabakamira Shema Manasse  
Student ID: 668852  
Course: SWE3090XA - Software Engineering Project I  
Date: June 2026

## Document Note

This document gives the first Entity Relationship Diagram (ERD) and API specification for the project. It is intentionally student-level: detailed enough to guide implementation and testing, but not so complex that it becomes hard to maintain during the semester.

## 1. ERD Overview

The main data model is centered on five areas:

- Users and roles.
- Seller verification and storefronts.
- Catalog and inventory.
- Shopping lists, sourcing notes, fulfillment, and invoices.
- Seller-controlled ledger and audit logs.

## 2. Text ERD

This text ERD shows the main relationships before drawing the visual ERD.

```text
User 1 --- 0..1 SellerProfile
User 1 --- 0..* SellerVerificationRequest

User 1 --- 0..* BuyerSellerRelationship as buyer
SellerProfile 1 --- 0..* BuyerSellerRelationship as seller

Category 1 --- 0..* ProductType
BrandFamily 1 --- 0..* DeviceModel

Category 1 --- 0..* ProductVariant
ProductType 1 --- 0..* ProductVariant
BrandFamily 1 --- 0..* ProductVariant
DeviceModel 1 --- 0..* ProductVariant

SellerProfile 1 --- 0..* SellerProduct
ProductVariant 1 --- 0..* SellerProduct
SellerProduct 1 --- 0..1 InventoryRecord

User 1 --- 0..* Order as buyer
SellerProfile 1 --- 0..* Order as seller
Order 1 --- 1..* OrderItem
SellerProduct 1 --- 0..* OrderItem
Order 1 --- 0..* SourcingNote
Order 1 --- 0..* InvoiceAdjustment

Order 1 --- 0..* SellerPaymentReceipt
Order 1 --- 0..* CreditLedgerEntry

User 1 --- 0..* AuditLog as actor
User 1 --- 0..* OfflineSyncQueueItem
```

## 3. Entity Definitions

### 3.1 User

Stores login and identity data for all users.

| Field | Type | Notes |
| --- | --- | --- |
| id | UUID / integer | Primary key. |
| full_name | string | User's display name. |
| phone_number | string | Important for local trade communication. |
| email | string | Optional or required depending on final auth choice. |
| password_hash | string | Stored using Django password hashing. |
| role | enum | Admin, Wholesaler, Hawker. |
| created_at | datetime | Creation timestamp. |
| updated_at | datetime | Last update timestamp. |

### 3.2 SellerProfile

Stores public and seller-facing storefront information.

| Field | Type | Notes |
| --- | --- | --- |
| id | UUID / integer | Primary key. |
| user_id | FK User | Seller account owner. |
| store_name | string | Storefront name. |
| slug | string | Used for shareable URL. |
| description | text | Short store description. |
| whatsapp_phone | string | Contact number. |
| mpesa_phone | string | Payment instruction number. |
| is_verified | boolean | True after admin approval. |
| created_at | datetime | Creation timestamp. |
| updated_at | datetime | Last update timestamp. |

### 3.3 SellerVerificationRequest

Tracks seller verification requests and admin decisions.

| Field | Type | Notes |
| --- | --- | --- |
| id | UUID / integer | Primary key. |
| user_id | FK User | Seller requesting verification. |
| business_name | string | Name used in trade. |
| business_location | string | Example: RNG Plaza, Nairobi CBD. |
| phone_number | string | Contact number for verification. |
| status | enum | Pending, Approved, Rejected. |
| admin_note | text | Admin reason or comment. |
| reviewed_by | FK User | Admin who reviewed it. |
| reviewed_at | datetime | Review timestamp. |
| created_at | datetime | Request timestamp. |

### 3.4 BuyerSellerRelationship

Controls trusted access between hawkers and wholesalers.

| Field | Type | Notes |
| --- | --- | --- |
| id | UUID / integer | Primary key. |
| buyer_id | FK User | Hawker/reseller. |
| seller_id | FK SellerProfile | Wholesaler/storefront. |
| status | enum | Pending, Approved, Rejected, Blocked. |
| approved_at | datetime | Set when approved. |
| created_at | datetime | Request timestamp. |

### 3.5 Catalog Entities

These entities keep the phone accessories catalog structured.

| Entity | Purpose |
| --- | --- |
| Category | Example: Screen Protectors, Phone Covers, Chargers. |
| ProductType | Example: Privacy Glass, 3D Glass, USB-C Charger. |
| BrandFamily | Example: Samsung, iPhone, Tecno, Infinix. |
| DeviceModel | Example: Samsung A54, iPhone 13. |
| ProductVariant | The exact catalog item, such as Samsung A54 Privacy 3D Glass. |

### 3.6 SellerProduct

Connects a seller to a catalog item and defines seller-specific trade information.

| Field | Type | Notes |
| --- | --- | --- |
| id | UUID / integer | Primary key. |
| seller_id | FK SellerProfile | Owning seller. |
| product_variant_id | FK ProductVariant | Catalog item. |
| price | decimal | Seller's wholesale price. |
| pack_size | integer | Number of units in a pack. |
| minimum_order_quantity | integer | Minimum buyer quantity. |
| visibility | enum | Public, Trusted Only, Hidden. |
| availability_label | enum | Available, Can Be Sourced, Limited, Confirm with Seller, Unavailable. |
| created_at | datetime | Creation timestamp. |
| updated_at | datetime | Last update timestamp. |

### 3.7 InventoryRecord

Stores exact stock privately for seller use only.

| Field | Type | Notes |
| --- | --- | --- |
| id | UUID / integer | Primary key. |
| seller_product_id | FK SellerProduct | Product being tracked. |
| exact_quantity | integer | Restricted data. Never buyer-facing. |
| updated_by | FK User | Seller who updated the stock. |
| updated_at | datetime | Last update timestamp. |

### 3.8 Order

Represents the submitted buyer shopping list and seller fulfillment process.

| Field | Type | Notes |
| --- | --- | --- |
| id | UUID / integer | Primary key. |
| buyer_id | FK User | Hawker/reseller. |
| seller_id | FK SellerProfile | Wholesaler. |
| status | enum | Draft, Submitted, Sourcing & Packing, Locked & Updated, Debt Active, Cleared, Cancelled. |
| draft_total | decimal | Catalog item total before seller adjustments. |
| final_total | decimal | Total after seller invoice adjustments. |
| locked_at | datetime | Set when submitted. |
| submitted_at | datetime | Submission timestamp. |
| created_at | datetime | Creation timestamp. |
| updated_at | datetime | Last update timestamp. |

### 3.9 OrderItem

Stores catalog items selected by the buyer.

| Field | Type | Notes |
| --- | --- | --- |
| id | UUID / integer | Primary key. |
| order_id | FK Order | Parent order. |
| seller_product_id | FK SellerProduct | Selected item. |
| quantity | integer | Buyer requested quantity. |
| unit_price_snapshot | decimal | Price at the time of order. |
| line_total | decimal | Quantity multiplied by unit price. |

### 3.10 SourcingNote

Stores uncatalogued item requests written by the buyer before submission.

| Field | Type | Notes |
| --- | --- | --- |
| id | UUID / integer | Primary key. |
| order_id | FK Order | Related shopping list/order. |
| note_text | text | Example: "Kindly get me two Bluetooth radios." |
| created_by | FK User | Buyer who wrote the note. |
| created_at | datetime | Creation timestamp. |

### 3.11 InvoiceAdjustment

Stores seller-added charges or corrections after sourcing.

| Field | Type | Notes |
| --- | --- | --- |
| id | UUID / integer | Primary key. |
| order_id | FK Order | Related order. |
| description | text | Example: "Bluetooth radio sourced from nearby shop." |
| amount | decimal | Added or corrected amount. |
| created_by | FK User | Seller who added adjustment. |
| created_at | datetime | Creation timestamp. |

### 3.12 SellerPaymentReceipt

Stores seller-entered payment receipts after external verification.

| Field | Type | Notes |
| --- | --- | --- |
| id | UUID / integer | Primary key. |
| order_id | FK Order | Related order. |
| seller_id | FK SellerProfile | Seller recording payment. |
| buyer_id | FK User | Buyer who paid. |
| amount_received | decimal | Amount received externally. |
| payment_method | enum | M-Pesa, Cash, Other. |
| external_reference_note | text | Optional note from SMS or seller memory. |
| created_by | FK User | Must be seller in MVP. |
| created_at | datetime | Creation timestamp. |

### 3.13 CreditLedgerEntry

Append-only financial ledger for charges, payments, corrections, and debt status.

| Field | Type | Notes |
| --- | --- | --- |
| id | UUID / integer | Primary key. |
| order_id | FK Order | Related order. |
| seller_id | FK SellerProfile | Seller controlling the ledger. |
| buyer_id | FK User | Buyer involved. |
| entry_type | enum | Charge, Payment, Correction, Due Date Update, Cleared. |
| amount | decimal | Entry amount. |
| balance_after | decimal | Balance after this entry. |
| due_date | date | Optional or required when balance remains. |
| note | text | Human-readable explanation. |
| created_by | FK User | Usually seller. |
| created_at | datetime | Creation timestamp. |

### 3.14 AuditLog

Records sensitive actions for traceability.

| Field | Type | Notes |
| --- | --- | --- |
| id | UUID / integer | Primary key. |
| actor_id | FK User | User who performed action. |
| action | string | Example: SELLER_VERIFIED, LEDGER_ENTRY_CREATED. |
| target_type | string | Entity type affected. |
| target_id | string | Entity ID affected. |
| summary | text | Short explanation. |
| created_at | datetime | Timestamp. |

## 4. API Conventions

### 4.1 General Rules

- All protected endpoints require JWT authentication.
- Backend permissions are mandatory even if the frontend hides controls.
- Buyer-facing product responses must exclude exact stock quantities.
- Ledger write endpoints are seller-only in the MVP.
- Errors should be simple and readable.

### 4.2 Example Response Format

```json
{
  "data": {},
  "message": "Action completed successfully."
}
```

### 4.3 Example Error Format

```json
{
  "error": {
    "code": "permission_denied",
    "message": "You are not allowed to perform this action."
  }
}
```

## 5. Authentication API

### POST `/api/auth/register/`

Creates a new user account.

Request:

```json
{
  "full_name": "Example Buyer",
  "phone_number": "0712345678",
  "email": "buyer@example.com",
  "password": "StrongPassword123",
  "role": "hawker"
}
```

Response:

```json
{
  "data": {
    "id": "user-id",
    "full_name": "Example Buyer",
    "role": "hawker"
  },
  "message": "Account created successfully."
}
```

### POST `/api/auth/login/`

Authenticates a user and returns tokens.

Request:

```json
{
  "phone_number": "0712345678",
  "password": "StrongPassword123"
}
```

Response:

```json
{
  "data": {
    "access": "jwt-access-token",
    "refresh": "jwt-refresh-token",
    "user": {
      "id": "user-id",
      "full_name": "Example Buyer",
      "role": "hawker"
    }
  },
  "message": "Login successful."
}
```

## 6. Seller Verification API

### POST `/api/seller-verifications/`

Allows a wholesaler user to request verification.

Request:

```json
{
  "business_name": "Nyakizu Accessories",
  "business_location": "Nairobi CBD",
  "phone_number": "0712345678"
}
```

### PATCH `/api/seller-verifications/{id}/review/`

Allows an admin to approve or reject a seller verification request.

Request:

```json
{
  "status": "approved",
  "admin_note": "Seller details confirmed."
}
```

Permission:

- Admin only.

## 7. Storefront And Catalog API

### GET `/api/storefronts/{slug}/`

Returns storefront information.

Notes:

- Public or trusted data depends on seller visibility settings.
- Exact stock quantities are never included.

### POST `/api/seller-products/`

Creates a seller product.

Permission:

- Verified wholesaler only.

Request:

```json
{
  "product_variant_id": "variant-id",
  "price": "150.00",
  "pack_size": 10,
  "minimum_order_quantity": 1,
  "visibility": "trusted_only",
  "availability_label": "can_be_sourced"
}
```

### PATCH `/api/seller-products/{id}/inventory/`

Updates exact stock quantity.

Permission:

- Owning seller only.

Request:

```json
{
  "exact_quantity": 48
}
```

Important security note: this endpoint is not used by buyer-facing views.

## 8. Relationship API

### POST `/api/relationships/`

Buyer requests trusted access to a seller.

Request:

```json
{
  "seller_id": "seller-profile-id"
}
```

### PATCH `/api/relationships/{id}/review/`

Seller approves, rejects, or blocks buyer access.

Permission:

- Owning seller only.

Request:

```json
{
  "status": "approved"
}
```

## 9. Order And Shopping List API

### POST `/api/orders/`

Creates a draft order/shopping list.

Permission:

- Hawker only.

Request:

```json
{
  "seller_id": "seller-profile-id",
  "items": [
    {
      "seller_product_id": "seller-product-id",
      "quantity": 2
    }
  ],
  "sourcing_notes": [
    {
      "note_text": "Kindly get me two Bluetooth radios."
    }
  ]
}
```

### POST `/api/orders/{id}/submit/`

Submits and locks the shopping list.

Rules:

- Buyer must own the order.
- Order must still be Draft.
- After submission, buyer cannot edit items or sourcing notes.

### GET `/api/orders/{id}/`

Returns order details for the allowed buyer or seller.

Rules:

- Buyer can view own order.
- Seller can view orders sent to own storefront.
- Other users are denied.

## 10. Fulfillment And Invoice API

### PATCH `/api/orders/{id}/fulfillment/`

Seller updates fulfillment state.

Permission:

- Owning seller only.

Request:

```json
{
  "status": "sourcing_and_packing"
}
```

### POST `/api/orders/{id}/adjustments/`

Seller adds invoice adjustment for sourced items or corrections.

Permission:

- Owning seller only.

Request:

```json
{
  "description": "Bluetooth radio sourced from nearby shop",
  "amount": "1200.00"
}
```

Rules:

- Adjustment creates audit log.
- Final total is recalculated.
- Adjustment history remains visible to involved buyer and seller.

## 11. Ledger And Payment API

### POST `/api/orders/{id}/payments/`

Seller records externally received payment.

Permission:

- Owning seller only.

Request:

```json
{
  "amount_received": "3000.00",
  "payment_method": "mpesa",
  "external_reference_note": "Confirmed by Safaricom SMS",
  "due_date": "2026-06-30"
}
```

Rules:

- Creates `SellerPaymentReceipt`.
- Creates append-only `CreditLedgerEntry`.
- Recalculates balance.
- Updates order status to Debt Active or Cleared.

### GET `/api/orders/{id}/ledger/`

Returns ledger entries for allowed users.

Permission:

- Involved seller.
- Involved buyer.
- Authorized admin audit workflow.

### POST `/api/orders/{id}/ledger/corrections/`

Seller records a correction entry.

Permission:

- Owning seller only.

Request:

```json
{
  "amount": "-500.00",
  "note": "Correction for over-counted sourced item."
}
```

## 12. Admin API

### POST `/api/categories/`

Admin creates category.

### POST `/api/product-types/`

Admin creates product type.

### POST `/api/brand-families/`

Admin creates brand family.

### POST `/api/device-models/`

Admin creates device model.

### GET `/api/audit-logs/`

Admin reviews audit logs.

Permission:

- Admin only.

## 13. Offline Sync API

### POST `/api/sync/orders/`

Receives pending offline order payloads when the client reconnects.

Request:

```json
{
  "local_id": "local-draft-123",
  "seller_id": "seller-profile-id",
  "items": [
    {
      "seller_product_id": "seller-product-id",
      "quantity": 2
    }
  ],
  "sourcing_notes": [
    {
      "note_text": "Kindly get me two Bluetooth radios."
    }
  ]
}
```

Response:

```json
{
  "data": {
    "local_id": "local-draft-123",
    "server_order_id": "order-id",
    "status": "submitted"
  },
  "message": "Offline order synced successfully."
}
```

Important note: the synced order still requires seller fulfillment because cached catalog data may be stale.

## 14. Permission Test Checklist

These checks should become backend tests during implementation.

- Buyer cannot view exact stock quantity.
- Buyer cannot update inventory.
- Buyer cannot approve seller verification.
- Unverified seller cannot publish buyer-facing storefront.
- Buyer cannot edit an order after submission.
- Buyer cannot add invoice adjustments.
- Buyer cannot record payment receipts.
- Buyer cannot write ledger entries.
- Seller cannot access another seller's orders.
- Buyer cannot view another buyer's debt ledger.
- Admin-only taxonomy endpoints reject non-admin users.

## 15. Traceability

| API Area | Requirements Covered |
| --- | --- |
| Authentication API | FR-001 to FR-004 |
| Seller Verification API | FR-005 to FR-007 |
| Storefront And Catalog API | FR-008 to FR-014 |
| Relationship API | FR-015 to FR-017 |
| Order And Shopping List API | FR-018 to FR-024 |
| Fulfillment And Invoice API | FR-025 to FR-029 |
| Ledger And Payment API | FR-030 to FR-036 |
| Offline Sync API | FR-037 to FR-041 |
| Admin API | FR-042 to FR-044 |

