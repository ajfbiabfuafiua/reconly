import Reveal from "./Reveal";

const tiers = [
  {
    name: "Starter",
    price: "€490",
    unit: "/month",
    blurb: "For companies getting their first wallets in order.",
    features: [
      "Up to 5 wallets & 2 exchanges",
      "10,000 transactions / year",
      "Cost-basis valuation (FIFO)",
      "DATEV export",
      "Email support",
    ],
    highlight: false,
  },
  {
    name: "Growth",
    price: "€1,290",
    unit: "/month",
    blurb: "For finance teams with real on-chain volume.",
    features: [
      "Unlimited wallets & exchanges",
      "250,000 transactions / year",
      "FIFO / LIFO, HGB valuation dates",
      "Wallet screening & monitoring",
      "MiCA reporting templates",
      "Priority support",
    ],
    highlight: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    unit: "",
    blurb: "For groups, funds and regulated entities.",
    features: [
      "Multi-entity consolidation",
      "Unlimited volume",
      "Custom chart of accounts",
      "Audit support & SLAs",
      "EU data residency, SSO/SAML",
    ],
    highlight: false,
  },
];

export default function Pricing() {
  return (
    <section id="pricing" className="mx-auto max-w-6xl scroll-mt-24 px-5 py-28 sm:px-8">
      <Reveal className="text-center">
        <p className="text-[11px] font-medium uppercase tracking-[0.34em] text-[#9CA3AF]">
          Pricing
        </p>
        <h2 className="text-light-gradient mx-auto mt-4 max-w-xl text-balance text-3xl font-medium tracking-tight sm:text-4xl">
          Sober pricing for serious books
        </h2>
      </Reveal>

      <div className="mt-14 grid items-center gap-5 lg:grid-cols-3">
        {tiers.map((t, i) => (
          <Reveal key={t.name} delay={i * 100}>
            <div
              className={`light-seam relative rounded-2xl p-8 ${
                t.highlight
                  ? "glass-strong border-white/30 shadow-[0_-2px_44px_rgba(255,255,255,0.16)] lg:scale-[1.05] lg:py-10"
                  : "glass"
              }`}
            >
              {t.highlight && (
                <span className="glass absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full px-4 py-1 text-[11px] tracking-wide text-white">
                  Most popular
                </span>
              )}
              <h3 className="text-sm font-medium uppercase tracking-[0.2em] text-[#9CA3AF]">
                {t.name}
              </h3>
              <p className="mt-4 text-4xl font-medium text-white">
                {t.price}
                <span className="text-base font-normal text-[#6B7280]">{t.unit}</span>
              </p>
              <p className="mt-2 text-sm text-[#6B7280]">{t.blurb}</p>
              <ul className="mt-7 space-y-3">
                {t.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm text-[#9CA3AF]">
                    <svg viewBox="0 0 16 16" fill="none" className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true">
                      <path
                        d="M3.5 8.2l2.8 2.8 6.2-6.5"
                        stroke="white"
                        strokeWidth="1.2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    {f}
                  </li>
                ))}
              </ul>
              <a
                href="#cta"
                className={`mt-8 w-full text-sm ${t.highlight ? "btn-primary" : "btn-ghost border !border-white/15 justify-center"}`}
              >
                Book a demo
              </a>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
