# Archived audit docs

`frontend-audit.md` and `ui-db-code-design-report.md` were written against an
earlier snapshot of the codebase, before the gold-brand/paper-token redesign,
the plain-English copy pass, and the payments/ledger system existed in their
current form. Nearly every "critical" finding in them — hardcoded fake
account data, invisible 404 text, the broken "New Order" flow, inconsistent
status vocabulary, the dark-theme token leak — was independently verified
against the live code on 2026-08-18 and found already fixed.

Kept for historical reference only. Don't treat these as a current punch
list — if you need an up-to-date audit, run a fresh one against the current
`frontend/` tree rather than trusting the findings below.
