import { ALERTS } from "@/lib/ledger";

const SEVERITY_STYLES: Record<string, string> = {
  high: "border-white/50 bg-white/10 text-white",
  review: "border-white/25 bg-white/5 text-white",
  info: "border-white/15 text-[#9CA3AF]",
};

export default function CompliancePage() {
  const open = ALERTS.filter((a) => !a.resolved);
  const resolved = ALERTS.filter((a) => a.resolved);

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-xl font-medium text-white">Compliance</h1>
        <p className="mt-1 text-sm text-[#6B7280]">
          Continuous wallet screening and transaction monitoring across all sources.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          ["Wallets screened", "1,204"],
          ["Open alerts", String(open.length)],
          ["MiCA data completeness", "100%"],
        ].map(([k, v]) => (
          <div key={k} className="glass light-seam rounded-xl p-5">
            <p className="text-[11px] uppercase tracking-[0.18em] text-[#6B7280]">{k}</p>
            <p className="mt-2 text-2xl font-medium text-white">{v}</p>
          </div>
        ))}
      </div>

      <section className="space-y-3">
        <h2 className="text-sm font-medium text-white">Open alerts</h2>
        {open.map((a) => (
          <div key={a.id} className="glass light-seam rounded-xl p-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm font-medium text-white">{a.title}</p>
              <div className="flex items-center gap-3">
                <span className="text-xs text-[#6B7280]">{a.date}</span>
                <span
                  className={`rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-wide ${SEVERITY_STYLES[a.severity]}`}
                >
                  {a.severity}
                </span>
              </div>
            </div>
            <p className="mt-2 text-xs leading-relaxed text-[#9CA3AF]">{a.detail}</p>
            <div className="mt-4 flex gap-2">
              <button className="btn-ghost border !border-white/15 !px-4 !py-1.5 text-xs">
                Mark resolved
              </button>
              <button className="btn-ghost !px-4 !py-1.5 text-xs text-[#9CA3AF]">
                View transactions
              </button>
            </div>
          </div>
        ))}
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-medium text-white">Recently resolved</h2>
        {resolved.map((a) => (
          <div key={a.id} className="glass rounded-xl p-4 opacity-60">
            <div className="flex items-center justify-between">
              <p className="text-xs text-[#D1D5DB]">{a.title}</p>
              <span className="text-[10px] text-[#6B7280]">{a.date}</span>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
