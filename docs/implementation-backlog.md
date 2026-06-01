# Implementation Backlog

## Nyakizu Digital Market

This backlog converts the SRS into buildable student-level tasks. Each item is linked to requirement IDs so development, testing, and academic reporting can be traced.

## Priority Labels

- P0: Required for MVP demonstration.
- P1: Important but can be simplified if time is limited.
- P2: Future improvement after MVP.

## Status Labels

- Planned: Not started.
- In Progress: Currently being worked on.
- Done: Implemented and tested.
- Deferred: Moved out of the current phase.

## Epic 1: Project Setup And Authentication

Goal: Create the technical foundation for frontend, backend, database, and secure user access.

| Story ID | User Story | Requirements | Priority | Status |
| --- | --- | --- | --- | --- |
| US-001 | As a user, I can register for an account so that I can access Nyakizu. | FR-001 | P0 | Planned |
| US-002 | As a user, I can log in and log out securely. | FR-001, FR-004 | P0 | Planned |
| US-003 | As the system, I can assign roles so users only access allowed features. | FR-002, FR-003 | P0 | Planned |
| US-004 | As a developer, I can run the frontend and backend locally. | NFR-012 | P0 | Planned |

Acceptance notes:

- A buyer cannot access seller-only pages.
- A seller cannot access admin-only pages.
- Login failure messages should be simple and clear.

## Epic 2: Seller Verification

Goal: Ensure only verified wholesalers can publish buyer-facing storefronts.

| Story ID | User Story | Requirements | Priority | Status |
| --- | --- | --- | --- | --- |
| US-005 | As a seller, I can submit a verification request. | FR-005 | P0 | Planned |
| US-006 | As an admin, I can approve or reject seller verification. | FR-006 | P0 | Planned |
| US-007 | As the system, I can hide unverified sellers from buyer-facing areas. | FR-007 | P0 | Planned |

Acceptance notes:

- Unverified sellers may prepare data but should not appear as trusted storefronts.
- Admin approval should create an audit record.

## Epic 3: Storefront And Catalog

Goal: Let wholesalers create digital storefronts and manage product data without exposing sensitive stock information.

| Story ID | User Story | Requirements | Priority | Status |
| --- | --- | --- | --- | --- |
| US-008 | As a verified wholesaler, I can create and update my storefront profile. | FR-008 | P0 | Planned |
| US-009 | As a verified wholesaler, I can share my storefront URL through WhatsApp. | FR-009 | P0 | Planned |
| US-010 | As an admin, I can manage categories, brands, and device models. | FR-010, FR-042 | P0 | Planned |
| US-011 | As a seller, I can create product variants with price, pack size, and minimum order quantity. | FR-010, FR-011 | P0 | Planned |
| US-012 | As a seller, I can record exact internal stock for my own use. | FR-012 | P0 | Planned |
| US-013 | As a buyer, I see availability labels but not exact stock quantities. | FR-013, FR-014 | P0 | Planned |

Acceptance notes:

- Exact stock must not appear in buyer API responses.
- Availability labels should use simple wording: Available, Can Be Sourced, Limited, Confirm with Seller, Unavailable.
- Storefront sharing can start as a copyable link before deeper WhatsApp integration.

## Epic 4: Trusted Buyer Relationships

Goal: Make trusted relationships the main market access model.

| Story ID | User Story | Requirements | Priority | Status |
| --- | --- | --- | --- | --- |
| US-014 | As a hawker, I can request access to a wholesaler storefront. | FR-015 | P0 | Planned |
| US-015 | As a wholesaler, I can approve or reject buyer access. | FR-016 | P0 | Planned |
| US-016 | As a buyer, I can view My Suppliers as my main buying area. | FR-017 | P0 | Planned |

Acceptance notes:

- Buyers should not see confidential seller catalog details unless trusted access is approved.
- Relationship approval should be visible to both sides.

## Epic 5: Digital Shopping List And Sourcing Notes

Goal: Give buyers a fast ordering experience while preserving seller control after submission.

| Story ID | User Story | Requirements | Priority | Status |
| --- | --- | --- | --- | --- |
| US-017 | As a buyer, I can add catalog items to a digital shopping list. | FR-018 | P0 | Planned |
| US-018 | As a buyer, I can see the draft total for catalog items. | FR-019 | P0 | Planned |
| US-019 | As a buyer, I can add sourcing notes for uncatalogued items. | FR-020 | P0 | Planned |
| US-020 | As a buyer, I can save a draft shopping list offline. | FR-021, FR-039 | P1 | Planned |
| US-021 | As a buyer, I can submit a shopping list when online. | FR-022 | P0 | Planned |
| US-022 | As the system, I can mark offline submissions as Pending Sync. | FR-023, FR-041 | P1 | Planned |

Acceptance notes:

- Sourcing notes must be added before submission.
- Buyer should understand that sourced item prices are finalized by the seller.
- Offline draft support may be demonstrated with browser storage in the semester prototype.

## Epic 6: Order Locking And Seller Fulfillment

Goal: Prevent order confusion and give the seller control over sourcing and invoice finalization.

| Story ID | User Story | Requirements | Priority | Status |
| --- | --- | --- | --- | --- |
| US-023 | As the system, I lock buyer edits immediately after submission. | FR-024 | P0 | Planned |
| US-024 | As a seller, I can view submitted shopping lists. | FR-025 | P0 | Planned |
| US-025 | As a seller, I can move an order to Sourcing & Packing. | FR-026 | P0 | Planned |
| US-026 | As a seller, I can add sourced item charges or invoice adjustments. | FR-027 | P0 | Planned |
| US-027 | As the system, I can calculate final invoice total. | FR-028 | P0 | Planned |
| US-028 | As a buyer, I can view the final invoice total after seller updates. | FR-029 | P0 | Planned |

Acceptance notes:

- Buyer edit buttons should be disabled or hidden after submission.
- Seller invoice adjustments must be audited.
- Buyer should see final invoice history clearly enough to reduce disputes.

## Epic 7: Wholesaler-Controlled Ledger

Goal: Provide a strict financial ledger controlled by the seller.

| Story ID | User Story | Requirements | Priority | Status |
| --- | --- | --- | --- | --- |
| US-029 | As a seller, I can record an externally received M-Pesa payment. | FR-030 | P0 | Planned |
| US-030 | As a seller, I can set a due date for unpaid balance. | FR-031 | P0 | Planned |
| US-031 | As the system, I can calculate remaining debt after payment entries. | FR-032 | P0 | Planned |
| US-032 | As the system, I can mark debt as active, overdue, or cleared. | FR-033 | P0 | Planned |
| US-033 | As the system, I keep ledger entries append-only. | FR-034, FR-035 | P0 | Planned |
| US-034 | As a buyer, I can view my own debt status with the wholesaler. | FR-036 | P0 | Planned |

Acceptance notes:

- Buyer must not be able to create payment entries.
- Existing ledger entries must not be silently edited.
- Corrections should appear as new entries.

## Epic 8: Offline And PWA Support

Goal: Make the app useful in low-network environments.

| Story ID | User Story | Requirements | Priority | Status |
| --- | --- | --- | --- | --- |
| US-035 | As a user, I can load the basic app shell after it has been cached. | FR-037 | P1 | Planned |
| US-036 | As a buyer, I can view last-synced catalog data. | FR-038 | P1 | Planned |
| US-037 | As the system, I can store draft shopping lists in IndexedDB. | FR-039 | P1 | Planned |
| US-038 | As the system, I can sync pending actions when the network returns. | FR-040 | P1 | Planned |
| US-039 | As a user, I can see clear offline status labels. | FR-041 | P0 | Planned |

Acceptance notes:

- Offline features should be honest about stale data.
- The prototype can keep sync simple if Background Sync becomes too complex.

## Epic 9: Audit And Admin Support

Goal: Support trust, moderation, and academic evidence of secure design.

| Story ID | User Story | Requirements | Priority | Status |
| --- | --- | --- | --- | --- |
| US-040 | As the system, I create audit logs for important business actions. | FR-043 | P0 | Planned |
| US-041 | As an authorized admin, I can review audit logs for disputes. | FR-044 | P1 | Planned |

Acceptance notes:

- Audit logs should include actor, action, target, timestamp, and summary.
- Sensitive audit details should not leak to normal users.

## Suggested Build Order

1. Project setup and authentication.
2. Roles and basic dashboards.
3. Seller verification.
4. Storefront and catalog.
5. Trusted buyer relationships.
6. Digital shopping list and sourcing notes.
7. Order lock and seller fulfillment.
8. Seller-controlled ledger.
9. Offline drafts and PWA caching.
10. Audit logs, QA, polish, and demo data.

## First Demo Dataset

Use a small realistic dataset for testing and presentation:

- Two verified wholesalers.
- Three hawkers.
- Categories: Screen Protectors, Phone Covers, Chargers, Earphones.
- Brands: Samsung, iPhone, Tecno, Infinix.
- Device models: Samsung A54, iPhone 13, Tecno Spark 10, Infinix Hot 30.
- Availability labels: Available, Can Be Sourced, Limited, Confirm with Seller.
- One order with sourcing notes.
- One partially paid order with active debt.
- One cleared order.

