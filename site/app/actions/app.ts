"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/supabase";
import { getOrCreateOwnProfile, assertNotImpersonating, getSetting } from "@/lib/profile";

async function requireActiveForWrite() {
  await assertNotImpersonating();
  const p = await getOrCreateOwnProfile();
  if (!p || p.status !== "active") throw new Error("Not authorized");
  return p;
}

const CHAINS = ["ethereum", "bitcoin", "solana", "polygon", "arbitrum", "base", "exchange"];
const ASSETS: Record<string, string[]> = {
  ethereum: ["ETH", "USDC", "MATIC"],
  bitcoin: ["BTC"],
  solana: ["SOL", "USDC"],
  polygon: ["MATIC", "USDC"],
  arbitrum: ["ETH", "USDC"],
  base: ["ETH", "USDC"],
  exchange: ["BTC", "ETH", "SOL", "USDC"],
};

export async function addWallet(form: {
  label: string;
  chain: string;
  address: string;
  exchangeName?: string;
}) {
  const p = await requireActiveForWrite();
  const label = form.label?.trim();
  const chain = CHAINS.includes(form.chain) ? form.chain : null;
  const address = form.address?.trim() || form.exchangeName?.trim()?.toLowerCase() || "";
  if (!label || label.length > 100) throw new Error("Please enter a label");
  if (!chain) throw new Error("Please select a chain");
  if (!address || address.length > 200) throw new Error("Please enter an address or exchange");

  const { data: wallet, error } = await db()
    .from("wallets")
    .insert({
      clerk_user_id: p.clerk_user_id,
      label,
      chain,
      address,
      exchange_name: form.exchangeName?.trim() || null,
    })
    .select()
    .single();
  if (error) throw new Error(error.message);

  // Placeholder for real integrations: import a few mock transactions so the
  // workspace is immediately explorable.
  const assets = ASSETS[chain] ?? ["ETH"];
  const types = ["buy", "buy", "transfer_in", "staking_reward", "sell", "transfer_out", "fee"] as const;
  const rows = Array.from({ length: 6 + Math.floor(Math.random() * 5) }, (_, i) => {
    const type = types[Math.floor(Math.random() * types.length)];
    const asset = assets[Math.floor(Math.random() * assets.length)];
    const value =
      type === "fee"
        ? -(5 + Math.random() * 40)
        : type === "sell" || type === "transfer_out"
          ? -(300 + Math.random() * 4000)
          : 300 + Math.random() * 6000;
    return {
      clerk_user_id: p.clerk_user_id,
      wallet_id: wallet.id,
      tx_hash: `0x${Array.from({ length: 40 }, () => "0123456789abcdef"[Math.floor(Math.random() * 16)]).join("")}`,
      timestamp: new Date(Date.now() - (i + 1) * (36 + Math.random() * 30) * 3600000).toISOString(),
      type,
      asset,
      amount: Number((asset === "BTC" ? Math.random() * 0.6 : Math.random() * 12).toFixed(4)),
      value_eur: Number(value.toFixed(2)),
      status: "unreviewed",
    };
  });
  await db().from("transactions").insert(rows);

  revalidatePath("/app/wallets");
  revalidatePath("/app");
  return { id: wallet.id as string };
}

export async function deleteWallet(walletId: string) {
  const p = await requireActiveForWrite();
  const { error } = await db()
    .from("wallets")
    .delete()
    .eq("id", walletId)
    .eq("clerk_user_id", p.clerk_user_id);
  if (error) throw new Error(error.message);
  revalidatePath("/app/wallets");
  revalidatePath("/app");
}

export async function updateTransaction(
  txId: string,
  patch: { category?: string | null; markReviewed?: boolean }
) {
  const p = await requireActiveForWrite();
  const update: Record<string, unknown> = {};
  if (patch.category !== undefined) {
    update.category = patch.category?.trim() || null;
    update.status = "categorized";
  }
  if (patch.markReviewed) update.status = "categorized";
  const { error } = await db()
    .from("transactions")
    .update(update)
    .eq("id", txId)
    .eq("clerk_user_id", p.clerk_user_id);
  if (error) throw new Error(error.message);
  revalidatePath("/app/transactions");
}

export async function bulkCategorize(txIds: string[], category: string) {
  const p = await requireActiveForWrite();
  if (!txIds.length || txIds.length > 500) throw new Error("Invalid selection");
  const { error } = await db()
    .from("transactions")
    .update({ category: category.trim() || null, status: "categorized" })
    .in("id", txIds)
    .eq("clerk_user_id", p.clerk_user_id);
  if (error) throw new Error(error.message);
  revalidatePath("/app/transactions");
}

export async function setAlertStatus(alertId: string, status: "resolved" | "dismissed" | "open") {
  const p = await requireActiveForWrite();
  const { error } = await db()
    .from("compliance_alerts")
    .update({ status })
    .eq("id", alertId)
    .eq("clerk_user_id", p.clerk_user_id);
  if (error) throw new Error(error.message);
  revalidatePath("/app/compliance");
  revalidatePath("/app");
}

const REPORT_TYPES = ["monthly_close", "datev_export", "compliance_report"] as const;

export async function generateReport(type: string, period: string) {
  const p = await requireActiveForWrite();
  if (!REPORT_TYPES.includes(type as (typeof REPORT_TYPES)[number])) throw new Error("Invalid type");
  if (!/^\d{4}-\d{2}$/.test(period)) throw new Error("Invalid period");

  const { data: txs } = await db()
    .from("transactions")
    .select("timestamp, type, asset, amount, value_eur, category, tx_hash")
    .eq("clerk_user_id", p.clerk_user_id)
    .gte("timestamp", `${period}-01`)
    .lt("timestamp", nextMonth(period))
    .order("timestamp");

  const header = "date;type;asset;amount;value_eur;category;tx_hash";
  const lines = (txs ?? []).map((t) =>
    [
      t.timestamp.slice(0, 10),
      t.type,
      t.asset,
      t.amount,
      Number(t.value_eur).toFixed(2).replace(".", ","),
      t.category ?? "",
      t.tx_hash,
    ].join(";")
  );
  const csv = [
    `# Reconly ${type.replace("_", " ")} — ${period} — generated ${new Date().toISOString()}`,
    header,
    ...lines,
  ].join("\r\n");

  const path = `${p.clerk_user_id}/${type}-${period}-${Date.now()}.csv`;
  const { error: upErr } = await db()
    .storage.from("reports")
    .upload(path, new Blob([csv], { type: "text/csv" }), { upsert: true });
  if (upErr) throw new Error(upErr.message);

  const { error } = await db().from("reports").insert({
    clerk_user_id: p.clerk_user_id,
    type,
    period,
    file_url: path,
  });
  if (error) throw new Error(error.message);
  revalidatePath("/app/reports");
}

function nextMonth(period: string): string {
  const [y, m] = period.split("-").map(Number);
  return m === 12 ? `${y + 1}-01-01` : `${y}-${String(m + 1).padStart(2, "0")}-01`;
}

export async function updateOwnProfile(form: { fullName: string; companyName: string }) {
  const p = await requireActiveForWrite();
  const { error } = await db()
    .from("profiles")
    .update({
      full_name: form.fullName?.trim().slice(0, 200) || null,
      company_name: form.companyName?.trim().slice(0, 200) || null,
    })
    .eq("clerk_user_id", p.clerk_user_id);
  if (error) throw new Error(error.message);
  revalidatePath("/app/settings");
}

export async function requestAccountDeletion() {
  const p = await requireActiveForWrite();
  await db()
    .from("profiles")
    .update({ deletion_requested_at: new Date().toISOString() })
    .eq("clerk_user_id", p.clerk_user_id);
  const notify = await getSetting<string>("admin_notification_email", "");
  console.log(`[deletion-request] ${p.email} → notify ${notify || "n/a"}`);
  revalidatePath("/app/settings");
}
