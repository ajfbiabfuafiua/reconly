import { generateTxs } from "@/lib/ledger";

const MONTHS = ["2026-08", "2026-07", "2026-06", "2026-05"];

export default function ExportsPage() {
  const txs = generateTxs();

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-xl font-medium text-white">Exports</h1>
        <p className="mt-1 text-sm text-[#6B7280]">
          DATEV-ready journal batches for your tax advisor. One file per month,
          SKR04 account mapping.
        </p>
      </div>

      <div className="glass light-seam divide-y divide-white/8 rounded-xl">
        {MONTHS.map((m) => {
          const count = txs.filter((t) => t.date.startsWith(m)).length;
          const date = new Date(`${m}-01T00:00:00Z`);
          const label = date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
          return (
            <div key={m} className="flex items-center justify-between px-6 py-4">
              <div>
                <p className="text-sm font-medium text-white">{label}</p>
                <p className="mt-0.5 text-xs text-[#6B7280]">
                  {count} journal entries · CSV · SKR04
                </p>
              </div>
              <a
                href={`/api/exports/datev?month=${m}`}
                download
                className={`btn-ghost border !border-white/20 !px-5 !py-2 text-xs ${
                  count === 0 ? "pointer-events-none opacity-40" : ""
                }`}
              >
                Download DATEV CSV ↓
              </a>
            </div>
          );
        })}
      </div>

      <p className="text-xs leading-relaxed text-[#6B7280]">
        Exports follow the simplified DATEV journal format (Umsatz, S/H, WKZ,
        Konto, Gegenkonto, Belegdatum, Belegfeld 1, Buchungstext). Your tax
        advisor imports them directly — no reformatting needed.
      </p>
    </div>
  );
}
