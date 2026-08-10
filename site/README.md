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
