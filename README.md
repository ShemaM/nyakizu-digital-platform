### Nyakizu Digital Market

Community-based B2B platform for trusted phone accessories trade in Kenya.

What it is

Nyakizu Digital Market is a Progressive Web App (PWA) designed for Banyamulenge phone accessories traders in Nairobi. It digitizes existing trade workflows—catalog management, orders, payments, and credit tracking—without disrupting the trust-based supplier relationships that already power the business network. The platform is intentionally not a public marketplace. Buyers interact with sellers they already know and trust.

### Why Nyakizu exists

The trading ecosystem already works. Wholesalers know their buyers, buyers know their suppliers, and credit relationships are established. The operational challenge is that business records are still managed through WhatsApp messages, notebooks, M-Pesa confirmations, phone calls, and memory. As transaction volume grows, traders face difficulties tracking debts and partial payments, finding product information quickly, reconciling M-Pesa references with orders, and managing orders that change after packing has begun. Nyakizu addresses these problems while preserving the community’s existing way of doing business.

Nyakizu Digital Market Concept Note.pdf

### Key design principles

* Trust-first commerce

  Buyers access catalogs only from sellers who have approved them as trusted customers. Discovery is relationship-driven, not algorithm-driven.

  Nyakizu Digital Market Concept Note.pdf

* Hidden inventory quantities

  Buyers see availability labels such as Available or Can be sourced, while exact stock counts remain visible only to sellers. This reflects real-world wholesale practices where sellers can source additional inventory through supplier networks.

  Nyakizu Digital Market Concept Note.pdf

* Append-only financial records

  Debt and payment records are designed to be append-only to protect trust and reduce disputes. Corrections are added as new entries rather than modifying historical records.

  Nyakizu Digital Market Concept Note.pdf

* Offline-first operation

  The app supports saving drafts and actions offline, then synchronizing when connectivity returns. This is critical for traders who operate in low-network environments.

  Nyakizu Digital Market Concept Note.pdf

### Core features

Product catalog management

Organize products by category, brand, model, and variant.

Trusted supplier relationships

Restrict ordering to approved buyer–seller relationships.

Digital order management

Create structured orders instead of relying on chat messages and handwritten notes.

Order locking

Prevent modifications once packing begins to reduce fulfillment errors.

Credit & debt ledger

Track pay-later transactions, partial payments, due dates, and balances.

M-Pesa payment recording

Manually attach payment references to orders for reconciliation.

### System roles

| Role                | Responsibilities                                                             |
| ------------------- | ---------------------------------------------------------------------------- |
| Admin               | Verify sellers, manage platform data, moderate the system.                   |
| Seller / Wholesaler | Manage catalogs, inventory visibility, orders, payments, and credit records. |
| Buyer / Hawker      | Browse approved suppliers, place orders, and track debts and payments.       |

### Technology stack

| Layer           | Technology                                     |
| --------------- | ---------------------------------------------- |
| Frontend        | Next.js, TypeScript, Tailwind CSS              |
| Backend         | Django REST Framework                          |
| Database        | PostgreSQL                                     |
| Authentication  | JWT-based authentication                       |
| Offline support | Progressive Web App features and local storage |
| Notifications   | Nodemailer email notifications                 |
| Hosting         | Vercel (frontend), Render (backend)            |

The MVP intentionally avoids direct M-Pesa API integration, public seller discovery, automated stock counting, and advanced analytics to keep the initial scope focused and deliverable within a semester.

Nyakizu Digital Market Concept Note.pdf

### MVP scope

Included in v1

* User registration and authentication

* Seller verification workflow

* Trusted buyer–seller relationships

* Product catalog management

* Order placement and order locking

* Manual M-Pesa payment recording

* Credit and debt tracking

* Offline draft support

Deferred

* Public marketplace browsing

* Multi-seller cart

* Automated stock reservation

* Advanced analytics

* Direct payment integrations

### Project status

Planning

Software Engineering Project I concept stage

The current focus is requirements validation, system design, and MVP implementation planning. The target deliverable is a deployable PWA that can be installed on Android devices and used by traders in real-world conditions.

Nyakizu Digital Market Concept Note.pdf

### References

1. Nyakizu Digital Market Concept Note, 2026.

2. UNHCR Operational Data Portal: Kenya refugee and asylum-seeker statistics.

   Nyakizu Digital Market Concept Note.pdf
