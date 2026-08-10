import { dailyVolume, fmtEur, generateTxs, holdings, WALLETS } from "@/lib/ledger";

function StatCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="glass light-seam rounded-xl p-5">
      <p className="text-[11px] uppercase tracking-[0.18em] text-[#6B7280]">{label}</p>
      <p className="mt-2 text-2xl font-medium text-white">{value}</p>
      {sub && <p className="mt-1 text-xs text-[#9CA3AF]">{sub}</p>}
    </div>
  );
}

function VolumeChart({ data }: { data: { date: string; volume: number }[] }) {
  const max = Math.max(...data.map((d) => d.volume), 1);
  const w = 640;
  const h = 140;
  const step = w / (data.length - 1);
  const points = data.map((d, i) => `${(i * step).toFixed(1)},${(h - (d.volume / max) * (h - 16)).toFixed(1)}`);
  const line = `M${points.join(" L")}`;
  const area = `${line} L${w},${h} L0,${h} Z`;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full" aria-label="Daily transaction volume, last 30 days">
      <defs>
        <linearGradient id="vol" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="white" stopOpacity="0.16" />
          <stop offset="100%" stopColor="white" stopOpacity="0" />
        </linearGradient>
      </defs>
      {[0.25, 0.5, 0.75].map((f) => (
        <line key={f} x1="0" y1={h * f} x2={w} y2={h * f} stroke="white" strokeOpacity="0.06" strokeDasharray="3 5" />
      ))}
      <path d={area} fill="url(#vol)" />
      <path d={line} fill="none" stroke="white" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  );
}

export default function OverviewPage() {
  const txs = generateTxs();
  const hold = holdings(txs);
  const vol = dailyVolume(txs, 30);
  const totalValue = hold.reduce((s, h) => s + h.valueEur, 0);
  const totalPnl = hold.reduce((s, h) => s + h.pnlEur, 0);
  const review = txs.filter((t) => t.status === "review").length;

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h1 className="text-xl font-medium text-white">Overview</h1>
        <p className="mt-1 text-sm text-[#6B7280]">
          All figures from the reconciled sub-ledger, valued in EUR.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Portfolio value" value={fmtEur(totalValue)} sub="across 5 sources" />
        <StatCard
          label="Unrealized P&L"
          value={(totalPnl >= 0 ? "+" : "") + fmtEur(totalPnl)}
          sub="vs. FIFO cost basis"
        />
        <StatCard label="Transactions (90d)" value={String(txs.length)} sub={`${review} awaiting review`} />
        <StatCard label="Cost basis resolved" value="100%" sub="GoBD audit trail complete" />
      </div>

      <div className="glass light-seam rounded-xl p-5">
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm font-medium text-white">Transaction volume</p>
          <p className="text-xs text-[#6B7280]">last 30 days</p>
        </div>
        <VolumeChart data={vol} />
      </div>

      <div className="grid gap-4 lg:grid-cols-5">
        <div className="glass light-seam rounded-xl p-5 lg:col-span-3">
          <p className="mb-4 text-sm font-medium text-white">Holdings</p>
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/10 text-[#6B7280]">
                <th className="pb-2 font-normal">Asset</th>
                <th className="pb-2 text-right font-normal">Amount</th>
                <th className="pb-2 text-right font-normal">Value</th>
                <th className="pb-2 text-right font-normal">Cost basis</th>
                <th className="pb-2 text-right font-normal">P&L</th>
              </tr>
            </thead>
            <tbody className="text-[#D1D5DB]">
              {hold.map((h) => (
                <tr key={h.asset} className="border-b border-white/5 last:border-0">
                  <td className="py-2.5 font-medium text-white">{h.asset}</td>
                  <td className="py-2.5 text-right">{h.amount.toLocaleString("en-US")}</td>
                  <td className="py-2.5 text-right">{fmtEur(h.valueEur)}</td>
                  <td className="py-2.5 text-right text-[#9CA3AF]">{fmtEur(h.costBasisEur)}</td>
                  <td className={`py-2.5 text-right ${h.pnlEur >= 0 ? "text-white" : "text-[#9CA3AF]"}`}>
                    {(h.pnlEur >= 0 ? "+" : "") + fmtEur(h.pnlEur)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="glass light-seam rounded-xl p-5 lg:col-span-2">
          <p className="mb-4 text-sm font-medium text-white">Connected sources</p>
          <ul className="space-y-3">
            {WALLETS.map((w) => (
              <li key={w.id} className="flex items-center justify-between text-xs">
                <div>
                  <p className="text-[#D1D5DB]">{w.name}</p>
                  <p className="font-mono text-[10px] text-[#6B7280]">{w.address}</p>
                </div>
                <span className="rounded-full border border-white/15 px-2 py-0.5 text-[10px] capitalize text-[#9CA3AF]">
                  {w.kind}
                </span>
              </li>
            ))}
          </ul>
          <button className="btn-ghost mt-5 w-full justify-center border !border-white/15 !py-2 text-xs">
            Connect source
          </button>
        </div>
      </div>
    </div>
  );
}
