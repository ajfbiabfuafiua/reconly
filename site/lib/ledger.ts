/**
 * Deterministic mock ledger engine. Seeded PRNG so every render shows the
 * same books — swap for the real ingestion API later without touching the UI.
 */

export type Asset = "BTC" | "ETH" | "SOL" | "USDC" | "MATIC";
export type TxType = "trade" | "transfer" | "staking" | "fee" | "airdrop";
export type TxStatus = "booked" | "review";

export interface Wallet {
  id: string;
  name: string;
  kind: "wallet" | "exchange" | "custodian";
  address: string;
  txCount: number;
}

export interface Tx {
  id: string;
  date: string; // ISO date
  wallet: string;
  asset: Asset;
  type: TxType;
  amount: number; // signed
  priceEur: number; // unit price at tx time
  valueEur: number; // signed EUR value
  feeEur: number;
  account: string; // debit account (SKR04-ish)
  contra: string; // credit account
  status: TxStatus;
}

export interface Holding {
  asset: Asset;
  amount: number;
  valueEur: number;
  costBasisEur: number;
  pnlEur: number;
}

export interface Alert {
  id: string;
  severity: "info" | "review" | "high";
  title: string;
  detail: string;
  date: string;
  resolved: boolean;
}

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const BASE_PRICE: Record<Asset, number> = {
  BTC: 61800,
  ETH: 3080,
  SOL: 31.4,
  USDC: 0.92,
  MATIC: 0.53,
};

const ACCOUNTS: Record<TxType, [string, string]> = {
  trade: ["1460", "4830"],
  transfer: ["1460", "1461"],
  staking: ["1460", "4839"],
  fee: ["4970", "1460"],
  airdrop: ["1460", "4839"],
};

export const WALLETS: Wallet[] = [
  { id: "w1", name: "Treasury Safe", kind: "wallet", address: "0x7f3a…c21e", txCount: 0 },
  { id: "w2", name: "Ops Hot Wallet", kind: "wallet", address: "0x94d1…77b0", txCount: 0 },
  { id: "w3", name: "Kraken Corporate", kind: "exchange", address: "kraken-main", txCount: 0 },
  { id: "w4", name: "Coinbase Prime", kind: "custodian", address: "cb-prime-01", txCount: 0 },
  { id: "w5", name: "Staking Node", kind: "wallet", address: "bc1qxy…08fj", txCount: 0 },
];

const ASSETS: Asset[] = ["BTC", "ETH", "SOL", "USDC", "MATIC"];
const TYPES: TxType[] = ["trade", "trade", "trade", "transfer", "staking", "fee", "airdrop"];

/** ~140 transactions over the 90 days before 2026-08-01, newest first. */
export function generateTxs(): Tx[] {
  const rand = mulberry32(20260801);
  const txs: Tx[] = [];
  const end = Date.UTC(2026, 7, 1);

  for (let i = 0; i < 140; i++) {
    const daysAgo = Math.floor(rand() * 90);
    const date = new Date(end - daysAgo * 86400000);
    const type = TYPES[Math.floor(rand() * TYPES.length)];
    // airdrops only happen for the small tokens, never BTC/ETH
    const asset =
      type === "airdrop"
        ? (["MATIC", "USDC"] as const)[Math.floor(rand() * 2)]
        : ASSETS[Math.floor(rand() * ASSETS.length)];
    const wallet = WALLETS[Math.floor(rand() * WALLETS.length)];
    const drift = 1 + (rand() - 0.5) * 0.18;
    const price = BASE_PRICE[asset] * drift;

    let amount: number;
    switch (type) {
      case "trade":
        amount = (rand() - 0.42) * (asset === "BTC" ? 1.4 : asset === "ETH" ? 22 : 5200);
        break;
      case "transfer":
        amount = (rand() - 0.5) * (asset === "BTC" ? 0.8 : asset === "ETH" ? 12 : 3000);
        break;
      case "staking":
        amount = rand() * (asset === "ETH" ? 0.35 : 14);
        break;
      case "fee":
        amount = -rand() * (asset === "ETH" ? 0.02 : 0.4);
        break;
      case "airdrop":
        amount = 40 + rand() * 860;
        break;
    }
    if (asset === "USDC") amount = Math.round(amount * 100) / 100;

    const valueEur = amount * price;
    const [account, contra] = ACCOUNTS[type];
    txs.push({
      id: `tx${(10000 + i).toString(36)}`,
      date: date.toISOString().slice(0, 10),
      wallet: wallet.name,
      asset,
      type,
      amount: Math.round(amount * 10000) / 10000,
      priceEur: Math.round(price * 100) / 100,
      valueEur: Math.round(valueEur * 100) / 100,
      feeEur: Math.round(rand() * 18 * 100) / 100,
      account,
      contra,
      status: rand() < 0.93 ? "booked" : "review",
    });
    wallet.txCount++;
  }
  return txs.sort((a, b) => (a.date < b.date ? 1 : -1));
}

export function holdings(txs: Tx[]): Holding[] {
  const byAsset = new Map<Asset, { amount: number; cost: number }>();
  for (const tx of txs) {
    const h = byAsset.get(tx.asset) ?? { amount: 0, cost: 0 };
    h.amount += tx.amount;
    if (tx.amount > 0) h.cost += tx.valueEur;
    byAsset.set(tx.asset, h);
  }
  // per-asset FIFO factor, deterministic but never exactly 1.0
  const COST_FACTOR: Record<Asset, number> = {
    BTC: 0.79,
    ETH: 0.86,
    SOL: 1.08,
    USDC: 0.985,
    MATIC: 0.91,
  };
  return [...byAsset.entries()]
    .map(([asset, h]) => {
      const amount = Math.max(0.0001, h.amount + (asset === "BTC" ? 4.2 : asset === "ETH" ? 118 : 9000));
      const valueEur = amount * BASE_PRICE[asset];
      const costBasisEur = valueEur * COST_FACTOR[asset];
      return {
        asset,
        amount: Math.round(amount * 10000) / 10000,
        valueEur: Math.round(valueEur),
        costBasisEur: Math.round(costBasisEur),
        pnlEur: Math.round(valueEur - costBasisEur),
      };
    })
    .sort((a, b) => b.valueEur - a.valueEur);
}

/** Daily EUR volume for the last `days` days (oldest first) for the chart. */
export function dailyVolume(txs: Tx[], days = 30): { date: string; volume: number }[] {
  const map = new Map<string, number>();
  for (const tx of txs) map.set(tx.date, (map.get(tx.date) ?? 0) + Math.abs(tx.valueEur));
  const out: { date: string; volume: number }[] = [];
  const end = Date.UTC(2026, 7, 1);
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(end - i * 86400000).toISOString().slice(0, 10);
    out.push({ date: d, volume: Math.round(map.get(d) ?? 0) });
  }
  return out;
}

export const ALERTS: Alert[] = [
  {
    id: "al1",
    severity: "review",
    title: "Indirect mixer exposure",
    detail: "Incoming transfer to Staking Node is 2 hops from a flagged mixing service (0.4 ETH).",
    date: "2026-07-28",
    resolved: false,
  },
  {
    id: "al2",
    severity: "info",
    title: "New counterparty screened",
    detail: "First transfer from 0x3be1…9a04 — screening completed, no sanctions match.",
    date: "2026-07-26",
    resolved: false,
  },
  {
    id: "al3",
    severity: "high",
    title: "Velocity anomaly on Ops Hot Wallet",
    detail: "Outflow volume 6.8× above 30-day average within 4 hours. Review transfers tx7q2…tx7q9.",
    date: "2026-07-21",
    resolved: false,
  },
  {
    id: "al4",
    severity: "info",
    title: "MiCA quarterly report due",
    detail: "Q3 reporting window opens Oct 1. Data completeness currently at 100%.",
    date: "2026-07-15",
    resolved: true,
  },
  {
    id: "al5",
    severity: "review",
    title: "Unmatched cost basis",
    detail: "9 trades on Kraken Corporate await FIFO lot matching after CSV re-import.",
    date: "2026-07-11",
    resolved: true,
  },
];

export function fmtEur(n: number): string {
  const rounded = Math.round(n) === 0 ? 0 : Math.round(n); // avoid "-0 €"
  return rounded.toLocaleString("en-US") + " €";
}

/** Simplified DATEV-style journal CSV for one month (yyyy-mm). */
export function datevCsv(txs: Tx[], month: string): string {
  const rows = txs.filter((t) => t.date.startsWith(month));
  const header =
    '"Umsatz";"S/H";"WKZ";"Konto";"Gegenkonto";"Belegdatum";"Belegfeld 1";"Buchungstext"';
  const lines = rows.map((t) => {
    const sh = t.valueEur >= 0 ? "S" : "H";
    const text = `${t.type.toUpperCase()} ${t.asset} ${t.amount} @ ${t.priceEur} EUR (${t.wallet})`;
    const beleg = t.date.split("-").reverse().join("");
    return `"${Math.abs(t.valueEur).toFixed(2).replace(".", ",")}";"${sh}";"EUR";"${t.account}";"${t.contra}";"${beleg}";"${t.id}";"${text}"`;
  });
  return [header, ...lines].join("\r\n");
}
