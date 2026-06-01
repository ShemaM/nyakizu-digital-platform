# Brand Identity Guide

## Nyakizu Digital Market

Student: Nzabakamira Shema Manasse  
Course: SWE3090XA - Software Engineering Project I  
Date: June 2026

## Document Note

This guide defines the first brand identity for Nyakizu Digital Market before the application is scaffolded. It is written at student-project level so the design direction is easy to understand, implement, and explain during presentation.

## 1. Brand Position

Nyakizu Digital Market is not a generic online marketplace. It is a trusted digital layer for community-based phone accessories trade.

The brand should feel:

- Trustworthy.
- Practical.
- Mobile-first.
- Commercial.
- Community-aware.
- Clear rather than flashy.

The design should support serious business workflows such as orders, sourcing, payments, debts, and seller verification.

## 2. Brand Meaning

Nyakizu means a major source of goods. In the context of this project, it represents a familiar supply place where traders expect to find what they need.

The brand promise:

> Digitizing trusted community trade.

This means Nyakizu helps traders organize the trust-based business they already practice.

## 3. Brand Personality

Nyakizu should sound and feel like:

- A reliable trade assistant.
- A clean business notebook.
- A trusted supplier dashboard.
- A practical tool for busy wholesalers and hawkers.

Nyakizu should not feel like:

- A flashy social media app.
- A public auction marketplace.
- A luxury shopping website.
- A complicated accounting system.

## 4. Logo Direction

The first logo can be simple and text-based.

Recommended direction:

- Use the word **Nyakizu** as the main logo.
- Use **Digital Market** as a smaller subtitle when space allows.
- Include a simple mark inspired by supply, connection, and trust.

Possible logo mark ideas:

- A small stacked-box icon representing stock and supply.
- A simple link symbol representing trusted seller-buyer relationships.
- A market stall shape simplified into a clean icon.
- A letter **N** formed with two connected paths.

Student implementation note:

For the first version, use a text logo in the UI and avoid spending too much time on a complex logo. A polished text mark is enough for the MVP.

## 5. Color Palette

The palette uses green, blue, and amber because these colors already match the system's business meaning.

### Primary Colors

| Token | Color | Hex | Usage |
| --- | --- | --- | --- |
| Primary Blue | Trust Blue | `#2563EB` | Main buttons, links, verified states, active navigation. |
| Success Green | Trade Green | `#16A34A` | Cleared payments, successful actions, growth signals. |
| Warning Amber | Ledger Amber | `#D97706` | Pending sync, sourcing tasks, active debt, attention states. |

### Neutral Colors

| Token | Color | Hex | Usage |
| --- | --- | --- | --- |
| Ink | Near Black | `#111827` | Main text. |
| Slate | Cool Gray | `#374151` | Secondary text. |
| Muted | Light Gray | `#6B7280` | Helper text and metadata. |
| Line | Border Gray | `#D1D5DB` | Borders and dividers. |
| Surface | App White | `#FFFFFF` | Page background and panels. |
| Soft Surface | Light Background | `#F9FAFB` | Subtle section backgrounds. |

### Status Colors

| Status | Color | Hex |
| --- | --- | --- |
| Draft | Muted Gray | `#6B7280` |
| Submitted | Trust Blue | `#2563EB` |
| Sourcing & Packing | Ledger Amber | `#D97706` |
| Debt Active | Deep Amber | `#B45309` |
| Cleared | Trade Green | `#16A34A` |
| Cancelled | Red | `#DC2626` |

## 6. Typography

Recommended font direction:

- Use a clean sans-serif font.
- Prioritize readability on budget Android smartphones.
- Avoid overly decorative fonts.

Frontend recommendation:

- Use `Inter`, `Geist`, or the system sans-serif stack.
- Use a monospace font only for technical values such as IDs or reference notes.

Suggested scale:

| Use | Size | Notes |
| --- | --- | --- |
| Page title | 24px to 30px | Use sparingly. |
| Section title | 18px to 22px | Good for dashboards. |
| Body text | 14px to 16px | Main app text. |
| Helper text | 12px to 14px | Metadata and small notes. |
| Button text | 14px to 16px | Must remain readable. |

## 7. UI Style

The app should feel like a practical trade tool.

Design rules:

- Mobile-first layout.
- Clear dashboards.
- Simple cards for orders, products, and ledger entries.
- Strong status labels.
- Large tap targets for mobile users.
- Avoid decorative clutter.
- Avoid hiding important business actions behind confusing menus.

Card style:

- Border radius: 8px.
- Border: light gray.
- Background: white.
- Shadow: very subtle or none.

Button style:

- Primary action: blue.
- Success action: green.
- Warning or pending action: amber.
- Destructive action: red.

## 8. Icon Direction

Use simple line icons when building the frontend.

Recommended icon meanings:

| Feature | Icon Idea |
| --- | --- |
| Storefront | Store icon |
| Products | Package icon |
| Shopping list | Clipboard/list icon |
| Sourcing notes | Message/note icon |
| Ledger | Book/open-book icon |
| Payments | Wallet/receipt icon |
| Offline sync | Cloud/offline icon |
| Verification | Badge/check icon |

Student implementation note:

When using React, use `lucide-react` icons because they are simple and consistent.

## 9. Voice And Writing Style

Nyakizu should use plain business language.

Good labels:

- My Suppliers.
- Shopping List.
- Sourcing Notes.
- Final Invoice.
- Amount Received.
- Balance Remaining.
- Debt Active.
- Cleared.
- Pending Sync.

Avoid confusing labels:

- Cart checkout.
- Marketplace bidding.
- Auto-payment settlement.
- Financial reconciliation engine.

The system should speak clearly:

- "This list has been submitted and cannot be changed."
- "Final price may change after the seller sources requested items."
- "Payment is recorded by the seller after external confirmation."
- "This catalog is based on your last sync."

## 10. Brand Application In Core Screens

### Buyer Screens

Buyer screens should emphasize speed and clarity:

- My Suppliers first.
- Product catalog with availability labels.
- Shopping list summary.
- Sourcing notes box.
- Clear submitted/locked state.
- Debt status view.

### Seller Screens

Seller screens should emphasize control:

- Storefront management.
- Product and private stock management.
- Submitted shopping lists.
- Sourcing & Packing workflow.
- Final invoice adjustment.
- Payment receipt entry.
- Ledger and buyer balances.

### Admin Screens

Admin screens should emphasize verification and audit:

- Seller verification requests.
- Category and device model management.
- Audit log review.

## 11. Accessibility And Usability

The design should support users with basic smartphone skills.

Rules:

- Use readable contrast.
- Keep buttons large enough to tap.
- Avoid tiny text for important money values.
- Show money amounts clearly in KES.
- Use status labels with both color and text.
- Do not rely on color alone.
- Keep forms short and focused.
- Provide confirmation before important seller actions.

## 12. Design Tokens For Frontend

These tokens can later be converted into Tailwind theme values.

```text
brand.primary = #2563EB
brand.success = #16A34A
brand.warning = #D97706
brand.danger = #DC2626

text.primary = #111827
text.secondary = #374151
text.muted = #6B7280

surface.page = #F9FAFB
surface.card = #FFFFFF
border.default = #D1D5DB

radius.card = 8px
radius.button = 8px
```

## 13. MVP Brand Checklist

Before the first demo, confirm:

- The app uses the Nyakizu name consistently.
- The tagline appears in the README or presentation.
- Primary actions use blue.
- Cleared payments use green.
- Pending sync, sourcing, and active debt use amber.
- Exact stock is not visually exposed to buyers.
- Buyer and seller dashboards have different emphasis.
- UI text is simple enough for non-technical traders.

