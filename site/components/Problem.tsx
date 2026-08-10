import Reveal from "./Reveal";

const problems = [
  {
    title: "Thousands of transactions, zero structure",
    body: "Swaps, staking rewards, bridging, gas — every wallet produces noise. Nobody can hand that to an auditor.",
    icon: (
      <svg viewBox="0 0 32 32" fill="none" className="h-8 w-8" aria-hidden="true">
        <path
          d="M4 24l6-6 5 4 7-9 6 5M4 8h8M4 12h5"
          stroke="white"
          strokeWidth="1.3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    title: "Your tax advisor doesn't speak crypto",
    body: "CSV chaos meets HGB reality. Cost basis, valuation dates, account mapping — lost in translation every quarter.",
    icon: (
      <svg viewBox="0 0 32 32" fill="none" className="h-8 w-8" aria-hidden="true">
        <path
          d="M6 22V8a2 2 0 012-2h12a2 2 0 012 2v10a2 2 0 01-2 2H12l-6 4zM26 12v8m0 0l-3-2.5M26 20l3-2.5"
          stroke="white"
          strokeWidth="1.3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    title: "MiCA & AML deadlines are coming",
    body: "Regulators expect screening, monitoring and reports. Spreadsheets won't survive the first audit request.",
    icon: (
      <svg viewBox="0 0 32 32" fill="none" className="h-8 w-8" aria-hidden="true">
        <path
          d="M16 4l10 4v7c0 6.2-4.3 10.6-10 13-5.7-2.4-10-6.8-10-13V8l10-4zM16 11v6m0 4v.5"
          stroke="white"
          strokeWidth="1.3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
];

export default function Problem() {
  return (
    <section className="relative mx-auto max-w-6xl px-5 py-28 sm:px-8">
      <Reveal className="text-center">
        <p className="text-[11px] font-medium uppercase tracking-[0.34em] text-[#9CA3AF]">
          The mess we clean up
        </p>
        <h2 className="text-light-gradient mx-auto mt-4 max-w-2xl text-balance text-3xl font-medium tracking-tight sm:text-4xl">
          Digital assets don&apos;t fit old bookkeeping. Until now.
        </h2>
      </Reveal>

      <div className="mt-14 grid gap-5 md:grid-cols-3">
        {problems.map((p, i) => (
          <Reveal key={p.title} delay={i * 100}>
            <div className="glass light-seam group h-full rounded-2xl p-7 transition-all duration-200 hover:-translate-y-0.5 hover:border-white/25 hover:shadow-[0_-1px_32px_rgba(255,255,255,0.12)]">
              <div className="mb-5 inline-flex rounded-xl border border-white/10 bg-white/4 p-3">
                {p.icon}
              </div>
              <h3 className="text-lg font-medium text-white">{p.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-[#9CA3AF]">{p.body}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
