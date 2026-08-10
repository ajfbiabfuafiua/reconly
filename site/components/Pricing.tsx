"use client";

import { useState } from "react";
import Reveal from "./Reveal";

type Billing = "monthly" | "annual";

const tiers = [
  {
    name: "Starter",
    monthly: 249,
    from: false,
    blurb: "For startups holding crypto on their balance sheet",
    features: [
      "3 wallets & exchange accounts, 1 entity",
      "Up to 2,500 transactions /month",
      "Automatic on-chain & exchange import",
      "Cost-basis valuation (FIFO) in EUR",
      "DATEV export (CSV) & monthly close view",
      "GoBD-compliant audit trail",
      "Email support",
    ],
    cta: "Start with Starter",
    highlight: false,
  },
  {
    name: "Growth",
    monthly: 749,
    from: false,
    blurb: "For growing companies and their tax advisors",
    features: [
      "Everything in Starter",
      "15 wallets & accounts, 3 entities",
      "Up to 25,000 transactions /month",
      "All chains + DeFi positions (staking, LP)",
      "Auto-categorization & booking rules (SKR03/04)",
      "Dedicated tax-advisor access (read-only login)",
      "Wallet screening & sanctions checks",
      "Monthly compliance reports (PDF)",
      "Priority support + onboarding call",
    ],
    cta: "Book a demo",
    highlight: true,
  },
  {
    name: "Max",
    monthly: 1990,
    from: true,
    blurb: "For regulated VASPs and multi-entity groups",
    features: [
      "Everything in Growth",
      "Unlimited wallets, entities & transactions",
      "Group consolidation across entities",
      "Full compliance suite: transaction monitoring & alerts, MiCA reporting templates, Travel Rule data export",
      "API access & custom exports (HGB/IFRS)",
      "EU hosting, single-tenant option",
      "99.9% SLA + dedicated account manager",
    ],
    cta: "Talk to sales",
    highlight: false,
  },
];

function price(monthly: number, billing: Billing) {
  // annual billing: 2 months free → pay 10 of 12 months
  const value = billing === "annual" ? (monthly * 10) / 12 : monthly;
  return Math.round(value).toLocaleString("en-US");
}

export default function Pricing() {
  const [billing, setBilling] = useState<Billing>("monthly");

  return (
    <section id="pricing" className="mx-auto max-w-6xl scroll-mt-24 px-5 py-28 sm:px-8">
      <Reveal className="text-center">
        <p className="text-[11px] font-medium uppercase tracking-[0.34em] text-[#9CA3AF]">
          Pricing
        </p>
        <h2 className="text-light-gradient mx-auto mt-4 max-w-xl text-balance text-3xl font-medium tracking-tight sm:text-4xl">
          Sober pricing for serious books
        </h2>

        {/* billing toggle — tag is absolutely positioned so the pill stays centered */}
        <div className="relative mt-8 inline-flex">
          <div
            className="glass relative inline-flex rounded-full p-1"
            role="group"
            aria-label="Billing period"
          >
            {(["monthly", "annual"] as const).map((b) => (
              <button
                key={b}
                type="button"
                onClick={() => setBilling(b)}
                aria-pressed={billing === b}
                className={`relative rounded-full px-5 py-1.5 text-sm transition-colors duration-200 ${
                  billing === b
                    ? "bg-white/12 text-white shadow-[0_0_14px_rgba(255,255,255,0.15),inset_0_1px_0_rgba(255,255,255,0.2)]"
                    : "text-[#9CA3AF] hover:text-white"
                }`}
              >
                {b === "monthly" ? "Monthly" : "Annual"}
              </button>
            ))}
          </div>
          <span
            className={`glass light-seam absolute left-full top-1/2 ml-3 -translate-y-1/2 whitespace-nowrap rounded-full px-3 py-1 text-[11px] tracking-wide text-white transition-opacity duration-200 ${
              billing === "annual" ? "opacity-100" : "pointer-events-none opacity-0"
            }`}
            aria-hidden={billing !== "annual"}
          >
            2 months free
          </span>
        </div>
      </Reveal>

      <div className="mt-14 grid items-stretch gap-5 lg:grid-cols-3">
        {tiers.map((t, i) => (
          <Reveal key={t.name} delay={i * 100} className="h-full">
            <div
              className={`light-seam relative flex h-full flex-col rounded-2xl p-8 ${
                t.highlight
                  ? "glass-strong border-white/30 shadow-[0_-2px_44px_rgba(255,255,255,0.16)] lg:-my-3 lg:py-11"
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
                {t.from && (
                  <span className="mr-1.5 text-base font-normal text-[#6B7280]">from</span>
                )}
                €{price(t.monthly, billing)}
                <span className="text-base font-normal text-[#6B7280]"> /month</span>
              </p>
              <p className="mt-1 h-4 text-xs text-[#6B7280]">
                {billing === "annual" ? "billed annually" : " "}
              </p>
              <p className="mt-2 text-sm text-[#6B7280]">{t.blurb}</p>
              <ul className="mt-7 flex-1 space-y-3">
                {t.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm text-[#9CA3AF]">
                    <svg
                      viewBox="0 0 16 16"
                      fill="none"
                      className="mt-0.5 h-4 w-4 shrink-0"
                      aria-hidden="true"
                    >
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
                className={`mt-8 text-sm ${
                  t.highlight
                    ? "btn-primary"
                    : "btn-ghost justify-center border !border-white/15"
                }`}
              >
                {t.cta}
              </a>
            </div>
          </Reveal>
        ))}
      </div>

      <Reveal delay={200}>
        <p className="mt-10 text-center text-xs text-[#6B7280]">
          All prices net. Annual billing: 2 months free. Software only — no custody, no
          financial services.
        </p>
      </Reveal>
    </section>
  );
}
