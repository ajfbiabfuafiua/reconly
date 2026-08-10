"use client";

import { useEffect, useRef } from "react";
import DOTS from "@/lib/globe-dots.json";

/**
 * Rotating monochrome dot-globe with pulsing connection arcs.
 * Canvas 2D, real landmasses (sampled from world-atlas at build time in the
 * sibling Velora project). Pauses off-viewport and respects reduced motion.
 */

const TILT = -0.42; // rad, tilt around the x-axis
const SPEED = 0.055; // rad/s rotation

// [lat, lng] — Frankfurt as the hub, connected to global financial centers
const CITIES: [number, number][][] = [
  [[50.1, 8.7], [51.5, -0.1]], // Frankfurt – London
  [[50.1, 8.7], [40.7, -74.0]], // Frankfurt – New York
  [[50.1, 8.7], [1.35, 103.8]], // Frankfurt – Singapore
  [[50.1, 8.7], [35.7, 139.7]], // Frankfurt – Tokyo
  [[47.4, 8.5], [25.2, 55.3]], // Zurich – Dubai
  [[40.7, -74.0], [-23.5, -46.6]], // New York – São Paulo
];

type Vec3 = [number, number, number];

function toVec3(lng: number, lat: number): Vec3 {
  const phi = (lat * Math.PI) / 180;
  const lambda = (lng * Math.PI) / 180;
  return [
    Math.cos(phi) * Math.cos(lambda),
    Math.sin(phi),
    Math.cos(phi) * Math.sin(lambda),
  ];
}

/** Great-circle interpolation with a lift bump for the arcs. */
function slerp(a: Vec3, b: Vec3, t: number, lift: number): Vec3 {
  const dot = Math.max(-1, Math.min(1, a[0] * b[0] + a[1] * b[1] + a[2] * b[2]));
  const omega = Math.acos(dot);
  const so = Math.sin(omega) || 1e-6;
  const k1 = Math.sin((1 - t) * omega) / so;
  const k2 = Math.sin(t * omega) / so;
  const scale = 1 + lift * Math.sin(Math.PI * t);
  return [
    (k1 * a[0] + k2 * b[0]) * scale,
    (k1 * a[1] + k2 * b[1]) * scale,
    (k1 * a[2] + k2 * b[2]) * scale,
  ];
}

export default function Globe({ className, label }: { className?: string; label: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const dots: Vec3[] = (DOTS as [number, number][]).map(([lng, lat]) =>
      toVec3(lng, lat)
    );
    const arcs = CITIES.map(([a, b]) => ({
      a: toVec3(a[1], a[0]),
      b: toVec3(b[1], b[0]),
      offset: Math.abs(Math.sin(a[0] * 12.9898 + b[1] * 78.233)),
    }));

    let raf = 0;
    let running = false;
    let width = 0;
    let height = 0;
    let dpr = 1;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      dpr = Math.min(2, window.devicePixelRatio || 1);
      width = rect.width;
      height = rect.height;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
    };

    const cosT = Math.cos(TILT);
    const sinT = Math.sin(TILT);

    const project = (v: Vec3, rot: number, radius: number, cx: number, cy: number) => {
      const cosR = Math.cos(rot);
      const sinR = Math.sin(rot);
      const x = v[0] * cosR + v[2] * sinR;
      const z = -v[0] * sinR + v[2] * cosR;
      const y2 = v[1] * cosT - z * sinT;
      const z2 = v[1] * sinT + z * cosT;
      return { sx: cx + x * radius, sy: cy - y2 * radius, depth: z2 };
    };

    const draw = (timeMs: number) => {
      const t = timeMs / 1000;
      const rot = reduced ? 0.8 : t * SPEED;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, width, height);

      const radius = Math.min(width, height * 1.9) * 0.46;
      const cx = width / 2;
      const cy = height * 0.98;

      // earth disc, very dark so far-side dots disappear
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(255, 255, 255, 0.03)";
      ctx.fill();

      for (const v of dots) {
        const p = project(v, rot, radius, cx, cy);
        if (p.depth <= 0.02) continue;
        const alpha = 0.12 + p.depth * 0.45;
        const size = 1 + p.depth * 0.9;
        ctx.beginPath();
        ctx.arc(p.sx, p.sy, size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${alpha.toFixed(3)})`;
        ctx.fill();
      }

      for (const arc of arcs) {
        const STEPS = 44;
        ctx.beginPath();
        let visible = false;
        for (let i = 0; i <= STEPS; i++) {
          const tt = i / STEPS;
          const v = slerp(arc.a, arc.b, tt, 0.28);
          const p = project(v, rot, radius, cx, cy);
          if (p.depth > -0.05) visible = true;
          if (i === 0) ctx.moveTo(p.sx, p.sy);
          else ctx.lineTo(p.sx, p.sy);
        }
        if (!visible) continue;
        ctx.strokeStyle = "rgba(255, 255, 255, 0.16)";
        ctx.lineWidth = 1;
        ctx.stroke();

        // traveling pulse along the arc
        const pulse = reduced ? 0.5 : (t * 0.22 + arc.offset) % 1;
        const v = slerp(arc.a, arc.b, pulse, 0.28);
        const p = project(v, rot, radius, cx, cy);
        if (p.depth > -0.05) {
          ctx.beginPath();
          ctx.arc(p.sx, p.sy, 2.2, 0, Math.PI * 2);
          ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
          ctx.fill();
        }

        for (const end of [arc.a, arc.b]) {
          const q = project(end, rot, radius, cx, cy);
          if (q.depth <= 0.02) continue;
          ctx.beginPath();
          ctx.arc(q.sx, q.sy, 2.4, 0, Math.PI * 2);
          ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
          ctx.fill();
        }
      }
    };

    const loop = (time: number) => {
      draw(time);
      if (!reduced) raf = requestAnimationFrame(loop);
    };

    const start = () => {
      if (running) return;
      running = true;
      resize();
      raf = requestAnimationFrame(loop);
    };
    const stop = () => {
      running = false;
      cancelAnimationFrame(raf);
    };

    const io = new IntersectionObserver(
      ([entry]) => (entry.isIntersecting ? start() : stop()),
      { rootMargin: "80px" }
    );
    io.observe(canvas);

    const ro = new ResizeObserver(() => {
      resize();
      if (reduced) draw(0);
    });
    ro.observe(canvas);

    return () => {
      stop();
      io.disconnect();
      ro.disconnect();
    };
  }, []);

  return <canvas ref={canvasRef} role="img" aria-label={label} className={className} />;
}
