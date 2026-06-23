# Software Requirements Specification

## Nyakizu Digital Market

Student: Nzabakamira Shema Manasse  
Student ID: 668852  
Course: SWE3090XA - Software Engineering Project I  
Institution: United States International University-Africa  
Supervisor: Dr. Ogore Frederic Michael  
Date: June 2026

## Document Note

This SRS is written at student project level. It explains the system clearly, keeps requirements traceable, and avoids unnecessary enterprise complexity. The document should be updated whenever the project scope, design, or implementation changes.

## 1. Introduction

### 1.1 Purpose

The purpose of this document is to define the software requirements for Nyakizu Digital Market. The SRS will guide design, development, testing, academic review, and future improvement.

### 1.2 Project Background

Nyakizu Digital Market is a community-based B2B digital market for trusted phone accessories trade. It supports wholesalers, hawkers, and resellers who already trade using WhatsApp, M-Pesa, notebooks, memory, and trust-based credit.

The system does not try to replace the existing trading culture. Instead, it digitizes the most important parts of the current workflow:

- Product catalog browsing.
- Digital shopping list creation.
- Sourcing notes for uncatalogued items.
- Seller-controlled fulfillment.
- Seller-controlled invoice updates.
- Seller-controlled payment and credit ledger.
- Offline draft support for low-network environments.

### 1.3 Intended Users

This document is intended for:

- The student developer.
- The academic supervisor.
- Future project reviewers.
- Testers and evaluators.
- Potential community stakeholders.
- Future contributors to the project.

### 1.4 Product Scope

The MVP focuses on a trusted wholesaler-hawker transaction. The buyer uses the system to create a structured shopping list, while the wholesaler controls fulfillment, sourcing, final invoice total, and payment/debt records.

The MVP does not include direct M-Pesa integration, public marketplace competition, advanced analytics, ratings, reviews, or automated stock reservation.

## 2. Overall Description

### 2.1 Product Perspective

Nyakizu Digital Market will be built as a web application. Users access it through a mobile browser and may install it as a Progressive Web App. The system will use a frontend web app, a backend API, and a PostgreSQL database.

The project is designed to support real community trade while remaining achievable within a semester.

### 2.2 Product Functions

At a high level, the system will:

- Register and authenticate users.
- Assign users roles.
- Verify wholesalers.
- Allow wholesalers to create storefronts.
- Allow wholesalers to share storefront links through WhatsApp.
- Allow wholesalers to manage product catalogs.
- Hide exact stock quantities from buyers.
- Show simple availability labels to trusted buyers.
- Allow hawkers to create digital shopping lists.
- Allow hawkers to add sourcing notes before submitting.
- Lock submitted shopping lists.
- Allow sellers to fulfill, source, and update final invoice totals.
- Allow sellers to record external M-Pesa payments manually.
- Track credit, partial payments, due dates, and balances.
- Keep ledger records append-only.
- Support offline drafts and pending sync behavior.
- Keep audit logs for important actions.

### 2.3 User Classes

| User Class | Description |
| --- | --- |
| Admin / Moderator | Manages seller verification, taxonomy data, and audit review. |
| Verified Wholesaler | Owns storefront, catalog, buyer relationships, fulfillment, invoices, and ledger entries. |
| Hawker / Reseller | Browses trusted wholesaler storefronts, creates shopping lists, adds sourcing notes, and views debt status. |

### 2.4 Operating Environment

The system is expected to operate in the following environment:

- Mobile-first web browser access.
- Budget Android smartphones.
- Low or unstable internet connections.
- Frontend deployed on Vercel or similar hosting.
- Backend deployed on Render, Railway, or similar hosting.
- PostgreSQL database.

### 2.5 Design And Implementation Constraints

- The MVP must fit within a semester timeline.
- Direct M-Pesa API integration is excluded from the MVP.
- Buyer-facing views must not show exact stock counts.
- Ledger writes are controlled by the wholesaler in the MVP.
- Submitted shopping lists must be locked to prevent buyer changes.
- Offline support should focus on drafts and pending sync, not full conflict resolution.
- The user interface should be simple enough for traders with basic smartphone skills.

### 2.6 Assumptions And Dependencies

- Hawkers already have trusted wholesaler relationships.
- Wholesalers are willing to share storefront links through WhatsApp.
- Sellers will manually verify M-Pesa payments from Safaricom SMS messages.
- Some users may have weak internet access.
- The academic project requires documentation, implementation, testing, and demonstration.

## 3. Functional Requirements

This section lists the main functional requirements. Each requirement uses an ID for traceability during design, coding, testing, and reporting.

### 3.1 User And Role Management

| ID | Requirement | Priority |
| --- | --- | --- |
| FR-001 | The system shall allow users to register and log in securely. | Must |
| FR-002 | The system shall assign users one or more roles. | Must |
| FR-003 | The system shall restrict features based on user role. | Must |
| FR-004 | The system shall allow users to log out. | Must |

### 3.2 Seller Verification

| ID | Requirement | Priority |
| --- | --- | --- |
| FR-005 | The system shall allow a user to request wholesaler verification. | Must |
| FR-006 | The system shall allow admins to approve or reject verification requests. | Must |
| FR-007 | The system shall prevent unverified sellers from appearing in buyer-facing storefront discovery. | Must |

### 3.3 Storefront And Catalog

| ID | Requirement | Priority |
| --- | --- | --- |
| FR-008 | The system shall allow verified wholesalers to create and update storefront profiles. | Must |
| FR-009 | The system shall allow wholesalers to share storefront URLs externally, especially through WhatsApp. | Must |
| FR-010 | The system shall support product categories, product types, brand families, device models, and variants. | Must |
| FR-011 | The system shall allow sellers to define product price, pack size, minimum order quantity, visibility, and availability label. | Must |
| FR-012 | The system shall store exact stock quantities for seller use. | Must |
| FR-013 | The system shall hide exact stock quantities from buyers. | Must |
| FR-014 | The system shall show buyer-facing availability labels instead of exact stock counts. | Must |

### 3.4 Trusted Buyer Relationships

| ID | Requirement | Priority |
| --- | --- | --- |
| FR-015 | The system shall allow hawkers to request access to a wholesaler storefront. | Must |
| FR-016 | The system shall allow wholesalers to approve or reject trusted buyer access. | Must |
| FR-017 | The system shall make trusted suppliers the primary buyer experience. | Must |

### 3.5 Digital Shopping List And Sourcing Notes

| ID | Requirement | Priority |
| --- | --- | --- |
| FR-018 | The system shall allow buyers to create a digital shopping list from a trusted seller catalog. | Must |
| FR-019 | The system shall automatically calculate the draft total for catalog items. | Must |
| FR-020 | The system shall allow buyers to add sourcing notes for uncatalogued items before submission. | Must |
| FR-021 | The system shall allow buyers to save shopping list drafts offline. | Should |
| FR-022 | The system shall allow buyers to submit shopping lists when online. | Must |
| FR-023 | The system shall store offline submissions as Pending Sync when the network is unavailable. | Should |

### 3.6 Order Locking And Fulfillment

| ID | Requirement | Priority |
| --- | --- | --- |
| FR-024 | The system shall lock buyer edits immediately after shopping list submission. | Must |
| FR-025 | The system shall allow sellers to view submitted shopping lists. | Must |
| FR-026 | The system shall allow sellers to move orders into Sourcing & Packing. | Must |
| FR-027 | The system shall allow sellers to add sourced item charges or invoice adjustments. | Must |
| FR-028 | The system shall calculate the final invoice total after seller updates. | Must |
| FR-029 | The system shall expose the final invoice total to the involved buyer. | Must |

### 3.7 Seller-Controlled Ledger

| ID | Requirement | Priority |
| --- | --- | --- |
| FR-030 | The system shall allow sellers to record externally received payments manually. | Must |
| FR-031 | The system shall allow sellers to set due dates for unpaid balances. | Must |
| FR-032 | The system shall calculate remaining debt after each payment entry. | Must |
| FR-033 | The system shall mark debts as active, overdue, or cleared. | Must |
| FR-034 | The system shall make ledger entries append-only. | Must |
| FR-035 | The system shall use correction entries instead of silent edits or deletions. | Must |
| FR-036 | The system shall allow buyers to view only their own debt records with the involved wholesaler. | Must |

### 3.8 Offline Support

| ID | Requirement | Priority |
| --- | --- | --- |
| FR-037 | The system shall cache the application shell for basic offline loading. | Should |
| FR-038 | The system shall cache last-synced catalog data. | Should |
| FR-039 | The system shall store draft shopping lists in IndexedDB. | Should |
| FR-040 | The system shall sync pending actions when connectivity returns. | Should |
| FR-041 | The system shall clearly mark offline data as Draft, Saved Offline, Pending Sync, or Synced. | Must |

### 3.9 Admin And Audit

| ID | Requirement | Priority |
| --- | --- | --- |
| FR-042 | The system shall allow admins to manage platform taxonomy such as categories, brands, and device models. | Must |
| FR-043 | The system shall keep audit logs for verification, invoice adjustments, order status changes, and ledger entries. | Must |
| FR-044 | The system shall allow authorized admins to review audit information for dispute support. | Should |

## 4. Non-Functional Requirements

| ID | Requirement | Priority |
| --- | --- | --- |
| NFR-001 | The interface shall be mobile-first. | Must |
| NFR-002 | The system shall be usable on budget Android smartphones. | Must |
| NFR-003 | The system shall use simple language and clear buttons. | Must |
| NFR-004 | The system shall protect exact stock quantities from buyer access. | Must |
| NFR-005 | The system shall protect credit, debt, and payment records from unauthorized access. | Must |
| NFR-006 | The system shall use HTTPS in deployed environments. | Must |
| NFR-007 | The backend shall validate all important user inputs. | Must |
| NFR-008 | The system shall use role-based access control. | Must |
| NFR-009 | Important business records shall be auditable. | Must |
| NFR-010 | Core pages should load quickly on weak networks. | Should |
| NFR-011 | Offline draft data should not disappear when network connection fails. | Should |
| NFR-012 | The system should allow future expansion to public discovery, SMS, analytics, and M-Pesa API integration. | Should |

## 5. System States

| State | Description |
| --- | --- |
| Draft | Buyer is building a shopping list. Draft may exist offline. |
| Submitted | Buyer submitted the list. Buyer edits are locked. |
| Sourcing & Packing | Seller is packing catalog items and sourcing special requests. |
| Locked & Updated | Seller has finalized invoice changes. |
| Debt Active | There is unpaid balance after payment or credit approval. |
| Cleared | Seller has recorded full payment. |
| Cancelled | Seller or allowed workflow cancels the transaction. |

## 6. Data Requirements

The initial data entities are:

- User.
- Role.
- Seller verification request.
- Seller profile.
- Buyer-seller relationship.
- Category.
- Product type.
- Brand family.
- Device model.
- Product variant.
- Seller product.
- Inventory record.
- Availability status.
- Order.
- Order item.
- Sourcing note.
- Invoice adjustment.
- Seller payment receipt.
- Credit ledger entry.
- Audit log.
- Offline sync queue item.

## 7. Data Classification

| Data Element | Classification | Access Rule |
| --- | --- | --- |
| Platform taxonomy | Public within system | Authenticated users may view. |
| Storefront link | Public or semi-public | Anyone with link may view public storefront info, depending on seller settings. |
| Availability labels | Confidential | Trusted buyers for that wholesaler may view. |
| Sourcing notes | Confidential | Only the involved buyer and seller may view. |
| Exact stock quantities | Restricted | Only the owning seller may view. |
| Credit and debt ledger | Restricted | Only the involved buyer, seller, and authorized audit workflow may view. |

## 8. Use Cases

### UC-001: Buyer Creates Digital Shopping List

Actor: Hawker / Reseller  
Precondition: Buyer is logged in and has access to a trusted wholesaler storefront.  
Main Flow:

1. Buyer opens the wholesaler storefront.
2. Buyer browses catalog items.
3. Buyer adds items to the shopping list.
4. System calculates the draft total.
5. Buyer adds sourcing notes if needed.
6. Buyer submits the list.
7. System locks the submitted list.

Postcondition: Seller can view the submitted shopping list.

### UC-002: Seller Fulfills And Updates Invoice

Actor: Verified Wholesaler  
Precondition: A buyer has submitted a shopping list.  
Main Flow:

1. Seller opens submitted order.
2. Seller reviews catalog items and sourcing notes.
3. Seller moves order to Sourcing & Packing.
4. Seller packs available catalog items.
5. Seller sources uncatalogued items where possible.
6. Seller adds invoice adjustments.
7. System calculates final invoice total.

Postcondition: Buyer can view final invoice total.

### UC-003: Seller Records Payment And Debt

Actor: Verified Wholesaler  
Precondition: Seller has verified payment outside the system or approved credit.  
Main Flow:

1. Seller opens the order ledger.
2. Seller enters received amount.
3. Seller enters due date if balance remains.
4. System appends payment entry.
5. System calculates remaining balance.
6. System marks debt as active, overdue, cleared, or paid according to balance and due date.

Postcondition: Ledger is updated without deleting previous records.

### UC-004: Buyer Creates Offline Draft

Actor: Hawker / Reseller  
Precondition: Buyer has previously synced catalog data.  
Main Flow:

1. Buyer opens app in weak or no network.
2. System loads cached app shell and catalog where available.
3. Buyer creates a draft shopping list.
4. System saves draft in IndexedDB.
5. When network returns, system marks the draft ready for sync.

Postcondition: Draft is preserved and can be submitted later.

## 9. Acceptance Criteria Examples

| Requirement | Acceptance Criteria |
| --- | --- |
| FR-013 | When logged in as a buyer, API responses and UI screens do not show exact stock quantity. |
| FR-020 | Buyer can type a sourcing note before submission, and seller can see it after submission. |
| FR-024 | After submission, buyer cannot add, remove, or edit order items. |
| FR-027 | Seller can add a sourced item charge, and final invoice total changes accordingly. |
| FR-030 | Buyer cannot create seller payment receipt entries. |
| FR-034 | Existing ledger entries cannot be silently edited or deleted through normal user workflows. |
| FR-041 | Offline records show clear status labels such as Draft or Pending Sync. |

## 10. Traceability Starter Table

| Requirement ID | Design Area | Test Focus |
| --- | --- | --- |
| FR-001 | Authentication | Register, login, logout tests. |
| FR-013 | Inventory privacy | Buyer cannot see exact stock. |
| FR-020 | Sourcing notes | Buyer creates note, seller views note. |
| FR-024 | Order locking | Buyer cannot edit after submission. |
| FR-027 | Invoice adjustment | Seller adjusts final invoice. |
| FR-030 | Seller payment receipt | Seller records payment; buyer cannot. |
| FR-034 | Append-only ledger | Ledger entries preserve history. |
| FR-041 | Offline status | Draft and pending sync labels display correctly. |

## 11. Open Issues

- Final seller verification fields still need to be selected.
- Demo product categories and device models need to be prepared.
- Exact offline sync behavior may be simplified for semester demonstration.
- Language support should be confirmed: English only, Kiswahili, Kinyamulenge, or mixed.
- Dispute review workflow should be kept simple in MVP unless required by the supervisor.

