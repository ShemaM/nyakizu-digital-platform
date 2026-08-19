# Nyakizu Frontend — Complete UX Audit & Redesign Roadmap

**Auditor:** Senior Staff Frontend Engineer / Product Designer / Design Systems Architect
**Date of audit:** Based on current `frontend/` source tree
**Scope:** Every page, layout, component, style token, form, dashboard, auth flow, empty/error/loading state, and every visible word in the application.

---

## 1. Executive Summary

Nyakizu has a genuinely strong **core concept** and a handful of excellent product instincts buried in the code: the "availability, not exact stock" privacy mechanic, the "an order can't be quietly changed after packing" trust mechanic, the offline-first order queue, the role-based color accents, and the buyer order tracker. These are not generic. They come from real field observation. That is the product's moat.

The **execution is not product-grade yet.** This is honest, brutal feedback:

1. **There are critical broken flows.** The buyer dashboard's primary "New Order" button routes to `/buyer/lists/new` *without a seller selected* — a page that immediately renders an error screen. The 404 page and the error page render **white text on a light background** (invisible). The buyer account page and seller account page display **hardcoded fake data** to real users.
2. **There are two design languages fighting.** The marketing site is a blue/violet/gradient "Silicon Valley SaaS" look. The in-app theme is a light, role-colored slate system. The offline page is **dark green**. The logo gold accent exists in tokens but is barely used. This is not a brand — it's three templates.
3. **The design system is half-rewired.** `dark.*` tokens now hold light values (a legacy hack), global component classes in `globals.css` still reference `bg-slate-900/50` and `text-slate-200` (dead dark-theme classes), radius and shadow tokens vary page to page, and 9px–11px text appears everywhere — completely wrong for the stated audience (low-end Android, non-technical traders, poor eyesight under market lighting).
4. **Copy is bipolar.** The buyer order tracker ("Seller is Packing Your Order") and debts page ("What You Owe") are excellent plain Kenyan English. The seller account page then says *"Your trading node is fully cryptographically signed. To update critical bank parameters or settlement protocols, please contact your systems auditor."* That single sentence would destroy trust with the target user in under a second.
5. **Legacy/dead code litters the repo.** At least four duplicate or stray implementations exist (role pickers, status-label maps, root-level orphan files, a dev role toolbar, `role-context` vs `auth-context`, dummy-data-backed admin/store pages). None of it helps users; all of it confuses maintainers.

**Overall verdict:** The product idea is a 9/10 for this community. The current UI is ~4.5/10 and looks like a competent developer's first product, not a designed product. With the roadmap below — a real design token system, a simplified copy pass, and ~4 broken-flow fixes — Nyakizu can go from "impressive school project" to "product a community genuinely adopts." The single biggest risk to adoption is **trust**, and right now the UI actively undermines trust (fake names, tech-babble, dead CTAs, invisible text).

---

## 2. Overall UI Score (0–10)

### 4.8 / 10

**What raises it:** Good card language, consistent iconography (lucide), an actual (if inconsistent) spacing grid, a working role-color accent system, thoughtful skeletons, a great mobile bottom-nav with safe-area handling.

**What sinks it:** Duplicate visual languages, invisible text on error/404 pages, 9–11px labels everywhere, heavy 0.3-alpha shadows designed for a dark theme, dead dark-theme utility classes, hardcoded mock data masquerading as live UI, and zero memorable visual identity.

---

## 3. UX Score (0–10)

### 5.1 / 10

**What's genuinely good:**
- The trust mechanic communicates clearly ("Debts can only be corrected, never erased").
- The order tracker is excellent: short, human sentences + a dot strip + a timeline with real dates.
- Offline draft → sync flow in New Order is advanced and correct.
- Role-locked registration (skip role picker when arriving from a landing CTA) is a smart simplification.
- Confirmation dialogs exist on every destructive/immutable action (lock price, cancel order, approve seller) — exactly right for a community that runs on trust.

**Friction points (ranked):**
1. **Buyer dashboard "New Order" is a trap.** Hero button + Quick Action both go to `/buyer/lists/new` with no seller → error page. This is the buyer's *primary* job-to-be-done. **Critical.**
2. **No supplier-first path.** A new buyer lands on an empty dashboard with four KPI cards of zeroes. The supplier discovery → access request → approval → order path is multi-step and unexplained. The dashboard should say "Find your suppliers first" as a guided first-run flow.
3. **Dead ends and placeholder links.** "Forgot password?" → `href="#"`. Contact/Privacy/Terms in footer → `href="#"`. Taxonomy "Edit" button → does nothing. Admin "Add category" → mutates local state only (not persisted).
4. **Two account pages show fake data.** Buyer account shows "John Mwangi / john@example.com". Seller account shows a fake trader. A real user seeing another person's name loses trust instantly.
5. **Inconsistent vocabulary for the same status.** "New Order / Preparing / Ready / Money Owed / Paid" (seller RecentOrders) vs "New / Packing / Ready / You Owe / Paid" (order-status.ts) vs "Submitted / Sourcing / Locked / Debt / Cleared" (admin orders page). Three maps for one state machine.
6. **Loading states are inconsistent.** Some pages use `PageSkeleton`, some `LoadingScreen`, some a naked "Loading..." line of text. Same for empty states — the `EmptyState` component exists but pages re-implement their own empty screens with different wording.
7. **The public store page and admin taxonomy/analytics pages run on dummy data.** Displaying fabricated numbers ("New Users: 42, Volume: KES 1.2M") to an operator is worse than showing none.

---

## 4. Mobile Experience Score (0–10)

### 5.7 / 10

This is the highest-priority audience and it's the closest to right, but it is undermined by typography and a few layout choices.

**Good:**
- BottomNav is fixed, role-aware, has safe-area inset padding, 44px min target, 5 tabs. Correct pattern.
- New Order has a pinned bottom summary bar above the nav — reachable thumb action. **This is the best mobile pattern in the app.**
- Dialogs open as bottom sheets on mobile (`items-end sm:items-center`). Correct.
- Sticky category filter on storefronts with blur. Correct.
- New Order product rows are 44px+ with a large `+` add button. Good.
- Hero CTA buttons and primary buttons are comfortably large (`h-12`, `px-8`).

**Bad:**
- **Font sizes are hostile:** `text-[9px]`, `text-[10px]`, `text-[11px]` appear in literally dozens of places (seller order status chips, subcategory headers, bottom nav labels, product "per piece" prices, timestamps, ledger refs). At 9–11px on a 720×1280 Android under a market awning, this is unreadable.
- QuantityStepper buttons are 32–36px — below the 44px touch-target floor; adjacent to thumb reach failure.
- Buyer dashboard hero greeting card + 4 KPI cards push recent orders far below the fold; the primary action ("New Order") is promoted but broken.
- Keyboard: no `inputMode`/`enterkeyhint` hints on phone number / price fields → numeric keyboards not consistently shown. Password fields have no show/hide toggle (typo-prone on small devices).
- Offline page uses `#0a1f10` (dark green) while the rest of the app is light — jarring switch that looks like a different product.
- Landscape tablet/large-phone: header consumes 64px and bottom nav 60px; content is fine but the `max-w-2xl mx-auto` content columns are sometimes left-padded inconsistently (`p-4 sm:p-6` vs `px-4`).

**Macro recommendation:** Establish a **minimum font-size floor of 14px for body and 12px for secondary labels**, enlarge any interactive element below 44×44px, and validate every screen at 375×667.

---

## 5. Accessibility Score (0–10)

### 3.9 / 10

**Fails:**
- **Contrast:** `text-slate-400` on white is ~2.8:1 (used extensively); `text-slate-400` on `bg-slate-50` ~2.4:1; `text-[9px]/[10px] slate-400/500` everywhere. Badge fills at `/12` opacity produce weak contrast on all but the largest text. Fails WCAG AA for normal text.
- **Error/404 pages: white text on `bg-dark-primary`** (`#F8FAFC` now). Effectively invisible. Critical.
- **Dialog has no focus trap, no Escape handling, no focus restore, no `role="dialog"`/`aria-modal`.** Keyboard users can tab behind it; screen readers get no dialog landmark.
- **Input labels are not programmatically associated** (`<label class="text-label">` without `htmlFor` + `id`).
- **`Alert` forces `role="alert"` on every variant**, including informational and success — screen readers will aggressively announce benign state changes.
- **Buttons styled as toggles lack `aria-pressed`** (CategoryFilter).
- The mobile nav drawer has no focus containment and doesn't return focus on close; the overlay `aria-hidden` is set correctly but the drawer itself isn't labelled with `aria-modal`.

**Passes:**
- `prefers-reduced-motion` global guard is correctly implemented.
- Focus-visible ring is defined (though not always applied — several buttons rely only on `outline-none`).
- Semantic `<main>`, `<header>`, `<footer>`, `<section>`, `<nav aria-label>` usage is mostly correct.
- Toast container uses `aria-live="polite"`; toast errors use `role="alert"`. Good.
- BottomNav uses `aria-current="page"`. Good.

---

## 6. Performance Score (0–10)

### 5.4 / 10

**Good:**
- Inter via `next/font` with `display: swap`.
- Hero uses `next/image` with `priority` and `sizes`.
- Skeletons reduce perceived load; `PageSkeleton`/`ListSkeleton` patterns are good.
- AuthProvider/ToastProvider wrap for shared state; `useCallback` used sensibly.
- PWA manifest + service worker with offline draft queue is a genuine differentiator.

**Problems:**
- **Every page is a client component** (`"use client"` top of nearly every page) — no server components, no RSC data fetching, no route-level code splitting beyond Next's default. BMI is high for dashboards.
- **Notebook of re-render risk:** dashboard pages fetch 3–4 endpoints in parallel `useEffect` with `any[]` state — fine at this scale, but no memoization of filtered/derived lists on list-heavy pages (e.g., AdminUsers re-derives `filtered` on each keystroke over the full list — acceptable at small N; will not scale).
- **Raw `<img>` instead of `next/image`** in seller catalog product thumbnails and `Avatar` (no layout shift handling, no optimization).
- **Unused/legacy code ships:** `lucide` tree-shakes fine, but dead pages (analytics, taxonomy), dead components, duplicate components, and the `sw.js` with a hand-rolled cache add maintenance load and bundle surface. `jspdf` is weighty (bundled for receipts) — verify it's lazy-loaded.
- `experimental.cpus: 1` in `next.config.ts` disables parallel compilation — slows every build for no user benefit.
- The custom `public/sw.js` + service-worker cache can go stale vs the Next build manifest; needs a version-based cache-busting strategy.

**Verdict:** Fine for a prototype and very small community scale (hundreds of users). Not tuned for low-end device memory. Do not add heavy charts/libraries without code-splitting them.

---

## 7. Brand Identity Score (0–10)

### 3.2 / 10

**The brand today is "three templates in a trench coat":**

| Surface | Language |
|---|---|
| Landing page | Blue→violet→cyan gradient SaaS template |
| Auth pages | Dark navy `gradient-dark`, gold accents |
| In-app | Light slate, role colors (blue buyer / violet seller / slate admin) |

- The `brand.gold` (#C8860A) token exists, plus an "ink" dark-navy palette, plus a "surface" paper palette, plus a dark-green offline page. None of them reconcile. There is no hierarchy of surfaces, no single accent, no consistent logo treatment (the `<Logo>` renders an "N" mark, but the footer, header, and auth pages each place it differently with different colors).
- **The name is the brand.** "Nyakizu — a huge building in Kinyamulenge" is a *beautiful*, memorable origin story that absolutely can be the identity. But the UI barely uses it (one line in the footer).
- The logo mark is fine but generic (a stylized "N" with ledger lines — actually a decent concept — but at 32px with 0.1-opacity fill it reads as a weak blue square).

**How to build a real identity (short version):** Pick ONE story — "the ledger + the market building." Choose a single hero accent (I recommend carrying gold/amber as the community-trust accent for humanity + green as money/cleared state per the brand guide, and demoting blue/violet to role tints only). Standardize the logo lockup (mark + wordmark + optional "RNG Plaza traders" tagline), create 1 hero pattern texture (e.g., subtle ledger-line motif), and write a 1-page brand language rule ("warm, plain, street-level, never corporate").

---

## 8. Landing Page Review

**Overall: 5.5 / 10.** Conceptually strong, visually generic, with two dead sections and a header/footer with dead links.

### Section-by-section verdict

| Section | Verdict | Notes |
|---|---|---|
| Header | **Keep, polish** | Sticky glassmorphism is fine; the "Create Account" gradient button and the blue→violet gradient hover underline signal "template." Move to brand accent. Mobile drawer is good but unfocused. |
| Hero | **Redesign half** | "Your trade, digitized. Not disrupted." is clever but not *plain*. The split-CTA (blue "Enter as Buyer" / violet "Enter as Seller") is excellent and should stay. The photo + gradient wash + phone mockup is well-executed but looks like a generic dev-portfolio hero; the "scattered WhatsApp orders → one clean list" floating chip is the *best* copy on the page. Keep the phone, the chips, the three trust bullets; replace the headline with something a trader would say, and warm the palette. |
| Problems bento grid | **Keep — best section** | Real field observations. "Orders change mid-pack" and "The network cuts out" are authentic. Minor: icons all get the same blue–violet gradient chip → redundant; give each problem icon a neutral chip and let the story carry the color. |
| Privacy/trust solution | **Keep — differentiated** | "247 left" vs "Can be sourced" is a genuinely memorable contrast. This is the brand. Minor: "Typical online store" box is dead grey (`opacity-80`) — make the drama stronger. |
| Onboarding walkthrough | **Keep, tighten copy** | The four-step, two-column layout is good. Some sentences are long ("Request to join a seller — find your wholesaler… the same as asking to join their WhatsApp group" is excellent). Trim step titles. |
| Final CTA | **Keep** | "Ready to stop losing track?" is good and human. |
| **Footer** | **Fix dead links** | Contact / Privacy Policy / Terms / Community Guidelines → all `href="#"`. For a trust-first product, dead legal/footer links are a red flag. Ship real pages or remove the links. |

**Memorability test:** Would a trader remember this in a week? The *idea* would ("availability not stock", "debts can't be erased"). The *visuals* would not — nothing about the current gradient/typography/photography is distinctive.

**Does it look handcrafted or AI-generated?** At a glance it reads as a competent but generic Next.js/Tailwind landing template. The bento problems grid and privacy contrast section are the only parts with a human point of view.

---

## 9. Authentication Review

### Registration — 6/10

**Good:** Role-locked flow from landing CTAs ("Not you? Switch" is a thoughtful escape hatch). Field grouping with labels (Your details / Business details / Security) is better than a flat form. `noValidate` + explicit success/error alerts are deliberate. `Suspense` wrapper around `useSearchParams` is correct for Next 16.

**Problems:**
- **No inline validation.** With ~10 fields, one top-of-form error for "Passwords do not match" is fine, but for a non-technical user, field-level errors with friendly words are far better. No email format check, no phone format check, no password strength meter.
- **No "show password."** Typo + hidden password on a phone = frustration.
- **"Username or Email" on login vs. no username field on register.** Users register with email only. If the backend auto-creates a username, fine — but then the login label should read "Email" or make the identifier handling explicit.
- The role radio buttons lack `aria-pressed` semantics (they are buttons with `role="radio"`, which is okay, but the group has no arrow-key navigation — minor).
- **Success message auto-redirects after 3s** with no countdown/notice and no action button. A user reading "check your email" gets yanked to the login page before finishing the sentence. Let them tap a button.

### Login — 5/10

**Good:** Clean 2-field form, big CTA, `next` param redirect handled safely, loading state deliberately kept on navigation.

**Problems:**
- **"Forgot password?" → `href="#"`.** Dead link on an auth page is a trust killer. Either build the endpoint+UI or remove the link.
- Error handling: single generic alert; on slow/bad networks there's no hint about offline state (given the product's audience, an "offline — check your connection" message would be appropriate).
- No "remember me", no biometric/OTP option — future, but relevant for repeated trader use.

### Verify Email — 6/10

Good skeleton, good states. Problems: no backend "resend verification" endpoint — the UI redirects a stranded user to register ("Request new email" → `/register`), which is wrong and will confuse. The error copy is a bit legalistic ("For security, tokens expire after a short period").

### AuthLayout — 6/10

The split layout (brand + form) is fine, but the dark-navy `bg-gradient-dark` panel with gold dots is the *third* brand world on these pages. The tagline "Structured trade, trusted ledger." is decent. Recommend a single light "paper" auth shell with the gold/ledger identity, and keep the marketing dark panels only if everyone agrees dark marketing is the brand.

---

## 10. Buyer Experience Review

**Overall: 5 / 10 — strong pieces, broken spine.**

### Dashboard (`/buyer`)
- **Greeting card** is warm ("Good morning, Shema"). Good.
- **KPI cards** of all-zero numbers on day one is demoralizing; a first-run "Here's how to get started" hero would serve better than stats.
- **CRITICAL BUG:** "New Order" (hero button and Quick Action) → `/buyer/lists/new` with no seller → NewListContent shows error "No seller specified. Please select a supplier first." The buyer's main job cannot be started from the dashboard.
- **Suppliers strip** is nice (avatar row + "My Suppliers"). 
- **Recent Activity** empty state is good; row layout is good; the `MiniProgress` dot strip is a nice touch.

### Suppliers (`/buyer/suppliers`)
- Good search + "Working with" / "Discover" grouping. "Join" button copy is human. The sandbox fallback (loading pending sellers when no approved sellers exist) is a dev hack leaking into production behavior — remove behind a flag.
- Card CTAs are duplicated text ("Browse Catalog" is good).

### Storefront (`/buyer/suppliers/[id]/storefront`)
- Access banner logic (pending/denied/no-access) is clear and well-colored. Products are cleanly grouped. `+ New order` header button is correct.
- Product rows: no image (package icon always) — for phone accessories, photos matter enormously to buyers. **High-impact improvement.**
- Category filter sticky header is good.

### New Order (`/buyer/lists/new`)
- **This is the best screen in the app.** Offline banner, sync status pills, draft persistence, quantity steppers, sourcing-note textarea in Kinyamulenge/Kiswahili, pinned total bar, immutable-order confirmation dialog. Excellent.
- Improvements: textarea placeholder mixes languages well ("Hari ikintu gihariye ushaka? Andika hano") but sizing/type is plain — allow it. Add `inputMode="numeric"`-style hints where relevant. The stepper is 32–36px (small). The confirmation dialog should show the *full item list* (it currently just shows the total) — that's the moment of truth for "once sent you cannot change it."

### Debts (`/buyer/debts`)
- Title "What You Owe" is perfect plain language. Progress bars + balance breakdown are clear. Copy "You don't owe anything" for empty state is great.
- Improvement: explain *what to do* now (e.g., "Pay your seller via M-Pesa, then they record it here" — one line that closes the loop).

### Order detail (`/buyer/orders/[id]`)
- Tracker card + timeline is excellent. "You can't change items after sending... talk to the seller directly" is exactly the trust-facing language needed.
- **Receipt** link in header (opens in new tab) is good; the receipt print style is professional.

### Account (`/buyer/account`)
- **Fake data (John Mwangi / john@example.com).** Hardcoded user render is a bug that must be fixed. Notification toggles don't persist. "Sign Out" duplicates the bottom-nav logout icon. **This is trust-breaking.**

---

## 11. Seller Experience Review

**Overall: 4.5 / 10. The most jargon-heavy and most inconsistent surface in the app.**

### Dashboard (`/seller/dashboard`)
- Composition is good (shop header, KPIs, quick actions, recent orders, summaries). 
- **Data bugs:** Shop header uses `approval_note` as location. `ShopStats` "Money Owed" = sum of `total_price` of `debt_active` orders, not the *remaining balance* — misrepresents what's owed. `MoneySummary` duplicates this and adds "Money Section" as a visible heading (framework-speak).
- Status vocabulary differs from `order-status.ts` (RecentOrders: "New Order/Preparing/Ready/Money Owed/Paid" vs shared map "New/Packing/Ready/You Owe/Paid"). **One state map should be the source of truth.**
- QuickActions labels are decent but "Shop Settings" heading is fine.

### Catalog (`/seller/dashboard/catalog`)
- Store-link banner is a nice feature but copies `nyakizu.app/{username}` while the real public route is `/store/{slug}` from *dummy-data* — the copyable link may not resolve to a real, live store. **Verify and wire to the actual route.**
- Product cards: image-or-fallback is good; **Edit/Preview buttons do nothing** (no onClick handlers). Filter pills are dev-label names (`available`, `draft`, `out_of_stock` shown raw with underscores replaced) rather than plain words. Badge raw status text ("available") instead of "In stock".
- "Manage items, stock statuses, and storefront visibility" is fine but could be plainer.

### Add Product (`/seller/dashboard/catalog/new`)
- Clean form; decent validation ("Product name and price are required").
- Improvements: add stock quantity field with `inputMode="numeric"`, a photo upload (critical for a catalog), pack-size / units (the platform sells packs: "Pack of 5"), and plain-label statuses ("Visible to buyers / Hidden draft / Out of stock" — the current `<option>` copy is *already* good! Keep it and use it everywhere).

### Orders (`/seller/dashboard/orders`)
- "Orders Ledger", "Sync Ledger", "Track wholesale inbound pipeline, client payments, and supply statuses" — all jargon. Call it "Orders" and say "See the orders your buyers sent you."
- **`getStatusBadgeVariant` uses a DIFFERENT status set ("completed/pending/cancelled")** than the real order statuses — badges will render `default` grey for every real status. This page is effectively un-finished relative to the real API. **High priority: reconcile this page with `order-status.ts` and the real API statuses.**

### Fulfill order (`/seller/dashboard/orders/[id]/fulfill`)
- The workflow (Start Packing → Lock Price → immediate payment ledger) is exactly right for this business.
- Text size explosion from tiny labels (`text-[9px]`, `[10px]`, `[11px]` everywhere, "PRICE TBC" in 11px). 
- "Set Final Price" lock flow has clear consequences copy ("creates an immutable ledger entry") — good, keep.
- Improvement: prefill final total with the estimate (it does), and validate > 0.

### Ledger (`/seller/dashboard/ledger`)
- Title "Payment Ledger" — rename to "Debt Records" or "Money Records" per the brief.
- Summary cards + per-order progress bars are useful. The record-payment dialog (amount, M-Pesa reference, method) is exactly right.

### Buyers (`/seller/dashboard/buyers`)
- Pending/approved/denied sections are clear. Approve/Deny with confirmation dialog — correct for trust-based onboarding.

### Account (`/seller/account`)
- **The single worst copy in the app.** "Manage your enterprise identities, security badges, and ledger configurations." "Your trading node is fully cryptographically signed. To update critical bank parameters or settlement protocols, please contact your systems auditor." This is fiction for a phone-accessories wholesaler and sounds actively hostile to a non-technical trader.
- Also **hardcoded fake profile data** (email `shemanzabakamira@gmail.com`; businessType "Structured Ledger Enterprise").

---

## 12. Admin Review

**Overall: 4.5 / 10. Functionally skeletal; two pages are dummy-data demos.**

| Page | Verdict |
|---|---|
| `/admin` Dashboard | Fine stat cards; "Total Volume —" with "Coming soon" is honest. "Loading..." plain text is inconsistent with the rest of the app. |
| `/admin/verify` | **Best admin page.** Pending/rejected, approve/reject with the right confirmation dialog, seller details + categories. Keep. |
| `/admin/users` | Good: search + role filter + stats + verified badge. Keep. |
| `/admin/orders` | Third vocabulary for statuses ("Submitted/Sourcing/Locked/Debt/Cleared") — consolidate. No drill-down to the order. Fine otherwise. |
| `/admin/analytics` | **Hardcoded fake metrics** ("Last 7 days: New Users 42, Volume KES 1.2M"). Never show fabricated business numbers to an operator. Build from the API or hide the page. |
| `/admin/taxonomy` | Reads/writes **dummy `CATEGORIES` from `dummy-data`**, not the API. "Edit" button has no handler. This page doesn't do anything real. |

---

## 13. Design System Review

**Does Nyakizu have a design system? Partially.** There is a real skeleton:
- CVA-based `buttonVariants`, `badgeVariants`, `Card` variants.
- Role-accent CSS custom properties (`--role`, `--role-soft`) — an *excellent* idea.
- A token layer in `tailwind.config.ts` (colors, radii, shadows, animations, spacing).
- Shared `cn()`, well-used `Button`, `Badge`, `Card`, `Input`, `Dialog`, `Toast`, `Timeline`, `EmptyState`, `LoadingState`, `ProgressBar`, `QuantityStepper`, `Avatar`.

**But it is incoherent:**

1. **`dark.*` tokens are a lie.** They now hold light values (`deepest: #FFFFFF`, `primary: #F8FAFC`) with comments explaining the hack, while `ink.*` (dark navy) still exists for marketing and `surface` for print. Three surface systems with three names.
2. **Dead global classes.** In `globals.css`, `@layer components` defines `.card`, `.btn-primary`, `.btn-secondary`, `.btn-outline`, `.btn-ghost`, `.input-base`, `.skeleton`, `.badge-*` all with **dark-theme colors** (`bg-slate-900/50`, `text-slate-200`, `bg-slate-800`). If anything uses these, it renders dark in a light app. (The in-app pages use the newer CVA components, so these are mostly dead — delete them.)
3. **Radius drift.** Cards are `rounded-2xl` (20px) in components, but `rounded-xl` (12px) in many page-level cards, `rounded-lg` (8px) on receipts, `rounded-full` pills. Brand guide says 8px. Pick a scale (2–3 steps) and enforce.
4. **Shadow drift.** Token shadows use 0.3–0.5 alpha (dark-theme heaviness) while page-level cards use bespoke `shadow-[0_1px_2px..., 0_8px_24px_-8px...]` strings. Dozens of one-off arbitrary shadows break the system.
5. **Typography is not a system.** Only `Inter`; the tokens define one extra `2xs`. Real usage: `text-[9px]` to `text-4xl` all over. There is no semantic `text-body`, `text-caption`, `text-price`, `text-display` layer.
6. **No spacing enforcement.** `p-3`, `p-4`, `p-5`, `p-6`, `p-8`, `px-6 py-5`, `pt-6`, and arbitrary `gap` values are chosen per-file. Some consistency exists but it's by habit, not by rule.
7. **Status colors** are *good* and consistent at the token level (success/warning/error/info), but the status *labels* vary across three files — the system should export one `getOrderStatus()` source of truth (label + variant + timeline).
8. **Empty/loading/error components exist but aren't consistently used** — every page re-rolls its own.

### Recommended token architecture (concrete spec)

```ts
// FOUNDATION
--color-bg-app: #FAF9F6            // warm paper, not cool slate
--color-bg-surface: #FFFFFF
--color-bg-muted: #F4F1EA
--color-border: #E6E1D7
--color-text-primary: #14120E
--color-text-secondary: #5A5347
--color-text-muted: #8A8172

// STATUS (money language)
--color-money-cleared: #16A34A
--color-money-owed: #B45309
--color-attention: #C8860A        // gold = the Nyakizu accent
--color-error: #DC2626
--color-info: #2563EB

// ROLE tints (existing --role system, keep!)
buyer: --role blue · seller: --role violet · admin: --role slate

// RADIUS (3-step)
sm: 8px · md: 12px · lg: 16px

// TYPE (7-step semantic scale)
--text-caption: 12/16 · --text-body: 14/20 · --text-body-lg: 16/24
--text-title: 18/26 · --text-title-lg: 22/30 · --text-display: 28/34
--text-hero: 40/44

// SHADOWS (3-step, soft, low alpha)
shadow-card: 0 1px 2px rgba(20,18,14,0.04), 0 4px 12px rgba(20,18,14,0.05)
shadow-pop:  0 4px 8px rgba(20,18,14,0.06), 0 12px 32px rgba(20,18,14,0.10)
shadow-float:0 8px 16px rgba(20,18,14,0.08), 0 24px 64px rgba(20,18,14,0.14)
```

**Minimum font floor:** body ≥ 14px, captions ≥ 12px, money/values ≥ 14px bold, buttons ≥ 14px, bottom-nav labels ≥ 12px. This single rule fixes the biggest mobile + accessibility failure.

---

## 14. Copywriting Review

**Global principle:** *Say it like a trader says it. Short sentences. No framework nouns.*

### Crimes (must fix)

| Current | Location | Problem |
|---|---|---|
| "Your trading node is fully cryptographically signed. To update critical bank parameters or settlement protocols, contact your systems auditor." | Seller account | Fiction + hostile tech-babble. |
| "Manage your enterprise identities, security badges, and ledger configurations" | Seller account | Corporate nonsense. |
| "Business Classification — Structured Ledger Enterprise" | Seller account | Meaningless. |
| "Initial Visibility Status" | Add product | Confusing; "Who can see this?" is clearer. |
| "Track wholesale inbound pipeline, client payments, and supply statuses" | Seller orders | Jargon stack. |
| "Sync Ledger" | Seller orders | Leftover wording. |
| "No hidden steps... whichever seat you take." | Landing | "seat" is office-culture. |
| "Your trusted marketplace network" | Add product | Empty marketing word. |
| "New User / Transactions / Trade Volume" with fake numbers | Admin analytics | Deceptive even if intended as placeholder. |
| "Watermark`Payment Ledger`" | Seller ledger | Rename to "Debt Records" / "Money Records". |

### Great copy (keep and extend)

- "Debts get argued over… Partial M-Pesa payments and running credit scribbled in a notebook lead to real disputes."
- "Buyers see availability, never exact counts — Just 'Available' or 'Can be sourced'."
- "Debt records can be corrected, never deleted."
- "You can't change items after sending an order. If something is wrong, talk to the seller directly."
- "What You Owe" / "You don't owe anything" / "All your orders are paid in full."
- "Once you send it, you cannot change the list. The seller will check it and confirm the final price."
- "Join the traders already keeping their orders, debts, and payments safe on Nyakizu."
- "Hakuna mtandao" (offline page) — starting to speak the user's language; push this further.

### Simplified copy rewrite table (top 25)

| Current | Simplified |
|---|---|
| Payment Ledger | Debt Records |
| Manage Inventory / Manage items, stock statuses, storefront visibility | Know what's available |
| Order Lifecycle | Send order once, track it here |
| Credit Ledger | Debt Records |
| Business Classification | What do you sell? |
| Initial Visibility Status | Who can see this? |
| Wholesale inbound pipeline | Orders from your buyers |
| Sync Ledger | Refresh orders |
| Settlement / locked invoice | Price confirmed |
| Sourcing notes | What to look for |
| Buyers (seller nav) | Who buys from me |
| Verification | Let a buyer trust you / Approved store |
| Categories / Taxonomy | What you sell (types) |
| Out of Stock | Sold out / None right now |
| Draft | Hidden / Not live yet |
| Can be sourced | Can you find it? |
| Availability | Is it there? |
| Request Access | Ask to start buying |
| Join (seller request) | Ask to join their shop |
| Member since | Trader since |
| Privacy-first • Community-built | No one sees your stock. Built for traders. |
| Your trading node… (all of it) | Delete. Replace with "Your details are private and only shown to buyers you approve." |
| Create Free Account (final CTA) | Start by creating an account |
| "Enter as Buyer / Enter as Seller" (hero) | "I'm buying" / "I'm selling" |
| Works offline / Offline-capable | Works even without network |
| Mobile-first | (delete — not user language) |

**Language note:** The platform should progressively support Kiswahili/Kinyamulenge UI strings. The New Order sourcing textarea already does ("Hari ikintu gihariye ushaka? Andika hano..."). Add a lightweight `useLang()` + copy dictionary as a medium-term step.

---

## 15. Component-by-Component Audit

| Component | Rating | Notes |
|---|---|---|
| `Button` | 8/10 | Solid CVA + loading spinner + focus ring. `active:scale-95` is nice on touch. Variants a bit redundant (`role` vs `default` vs `dark`). |
| `Badge` | 6/10 | Good variants. Danger: `/12` opacity fills + 12px text = poor contrast. Consider solid-soft pairs (bg + explicit text color with ≥4.5:1). |
| `Card` | 8/10 | Variants + interactive hover are good. Border color `slate-100` is near-invisible; slightly stronger border improves depth. |
| `Input` | 7/10 | Good error state + icon slot. Labels NOT associated via `htmlFor`/`id` (a11y fix). No `inputMode` pass-through guidance. |
| `Select` | 7/10 | Radix, well-built. Underused — several pages use raw `<select>`. |
| `Textarea` | 6/10 | Fine; underused (raw textarea in New Order). |
| `Dialog` | 4/10 | Bottom-sheet pattern is right; missing focus trap, Escape, `role="dialog"`, `aria-modal`, focus restore. |
| `Toast` | 8/10 | Accessible live region, dismissible, animated. |
| `Alert` | 5/10 | Forces `role="alert"` always; needs variant-aware roles (`role="status"`). |
| `EmptyState` | 7/10 | Well-designed — but inconsistently used (pages re-roll their own empty states). |
| `LoadingState` skeletons | 8/10 | Great set. Inconsistent usage (plain "Loading..." on admin pages). |
| `Timeline` | 8/10 | Clear, dates included, pulse on current. Slight connect-line issue when current step is mid-line — minor. |
| `ProgressBar` | 7/10 | Simple and effective. |
| `QuantityStepper` | 5/10 | Buttons 32–36px (touch target fail). Add 44px min. |
| `Avatar` / `AvatarGroup` | 7/10 | Color-hash initials are nice. Raw `<img>` w/ no sizing hints. |
| `BottomNav` | 8/10 | Correct pattern. Labels 10px (raise to 12px). |
| `InlineBanner` | 7/10 | Tone map is good; use more often. |
| `Logo` | 6/10 | Decent concept, weak at small sizes, color param mismatch brand token. |
| `AppShell` / `DashboardLayout` | 7/10 | Solid; sticky header + bottom nav. |
| `LandingLayout`/`Header`/`Footer` | 6/10 | Fine, dead links, third palette. |
| `AuthLayout` | 6/10 | Third palette (dark navy). |
| `CategoryFilter` | 6/10 | Lacks `aria-pressed`, tiny text. |
| `LoadingScreen` | 6/10 | Nice, but uses `min-h-[100dvh]` full-screen spin in flow contexts where a skeleton is better. |
| `RegistrationCards` | 4/10 | Duplicates the inline role picker in `register/page.tsx`. Consolidate or delete. |
| `PWARegister` | 7/10 | Correct hardening (dev unregister), good messaging hooks. |
| `ErrorBoundary` | 7/10 | Well-built; verify it's actually mounted around app content. |

---

## 16. File-by-File Recommendations

| File | Priority | What to do |
|---|---|---|
| `src/app/buyer/page.tsx` | **Critical** | Route "New Order" through supplier selection (or a picker overlay). Show rich first-run guidance. |
| `src/app/buyer/lists/new/NewListContent.tsx` | High | Add `?id=` handling → if missing, show supplier picker instead of error; enforce 44px steppers; list items in the confirm dialog. |
| `src/app/not-found.tsx` | **Critical** | Fix invisible white text on light bg. |
| `src/app/error.tsx` | **Critical** | Same fix. |
| `src/app/buyer/account/page.tsx` | **Critical** | Replace hardcoded user with `useAuth()`; persist preferences; wire sign-out to `logout()`. |
| `src/app/seller/account/page.tsx` | **Critical** | Replace hardcoded profile + delete teхническая fiction copy. |
| `src/app/login/page.tsx` | High | Remove/fix `href="#"` forgot-password; add offline hint. |
| `src/app/register/page.tsx` | Medium | Inline field validation; show-password; button-based redirect. |
| `src/lib/order-status.ts` | High | Make single source of truth for label+variant+timeline; delete per-page status maps (seller orders page, admin orders page, seller RecentOrders). |
| `src/app/seller/dashboard/orders/page.tsx` | **High** | Rewire to real API statuses; plain copy; remove "Orders Ledger". |
| `src/app/admin/analytics/page.tsx` | High | Wire to API or remove. Never mock metrics. |
| `src/app/admin/taxonomy/page.tsx` | High | Wire to API or remove. "Add" currently does nothing real. |
| `src/app/store/[slug]/page.tsx` | High | Wire to real store lookup + products; remove dummy-data dependency. |
| `src/components/DevRoleToolbar.tsx` + `role-context.tsx` | Medium | Delete or gate to dev env. |
| `src/app/offline/page.tsx` | Medium | Re-theme to brand palette (dark green → ink or paper). |
| `globals.css` | High | Delete dead dark-theme `.card/.btn*/.input-base` classes; enforce light tokens; establish text floors. |
| `tailwind.config.ts` | High | Simplify token set (surfaces, radii, shadows, type scale incl. floors). |
| Orphan root files (`AccountTypeCard.tsx`, `CommunityActivity.tsx`, `LocationSelector.tsx`, `constants.ts`, duplicated `Header.tsx`/`StatsSection.tsx`) | Medium | Confirm dead → delete. |
| `src/app/seller/dashboard/catalog/page.tsx` | Medium | Wire Edit/Preview buttons; plain status labels; next/image for images. |
| `src/app/seller/dashboard/page.tsx` + dashboard sub-components | High | Fix Money Owed calc (use balance); single status vocab; fix shop header location. |
| `public/sw.js` | Low | Add version-based cache busting; keep offline draft queue. |

---

## 17. Components to Delete

1. **`DevRoleToolbar.tsx` + `role-context.tsx`** — dev tooling leaking into production; the app already uses `auth-context`.
2. **Legacy dark-theme classes in `globals.css`** (`.card`, `.btn-primary/secondary/outline/ghost`, `.input-base`, `.skeleton`, `.badge-*`, `.text-label/.text-subtitle` if unreferenced) — they render a dark app inside a light app.
3. **One of the two role-picker implementations** — `RegistrationCards.tsx` or the inline radio group in `register/page.tsx`. Keep the inline one (it's the one actually used) or merge.
4. **Duplicate status-label maps** in `seller/orders/page.tsx`, `admin/orders/page.tsx`, and `RecentOrders.tsx` — keep only `order-status.ts`.
5. **`/admin/analytics` page** until it reads real data (or gate it with "Coming soon" instead of fake numbers).
6. **`/admin/taxonomy` page** until it hits the API (or remove entirely).
7. **Orphan root-level files** (`AccountTypeCard.tsx`, `CommunityActivity.tsx`, `LocationSelector.tsx`, `constants.ts`, stray duplicate `Header.tsx`/`StatsSection.tsx`) — verify dead, then delete.

---

## 18. Components to Redesign

1. **Design tokens** (`tailwind.config.ts` + `globals.css`) — consolidate three surface systems into one paper + ink system with one gold accent.
2. **Logo lockup** — larger mark, combined wordmark + optional "RNG Plaza traders" tagline, consistent on every surface.
3. **Dialog** — add focus trap, Escape, `role="dialog"`, `aria-modal`, focus restore.
4. **Badge** — solid-soft contrast pairs, raise min text 12px.
5. **Alert** — variant-aware roles.
6. **QuantityStepper** — 44px targets.
7. **Landing hero** — plain-language headline, warm palette, keep the phone + chips.
8. **AuthLayout** — unify palette with brand (paper/gold), not dark navy.
9. **Offline page** — on-brand, warm, still reassuring.
10. **Seller orders page + status badges** — real statuses + plain labels.
11. **New Order confirmation** — show the full item list before "Send this order."
12. **Empty states throughout** — use the shared `EmptyState` component; standardize copy per surface (orders/products/suppliers/debts).

---

## 19. Components to Keep

- `Button` (with minor variant cleanup)
- `Card` system (CardHeader/Title/Content/Footer/Section)
- `Input` (with label-association fix)
- `Timeline` + order tracker model
- `Toast`
- `ProgressBar`
- `Skeleton` family (`PageSkeleton`, `ListSkeleton`, `TableSkeleton`, etc.)
- `BottomNav` (raise label size)
- `InlineBanner`
- `EmptyState` (start using it)
- `Avatar`/`AvatarGroup`
- `ErrorBoundary`
- `PWARegister` + offline-db queue
- `Role accent CSS variables` (the `--role`/`--role-soft` system) — one of the best ideas in the codebase.
- The privacy/trust landing sections and the onboarding walkthrough.

---

## 20. Quick Wins (can be completed in under one day)

| # | Fix | Impact |
|---|---|---|
| 1 | 404 + error pages: fix invisible text (light bg / dark text) | **High** — trust + usability |
| 2 | Buyer account + seller account: read real user from `useAuth()`, delete fake data | **High** — trust |
| 3 | Delete dead legal/footer links on landing + login ("forgot password") | **Medium** — trust |
| 4 | Enforce a 12px minimum on captions and 44px minimum on interactive controls (stepper, icon buttons) | **High** — accessibility/mobile |
| 5 | Replace fake `/admin/analytics` metrics with "Live data coming soon" state | **High** — integrity |
| 6 | Delete `DevRoleToolbar`, orphan root files, and duplicate status maps | **Low** — maintenance |
| 7 | Wire buyer dashboard "New Order" to supplier picker (simple `id` picker overlay) instead of error page | **High** — core flow |
| 8 | Add `htmlFor`/`id` label association to `Input`; make `Alert` roles variant-aware | **Medium** — accessibility |

---

## 21. Medium Improvements (1–3 days)

| # | Improvement | Impact |
|---|---|---|
| 1 | Consolidate all order status display into `order-status.ts`; rewire seller orders + admin orders + RecentOrders | **High** — consistency |
| 2 | Rewrite the worst copy (seller account, seller orders header, add-product labels, ledger title) per the rewrite table | **High** — trust & comprehension |
| 3 | Fix Money Owed calc to use remaining `balance`, not `total_price`; fix shop header location field | **High** — data correctness |
| 4 | Add inline field validation + show-password to register/login | **Medium** — usability |
| 5 | Build a unified light "paper" palette (warm white, ink, gold) and apply to auth + marketing surfaces | **Medium** — brand |
| 6 | Product photos: add image upload/URL field to Add Product + render with `next/image` in catalog/storefront | **High** — buyer decision-making |
| 7 | New Order confirm dialog: show full item list | **Medium** — trust at point of no return |
| 8 | Standardize empty states across all pages using shared `EmptyState` | **Medium** — polish |
| 9 | Remove the pending-sellers fallback hack in buyer suppliers (env-gate it) | **Medium** — correctness |
| 10 | Fix `Store link` to use the real public route + slug | **High** — feature actually works |

---

## 22. Major Improvements (1–2 weeks)

| # | Improvement | Impact |
|---|---|---|
| 1 | **Full design-token reset** — paper/ink/gold foundation, 3-step radius, 3-step shadow, semantic 7-step type scale with 14px body floor; delete dead dark classes | **Very High** — system-wide coherence |
| 2 | **Landing page redesign pass 1** — plain-language hero, warm palette, real product photography (accessories), keep privacy/trust + onboarding sections; deliver a real Privacy/Terms footer | **High** — first impression & memorability |
| 3 | **Seller dashboard recomposition** — plain words, correct money math, single status vocab, actionable cards | **High** — seller retention |
| 4 | **Buyer first-run flow** — guided "find suppliers → request → order" onboarding on empty dashboard | **High** — activation |
| 5 | **Wire admin taxonomy + analytics to the API** or remove | **Medium** — admin integrity |
| 6 | **Wire public store pages to real sellers/products** (dummy-data removal) | **High** — real storefronts |
| 7 | **Accessibility hardening** — Dialog focus management, aria-pressed toggles, contrast audit, keyboard nav for drawer | **High** — a11y |
| 8 | **Performance pass** — route-level code splitting for admin/receipt, lazy-load jspdf, next/image everywhere, remove `cpus: 1` | **Medium** — low-end device UX |

---

## 23. Final Verdict

Nyakizu is a **genuinely thoughtful product** trapped inside a **slightly above-average developer demo UI**. The concept — trust-focused, privacy-respecting, offline-first trading for the Banyamulenge community — is one of the most coherent product briefs I've seen at this stage, and several implementation details (the tracker, the offline queue, the immutable-order dialogs, the role accents) show real design thinking.

But the UI cannot be shipped as-is to the stated audience:

- Four broken/trust-breaking surfaces (invisible 404/error text, fake account data, dead "New Order" flow, fabricated admin analytics).
- A font-size floor that actively excludes the primary user (9–11px everywhere).
- Three collision of visual identities (SaaS gradient / dark navy / light slate) when the brand story deserves one warm, memorable identity.
- Copy that oscillates between excellent plain language and invented technical fiction.

**The good news:** almost everything bad is surface. The fixes are *visual tokens, copy, and flow wiring* — not architecture. There is no need to throw away the components; most are good. The roadmap above is ordered so that the first day delivers the highest-trust wins, the first week delivers coherence, and the first two weeks deliver a product that looks built *for* RNG Plaza rather than borrowed from Silicon Valley.

**Priority order for leadership:**
1. Fix the four trust-critical flows (Day 0).
2. Reset the design tokens + type floor (Week 1).
3. Rewrite copy to plain trader language everywhere (continuous).
4. Then re-skin landing + dashboards (Weeks 1–2).

Do that, and Nyakizu stops being "another generic SaaS template" and starts being *a clean business notebook for people who already trust each other* — which is exactly the brand your own charter asks for.

---

*Appendix below: concrete design-system spec + full copy rewrite table.*

---

## Appendix A — Design System Spec (Condensed Build Sheet)

### A.1 Foundation tokens

| Token | Value | Notes |
|---|---|---|
| `bg.app` | `#FAF9F6` | warm paper |
| `bg.surface` | `#FFFFFF` | cards/panels |
| `bg.muted` | `#F4F1EA` | soft section bands |
| `border.default` | `#E6E1D7` | hairline borders/dividers |
| `text.primary` | `#14120E` | near-black warm ink |
| `text.secondary` | `#5A5347` | body-support text |
| `text.muted` | `#8A8172` | captions/labels |
| `accent.gold` | `#C8860A` | **Nyakizu hero accent** (trust/humanity) |
| `accent.gold-dark` | `#A97706` | hover/active gold |
| `money.cleared` | `#16A34A` | paid / all clear |
| `money.owed` | `#B45309` | you owe / debt |
| `info` | `#2563EB` | buyer actions |
| `error` | `#DC2626` | destructive / blocked |
| `role.buyer` | `blue` | via `--role` |
| `role.seller` | `violet` | via `--role` |
| `role.admin` | `slate` | via `--role` |

### A.2 Radius scale (3 steps)

| Token | Value | Use |
|---|---|---|
| `radius.sm` | `8px` | chips, inputs, small controls |
| `radius.md` | `12px` | buttons, banners, small cards |
| `radius.lg` | `16px` | cards, dialogs, sheets |

### A.3 Shadow scale (3 steps, warm, low-alpha)

| Token | Value |
|---|---|
| `shadow.card` | `0 1px 2px rgba(20,18,14,0.04), 0 4px 12px rgba(20,18,14,0.05)` |
| `shadow.pop` | `0 4px 8px rgba(20,18,14,0.06), 0 12px 32px rgba(20,18,14,0.10)` |
| `shadow.float` | `0 8px 16px rgba(20,18,14,0.08), 0 24px 64px rgba(20,18,14,0.14)` |

### A.4 Type scale (7 steps, semantic)

| Token | Size / Line | Notes | Floor |
|---|---|---|---|
| `text.caption` | 12 / 16 | labels, metadata | **minimum 12px** |
| `text.body` | 14 / 20 | default body | **minimum 14px** |
| `text.body-lg` | 16 / 24 | lede, list rows | |
| `text.title` | 18 / 26 | card titles | |
| `text.title-lg` | 22 / 30 | section titles | |
| `text.display` | 28 / 34 | page / dashboard titles | |
| `text.hero` | 40 / 44 | landing hero | |
| `text.price` | 16 / 20 **bold** | money values | **never below 14** |

### A.5 Spacing scale (recommended)

Use a 4px base: `4, 8, 12, 16, 20, 24, 32, 40, 48, 64`. Map to `space-1..10` utilities. Enforce one container gutter (`px-4` mobile / `px-6` tablet / `px-8` desktop) and one card padding (`p-4`/`p-5`).

### A.6 Component rules (build sheet)

- **Button**: `h-11` default (44px mobile), `h-12` for primary CTA. Primary = gold (`bg-gold`) on light; role variants for buyer/seller. Loading spinner built-in. `active:scale-95` keep.
- **Badge**: soft bg + explicit ≥4.5:1 text color. Never `/12` alpha on tiny text. Min height 20px.
- **Card**: radius `lg` (16px), shadow `card`, border `border.default`. Interactive hover = `shadow.pop` + `-translate-y-0.5`.
- **Input/Select/Textarea**: `h-11`, radius `md`, `htmlFor`/`id` label association, `aria-invalid` + error text, keyboard hints (`inputMode`, `enterKeyHint`).
- **Dialog**: `role="dialog"` + `aria-modal="true"`, focus trap, Escape to close, focus restore, bottom-sheet on mobile.
- **Toast**: keep `aria-live="polite"`; errors `role="alert"`.
- **Alert**: `role="status"` for info/success, `role="alert"` only for errors.
- **EmptyState**: single component, per-surface copy (orders/products/suppliers/debts); always show a next action.
- **Loading**: `Skeleton` family for in-flow; `LoadingScreen` only for full-page gate.
- **BottomNav**: labels ≥ 12px, 5 tabs max, safe-area padding, `aria-current="page"`.
- **Timeline**: keep the model; ensure the connecting line renders correctly when the current step is mid-path.

---

## Appendix B — Full Copy Rewrite Table (Old → New)

| # | Surface | Old | New (plain Kenyan English) |
|---|---|---|---|
| 1 | Seller account | "Your trading node is fully cryptographically signed. To update critical bank parameters or settlement protocols, contact your systems auditor." | **Delete.** Replace: "Your details are private and only shown to buyers you approve." |
| 2 | Seller account | "Manage your enterprise identities, security badges, and ledger configurations" | "Your Shop Details" |
| 3 | Seller account | "Business Classification — Structured Ledger Enterprise" | "What you sell" (or remove) |
| 4 | Seller account | "Registered Email" | "Your email" |
| 5 | Seller dashboard | "Your Shop" | "Your Shop" (keep) / "Your Store" |
| 6 | Seller dashboard | "Seller: … • {location}" | "You trade at {location}" |
| 7 | Seller dashboard | "Money Owed" card | "Money coming in" (you are owed) |
| 8 | Seller dashboard | "Buyers" card | "My buyers" |
| 9 | Seller dashboard | "Money Section" | "Money" |
| 10 | Seller dashboard | "Recent Activity" | "Recent Orders" |
| 11 | Seller orders | "Orders Ledger" | "Orders" |
| 12 | Seller orders | "Sync Ledger" | "Refresh" |
| 13 | Seller orders | "Track wholesale inbound pipeline, client payments, and supply statuses" | "See the orders your buyers sent you." |
| 14 | Seller orders | "Marketplace Client" | "Buyer" |
| 15 | Add product | "Initial Visibility Status" | "Who can see this?" |
| 16 | Add product | "Your trusted marketplace network" | "Your store" |
| 17 | Add product | "Provide batch details or accessory specifications" | "Describe the item (e.g. pack of 5)" |
| 18 | Catalog | "Manage items, stock statuses, and storefront visibility" | "Know what's available" |
| 19 | Catalog | Filter labels `available / draft / out_of_stock` | "In stock / Hidden / Sold out" |
| 20 | Catalog | Badge "available" | "In stock" |
| 21 | Ledger | "Payment Ledger" | "Debt Records" |
| 22 | Ledger | "Payment history" | "Money records" |
| 23 | Ledger | "Record Payment" | "Money received" |
| 24 | Ledger | "Payment Reference (e.g. M-Pesa code)" | "M-Pesa code (e.g. SAB2XYZ123)" |
| 25 | Buyer debts | "Payments" (nav) | "What I owe" |
| 26 | Buyer debts | "You don't owe anything" | "Keep (great copy)" |
| 27 | Buyer debts | Progress bar | Add: "Pay your seller by M-Pesa, then they record it here." |
| 28 | Login | "Forgot password?" (`href="#"`) | Fix or remove |
| 29 | Login | "Username or Email" | "Email or phone" |
| 30 | Register | "Create Account" | "Create my account" |
| 31 | Register | "Business details" | "About your trade" |
| 32 | Register | "Business Type — e.g. Reseller, Hawker" | "What do you sell?" |
| 33 | Auth | "Structured trade, trusted ledger." | "Trade you can trust, recorded clearly." |
| 34 | Auth | "Offline-capable • Privacy-first • Community-built" | "Works without network • No one sees your stock • Built for traders" |
| 35 | Landing hero | "Your trade, digitized. Not disrupted." | "Put your trade in one place." |
| 36 | Landing hero | "Enter as Buyer / Enter as Seller" | "I'm buying" / "I'm selling" |
| 37 | Landing | "No hidden steps... whichever seat you take." | "No hidden steps. Here's what happens." |
| 38 | Landing | "Create Free Account" | "Start by creating an account" |
| 39 | Footer | "Privacy-first • Community-built" | "No one sees your stock. Built for traders." |
| 40 | Footer | Legal links `href="#"` | Ship real Privacy/Terms/Guidelines or remove |
| 41 | Supplier store | "Request Access" | "Ask to start buying" |
| 42 | Supplier store | "Join" | "Ask to join this shop" |
| 43 | Supplier store | "Member since" | "Trader since" |
| 44 | Storefront | "Can be sourced" | "Can you find it?" |
| 45 | Storefront | "Not available" | "None right now" |
| 46 | Storefront | "Out of stock" | "Sold out" |
| 47 | Order | "Submitted / Sourcing / Locked / Debt / Cleared" (admin) | "New / Packing / Ready / You owe / Paid" |
| 48 | Order | "Invoice confirmed" | "Price confirmed" |
| 49 | Fulfill | "Set Final Price" | "Confirm the final price" |
| 50 | Fulfill | "Sourcing Req" | "Sourcing" |
| 51 | Fulfill | "Price TBC" | "Price to be confirmed" |
| 52 | Admin | "Total Sellers" | "Sellers" |
| 53 | Admin | "Pending Verifications" | "Sellers to approve" |
| 54 | Admin | "Verified Sellers" | "Approved sellers" |
| 55 | Admin | "Total Volume — Coming soon" | "Live data coming soon" |
| 56 | Admin analytics | Fake metrics | Remove / "Live data coming soon" |
| 57 | Admin taxonomy | "Taxonomy" | "Categories" |
| 58 | Admin | "Rejected" | "Not approved" |
