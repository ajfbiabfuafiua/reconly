"use client";

import { useEffect, useRef } from "react";
import Particles from "./Particles";
import { DemoButton } from "./DemoRequest";

/**
 * Hero with cursor interaction: the glass ribbon tilts toward the pointer
 * (spring-lerped parallax) and a soft white spotlight follows the cursor,
 * lighting up the glass and the particle field.
 */
export default function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const ribbonRef = useRef<HTMLDivElement>(null);
  const spotRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const ribbon = ribbonRef.current;
    const spot = spotRef.current;
    if (!section || !ribbon || !spot) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;

    let raf = 0;
    const target = { x: 0, y: 0, sx: 0, sy: 0, active: false };
    const current = { x: 0, y: 0, sx: 0, sy: 0, o: 0 };

    const onMove = (e: PointerEvent) => {
      const rect = section.getBoundingClientRect();
      const inside =
        e.clientY >= rect.top && e.clientY <= rect.bottom;
      target.active = inside;
      if (!inside) return;
      // normalized -1..1 relative to hero center
      target.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      target.y = ((e.clientY - rect.top) / rect.height) * 2 - 1;
      target.sx = e.clientX - rect.left;
      target.sy = e.clientY - rect.top;
    };

    const loop = () => {
      // spring-ish lerp for a calm, expensive feel
      current.x += (target.x - current.x) * 0.045;
      current.y += (target.y - current.y) * 0.045;
      current.sx += (target.sx - current.sx) * 0.12;
      current.sy += (target.sy - current.sy) * 0.12;
      current.o += ((target.active ? 1 : 0) - current.o) * 0.06;

      ribbon.style.transform = `perspective(1100px) rotateY(${(
        current.x * 7
      ).toFixed(3)}deg) rotateX(${(-current.y * 5).toFixed(3)}deg) translate3d(${(
        current.x * 18
      ).toFixed(2)}px, ${(current.y * 12).toFixed(2)}px, 0)`;

      spot.style.opacity = current.o.toFixed(3);
      spot.style.background = `radial-gradient(420px circle at ${current.sx.toFixed(
        1
      )}px ${current.sy.toFixed(1)}px, rgba(255,255,255,0.09), rgba(255,255,255,0.03) 40%, transparent 65%)`;

      raf = requestAnimationFrame(loop);
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    raf = requestAnimationFrame(loop);
    return () => {
      window.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      id="top"
      className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-5 pt-24 pb-16"
    >
      {/* radial vignette */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% 42%, #0A0A0A 0%, #000 70%)",
        }}
      />

      {/* diagonal light beam (grey-to-white gradient, from the brand sheet) */}
      <div
        className="pointer-events-none absolute inset-0 opacity-60"
        style={{
          background:
            "linear-gradient(118deg, transparent 38%, rgba(255,255,255,0.05) 48%, rgba(255,255,255,0.10) 50%, rgba(255,255,255,0.05) 52%, transparent 62%)",
        }}
      />

      {/* particle field (interactive) */}
      <Particles density={130} className="opacity-90" />

      {/* the folded glass ribbon — logo motif scaled up, drifting + cursor parallax */}
      <div ref={ribbonRef} className="pointer-events-none absolute inset-0 will-change-transform">
        <div className="drift-slow absolute left-1/2 top-[44%] h-[min(88vmin,780px)] w-[min(88vmin,780px)] -translate-x-1/2 -translate-y-1/2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/ribbon.png"
            alt=""
            className="h-full w-full object-contain opacity-40"
            style={{
              filter: "drop-shadow(0 0 60px rgba(255,255,255,0.10))",
            }}
          />
        </div>
      </div>

      {/* cursor spotlight, lights up the glass */}
      <div
        ref={spotRef}
        className="pointer-events-none absolute inset-0 opacity-0 mix-blend-screen"
        aria-hidden="true"
      />

      {/* content */}
      <div className="relative z-10 flex max-w-4xl flex-col items-center text-center">
        <p className="mb-6 text-[11px] font-medium uppercase tracking-[0.34em] text-[#9CA3AF]">
          Crypto sub-ledger &amp; compliance
        </p>
        <h1 className="text-light-gradient text-balance text-5xl font-medium leading-[1.06] tracking-tight sm:text-6xl md:text-7xl">
          Your crypto. Fully accounted. Fully compliant.
        </h1>
        <p className="mt-7 max-w-2xl text-pretty text-base leading-relaxed text-[#9CA3AF] sm:text-lg">
          Reconly turns on-chain activity into audit-ready books and MiCA-ready
          reports. Connect wallets and exchanges once — your accountant gets
          clean DATEV exports, your compliance team gets peace of mind.
        </p>
        <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row">
          <DemoButton className="btn-primary">Book a demo</DemoButton>
          <a href="#product" className="btn-ghost text-[#D1D5DB]">
            See how it works
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path
                d="M3 8h10m0 0L9.5 4.5M13 8l-3.5 3.5"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </a>
        </div>

        {/* trust strip */}
        <div className="glass light-seam mt-14 rounded-full px-7 py-3">
          <p className="text-xs tracking-wide text-[#9CA3AF] sm:text-sm">
            Built for EU regulation&nbsp;&nbsp;·&nbsp;&nbsp;MiCA&nbsp;&nbsp;·&nbsp;&nbsp;GoBD&nbsp;&nbsp;·&nbsp;&nbsp;DATEV export
          </p>
        </div>
      </div>
    </section>
  );
}
