# Phase 3 — Google Sign-In

## Done (code side — fully wired, waiting only on credentials)
- [x] Backend: allauth Google provider now reads `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` from `backend/.env` (no DB SocialApp row needed); `SOCIALACCOUNT_LOGIN_ON_GET` sends users straight to Google
- [x] Adapter: first-time Google users get `role=buyer`, `is_email_verified=True` (Google already verified the address — without this the buyer can sign in but not order), and a `BuyerProfile` (normally created by RegisterSerializer, which social signups bypass)
- [x] Existing email/password accounts with the same Gmail are signed in and auto-linked (`SOCIALACCOUNT_EMAIL_AUTHENTICATION[_AUTO_CONNECT]`) instead of erroring
- [x] Frontend: "Sign in with Google" on /login, "Sign up with Google" on /register step 1 (labeled: creates a buyer account), `/auth/google/done` landing page that routes to the right dashboard by role
- [x] Verified: OAuth entry 302s to Google with correct callback URI; simulated first-time Google signup through the real adapter (username, role, verified flag, BuyerProfile, linked social account all correct); 15/15 backend tests pass

## To go live (owner action — needs your Google account)
- [ ] Google Cloud Console → APIs & Services → Credentials → Create OAuth client ID (type: Web application)
  - Authorized JavaScript origin: `http://localhost:8000`
  - Authorized redirect URI: `http://localhost:8000/accounts/google/login/callback/`
- [ ] Paste the client ID and secret into `backend/.env` (`GOOGLE_CLIENT_ID=`, `GOOGLE_CLIENT_SECRET=` — placeholders already added), then restart the backend
- [ ] For production later: add the production backend origin + callback URI to the same OAuth client, and set the OAuth consent screen to "In production"

---

# Phase 2 — Homepage UX Audit (HCI pass)

## Content & branding
- [x] Remove "RNG Plaza" from all marketing copy, metadata, and form placeholders — it was only ever used to explain the "Nyakizu" name, not to be published as our own brand language
- [x] Rewrite hero headline to lead with "digitizing existing trade," not inventing a new one
- [x] Weave the "Nyakizu = huge building" origin story into the Problem section (was buried in the footer only)
- [x] Add honest "pilot phase" framing around the community stats so small real numbers read as credible, not broken

## Navigation & CTA hierarchy
- [x] One primary CTA label ("Start Free") and one visual treatment (brand-gold button) used everywhere — header, hero, final CTA, footer
- [x] Removed the "Get Started" nav link (pointed at a dead `#get-started` anchor and duplicated the primary CTA)
- [x] Removed the redundant "Join the Community" button from the stats section — the page now closes on a single CTA, not several competing ones

## Page flow
- [x] Reordered sections: Hero → Problem → Solution (How It Works) → Features (Why Nyakizu) → Proof (community stats) → final CTA
- [x] Added bridging copy between sections so each one references what came before instead of jumping topics

## Accessibility
- [x] Fixed a contrast shortfall on the small gold "eyebrow" label in the stats section (was ~4.15:1, now ~6:1 against white)
- [x] Added `aria-hidden` to decorative icons that sit next to text conveying the same meaning
- [x] Confirmed the new phone-mockup image has descriptive alt text
- [x] Confirmed interactive elements (Button component) have visible focus-visible rings; verified text contrast on existing tokens (text-muted, text-secondary, text-primary) was already tuned for WCAG AA

## Deferred — needs its own scoping
- [ ] Bilingual toggle (English + a second language) — needs: which language, who reviews/verifies the translation, whole-site or homepage-only scope
- [ ] "Professional" rewrite of Problem section pain points — explicitly rejected in favor of staying elementary-English; the existing pain-point copy was reviewed and is already concrete/specific, not vague

## Hero mockup & Solution section (follow-up round)
- [x] Seeded realistic demo orders/relationships (hassan ↔ fatuma) so the dashboard screenshots show populated stats instead of zeros — renamed the demo seller's shop/location off of "RNG Plaza" too, since it would otherwise leak into the screenshot itself
- [x] Rebuilt the phone mockup (`RotatingPhoneMockup.tsx`) to flip between real seller and buyer dashboard screenshots on a timer, Y-axis rotation, swapping the image at the flip's midpoint; removed the "M-Pesa tracked" / "Works offline" floating chips
- [x] Redesigned `OnboardingWalkthrough.tsx` (the Solution section): gradient role-banner headers, numbered step circles with an animated draw-in connector line, alternating slide-in entrance per column
- [x] Root-caused a stale-image bug: Turbopack persists its image-optimizer cache to disk at `.next/dev/cache/images/`, which survives a full dev-server restart — deleting that directory (not `.next/cache/images`, which doesn't exist under Turbopack) is what actually invalidates it after swapping a `public/` asset in place

---

# Phase 1 — Approval Workflow Implementation

## Backend
- [x] Step 1: Extend SellerProfile model (needs_info, approved_by, submitted_for_review_at)
- [x] Step 2: Create migration
- [x] Step 3: Extend UserSerializer with seller profile data
- [x] Step 4: Add email automation to approve/reject views
- [x] Step 5: Update admin.py with new fields

## Frontend
- [x] Step 6: Extend User type in api.ts with seller_profile fields
- [x] Step 7: Update seller dashboard to show approval status screens

