-- Reconly seed data (idempotent-ish: clears demo rows first).
-- IMPORTANT: replace the three clerk_user_id placeholders with real Clerk user
-- IDs after your first sign-ins (Clerk dashboard → Users), or leave the demo
-- IDs — the app self-heals real profiles on first sign-in either way.

-- demo identities
delete from profiles where clerk_user_id in ('user_demo_admin','user_demo_alice','user_demo_bob');

insert into profiles (clerk_user_id, email, full_name, company_name, role, status, plan, last_login_at) values
  ('user_demo_admin', 'admin@reconly.io', 'Reconly Admin', 'Reconly GmbH', 'admin', 'active', 'max', now()),
  ('user_demo_alice', 'alice@acme-digital.example', 'Alice Weber', 'Acme Digital GmbH', 'user', 'active', 'growth', now() - interval '2 hours'),
  ('user_demo_bob', 'bob@nordchain.example', 'Bob Fischer', 'Nordchain UG', 'user', 'pending', 'none', null);

-- wallets for Alice
insert into wallets (id, clerk_user_id, label, chain, address, exchange_name) values
  ('11111111-1111-1111-1111-111111111101', 'user_demo_alice', 'Treasury Safe', 'ethereum', '0x7f3a9c21e4b8d0f2a6c5e8b1d4f7a0c3e6b9d21e', null),
  ('11111111-1111-1111-1111-111111111102', 'user_demo_alice', 'Ops Hot Wallet', 'ethereum', '0x94d177b0c3e6a9d2f5b8e1c4a7d0f3b6e9c277b0', null),
  ('11111111-1111-1111-1111-111111111103', 'user_demo_alice', 'Kraken Corporate', 'exchange', 'kraken-main', 'Kraken'),
  ('11111111-1111-1111-1111-111111111104', 'user_demo_alice', 'Staking Node', 'bitcoin', 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx08fj', null)
on conflict (id) do nothing;

-- ~50 realistic transactions over the last 90 days for Alice
delete from transactions where clerk_user_id = 'user_demo_alice';
insert into transactions (clerk_user_id, wallet_id, tx_hash, timestamp, type, asset, amount, value_eur, category, status)
select
  'user_demo_alice',
  (array['11111111-1111-1111-1111-111111111101','11111111-1111-1111-1111-111111111102','11111111-1111-1111-1111-111111111103','11111111-1111-1111-1111-111111111104'])[1 + (i % 4)]::uuid,
  '0x' || md5(i::text || 'reconly'),
  now() - (i * interval '43 hours') - (i * interval '17 minutes'),
  (array['buy','sell','transfer_in','transfer_out','staking_reward','fee','buy','buy','transfer_in','staking_reward'])[1 + (i % 10)]::tx_type,
  (array['ETH','BTC','SOL','USDC','ETH','MATIC','ETH','BTC','USDC','SOL'])[1 + (i % 10)],
  round((case (i % 10)
    when 1 then 0.05 + (i % 7) * 0.11        -- BTC-ish
    when 7 then 0.02 + (i % 5) * 0.08
    else 0.4 + (i % 13) * 1.7 end)::numeric, 4),
  round((case (i % 10)
    when 5 then -1 * (8 + (i % 9) * 3.5)      -- fees negative
    when 3 then -1 * (900 + (i % 11) * 640)   -- transfer_out negative
    when 1 then 2800 + (i % 7) * 6100
    else 350 + (i % 17) * 820 end)::numeric, 2),
  case when i % 3 = 0 then (array['Trading','Treasury','Staking','Operations'])[1 + (i % 4)] else null end,
  (array['unreviewed','categorized','categorized','categorized','flagged','categorized','unreviewed','categorized','categorized','categorized'])[1 + (i % 10)]::tx_status
from generate_series(1, 52) as i;

-- compliance alerts for Alice
delete from compliance_alerts where clerk_user_id = 'user_demo_alice';
insert into compliance_alerts (clerk_user_id, wallet_id, severity, title, description, status, created_at) values
  ('user_demo_alice', '11111111-1111-1111-1111-111111111104', 'critical', 'Velocity anomaly on Staking Node', 'Outflow volume 6.8x above the 30-day average within 4 hours. Review the most recent outbound transfers.', 'open', now() - interval '3 days'),
  ('user_demo_alice', '11111111-1111-1111-1111-111111111102', 'warning', 'Indirect mixer exposure', 'An incoming transfer is 2 hops removed from a flagged mixing service (0.4 ETH).', 'open', now() - interval '6 days'),
  ('user_demo_alice', null, 'info', 'MiCA quarterly window opens soon', 'The next MiCA reporting window opens on the first of next month. Data completeness is currently 100%.', 'open', now() - interval '9 days'),
  ('user_demo_alice', '11111111-1111-1111-1111-111111111101', 'info', 'New counterparty screened', 'First transfer from 0x3be1…9a04 — screening completed, no sanctions match.', 'resolved', now() - interval '15 days'),
  ('user_demo_alice', '11111111-1111-1111-1111-111111111103', 'warning', 'Unmatched cost basis', '9 trades on Kraken Corporate await FIFO lot matching after a CSV re-import.', 'dismissed', now() - interval '21 days');

-- reports for Alice (file_url paths assume the 'reports' storage bucket)
delete from reports where clerk_user_id = 'user_demo_alice';
insert into reports (clerk_user_id, type, period, file_url, created_at) values
  ('user_demo_alice', 'monthly_close', to_char(now() - interval '1 month', 'YYYY-MM'), 'seed/monthly-close-demo.csv', now() - interval '12 days'),
  ('user_demo_alice', 'datev_export', to_char(now() - interval '1 month', 'YYYY-MM'), 'seed/datev-export-demo.csv', now() - interval '11 days'),
  ('user_demo_alice', 'compliance_report', to_char(now() - interval '2 month', 'YYYY-MM'), 'seed/compliance-demo.csv', now() - interval '40 days');

-- demo requests
insert into demo_requests (name, email, company, phone, company_size, message, interested_plan, status) values
  ('Clara Vogt', 'clara@vogt-ventures.example', 'Vogt Ventures', '+49 170 1234567', '11-50', 'We hold ETH and BTC on our balance sheet and need DATEV exports for our tax advisor.', 'growth', 'new'),
  ('Daniel Roth', 'daniel@rothpay.example', 'RothPay GmbH', null, '51-200', 'Interested in the compliance suite — we are preparing a MiCA license application.', 'max', 'contacted'),
  ('Emma Klein', 'emma@kleinstudio.example', 'Klein Studio', null, '1-10', 'Small crypto treasury, mostly staking rewards.', 'starter', 'new');

-- sample audit entries
insert into audit_log (actor_id, action, target_type, target_id, details) values
  ('user_demo_admin', 'user.activate', 'profile', 'user_demo_alice', '{"from": "pending", "to": "active"}'),
  ('user_demo_admin', 'user.plan_change', 'profile', 'user_demo_alice', '{"from": "starter", "to": "growth"}'),
  ('user_demo_admin', 'demo.status_change', 'demo_request', 'seeded', '{"from": "new", "to": "contacted"}');

-- assistant demo conversation
delete from assistant_conversations where clerk_user_id = 'user_demo_alice';
with conv as (
  insert into assistant_conversations (clerk_user_id, title)
  values ('user_demo_alice', 'Unreviewed transactions')
  returning id
)
insert into assistant_messages (conversation_id, role, content, context)
select id, 'user', 'Which transactions are still unreviewed?', '{}'::jsonb from conv
union all
select id, 'assistant', 'You currently have unreviewed transactions across your connected wallets — most are recent buys on Kraken Corporate. You can filter the Transactions page by "unreviewed" and use bulk categorize to clear them. This is general information, not tax advice.', '{"usage": {"input_tokens": 900, "output_tokens": 80}}'::jsonb from conv;
