import Link from "next/link";
import { fmtEur, generateTxs, type TxType } from "@/lib/ledger";

const FILTERS: { key: string; label: string }[] = [
  { key: "all", label: "All" },
  { key: "trade", label: "Trades" },
  { key: "transfer", label: "Transfers" },
  { key: "staking", label: "Staking" },
  { key: "fee", label: "Fees" },
  { key: "review", label: "Needs review" },
];

export default async function TransactionsPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>;
}) {
  const { filter = "all" } = await searchParams;
  const txs = generateTxs();
  const rows =
    filter === "all"
      ? txs
      : filter === "review"
        ? txs.filter((t) => t.status === "review")
        : txs.filter((t) => t.type === (filter as TxType));

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-xl font-medium text-white">Transactions</h1>
          <p className="mt-1 text-sm text-[#6B7280]">
            {rows.length} of {txs.length} transactions · last 90 days
          </p>
        </div>
        <div className="glass flex rounded-full p-1 text-xs">
          {FILTERS.map((f) => (
            <Link
              key={f.key}
              href={f.key === "all" ? "/dashboard/transactions" : `/dashboard/transactions?filter=${f.key}`}
              className={`rounded-full px-3 py-1.5 transition-colors ${
                filter === f.key ? "bg-white/12 text-white" : "text-[#9CA3AF] hover:text-white"
              }`}
            >
              {f.label}
            </Link>
          ))}
        </div>
      </div>

      <div className="glass light-seam overflow-x-auto rounded-xl">
        <table className="w-full min-w-[760px] text-left text-xs">
          <thead>
            <tr className="border-b border-white/10 text-[#6B7280]">
              <th className="px-5 py-3 font-normal">Date</th>
              <th className="px-2 py-3 font-normal">Type</th>
              <th className="px-2 py-3 font-normal">Asset</th>
              <th className="px-2 py-3 text-right font-normal">Amount</th>
              <th className="px-2 py-3 text-right font-normal">Value (EUR)</th>
              <th className="px-2 py-3 font-normal">Source</th>
              <th className="px-2 py-3 font-normal">Accounts</th>
              <th className="px-5 py-3 text-right font-normal">Status</th>
            </tr>
          </thead>
          <tbody className="text-[#D1D5DB]">
            {rows.slice(0, 60).map((t) => (
              <tr key={t.id} className="border-b border-white/5 last:border-0 hover:bg-white/2">
                <td className="px-5 py-2.5 text-[#9CA3AF]">{t.date}</td>
                <td className="px-2 py-2.5 capitalize">{t.type}</td>
                <td className="px-2 py-2.5 font-medium text-white">{t.asset}</td>
                <td className="px-2 py-2.5 text-right font-mono">
                  {t.amount > 0 ? "+" : ""}
                  {t.amount.toLocaleString("en-US", { maximumFractionDigits: 4 })}
                </td>
                <td className="px-2 py-2.5 text-right">{fmtEur(t.valueEur)}</td>
                <td className="px-2 py-2.5 text-[#9CA3AF]">{t.wallet}</td>
                <td className="px-2 py-2.5 font-mono text-[10px] text-[#9CA3AF]">
                  {t.account} → {t.contra}
                </td>
                <td className="px-5 py-2.5 text-right">
                  <span
                    className={`rounded-full border px-2 py-0.5 text-[10px] ${
                      t.status === "booked"
                        ? "border-white/20 text-white"
                        : "border-white/40 bg-white/8 text-white"
                    }`}
                  >
                    {t.status === "booked" ? "Booked" : "Review"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {rows.length > 60 && (
        <p className="text-center text-xs text-[#6B7280]">Showing first 60 rows.</p>
      )}
    </div>
  );
}
