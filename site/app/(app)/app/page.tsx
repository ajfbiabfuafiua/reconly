import Link from "next/link";
import { requireActiveUser } from "@/lib/profile";
import { getOverview, fmtEur } from "@/lib/data";
import { Kpi, LineChart, SeverityDot, StatusBadge, EmptyState } from "@/components/app/Bits";
import { AskAssistButton } from "@/components/assist/AssistEntry";

export default async function OverviewPage() {
  const { profile } = await requireActiveUser();
  const o = await getOverview(profile.clerk_user_id);

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-medium text-white">Overview</h1>
          <p className="mt-1 text-sm text-[#6B7280]">
            {profile.company_name ?? profile.email} · valued in EUR
          </p>
        </div>
        <AskAssistButton prompt="Explain this month's change in my portfolio." context={{ label: "Overview" }}>
          Explain this month&apos;s change
        </AskAssistButton>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi label="Portfolio value" value={fmtEur(o.portfolioValue)} sub="all sources" />
        <Kpi label="Transactions this month" value={String(o.txThisMonth)} />
        <Kpi label="Unreviewed" value={String(o.unreviewed)} sub="awaiting categorization" />
        <Kpi label="Open alerts" value={String(o.openAlerts)} sub="compliance monitoring" />
      </div>

      <div className="glass light-seam rounded-xl p-5">
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm font-medium text-white">Portfolio value</p>
          <p className="text-xs text-[#6B7280]">last 90 days</p>
        </div>
        <LineChart data={o.series} label="Portfolio value over the last 90 days" />
      </div>

      <div className="grid gap-4 lg:grid-cols-5">
        <div className="glass light-seam rounded-xl p-5 lg:col-span-3">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm font-medium text-white">Recent transactions</p>
            <Link href="/app/transactions" className="text-xs text-[#9CA3AF] hover:text-white">
              View all →
            </Link>
          </div>
          {o.recentTx.length === 0 ? (
            <EmptyState
              title="No transactions yet"
              hint="Connect a wallet or exchange and Reconly will start building your sub-ledger."
              action={
                <Link href="/app/wallets" className="btn-primary !px-5 !py-2 text-xs">
                  Add wallet
                </Link>
              }
            />
          ) : (
            <table className="w-full text-left text-xs">
              <tbody className="text-[#D1D5DB]">
                {o.recentTx.map((t) => (
                  <tr key={t.id} className="border-b border-white/5 last:border-0">
                    <td className="py-2 text-[#9CA3AF]">{t.timestamp.slice(0, 10)}</td>
                    <td className="py-2 capitalize">{t.type.replace("_", " ")}</td>
                    <td className="py-2 font-medium text-white">{t.asset}</td>
                    <td className="py-2 text-right">{fmtEur(Number(t.value_eur))}</td>
                    <td className="py-2 pl-3 text-right">
                      <StatusBadge status={t.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="glass light-seam rounded-xl p-5 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm font-medium text-white">Recent alerts</p>
            <Link href="/app/compliance" className="text-xs text-[#9CA3AF] hover:text-white">
              Compliance →
            </Link>
          </div>
          {o.recentAlerts.length === 0 ? (
            <p className="py-8 text-center text-xs text-[#6B7280]">No alerts — all clear.</p>
          ) : (
            <ul className="space-y-3">
              {o.recentAlerts.map((a) => (
                <li key={a.id} className="flex items-start gap-2.5 text-xs">
                  <span className="mt-1">
                    <SeverityDot severity={a.severity} />
                  </span>
                  <div>
                    <p className="text-[#D1D5DB]">{a.title}</p>
                    <p className="mt-0.5 text-[10px] text-[#6B7280]">
                      {a.created_at.slice(0, 10)} · {a.status}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
