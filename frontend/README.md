# Nyakizu Digital Market Frontend

This is the Next.js frontend for Nyakizu Digital Market.

## Student Tracking Notes

- Framework: Next.js App Router with TypeScript.
- Styling: Tailwind CSS v4.
- Current branch purpose: scaffold the frontend and apply the first Nyakizu brand shell.
- Brand reference: `../docs/brand-identity.md`.
- UI reference: `../docs/ui-blueprint.md`.

## Current MVP Screen

The first screen is a static branded prototype shell. It shows:

- Buyer My Suppliers preview.
- Shopping list draft.
- Sourcing note example.
- Seller fulfillment tasks.
- Wholesaler-controlled ledger preview.

This screen is not connected to the backend yet. Backend integration will come after the Django API scaffold is created.

## Commands

```bash
npm run dev
npm run lint
npm run build
```

## Verification Completed

During scaffold verification:

- `npm.cmd run lint` passed.
- `npm.cmd run build` passed.
- Local HTTP check at `http://localhost:3020` returned status `200`.
- The rendered HTML contained the expected Nyakizu, shopping list, and ledger text.

Visual browser automation was attempted, but the `agent-browser` command was not available on this machine.

