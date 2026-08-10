import { db } from "./supabase";
import { getSetting, type Profile } from "./profile";

/** Hard boundaries + product FAQ — injected as the system prompt. */
export function buildSystemPrompt(snapshot: string, language: "en" | "de"): string {
  return `You are Reconly Assist, the built-in assistant of Reconly — a crypto accounting & compliance platform (crypto sub-ledger, DATEV-ready bookkeeping, MiCA/AML compliance) for companies holding digital assets.

Hard rules (never break these):
- Software-scoped only: NO tax advice, NO legal advice, NO investment advice. When asked, explain the concept generally and refer to a professional ("Your tax advisor can confirm how this applies to you.").
- You can only see the current user's own data. You cannot access other users, other companies, or external accounts — say so if asked.
- No hallucinated numbers: every figure you cite must come from the data snapshot below. If the data wasn't provided, say so and point to where it lives in the app (Overview, Wallets, Transactions, Reports, Compliance).
- You cannot execute actions (no deleting, no exporting, no plan changes, no applying categories). You only propose; the user confirms via the normal UI.
- Category suggestions are proposals with a confidence level (low/medium/high) — never claim they were applied.
- When explaining a single transaction, end with: "AI-generated explanation — verify with your tax advisor."
- When explaining a compliance alert, never advise ignoring it (especially critical ones), and end with: "This is general information, not legal advice."
- Tone: calm, precise, concise. No emojis, no hype. Match the Reconly brand: private-banking sobriety.
${language === "de" ? "- Respond in German (Sie-Form)." : "- Respond in English unless the user writes in German."}

Product help (built-in FAQ you may answer from):
- Add a wallet: Wallets → "Add wallet" → choose chain or exchange, paste the address. Import starts automatically.
- Categorize transactions: Transactions → click a row → set category → "Save & mark reviewed". Bulk: select rows → "Categorize as…".
- Generate a DATEV export: Reports → "Generate report" → type "DATEV export" → pick the month → Download.
- Invite your tax advisor: dedicated read-only advisor access is part of the Growth plan — contact hello@reconly.io to enable it.
- Compliance alerts: Compliance page, grouped by severity; resolve or dismiss each alert. Critical alerts should be reviewed, not dismissed.
- Plans: Starter €249/mo, Growth €749/mo, Max from €1,990/mo. Plan changes go through the Reconly team.

User data snapshot (JSON, scoped to this user, generated just now — the ONLY source for figures):
${snapshot}`;
}

/** Server-side, user-scoped data snapshot. The model never touches the DB. */
export async function buildSnapshot(userId: string): Promise<string> {
  const [wallets, txs, alerts, reports] = await Promise.all([
    db().from("wallets").select("id,label,chain,exchange_name,address").eq("clerk_user_id", userId),
    db()
      .from("transactions")
      .select("timestamp,type,asset,amount,value_eur,category,status,wallet_id")
      .eq("clerk_user_id", userId)
      .order("timestamp", { ascending: false })
      .limit(120),
    db()
      .from("compliance_alerts")
      .select("severity,title,description,status,created_at")
      .eq("clerk_user_id", userId)
      .order("created_at", { ascending: false })
      .limit(20),
    db()
      .from("reports")
      .select("type,period,created_at")
      .eq("clerk_user_id", userId)
      .order("created_at", { ascending: false })
      .limit(20),
  ]);

  const rows = txs.data ?? [];
  const walletById = new Map((wallets.data ?? []).map((w) => [w.id, w.label]));
  const totalValue = rows.reduce((s, t) => s + Number(t.value_eur), 0);
  const unreviewed = rows.filter((t) => t.status === "unreviewed").length;
  const byAsset: Record<string, { count: number; value_eur: number }> = {};
  for (const t of rows) {
    byAsset[t.asset] ??= { count: 0, value_eur: 0 };
    byAsset[t.asset].count++;
    byAsset[t.asset].value_eur += Number(t.value_eur);
  }

  return JSON.stringify(
    {
      generated_at: new Date().toISOString(),
      aggregates: {
        recent_tx_window: rows.length,
        net_value_eur_recent: Math.round(totalValue),
        unreviewed_in_window: unreviewed,
        by_asset: Object.fromEntries(
          Object.entries(byAsset).map(([k, v]) => [k, { count: v.count, value_eur: Math.round(v.value_eur) }])
        ),
      },
      wallets: (wallets.data ?? []).map((w) => ({
        label: w.label,
        chain: w.chain,
        exchange: w.exchange_name,
      })),
      recent_transactions: rows.slice(0, 60).map((t) => ({
        date: String(t.timestamp).slice(0, 10),
        wallet: walletById.get(t.wallet_id) ?? null,
        type: t.type,
        asset: t.asset,
        amount: Number(t.amount),
        value_eur: Math.round(Number(t.value_eur)),
        category: t.category,
        status: t.status,
      })),
      alerts: alerts.data ?? [],
      reports: reports.data ?? [],
    },
    null,
    0
  );
}

export interface QuotaState {
  allowed: boolean;
  reason?: string;
  remainingMonth: number | null; // null = unlimited
}

/** Rate limiting: hourly hard cap + per-plan monthly quota. */
export async function checkQuota(profile: Profile): Promise<QuotaState> {
  const hourlyLimit = await getSetting<number>("assistant_hourly_limit", 30);
  const quotas = await getSetting<Record<string, number>>("assistant_plan_quotas", {
    starter: 50,
    growth: 500,
    max: -1,
    none: 0,
  });

  const convs = await db()
    .from("assistant_conversations")
    .select("id")
    .eq("clerk_user_id", profile.clerk_user_id);
  const convIds = (convs.data ?? []).map((c) => c.id);
  if (convIds.length === 0) {
    const monthly = profile.role === "admin" ? -1 : (quotas[profile.plan] ?? 0);
    return { allowed: monthly !== 0, reason: monthly === 0 ? "plan" : undefined, remainingMonth: monthly < 0 ? null : monthly };
  }

  const hourAgo = new Date(Date.now() - 3600_000).toISOString();
  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);

  const [{ count: hourCount }, { count: monthCount }] = await Promise.all([
    db()
      .from("assistant_messages")
      .select("id", { count: "exact", head: true })
      .in("conversation_id", convIds)
      .eq("role", "user")
      .gte("created_at", hourAgo),
    db()
      .from("assistant_messages")
      .select("id", { count: "exact", head: true })
      .in("conversation_id", convIds)
      .eq("role", "user")
      .gte("created_at", monthStart.toISOString()),
  ]);

  if ((hourCount ?? 0) >= hourlyLimit) {
    return { allowed: false, reason: "hourly", remainingMonth: null };
  }

  const monthly = profile.role === "admin" ? -1 : (quotas[profile.plan] ?? 0);
  if (monthly < 0) return { allowed: true, remainingMonth: null };
  const remaining = monthly - (monthCount ?? 0);
  if (remaining <= 0) return { allowed: false, reason: "plan", remainingMonth: 0 };
  return { allowed: true, remainingMonth: remaining - 1 };
}
