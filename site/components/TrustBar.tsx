import Reveal from "./Reveal";

const names = [
  { label: "KRAKEN", style: "font-semibold tracking-[0.22em]" },
  { label: "Coinbase", style: "font-medium tracking-tight text-lg" },
  { label: "BINANCE", style: "font-semibold tracking-[0.14em]" },
  { label: "Ethereum", style: "font-light tracking-wide text-lg italic" },
  { label: "SOLANA", style: "font-bold tracking-[0.3em]" },
  { label: "DATEV", style: "font-black tracking-tight text-lg" },
  { label: "Bitcoin", style: "font-semibold tracking-tight text-lg" },
  { label: "FIREBLOCKS", style: "font-medium tracking-[0.18em]" },
  { label: "Polygon", style: "font-medium tracking-tight text-lg" },
  { label: "BitGo", style: "font-semibold tracking-wide text-lg" },
];

function LogoRow() {
  return (
    <div className="marquee-half" aria-hidden="true">
      {names.map((n) => (
        <span key={n.label} className={`select-none text-base text-white ${n.style}`}>
          {n.label}
        </span>
      ))}
    </div>
  );
}

export default function TrustBar() {
  return (
    <section className="border-y border-white/6 py-10">
      <Reveal>
        <p className="mb-8 text-center text-[11px] uppercase tracking-[0.3em] text-[#6B7280]">
          Works with the stack you already use
        </p>
        <div className="marquee mx-auto max-w-6xl opacity-40 grayscale">
          <div className="marquee-track">
            <LogoRow />
            <LogoRow />
          </div>
          <span className="sr-only">
            Kraken, Coinbase, Binance, Ethereum, Solana, DATEV, Bitcoin, Fireblocks,
            Polygon, BitGo
          </span>
        </div>
      </Reveal>
    </section>
  );
}
