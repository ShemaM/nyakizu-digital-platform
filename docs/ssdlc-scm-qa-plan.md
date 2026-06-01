# SSDLC, SCM, And QA Plan

## 1. Purpose

This plan defines how Nyakizu Digital Market should be developed as both an academic software engineering project and a real-world community platform. It covers secure software development lifecycle practices, source control management, quality assurance, testing, reviews, documentation, and release discipline.

## 2. Delivery Principles

- Build the smallest useful product around trusted wholesaler-hawker trade.
- Design around asymmetric value: buyer convenience, seller control.
- Preserve community trust and privacy as product requirements, not afterthoughts.
- Keep requirements traceable from concept to design, code, tests, and demonstration.
- Treat credit, debt, payment, sourcing, and stock information as sensitive data.
- Prefer simple workflows that work on budget smartphones and weak networks.
- Use iterative delivery with frequent validation from real traders.

## 3. SSDLC Phases

| Phase | Activities | Outputs |
| --- | --- | --- |
| 1. Initiation and feasibility | Confirm project goals, users, risks, constraints, academic requirements, technology stack. | Project charter, stakeholder list, feasibility notes. |
| 2. Requirements engineering | Gather functional, non-functional, security, privacy, offline, and data requirements. Validate with users. | Requirements baseline, SRS, user stories, acceptance criteria. |
| 3. Secure design | Define architecture, data model, access control, offline sync rules, audit model, threat model. | System design document, ERD, API specification, threat model. |
| 4. Implementation | Build features in small increments using code review, linting, type checks, and tests. | Source code, migrations, UI screens, API endpoints. |
| 5. Verification and validation | Test requirements, security controls, usability, offline behavior, and role permissions. | Test cases, test report, defect log, user feedback notes. |
| 6. Deployment | Deploy prototype environments, configure secrets, HTTPS, database, and seed data. | Deployment notes, environment config, demo URL. |
| 7. Maintenance and improvement | Track issues, enhancement requests, defects, security findings, and post-demo feedback. | Backlog, release notes, improvement roadmap. |

## 4. Security Requirements

- Use authenticated sessions or JWT with refresh controls.
- Enforce role-based access control on both frontend and backend.
- Prevent buyers from accessing exact seller stock quantities.
- Prevent users from viewing other users' debt records.
- Prevent buyers from changing submitted shopping lists after submission.
- Restrict ledger writes to the owning wholesaler or audited admin correction workflows.
- Validate and sanitize inputs on the backend.
- Use HTTPS in deployed environments.
- Store passwords using secure framework-provided hashing.
- Do not store M-Pesa PINs or full mobile money credentials.
- Log sensitive actions for audit review, including invoice adjustments and seller-recorded payment receipts.
- Avoid silent edits to credit and payment records.
- Keep environment secrets out of Git.
- Use least privilege for admin access.

## 5. Initial Threat Model

| Threat | Risk | Mitigation |
| --- | --- | --- |
| Unauthorized user views debt records | Privacy and trust loss | Role checks, relationship checks, server-side authorization tests. |
| Buyer sees exact stock quantity | Business information leakage | Separate internal inventory from buyer-facing availability. |
| Payment reference is forged or mistyped | Payment dispute | Wholesaler-controlled payment entry, audit log, correction entries. |
| Credit entry is silently edited | Dispute or fraud | Append-only ledger and correction entries. |
| Buyer changes list during sourcing | Fulfillment confusion | Lock order immediately after submission. |
| Seller inflates sourced item amount | Trust dispute | Audit invoice adjustments and expose final invoice history to involved buyer. |
| Unverified seller appears as trusted | Trust failure | Admin verification gate. |
| Offline order submits stale availability | Order confusion | Last-sync warning and seller confirmation required. |
| Admin account abuse | Sensitive data exposure | Least privilege, audit logs, strong passwords, limited admin tools. |
| Lost device exposes user account | Business data exposure | Session expiry, logout, password reset flow in later phase. |

## 6. Source Control Management

### Repository Policy

- Use Git for all project artifacts, source code, documentation, tests, and configuration templates.
- Do not commit secrets, real credentials, private keys, `.env` files, production databases, or user-uploaded sensitive data.
- Keep generated files out of Git unless they are required for deployment or academic submission.

### Branching Model

Use a simple academic-friendly trunk-based model:

- `main`: stable, demo-ready code.
- `feature/<short-name>`: new feature work.
- `fix/<short-name>`: bug fixes.
- `docs/<short-name>`: documentation-only changes.

Feature branches should be merged only after review, tests, and acceptance criteria are satisfied.

### Commit Style

Use clear, scoped commits:

- `docs: add requirements baseline`
- `feat: add seller verification model`
- `feat: create trusted supplier workflow`
- `fix: enforce private stock access`
- `test: add credit ledger permission tests`

### Pull Request Checklist

Every merge should answer:

- What requirement IDs does this change address?
- What user role is affected?
- What data access rules are involved?
- What tests were added or updated?
- Were migrations reviewed?
- Were screenshots or demo notes added for UI changes?
- Are secrets and generated files excluded?

## 7. Quality Assurance Strategy

QA should verify that the system is useful, secure, correct, and usable under realistic trading conditions.

### Test Levels

| Level | Focus |
| --- | --- |
| Unit tests | Models, validators, ledger calculations, permission helpers, sync queue logic. |
| API tests | Authentication, authorization, shopping list workflow, seller payment entry, credit records. |
| Component tests | Form states, validation messages, mobile UI behavior. |
| Integration tests | Buyer order flow, seller processing, credit sale, verification workflow. |
| End-to-end tests | Complete role-based flows using seeded demo users. |
| Usability testing | Trader can complete common tasks on a smartphone with minimal guidance. |
| Security testing | Access control, hidden stock quantity, debt privacy, input validation. |
| Offline testing | Draft creation, pending sync, reconnect behavior, stale data warnings. |

### Priority Test Scenarios

- A buyer cannot see exact stock quantity.
- A buyer cannot order from an unverified seller.
- A buyer cannot edit an order after submission.
- A buyer can add sourcing notes before submission.
- A seller can add sourced item charges to the final invoice.
- A seller can record an externally verified payment.
- A buyer cannot create or silently modify ledger payment entries.
- A seller can create credit for a trusted buyer.
- Partial payment updates remaining balance correctly.
- Credit and payment records are not silently overwritten.
- A user cannot view another buyer's debt record.
- An offline draft order is clearly marked and later synced.
- Admin approval changes seller visibility.

## 8. Definition Of Ready

A feature is ready for implementation when:

- User role is clear.
- Requirement ID or user story exists.
- Acceptance criteria are written.
- Data entities are identified.
- Security and privacy rules are known.
- Offline behavior is stated if relevant.
- UI state is understood for mobile use.

## 9. Definition Of Done

A feature is done when:

- Code is implemented and reviewed.
- Tests cover normal, edge, and permission cases.
- UI works on mobile viewport.
- Requirement traceability is updated.
- Security rules are enforced on the backend.
- Documentation or demo notes are updated.
- No secrets or unrelated generated files are committed.
- Feature is deployable in the demo environment.

## 10. Requirements Traceability Matrix Template

| Requirement ID | Design Artifact | Code Module | Test Case | Status |
| --- | --- | --- | --- | --- |
| FR-001 | Auth design | TBD | TBD | Planned |
| FR-009 | Inventory design | TBD | TBD | Planned |
| FR-010 | Inventory access control | TBD | TBD | Planned |
| FR-016 | Sourcing notes design | TBD | TBD | Planned |
| FR-017 | Order lock design | TBD | TBD | Planned |
| FR-021 | Invoice adjustment design | TBD | TBD | Planned |
| FR-025 | Ledger model | TBD | TBD | Planned |

## 11. Academic Deliverables

Recommended deliverables:

- Concept note.
- Project charter.
- Software Requirements Specification.
- System Design Document.
- Entity Relationship Diagram.
- UI wireframes or prototype screenshots.
- Test plan and test report.
- Source code repository.
- Deployment or demo environment.
- User manual.
- Final report.
- Presentation slides.

## 12. Semester Delivery Plan

| Weeks | Main Work | QA Gate |
| --- | --- | --- |
| 1-2 | Project setup, auth, user roles, database base. | Login and role permission tests. |
| 3-4 | Seller catalog, product hierarchy, visibility, private stock. | Catalog and stock privacy tests. |
| 5-6 | Trusted supplier relationship and buyer dashboard. | Relationship access tests. |
| 7-8 | Digital shopping lists, sourcing notes, seller fulfillment, invoice adjustments, locking. | Shopping list, sourcing, invoice, and locking tests. |
| 9-10 | Wholesaler-controlled credit ledger, partial payments, due dates. | Ledger calculation, authorization, and append-only tests. |
| 11-12 | Seller verification and admin dashboard. | Admin verification tests. |
| 13 | Offline drafts and pending sync. | Offline state and sync tests. |
| 14 | Mobile polish, deployment, demo data, final report. | End-to-end demo and regression testing. |

## 13. Risk Register

| Risk | Probability | Impact | Response |
| --- | --- | --- | --- |
| Scope grows beyond semester capacity | High | High | Keep MVP strict and move marketplace features to future phases. |
| Users resist moving from WhatsApp | Medium | High | Focus on debt tracking and structured ordering that solves immediate pain. |
| Stock updates are neglected | Medium | Medium | Make stock optional for buyer display and use availability labels. |
| Credit disputes occur | Medium | High | Use append-only ledger, audit logs, final invoice history, and seller-controlled payment entries. |
| Offline sync becomes complex | Medium | High | Limit MVP offline support to drafts and pending sync, not full conflict resolution. |
| Sensitive business data leaks | Medium | High | Enforce access control and hide exact stock from buyers. |
| Academic time is lost to infrastructure | Medium | Medium | Use proven frameworks and a simple deployment path. |
