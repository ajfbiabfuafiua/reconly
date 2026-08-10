const columns = [
  {
    title: "Product",
    links: ["Accounting", "Compliance", "Pricing", "Integrations", "Changelog"],
  },
  {
    title: "Company",
    links: ["About", "Careers", "Blog", "Press", "Contact"],
  },
  {
    title: "Legal",
    links: ["Impressum", "Datenschutz", "Terms of Service", "DPA", "Security"],
  },
  {
    title: "Social",
    links: ["LinkedIn", "X / Twitter", "GitHub"],
  },
];

export default function Footer() {
  return (
    <footer className="border-t border-white/8 py-16">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-5">
          <div>
            <div className="flex items-center gap-2.5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/ribbon.png" alt="" className="h-7 w-7 object-contain" />
              <span className="text-sm font-medium tracking-[0.18em] text-white">RECONLY</span>
            </div>
            <p className="mt-4 max-w-[26ch] text-xs leading-relaxed text-[#6B7280]">
              The crypto sub-ledger and compliance platform for companies holding digital assets.
            </p>
          </div>
          {columns.map((c) => (
            <div key={c.title}>
              <h3 className="text-xs font-medium uppercase tracking-[0.2em] text-[#9CA3AF]">
                {c.title}
              </h3>
              <ul className="mt-4 space-y-2.5">
                {c.links.map((l) => (
                  <li key={l}>
                    <a
                      href="#"
                      className="text-sm text-[#6B7280] transition-colors duration-200 hover:text-white"
                    >
                      {l}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <hr className="hairline mt-14" />
        <p className="mt-6 text-center text-xs text-[#6B7280]">
          © 2026 Reconly. Software only — not a financial service, no custody, no investment advice.
        </p>
      </div>
    </footer>
  );
}
