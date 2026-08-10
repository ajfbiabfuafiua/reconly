import Reveal from "./Reveal";

function Check() {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true">
      <circle cx="10" cy="10" r="9" stroke="white" strokeOpacity="0.25" strokeWidth="1" />
      <path
        d="M6.5 10.2l2.3 2.3 4.7-5"
        stroke="white"
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function BrowserFrame({ url, children }: { url: string; children: React.ReactNode }) {
  return (
    <div className="glass-strong light-seam overflow-hidden rounded-2xl shadow-[0_-2px_40px_rgba(255,255,255,0.10),0_30px_60px_rgba(0,0,0,0.6)]">
      <div className="flex items-center gap-3 border-b border-white/8 px-4 py-3">
        <div className="flex gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
          <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
          <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
        </div>
        <div className="rounded-md bg-white/6 px-3 py-1 text-[11px] tracking-wide text-[#6B7280]">
          {url}
        </div>
      </div>
      <div className="bg-black/50 p-4 sm:p-5">{children}</div>
    </div>
  );
}

const ledgerRows = [
  ["Mar 04", "ETH", "+12.4021", "€38,204.11", "1460 → 8400", "Booked"],
  ["Mar 04", "USDC", "−25,000.00", "€23,118.90", "1460 → 4830", "Booked"],
  ["Mar 05", "BTC", "+0.8410", "€51,772.35", "1460 → 8400", "Booked"],
  ["Mar 06", "ETH", "Staking reward", "€412.08", "1460 → 4839", "Booked"],
  ["Mar 07", "SOL", "−310.0000", "€9,844.51", "1460 → 4830", "Review"],
  ["Mar 08", "ETH", "Gas fee", "−€64.20", "4970 → 1460", "Booked"],
];

function AccountingMockup() {
  return (
    <BrowserFrame url="app.reconly.io/ledger">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-[11px] uppercase tracking-[0.2em] text-[#6B7280]">Sub-ledger</p>
          <p className="mt-1 text-sm font-medium text-white">Journal entries · March 2026</p>
        </div>
        <span className="rounded-full border border-white/25 bg-white/6 px-3 py-1.5 text-[11px] font-medium text-white shadow-[0_0_12px_rgba(255,255,255,0.10)]">
          Export DATEV ↓
        </span>
      </div>
      <table className="w-full text-left text-[11px] sm:text-xs">
        <thead>
          <tr className="border-b border-white/10 text-[#6B7280]">
            <th className="pb-2 font-normal">Date</th>
            <th className="pb-2 font-normal">Asset</th>
            <th className="pb-2 font-normal">Amount</th>
            <th className="pb-2 font-normal">Value (EUR)</th>
            <th className="hidden pb-2 font-normal sm:table-cell">Accounts</th>
            <th className="pb-2 text-right font-normal">Status</th>
          </tr>
        </thead>
        <tbody className="text-[#D1D5DB]">
          {ledgerRows.map((r, i) => (
            <tr key={i} className="border-b border-white/5 last:border-0">
              <td className="py-2 text-[#9CA3AF]">{r[0]}</td>
              <td className="py-2 font-medium text-white">{r[1]}</td>
              <td className="py-2">{r[2]}</td>
              <td className="py-2">{r[3]}</td>
              <td className="hidden py-2 text-[#9CA3AF] sm:table-cell">{r[4]}</td>
              <td className="py-2 text-right">
                <span
                  className={`rounded-full border px-2 py-0.5 text-[10px] ${
                    r[5] === "Booked"
                      ? "border-white/20 text-white"
                      : "border-white/10 text-[#9CA3AF]"
                  }`}
                >
                  {r[5]}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="mt-4 flex items-center justify-between rounded-lg border border-white/8 bg-white/3 px-3 py-2 text-[11px] text-[#9CA3AF]">
        <span>2,847 transactions reconciled</span>
        <span className="text-white">100% cost basis resolved</span>
      </div>
    </BrowserFrame>
  );
}

function ComplianceMockup() {
  return (
    <BrowserFrame url="app.reconly.io/monitoring">
      <div className="mb-4 grid grid-cols-3 gap-3">
        {[
          ["Open alerts", "3"],
          ["Wallets screened", "1,204"],
          ["Portfolio risk", "Low"],
        ].map(([k, v]) => (
          <div key={k} className="rounded-lg border border-white/8 bg-white/3 px-3 py-2.5">
            <p className="text-[10px] uppercase tracking-wider text-[#6B7280]">{k}</p>
            <p className="mt-1 text-lg font-medium text-white">{v}</p>
          </div>
        ))}
      </div>

      <div className="rounded-lg border border-white/8 bg-white/3 p-3">
        <p className="mb-2 text-[10px] uppercase tracking-wider text-[#6B7280]">
          Transaction volume vs. flagged
        </p>
        <svg viewBox="0 0 400 110" className="w-full" aria-hidden="true">
          {[22, 44, 66, 88].map((y) => (
            <line key={y} x1="0" y1={y} x2="400" y2={y} stroke="white" strokeOpacity="0.06" strokeDasharray="3 5" />
          ))}
          <path
            d="M0 88 C40 70, 70 78, 100 60 S160 30, 200 42 S280 20, 320 30 S380 14, 400 18"
            fill="none"
            stroke="white"
            strokeWidth="1.6"
          />
          <path
            d="M0 100 C50 98, 90 92, 130 95 S210 86, 250 90 S330 82, 400 86"
            fill="none"
            stroke="white"
            strokeOpacity="0.35"
            strokeWidth="1.2"
            strokeDasharray="4 4"
          />
          <circle cx="320" cy="30" r="3" fill="white" />
        </svg>
      </div>

      <div className="mt-3 space-y-2">
        {[
          ["0x7f3a…c21e", "Screened · no match", "Clear"],
          ["bc1qxy…08fj", "Indirect exposure · mixer, 2 hops", "Review"],
          ["0x94d1…77b0", "Screened · no match", "Clear"],
        ].map(([addr, note, badge]) => (
          <div
            key={addr}
            className="flex items-center justify-between rounded-lg border border-white/8 bg-white/3 px-3 py-2 text-[11px]"
          >
            <span className="font-mono text-[#D1D5DB]">{addr}</span>
            <span className="hidden text-[#6B7280] sm:inline">{note}</span>
            <span
              className={`rounded-full border px-2 py-0.5 text-[10px] ${
                badge === "Clear" ? "border-white/20 text-white" : "border-white/40 bg-white/8 text-white"
              }`}
            >
              {badge}
            </span>
          </div>
        ))}
      </div>
    </BrowserFrame>
  );
}

const blocks = [
  {
    id: "accounting",
    eyebrow: "Accounting",
    title: "From raw chains to clean books",
    bullets: [
      "Automatic transaction ingestion from wallets, exchanges and custodians",
      "Cost-basis valuation (FIFO/LIFO) with HGB-compliant valuation dates",
      "DATEV-ready journal entries and one-click exports for your tax advisor",
    ],
    mockup: <AccountingMockup />,
    reverse: false,
  },
  {
    id: "compliance",
    eyebrow: "Compliance",
    title: "MiCA-ready, before the auditor asks",
    bullets: [
      "Wallet screening and continuous transaction monitoring",
      "MiCA and AML reporting templates, filled from your live data",
      "Complete audit trail — every figure traces back to the chain",
    ],
    mockup: <ComplianceMockup />,
    reverse: true,
  },
];

export default function Product() {
  return (
    <section id="product" className="mx-auto max-w-6xl space-y-32 px-5 py-28 sm:px-8">
      {blocks.map((b) => (
        <div
          key={b.id}
          id={b.id}
          className={`grid scroll-mt-28 items-center gap-12 lg:grid-cols-2 lg:gap-16 ${
            b.reverse ? "lg:[&>*:first-child]:order-2" : ""
          }`}
        >
          <Reveal>
            <div>
              <p className="text-[11px] font-medium uppercase tracking-[0.34em] text-[#9CA3AF]">
                {b.eyebrow}
              </p>
              <h2 className="text-light-gradient mt-4 text-balance text-3xl font-medium tracking-tight sm:text-4xl">
                {b.title}
              </h2>
              <ul className="mt-8 space-y-4">
                {b.bullets.map((t) => (
                  <li key={t} className="flex gap-3 text-[15px] leading-relaxed text-[#9CA3AF]">
                    <Check />
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
          <Reveal delay={120}>{b.mockup}</Reveal>
        </div>
      ))}
    </section>
  );
}
