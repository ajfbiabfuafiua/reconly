import { requireActiveUser } from "@/lib/profile";
import { getAlerts, getWallets, shortAddr } from "@/lib/data";
import { SeverityDot, EmptyState } from "@/components/app/Bits";
import AlertActions from "@/components/app/AlertActions";
import { AskAssistButton } from "@/components/assist/AssistEntry";

export default async function CompliancePage() {
  const { profile } = await requireActiveUser();
  const [alerts, wallets] = await Promise.all([
    getAlerts(profile.clerk_user_id),
    getWallets(profile.clerk_user_id),
  ]);

  const open = alerts.filter((a) => a.status === "open");
  const order = { critical: 0, warning: 1, info: 2 } as const;
  open.sort((a, b) => order[a.severity] - order[b.severity]);
  const closed = alerts.filter((a) => a.status !== "open").slice(0, 6);

  // mock screening result, deterministic per address
  const screening = wallets.map((w) => ({
    ...w,
    flagged: [...w.address].reduce((s, c) => s + c.charCodeAt(0), 0) % 7 === 0,
  }));

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div>
        <h1 className="text-xl font-medium text-white">Compliance</h1>
        <p className="mt-1 text-sm text-[#6B7280]">
          Continuous wallet screening and transaction monitoring across all sources
        </p>
      </div>

      <section className="space-y-3">
        <h2 className="text-sm font-medium text-white">
          Open alerts{" "}
          <span className="ml-1 rounded-full border border-white/20 px-2 py-0.5 text-[10px] text-[#9CA3AF]">
            {open.length}
          </span>
        </h2>
        {open.length === 0 ? (
          <EmptyState title="No open alerts" hint="Monitoring is active — new findings appear here." />
        ) : (
          open.map((a) => (
            <div key={a.id} className="glass light-seam rounded-xl p-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <SeverityDot severity={a.severity} />
                  <p className="text-sm font-medium text-white">{a.title}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-[#6B7280]">{a.created_at.slice(0, 10)}</span>
                  <span className="rounded-full border border-white/20 px-2 py-0.5 text-[10px] uppercase tracking-wide text-[#9CA3AF]">
                    {a.severity}
                  </span>
                </div>
              </div>
              <p className="mt-2 text-xs leading-relaxed text-[#9CA3AF]">{a.description}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <AlertActions alertId={a.id} critical={a.severity === "critical"} />
                <AskAssistButton
                  prompt={`Explain this compliance alert and sensible next steps: "${a.title}" — ${a.description}`}
                  context={{ label: `Alert: ${a.title.slice(0, 40)}`, alertId: a.id }}
                >
                  Explain this alert
                </AskAssistButton>
              </div>
            </div>
          ))
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-medium text-white">Wallet screening</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {screening.map((w) => (
            <div key={w.id} className="glass rounded-xl px-5 py-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-white">{w.label}</p>
                <span
                  className={`rounded-full border px-2.5 py-0.5 text-[10px] ${
                    w.flagged ? "border-white/50 bg-white/10 text-white" : "border-white/20 text-[#9CA3AF]"
                  }`}
                >
                  {w.flagged ? "Flagged" : "Clear"}
                </span>
              </div>
              <p className="mt-1 font-mono text-[10px] text-[#6B7280]">{shortAddr(w.address)}</p>
            </div>
          ))}
          {screening.length === 0 && (
            <p className="text-xs text-[#6B7280]">Connect a wallet to run screening.</p>
          )}
        </div>
      </section>

      {closed.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-sm font-medium text-white">Recently closed</h2>
          <div className="glass divide-y divide-white/6 rounded-xl">
            {closed.map((a) => (
              <div key={a.id} className="flex items-center justify-between px-5 py-3 opacity-60">
                <p className="text-xs text-[#D1D5DB]">{a.title}</p>
                <span className="text-[10px] capitalize text-[#6B7280]">{a.status}</span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
