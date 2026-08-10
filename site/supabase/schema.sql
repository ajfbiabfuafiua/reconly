-- Reconly schema (idempotent — safe to re-run in the Supabase SQL editor).
-- Auth is Clerk; Supabase is data-only. All user references use clerk_user_id
-- (text). RLS is deny-by-default and checks the Clerk JWT sub via the
-- official Clerk–Supabase third-party integration (auth.jwt()->>'sub').
-- Server code uses the service-role key (bypasses RLS) with explicit scoping.

-- ---------- enums ----------
do $$ begin create type user_role as enum ('user','admin'); exception when duplicate_object then null; end $$;
do $$ begin create type user_status as enum ('pending','active','banned'); exception when duplicate_object then null; end $$;
do $$ begin create type user_plan as enum ('none','starter','growth','max'); exception when duplicate_object then null; end $$;
do $$ begin create type company_size as enum ('1-10','11-50','51-200','200+'); exception when duplicate_object then null; end $$;
do $$ begin create type demo_status as enum ('new','contacted','converted','rejected'); exception when duplicate_object then null; end $$;
do $$ begin create type interested_plan as enum ('starter','growth','max','unsure'); exception when duplicate_object then null; end $$;
do $$ begin create type tx_type as enum ('buy','sell','transfer_in','transfer_out','staking_reward','fee'); exception when duplicate_object then null; end $$;
do $$ begin create type tx_status as enum ('unreviewed','categorized','flagged'); exception when duplicate_object then null; end $$;
do $$ begin create type report_type as enum ('monthly_close','datev_export','compliance_report'); exception when duplicate_object then null; end $$;
do $$ begin create type alert_severity as enum ('info','warning','critical'); exception when duplicate_object then null; end $$;
do $$ begin create type alert_status as enum ('open','resolved','dismissed'); exception when duplicate_object then null; end $$;
do $$ begin create type msg_role as enum ('user','assistant'); exception when duplicate_object then null; end $$;

-- ---------- tables ----------
create table if not exists profiles (
  clerk_user_id text primary key,
  email text not null,
  full_name text,
  company_name text,
  role user_role not null default 'user',
  status user_status not null default 'pending',
  plan user_plan not null default 'none',
  created_at timestamptz not null default now(),
  last_login_at timestamptz,
  deletion_requested_at timestamptz
);

create table if not exists demo_requests (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null,
  email text not null,
  company text not null,
  phone text,
  company_size company_size not null,
  message text not null default '',
  interested_plan interested_plan not null default 'unsure',
  status demo_status not null default 'new',
  admin_notes text not null default '',
  converted_user_id text references profiles(clerk_user_id) on delete set null
);

create table if not exists wallets (
  id uuid primary key default gen_random_uuid(),
  clerk_user_id text not null references profiles(clerk_user_id) on delete cascade,
  label text not null,
  chain text not null,
  address text not null,
  exchange_name text,
  created_at timestamptz not null default now()
);
create index if not exists wallets_user_idx on wallets (clerk_user_id);

create table if not exists transactions (
  id uuid primary key default gen_random_uuid(),
  clerk_user_id text not null references profiles(clerk_user_id) on delete cascade,
  wallet_id uuid not null references wallets(id) on delete cascade,
  tx_hash text not null,
  timestamp timestamptz not null,
  type tx_type not null,
  asset text not null,
  amount numeric not null,
  value_eur numeric not null,
  category text,
  status tx_status not null default 'unreviewed'
);
create index if not exists tx_user_ts_idx on transactions (clerk_user_id, timestamp desc);
create index if not exists tx_wallet_idx on transactions (wallet_id);

create table if not exists reports (
  id uuid primary key default gen_random_uuid(),
  clerk_user_id text not null references profiles(clerk_user_id) on delete cascade,
  type report_type not null,
  period text not null,
  file_url text not null,
  created_at timestamptz not null default now()
);
create index if not exists reports_user_idx on reports (clerk_user_id, created_at desc);

create table if not exists compliance_alerts (
  id uuid primary key default gen_random_uuid(),
  clerk_user_id text not null references profiles(clerk_user_id) on delete cascade,
  wallet_id uuid references wallets(id) on delete set null,
  severity alert_severity not null,
  title text not null,
  description text not null,
  status alert_status not null default 'open',
  created_at timestamptz not null default now()
);
create index if not exists alerts_user_idx on compliance_alerts (clerk_user_id, created_at desc);

create table if not exists audit_log (
  id uuid primary key default gen_random_uuid(),
  actor_id text not null,
  action text not null,
  target_type text not null,
  target_id text not null,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index if not exists audit_created_idx on audit_log (created_at desc);

create table if not exists assistant_conversations (
  id uuid primary key default gen_random_uuid(),
  clerk_user_id text not null references profiles(clerk_user_id) on delete cascade,
  title text not null default 'New conversation',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists conv_user_idx on assistant_conversations (clerk_user_id, updated_at desc);

create table if not exists assistant_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references assistant_conversations(id) on delete cascade,
  role msg_role not null,
  content text not null,
  context jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index if not exists msg_conv_idx on assistant_messages (conversation_id, created_at);
create index if not exists msg_created_idx on assistant_messages (created_at desc);

create table if not exists app_settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);

-- ---------- helpers ----------
create or replace function jwt_sub() returns text language sql stable as
$$ select coalesce(auth.jwt()->>'sub', '') $$;

create or replace function is_admin() returns boolean language sql stable security definer set search_path = public as
$$ select exists (select 1 from profiles p where p.clerk_user_id = jwt_sub() and p.role = 'admin' and p.status <> 'banned') $$;

create or replace function is_active() returns boolean language sql stable security definer set search_path = public as
$$ select exists (select 1 from profiles p where p.clerk_user_id = jwt_sub() and p.status = 'active') $$;

-- ---------- RLS: deny-by-default ----------
alter table profiles enable row level security;
alter table demo_requests enable row level security;
alter table wallets enable row level security;
alter table transactions enable row level security;
alter table reports enable row level security;
alter table compliance_alerts enable row level security;
alter table audit_log enable row level security;
alter table assistant_conversations enable row level security;
alter table assistant_messages enable row level security;
alter table app_settings enable row level security;

-- profiles: users read own; update own but NOT role/status/plan; admins read/update all
drop policy if exists profiles_select_own on profiles;
create policy profiles_select_own on profiles for select
  using (clerk_user_id = jwt_sub() or is_admin());
drop policy if exists profiles_update_own on profiles;
create policy profiles_update_own on profiles for update
  using (clerk_user_id = jwt_sub())
  with check (
    clerk_user_id = jwt_sub()
    and role = (select p.role from profiles p where p.clerk_user_id = jwt_sub())
    and status = (select p.status from profiles p where p.clerk_user_id = jwt_sub())
    and plan = (select p.plan from profiles p where p.clerk_user_id = jwt_sub())
  );
drop policy if exists profiles_admin_update on profiles;
create policy profiles_admin_update on profiles for update using (is_admin());

-- demo_requests: anon can INSERT; only admins SELECT/UPDATE
drop policy if exists demo_insert_anon on demo_requests;
create policy demo_insert_anon on demo_requests for insert with check (true);
drop policy if exists demo_admin_select on demo_requests;
create policy demo_admin_select on demo_requests for select using (is_admin());
drop policy if exists demo_admin_update on demo_requests;
create policy demo_admin_update on demo_requests for update using (is_admin());

-- wallets: users CRUD own (active only); admins read all
drop policy if exists wallets_own on wallets;
create policy wallets_own on wallets for all
  using (clerk_user_id = jwt_sub() and is_active())
  with check (clerk_user_id = jwt_sub() and is_active());
drop policy if exists wallets_admin_read on wallets;
create policy wallets_admin_read on wallets for select using (is_admin());

-- transactions: users CRUD own; admins read all
drop policy if exists tx_own on transactions;
create policy tx_own on transactions for all
  using (clerk_user_id = jwt_sub() and is_active())
  with check (clerk_user_id = jwt_sub() and is_active());
drop policy if exists tx_admin_read on transactions;
create policy tx_admin_read on transactions for select using (is_admin());

-- reports: users read own; created via server actions (service role)
drop policy if exists reports_own_read on reports;
create policy reports_own_read on reports for select
  using ((clerk_user_id = jwt_sub() and is_active()) or is_admin());

-- compliance_alerts: users read/update own; admins read all
drop policy if exists alerts_own on compliance_alerts;
create policy alerts_own on compliance_alerts for select
  using ((clerk_user_id = jwt_sub() and is_active()) or is_admin());
drop policy if exists alerts_own_update on compliance_alerts;
create policy alerts_own_update on compliance_alerts for update
  using (clerk_user_id = jwt_sub() and is_active())
  with check (clerk_user_id = jwt_sub());

-- audit_log: admins read; inserts via server actions only (service role)
drop policy if exists audit_admin_read on audit_log;
create policy audit_admin_read on audit_log for select using (is_admin());

-- assistant conversations/messages: users CRUD own; admins read all
drop policy if exists conv_own on assistant_conversations;
create policy conv_own on assistant_conversations for all
  using (clerk_user_id = jwt_sub() and is_active())
  with check (clerk_user_id = jwt_sub() and is_active());
drop policy if exists conv_admin_read on assistant_conversations;
create policy conv_admin_read on assistant_conversations for select using (is_admin());

drop policy if exists msg_own on assistant_messages;
create policy msg_own on assistant_messages for all
  using (exists (select 1 from assistant_conversations c where c.id = conversation_id and c.clerk_user_id = jwt_sub()) and is_active())
  with check (exists (select 1 from assistant_conversations c where c.id = conversation_id and c.clerk_user_id = jwt_sub()));
drop policy if exists msg_admin_read on assistant_messages;
create policy msg_admin_read on assistant_messages for select using (is_admin());

-- app_settings: admins read/write
drop policy if exists settings_admin on app_settings;
create policy settings_admin on app_settings for all using (is_admin()) with check (is_admin());

-- ---------- storage ----------
insert into storage.buckets (id, name, public)
values ('reports', 'reports', false)
on conflict (id) do nothing;

-- ---------- default settings ----------
insert into app_settings (key, value) values
  ('assistant_enabled', 'true'::jsonb),
  ('manual_activation', 'true'::jsonb),
  ('admin_notification_email', '""'::jsonb),
  ('assistant_hourly_limit', '30'::jsonb),
  ('assistant_plan_quotas', '{"starter": 50, "growth": 500, "max": -1, "none": 0}'::jsonb)
on conflict (key) do nothing;
