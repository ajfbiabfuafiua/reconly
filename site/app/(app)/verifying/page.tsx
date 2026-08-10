"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import ReconlyMark from "@/components/ReconlyMark";

const CAPTIONS = [
  "Verifying your session…",
  "Loading your workspace…",
  "Preparing your books…",
];

export default function VerifyingPage() {
  const router = useRouter();
  const [caption, setCaption] = useState(0);
  const [slow, setSlow] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const done = useRef(false);

  useEffect(() => {
    const captionTimer = setInterval(() => setCaption((c) => (c + 1) % CAPTIONS.length), 1400);
    const slowTimer = setTimeout(() => setSlow(true), 6000);
    const started = Date.now();

    const go = (path: string) => {
      if (done.current) return;
      done.current = true;
      // hold the branded loader for at least ~1.6s so it never flashes
      const wait = Math.max(0, 1600 - (Date.now() - started));
      setTimeout(() => {
        setLeaving(true);
        setTimeout(() => router.replace(path), 400);
      }, wait);
    };

    fetch("/api/session-state")
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((s: { status: string; role: string }) => {
        if (s.status === "banned") go("/suspended");
        else if (s.status === "pending") go("/pending");
        else if (s.role === "admin") go("/admin");
        else go("/app");
      })
      .catch(() => go("/login"));

    return () => {
      clearInterval(captionTimer);
      clearTimeout(slowTimer);
    };
  }, [router]);

  return (
    <main
      className="flex min-h-screen flex-col items-center justify-center bg-black transition-all duration-400"
      style={leaving ? { opacity: 0, filter: "blur(8px)" } : undefined}
    >
      <div className={leaving ? "scale-90 transition-transform duration-400" : ""}>
        <ReconlyMark size={96} animate />
      </div>
      <p key={caption} className="mt-8 text-sm text-[#9CA3AF]" style={{ animation: "simpleFade 400ms ease-out" }}>
        {CAPTIONS[caption]}
      </p>
      {slow && !leaving && (
        <p className="mt-4 text-xs text-[#6B7280]">
          Taking longer than usual…{" "}
          <button onClick={() => location.reload()} className="text-white underline underline-offset-4">
            Retry
          </button>
        </p>
      )}
    </main>
  );
}
