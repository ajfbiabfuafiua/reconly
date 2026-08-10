import { db } from "./supabase";

export interface Wallet {
  id: string;
  clerk_user_id: string;
  label: string;
  chain: string;
  address: string;
  exchange_name: string | null;
  created_at: string;
  tx_count?: number;
}

export interface Tx {
  id: string;
  clerk_user_id: string;
  wallet_id: string;
  tx_hash: string;
  timestamp: string;
  type: "buy" | "sell" | "transfer_in" | "transfer_out" | "staking_reward" | "fee";
  asset: string;
  amount: number;
  value_eur: number;
  category: string | null;
  status: "unreviewed" | "categorized" | "flagged";
  wallet?: { label: string } | null;
}

export interface Alert {
  id: string;
  wallet_id: string | null;
  severity: "info" | "warning" | "critical";
  title: string;
  description: string;
  status: "open" | "resolved" | "dismissed";
  created_at: string;
}

export interface Report {
  id: string;
  type: "monthly_close" | "datev_export" | "compliance_report";
  period: string;
  file_url: string;
  created_at: string;
}

export function fmtEur(n: number): string {
  const r = Math.round(n) === 0 ? 0 : Math.round(n);
  return r.toLocaleString("en-US") + " €";
}

export function shortAddr(a: string): string {
  return a.length > 14 ? `${a.slice(0, 6)}…${a.slice(-4)}` : a;
}

export async function getWallets(userId: string): Promise<Wallet[]> {
  const { data, error } = await db()
    .from("wallets")
    .select("*, transactions(count)")
    .eq("clerk_user_id", userId)
    .order("created_at", { ascending: true });
  if (error) throw new Error(error.message);
  return (data ?? []).map((w) => ({
    ...w,
    tx_count: (w.transactions as { count: number }[] | null)?.[0]?.count ?? 0,
    transactions: undefined,
  })) as Wallet[];
}

export interface TxFilter {
  walletId?: string;
  type?: string;
  status?: string;
  from?: string;
  to?: string;
  q?: string;
  page?: number;
}

const PAGE_SIZE = 25;

export async function getTransactions(
  userId: string,
  f: TxFilter
): Promise<{ rows: Tx[]; total: number; pageSize: number }> {
  let q = db()
    .from("transactions")
    .select("*, wallet:wallets(label)", { count: "exact" })
    .eq("clerk_user_id", userId);
  if (f.walletId) q = q.eq("wallet_id", f.walletId);
  if (f.type) q = q.eq("type", f.type);
  if (f.status) q = q.eq("status", f.status);
  if (f.from) q = q.gte("timestamp", f.from);
  if (f.to) q = q.lte("timestamp", `${f.to}T23:59:59Z`);
  if (f.q) q = q.or(`asset.ilike.%${f.q}%,tx_hash.ilike.%${f.q}%,category.ilike.%${f.q}%`);
  const page = Math.max(1, f.page ?? 1);
  const { data, count, error } = await q
    .order("timestamp", { ascending: false })
    .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);
  if (error) throw new Error(error.message);
  return { rows: (data ?? []) as Tx[], total: count ?? 0, pageSize: PAGE_SIZE };
}

export async function getAlerts(userId: string): Promise<Alert[]> {
  const { data, error } = await db()
    .from("compliance_alerts")
    .select("*")
    .eq("clerk_user_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []) as Alert[];
}

export async function getReports(userId: string): Promise<Report[]> {
  const { data, error } = await db()
    .from("reports")
    .select("*")
    .eq("clerk_user_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []) as Report[];
}

export interface OverviewData {
  portfolioValue: number;
  txThisMonth: number;
  unreviewed: number;
  openAlerts: number;
  series: { date: string; value: number }[];
  recentTx: Tx[];
  recentAlerts: Alert[];
}

export async function getOverview(userId: string): Promise<OverviewData> {
  const [{ data: txs }, alerts] = await Promise.all([
    db()
      .from("transactions")
      .select("timestamp, value_eur, type, status, asset, amount, id, wallet_id, tx_hash, category, clerk_user_id, wallet:wallets(label)")
      .eq("clerk_user_id", userId)
      .order("timestamp", { ascending: true }),
    getAlerts(userId),
  ]);
  const all = (txs ?? []) as unknown as Tx[];
  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);

  const portfolioValue = all.reduce((s, t) => s + Number(t.value_eur), 0);
  const txThisMonth = all.filter((t) => new Date(t.timestamp) >= monthStart).length;
  const unreviewed = all.filter((t) => t.status === "unreviewed").length;
  const openAlerts = alerts.filter((a) => a.status === "open").length;

  // cumulative portfolio value per day (last 90 days)
  const series: { date: string; value: number }[] = [];
  let cum = 0;
  const byDay = new Map<string, number>();
  for (const t of all) {
    const d = t.timestamp.slice(0, 10);
    byDay.set(d, (byDay.get(d) ?? 0) + Number(t.value_eur));
  }
  const start = new Date(Date.now() - 89 * 86400000);
  for (const t of all) if (new Date(t.timestamp) < start) cum += Number(t.value_eur);
  for (let i = 0; i < 90; i++) {
    const d = new Date(start.getTime() + i * 86400000).toISOString().slice(0, 10);
    cum += byDay.get(d) ?? 0;
    series.push({ date: d, value: Math.round(cum) });
  }

  return {
    portfolioValue,
    txThisMonth,
    unreviewed,
    openAlerts,
    series,
    recentTx: all.slice(-10).reverse(),
    recentAlerts: alerts.slice(0, 4),
  };
}
