"use client";

import { useEffect, useRef } from "react";

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  alpha: number;
  twinkle: number;
};

/**
 * Monochrome particle field. Particles drift slowly; near the cursor they are
 * gently pushed aside and brighten, and faint lines connect them to the cursor.
 */
export default function Particles({
  density = 110,
  interactive = true,
  className = "",
}: {
  density?: number;
  interactive?: boolean;
  className?: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let particles: Particle[] = [];
    let width = 0;
    let height = 0;
    let dpr = 1;
    let raf = 0;
    let running = true;
    const mouse = { x: -9999, y: -9999, active: false };

    const seed = () => {
      const count = Math.round((width * height) / (1920 * 900) * density);
      particles = Array.from({ length: Math.max(40, count) }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.12,
        vy: (Math.random() - 0.5) * 0.12,
        r: 0.6 + Math.random() * 1.4,
        alpha: 0.08 + Math.random() * 0.35,
        twinkle: Math.random() * Math.PI * 2,
      }));
    };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = rect.width;
      height = rect.height;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      seed();
    };

    const draw = (t: number) => {
      ctx.clearRect(0, 0, width, height);
      const R = 160; // cursor influence radius

      for (const p of particles) {
        if (!reduced) {
          p.x += p.vx;
          p.y += p.vy;
          if (p.x < -10) p.x = width + 10;
          if (p.x > width + 10) p.x = -10;
          if (p.y < -10) p.y = height + 10;
          if (p.y > height + 10) p.y = -10;
        }

        let glow = 0;
        if (interactive && mouse.active) {
          const dx = p.x - mouse.x;
          const dy = p.y - mouse.y;
          const dist = Math.hypot(dx, dy);
          if (dist < R && dist > 0.001) {
            const force = (1 - dist / R) ** 2;
            if (!reduced) {
              p.x += (dx / dist) * force * 1.6;
              p.y += (dy / dist) * force * 1.6;
            }
            glow = force;
            if (dist < R * 0.85) {
              ctx.beginPath();
              ctx.moveTo(mouse.x, mouse.y);
              ctx.lineTo(p.x, p.y);
              ctx.strokeStyle = `rgba(255,255,255,${(0.14 * force).toFixed(3)})`;
              ctx.lineWidth = 0.5;
              ctx.stroke();
            }
          }
        }

        const tw = reduced ? 0 : Math.sin(t / 1400 + p.twinkle) * 0.1;
        const a = Math.min(1, p.alpha + tw + glow * 0.55);
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r + glow * 1.2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${Math.max(0, a).toFixed(3)})`;
        ctx.fill();
      }
    };

    const loop = (t: number) => {
      if (!running) return;
      draw(t);
      raf = requestAnimationFrame(loop);
    };

    const onMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
      mouse.active =
        mouse.x >= 0 && mouse.y >= 0 && mouse.x <= rect.width && mouse.y <= rect.height;
    };
    const onLeave = () => {
      mouse.active = false;
      mouse.x = -9999;
      mouse.y = -9999;
    };
    const onVisibility = () => {
      running = !document.hidden;
      if (running) {
        raf = requestAnimationFrame(loop);
      } else {
        cancelAnimationFrame(raf);
      }
    };

    resize();
    window.addEventListener("resize", resize);
    if (interactive) {
      window.addEventListener("pointermove", onMove, { passive: true });
      window.addEventListener("pointerleave", onLeave);
    }
    document.addEventListener("visibilitychange", onVisibility);

    if (reduced && !interactive) {
      draw(0); // static field, no loop
    } else {
      raf = requestAnimationFrame(loop);
    }

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerleave", onLeave);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [density, interactive]);

  return (
    <canvas
      ref={canvasRef}
      className={`pointer-events-none absolute inset-0 h-full w-full ${className}`}
      aria-hidden="true"
    />
  );
}
