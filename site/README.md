# Reconly — Marketing Site

Premium dark landing page for Reconly, a B2B SaaS platform for crypto accounting & compliance (crypto sub-ledger, DATEV-ready bookkeeping, MiCA/AML reporting).

## Stack

- Next.js 15 (App Router, Turbopack), React 19, Tailwind CSS v4
- Single static page, dark theme only, fully self-contained (no external assets at runtime)

## Develop

```bash
pnpm install
pnpm dev        # http://localhost:3001
pnpm build      # production build (static)
```

## App & auth

The product lives under `/dashboard` (overview, transactions, compliance, DATEV
exports, admin) behind Clerk auth with an approval gate:

1. Create an app at dashboard.clerk.com, copy `.env.example` → `.env.local` and
   fill `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`, `ADMIN_EMAILS`.
2. Users sign in at `/sign-in`; new accounts land on `/waitlist` until an admin
   grants access at `/dashboard/admin` (stored as `publicMetadata.approved`).
   Emails in `ADMIN_EMAILS` are auto-approved admins.
3. Without Clerk keys the marketing site still works and app routes show a
   setup notice.

Ledger data comes from a deterministic mock engine (`lib/ledger.ts`) — swap for
the real ingestion API without touching the UI.

## Design system

"Dark liquid glass": pure black background, monochrome grey-to-white light. Glass
utilities live in `app/globals.css` (`.glass`, `.glass-strong`, `.light-seam`,
`.btn-primary`). The folded glass ribbon (`public/ribbon.png`, from `../assets/`)
is the brand mark — used in the navbar, hero, final CTA and favicon.

Interactions: cursor-follow spotlight + ribbon tilt in the hero (`components/Hero.tsx`),
interactive particle field (`components/Particles.tsx`), scroll reveals
(`components/Reveal.tsx`). All motion respects `prefers-reduced-motion`.

Note: write `backdrop-filter` without a `-webkit-` twin in globals.css — the CSS
minifier drops the pair otherwise (prefixing is automatic).
