import Reveal from "./Reveal";

const faqs = [
  {
    q: "Is Reconly a licensed financial service?",
    a: "No. Reconly is software only — we never take custody of assets, execute transactions or give investment advice. We turn data you already own into accounting records and compliance reports.",
  },
  {
    q: "Which chains and exchanges are supported?",
    a: "All major EVM chains (Ethereum, Polygon, Arbitrum, Base and more), Bitcoin and Solana, plus the large exchanges and custodians via API or signed exports. Missing a source? Enterprise onboarding covers custom integrations.",
  },
  {
    q: "How does the DATEV export work?",
    a: "Reconly maps every reconciled transaction to your chart of accounts (SKR03/SKR04 or custom) and produces standard DATEV-format batches your tax advisor imports directly — no reformatting, no manual journal entries.",
  },
  {
    q: "Is my data GDPR-safe and EU-hosted?",
    a: "Yes. All data is processed and stored exclusively in EU data centers, with encryption at rest and in transit. We are GDPR-compliant by design and sign DPAs with every customer.",
  },
  {
    q: "How long does onboarding take?",
    a: "Most teams connect their sources in under a day. Historic reconciliation depends on volume — typically one to two weeks until your books are fully audit-ready, guided by our onboarding team.",
  },
];

export default function Faq() {
  return (
    <section id="faq" className="mx-auto max-w-3xl scroll-mt-24 px-5 py-28 sm:px-8">
      <Reveal className="text-center">
        <p className="text-[11px] font-medium uppercase tracking-[0.34em] text-[#9CA3AF]">FAQ</p>
        <h2 className="text-light-gradient mt-4 text-balance text-3xl font-medium tracking-tight sm:text-4xl">
          Questions, answered
        </h2>
      </Reveal>

      <Reveal delay={100}>
        <div className="glass light-seam mt-12 divide-y divide-white/8 rounded-2xl">
          {faqs.map((f) => (
            <details key={f.q} className="group px-6 py-5">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-[15px] font-medium text-white">
                {f.q}
                <svg
                  viewBox="0 0 16 16"
                  fill="none"
                  className="faq-icon h-4 w-4 shrink-0 text-[#9CA3AF]"
                  aria-hidden="true"
                >
                  <path d="M8 2v12M2 8h12" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
                </svg>
              </summary>
              <p className="mt-3 pr-8 text-sm leading-relaxed text-[#9CA3AF]">{f.a}</p>
            </details>
          ))}
        </div>
      </Reveal>
    </section>
  );
}
