# Reconly — Platform

Full-stack B2B SaaS for crypto accounting & compliance: marketing site, customer
dashboard, admin panel and a built-in AI assistant. Dark liquid-glass design,
strictly monochrome.

## Stack

- Next.js 15 (App Router, Turbopack) · React 19 · Tailwind v4
- **Clerk** — authentication (login/register, sessions, invitations, webhooks)
- **Supabase** — Postgres (RLS deny-by-default) + Storage, data only
- **Anthropic API** — Reconly Assist (`claude-sonnet-4-6`, streaming)

## Setup

```bash
pnpm install
cp .env.example .env.local   # fill in Clerk, Supabase, Anthropic keys
pnpm dev                     # http://localhost:3001
```

1. **Clerk**: create an app, copy keys. Add a webhook for `user.created/updated/deleted`
   → `/api/webhooks/clerk` (secret → `CLERK_WEBHOOK_SECRET`). Recommended: session token
   customization `{ "publicMetadata": "{{user.public_metadata}}" }` for fast middleware gates.
2. **Supabase**: create a project, run `supabase/schema.sql` in the SQL editor
   (idempotent), optionally `supabase/seed.sql` for demo data. Copy URL + service-role key.
3. **Anthropic**: create an API key for Reconly Assist.
4. Make yourself admin: sign in once, then in Supabase set your row in `profiles`
   to `role = 'admin', status = 'active'` (the app mirrors it to Clerk automatically).

Without keys, the marketing site works and app routes show a setup notice.

## Architecture

- `/` — landing page with demo-request modal (honeypot + rate limit → `demo_requests`)
- `/login` `/register` — Clerk, glass-styled · `/verifying` — branded post-login loader
- `/pending` `/suspended` — account states (status lives in `profiles`, mirrored to Clerk
  `publicMetadata`; middleware gates fast, layouts re-check the DB authoritatively)
- `/app/*` — customer dashboard: overview, wallets (CRUD + mock import), transactions
  (filters, drawer, bulk categorize), reports (CSV to Storage + signed downloads),
  compliance (alerts + screening), settings
- `/admin/*` — overview, demo requests (Clerk invitations), users (activate, ban with
  session revocation, plan/role changes, read-only impersonation), audit log, settings,
  assistant usage/quotas/kill switch + audited conversation inspector
- `/api/assist` — streaming assistant route: quota check (hourly + per-plan monthly),
  server-side user-scoped data snapshot, hard boundaries in the system prompt,
  conversations persisted with token usage

Security: RLS on every table (deny-by-default, Clerk JWT `sub`); service-role and
Anthropic keys server-only; every admin mutation writes to `audit_log`; svix-verified
webhooks; banned users lose sessions immediately.
