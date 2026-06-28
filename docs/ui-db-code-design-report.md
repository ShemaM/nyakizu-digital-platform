# Report: User Interface, Database, and Code Design — Nyakizu Digital Market

## 1. Introduction
- **Purpose of the report**
  - Assess the current **User Interface (UI/UX)** for usability, consistency, accessibility, and responsiveness.
  - Analyze current **code design** (frontend/backend structure and patterns).
  - Validate how well the UI and code align with the project concept (trusted supplier-first trade, privacy controls, order locking/packing lifecycle, credit/debt ledger, payment references, offline-first sync, auditability).
- **Scope (UI evaluation + code design analysis)**
  - UI evaluation includes what’s observable from: `frontend/src/app/layout.tsx`, `frontend/next.config.ts`, and the existing UI shell patterns.
  - Code design analysis includes what’s observable from the backend and key frontend modules referenced in the repo docs.
- **Target audience**
  - Developers, designers, and stakeholders validating product readiness and technical robustness.

## 2. User Interface Analysis

### 2.1 Layout
- **App-wide wrapper & session boundary**
  - `frontend/src/app/layout.tsx` defines global metadata and wraps the app with `AuthProvider`.
  - It also includes `PWARegister` so PWA behavior is registered at the layout level.
- **Theming and visual baseline**
  - Uses global styling from `frontend/src/app/globals.css`, while the homepage (`frontend/src/app/page.tsx`) explicitly sets the hero background to `#0a1f10` and uses brand accents (amber/green) for call-to-actions.
- **Mobile/desktop structure**
  - Role-based UI is implemented via shared layout components (documented in `docs/frontend-detailed-overview.md`).
  - Mobile navigation is designed to be distinct from desktop navigation.

### 2.2 Consistency
- **Navigation consistency through role-based shell**
  - Role-based navigation reduces “feature discovery” friction and supports the concept’s asymmetric UX.
  - Consistent spacing/typography is handled via Tailwind utility classes.
- **Design reuse**
  - The UI is structured around reusable components (UI primitives under `frontend/src/components/ui/` and higher-level shell under `frontend/src/components/AppShell.tsx`).

### 2.3 Accessibility
- **Form semantics**
  - The registration flow uses labeled fields (example: `Field` helper wrapping inputs) and correct input types (`tel`, `email`, `password`).
- **Accessibility status**
  - Detailed WCAG verification requires inspecting `globals.css` and component-level focus/contrast styling.
  - This report flags accessibility as **partially validated** based on the inspected layout and form patterns.

### 2.4 Responsiveness
- **Viewport and scaling behavior**
  - `viewport` in `frontend/src/app/layout.tsx` explicitly configures scaling and `viewportFit: "cover"`.
- **Role-specific navigation adapts by breakpoint**
  - Mobile navigation is presented when desktop sidebar is hidden (as described in `docs/frontend-detailed-overview.md`).

### 2.5 Usability
- **Onboarding usability**
  - Registration is a two-step process (role selection then role-specific details) with clear progress feedback.
  - Success state communicates verification and sets expectations.
- **Error handling UX**
  - `frontend/src/lib/api.ts` centralizes backend error parsing into an `ApiError`, which is surfaced in the registration UI.

### 2.6 Offline/PWA UX (current status)
- **PWA behavior configuration**
  - `frontend/next.config.ts` sets HTTP headers for `/sw.js` and `/manifest.webmanifest` to avoid aggressive caching and to set correct content types.
- **Service worker**
  - `frontend/public/sw.js` is currently a minimal stub (no caching/sync logic).
- **Usability implication**
  - The app can *notify* users about offline states, but it does not yet implement true offline-first caching and sync queues as required by the concept.

## 3. Code Design Analysis

### 3.1 Architecture
- **Frontend architecture**
  - Next.js App Router + React + TypeScript.
  - `AuthProvider` handles session determination and role-based routing.
  - `AppShell` provides role-based navigation and layout.
- **Backend architecture**
  - Django + DRF.
  - Domain split across apps: `accounts`, `products`, `orders`.

### 3.2 Modularity
- **Frontend**
  - API access and type contracts are centralized in `frontend/src/lib/api.ts`.
  - UI shells and primitives are modularized (`AppShell`, `components/ui/*`).
- **Backend**
  - `orders` app separates models, serializers, and views.

### 3.3 Scalability
- **Data access patterns**
  - Seller order listing uses ORM filtering across order items.
  - As order volume grows, this requires appropriate DB indexes (recommended in DB design report).

### 3.4 Maintainability
- **Strengths**
  - Snapshotting unit prices exists in `OrderItem` (maintains pricing consistency).
- **Risks**
  - Business logic appears embedded in serializers (e.g., stock decrement and order item creation) rather than being centralized in a service layer.
  - Introducing locking, payment ledgers, idempotency, and audit trails will increase complexity unless refactored.

### 3.5 Security
- **Authentication model**
  - Frontend uses cookie/session auth (`credentials: "include"`).
- **Authorization risks vs concept**
  - The concept requires a trusted supplier gate at order creation time.
  - While relationship models exist, enforcement must be validated in order creation logic.
- **Privacy requirement**
  - Buyers must never see exact stock quantities.
  - This requires strict separation of buyer-facing serializers vs seller-only serializers.

## 4. Integration of UI and Code

### 4.1 How front-end design interacts with back-end logic
- `frontend/src/lib/api.ts` defines endpoints and expected request/response shapes.
- UI flows map to backend flows:
  - order creation and item selection
  - seller order listing/scoping
  - cancellation

### 4.2 API usage and data flow
- Central request wrapper parses errors into a user-friendly `ApiError`.
- Order creation currently relies on backend validation and stock availability checks.

### 4.3 Error handling between layers
- Backend returns serializer errors and detail messages.
- Frontend surfaces these via `ApiError` to the UI (example: registration page error banner).

## 5. Recommendations

### 5.1 UI improvements
1. **Accessibility hardening**
   - Add explicit ARIA where needed and verify focus/contrast against WCAG.
   - Ensure bottom navigation semantics and keyboard focus order.
2. **Offline-first completion**
   - Replace `sw.js` stub with a real caching strategy.
   - Implement an offline sync queue using IndexedDB + retryable requests + idempotency keys.
3. **Remove simulated workflows**
   - Where the UI currently simulates statuses, enforce them via backend state and lock semantics.

### 5.2 Code improvements (backend + design)
1. **Trusted relationship gate enforcement**
   - Validate `BuyerSellerRelationship.status=approved` during order creation.
2. **Order locking semantics**
   - Introduce/extend backend fields (e.g., `locked_at`) and enforce no updates after packing begins.
3. **Append-only payment & ledger tables**
   - Add `PaymentTransaction`, seller confirmation model, and ledger aggregates.
   - Corrections must be represented as new entries (no overwriting history).
4. **Audit log**
   - Add an audit model to track key transitions and approvals.
5. **Idempotency keys for offline sync**
   - Add request-scoped idempotency storage and enforce uniqueness.
6. **Refactor into a service layer**
   - Move domain logic out of serializers into `orders/services.py`-style modules for maintainability.

## 6. Conclusion
- **Summary of findings**
  - The frontend shows a strong role-based layout foundation and clear onboarding UX.
  - The backend provides basic order snapshot correctness and scoped listing endpoints.
  - However, concept-critical requirements—trusted supplier gating at order create-time, order locking after packing begins, append-only payment/ledger, auditability, and real offline-first sync—need deeper backend and DB implementation than what is currently evidenced in the inspected code.
- **Final thoughts**
  - With targeted backend model/API additions and enforcement of concept invariants, the existing UI shell can become fully reliable and end-to-end consistent.

