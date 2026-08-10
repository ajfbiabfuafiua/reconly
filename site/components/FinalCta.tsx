import Globe from "./Globe";
import Particles from "./Particles";
import Reveal from "./Reveal";

export default function FinalCta() {
  return (
    <section id="cta" className="relative overflow-hidden pt-40 pb-64">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: "radial-gradient(ellipse 70% 60% at 50% 50%, #0A0A0A 0%, #000 75%)",
        }}
      />
      <Particles density={50} interactive={false} className="opacity-60" />

      {/* rotating dot-globe rising from the bottom edge */}
      <Globe
        label="Rotating globe with connection arcs between financial centers"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[440px] w-full"
      />

      <div className="relative z-10 mx-auto max-w-2xl px-5 text-center">
        <Reveal>
          <h2 className="text-light-gradient text-balance text-4xl font-medium tracking-tight sm:text-5xl">
            Close your books. Open your future.
          </h2>
          <p className="mx-auto mt-5 max-w-md text-[15px] leading-relaxed text-[#9CA3AF]">
            See your own wallets turned into audit-ready books — live, in thirty minutes.
          </p>
          <div className="mt-9">
            <a href="mailto:hello@reconly.io?subject=Demo%20request" className="btn-primary text-base">
              Book a demo
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
