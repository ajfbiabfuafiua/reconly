import Reveal from "./Reveal";

const layers = [
  { label: "Ingest", note: "Wallets · Exchanges · Custodians" },
  { label: "Account", note: "Valuation · Journal entries · DATEV" },
  { label: "Comply", note: "Screening · Monitoring · MiCA reports" },
];

export default function Platform() {
  return (
    <section className="relative overflow-hidden py-32">
      {/* soft radial glow + dot grid backdrop */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 60% 55% at 50% 55%, #0B0B0B 0%, #000 75%)",
        }}
      />
      <div className="dot-grid pointer-events-none absolute inset-x-0 top-1/2 h-[480px] -translate-y-1/2 opacity-50" />

      <div className="relative mx-auto max-w-4xl px-5 text-center sm:px-8">
        <Reveal>
          <p className="text-[11px] font-medium uppercase tracking-[0.34em] text-[#9CA3AF]">
            One platform
          </p>
          <h2 className="text-light-gradient mx-auto mt-4 max-w-xl text-balance text-3xl font-medium tracking-tight sm:text-4xl">
            One data foundation. Two superpowers.
          </h2>
        </Reveal>

        <div className="relative mx-auto mt-16 max-w-md">
          {/* glowing connector line */}
          <div
            className="absolute left-1/2 top-4 bottom-4 w-px -translate-x-1/2"
            style={{
              background:
                "linear-gradient(180deg, transparent, rgba(255,255,255,0.6) 15%, rgba(255,255,255,0.6) 85%, transparent)",
              boxShadow: "0 0 12px rgba(255,255,255,0.35)",
            }}
          />
          <div className="space-y-10">
            {layers.map((l, i) => (
              <Reveal key={l.label} delay={i * 120}>
                <div className="relative">
                  {/* node on the line */}
                  <span className="absolute -top-6 left-1/2 h-2 w-2 -translate-x-1/2 rounded-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.8)]" />
                  <div
                    className="glass-strong light-seam relative mx-auto rounded-2xl px-8 py-6"
                    style={{
                      transform: `perspective(900px) rotateX(${18 - i * 4}deg)`,
                      transformOrigin: "center bottom",
                    }}
                  >
                    <p className="text-lg font-medium tracking-wide text-white">{l.label}</p>
                    <p className="mt-1 text-xs tracking-wide text-[#9CA3AF]">{l.note}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>

        <Reveal delay={200}>
          <p className="mt-12 text-sm text-[#6B7280]">
            Every report, every journal entry, every alert — from the same reconciled ledger.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
