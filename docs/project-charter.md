# Project Charter

## Project Name

Nyakizu Digital Market

## Subtitle

A Community-Based Digital Market for Trusted Phone Accessories Trade

## Tagline

Digitizing Trusted Community Trade

## Problem Statement

Banyamulenge phone accessories traders in Kenya already operate through trusted supplier-buyer relationships, WhatsApp communication, M-Pesa payments, notebooks, memory, and informal credit. These tools support daily trade, but they become unreliable when traders manage many products, changing orders, partial payments, credit balances, and low-network conditions. The platform is needed to digitize the existing trade process without exposing sensitive business information or disrupting trust.

## Project Goal

Build a mobile-first, offline-first web application that gives hawkers a frictionless digital shopping list experience while giving verified wholesalers strict control over catalog visibility, sourcing, final invoice totals, and an append-only credit/debt ledger.

## Success Criteria

- Hawkers can browse trusted suppliers before public discovery.
- Wholesalers can share free storefront links through WhatsApp to onboard existing buyers without app store downloads.
- Wholesalers can manage products and private stock without exposing exact quantities.
- Buyers can submit structured digital shopping lists with sourcing notes for uncatalogued items.
- Orders are locked immediately after submission so fulfillment changes are controlled by the seller.
- Sellers can manually update final invoice totals after sourcing uncatalogued goods.
- Sellers can manually record M-Pesa payments received outside the system.
- Credit sales, partial payments, due dates, and balances are tracked through a wholesaler-controlled append-only ledger.
- Sensitive data is only visible to authorized users.
- Core workflows work comfortably on smartphone screens.
- The academic submission includes traceable requirements, design, tests, and demonstration evidence.

## Constraints

- MVP must be achievable within a semester.
- Direct M-Pesa API integration is excluded from the first version.
- The platform must support low-network users through limited offline-first behavior.
- Exact stock quantity must not be buyer-facing.
- Financial ledger writes are controlled by the wholesaler in the MVP.
- Public marketplace discovery must remain secondary to trusted supplier relationships.
- Community-specific population and market-size estimates require validation before being treated as formal statistics.

## Initial Technology Direction

- Frontend: Next.js App Router, TypeScript, Tailwind CSS.
- Backend: Django REST Framework.
- Database: PostgreSQL.
- Authentication: JWT-based role access.
- Offline support: `next-pwa`, Service Workers, IndexedDB, Background Sync where supported.
- Deployment: Vercel for frontend and Render, Railway, or equivalent for backend.

## Governance

- Requirements are maintained in `docs/requirements-baseline.md`.
- SSDLC, SCM, and QA controls are maintained in `docs/ssdlc-scm-qa-plan.md`.
- Major scope changes should update requirements, traceability, and test plans
- Real user feedback should be recorded and converted into validated requirements.
