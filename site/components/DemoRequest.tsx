"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { submitDemoRequest } from "@/app/actions/demo";
import ReconlyMark, { RibbonLoader } from "@/components/ReconlyMark";

type Ctx = { open: (plan?: string) => void };
const DemoCtx = createContext<Ctx>({ open: () => {} });

/** Any "Book a demo" CTA calls this. */
export function DemoButton({
  plan,
  className = "btn-primary",
  children,
}: {
  plan?: string;
  className?: string;
  children: React.ReactNode;
}) {
  const { open } = useContext(DemoCtx);
  return (
    <button type="button" className={className} onClick={() => open(plan)}>
      {children}
    </button>
  );
}

export function DemoRequestProvider({ children }: { children: React.ReactNode }) {
  const [visible, setVisible] = useState(false);
  const [plan, setPlan] = useState<string>("unsure");
  const [state, setState] = useState<"form" | "sending" | "done">("form");
  const [error, setError] = useState<string | null>(null);

  const open = useCallback((p?: string) => {
    setPlan(p ?? "unsure");
    setState("form");
    setError(null);
    setVisible(true);
  }, []);

  useEffect(() => {
    if (!visible) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setVisible(false);
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [visible]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setState("sending");
    setError(null);
    const res = await submitDemoRequest({
      name: String(fd.get("name") ?? ""),
      email: String(fd.get("email") ?? ""),
      company: String(fd.get("company") ?? ""),
      phone: String(fd.get("phone") ?? ""),
      companySize: String(fd.get("companySize") ?? ""),
      interestedPlan: String(fd.get("interestedPlan") ?? "unsure"),
      message: String(fd.get("message") ?? ""),
      website: String(fd.get("website") ?? ""),
    });
    if (res.ok) setState("done");
    else {
      setState("form");
      setError(res.error);
    }
  }

  const input =
    "w-full rounded-lg border border-white/12 bg-white/4 px-3 py-2.5 text-sm text-white placeholder:text-[#6B7280] focus:border-white/30 focus:outline-none";

  return (
    <DemoCtx.Provider value={{ open }}>
      {children}
      {visible && (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm"
          onClick={(e) => e.target === e.currentTarget && setVisible(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Book a demo"
        >
          <div className="glass-strong light-seam max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl p-7">
            <div className="mb-5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <ReconlyMark size={24} />
                <h2 className="text-lg font-medium text-white">Book a demo</h2>
              </div>
              <button
                onClick={() => setVisible(false)}
                className="rounded-full p-1.5 text-[#9CA3AF] transition-colors hover:bg-white/6 hover:text-white"
                aria-label="Close"
              >
                <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none">
                  <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            {state === "done" ? (
              <div className="py-10 text-center">
                <div className="mx-auto mb-5 inline-flex">
                  <ReconlyMark size={56} animate />
                </div>
                <p className="text-lg font-medium text-white">Thanks — we&apos;ll reach out within 24 hours.</p>
                <p className="mt-2 text-sm text-[#9CA3AF]">
                  You&apos;ll hear from us at the email you provided.
                </p>
                <button onClick={() => setVisible(false)} className="btn-ghost mt-6 border !border-white/15 text-sm">
                  Close
                </button>
              </div>
            ) : (
              <form onSubmit={onSubmit} className="space-y-4">
                {/* honeypot */}
                <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block text-xs text-[#9CA3AF]">
                    Name *
                    <input name="name" required maxLength={200} className={`${input} mt-1.5`} placeholder="Jane Doe" />
                  </label>
                  <label className="block text-xs text-[#9CA3AF]">
                    Work email *
                    <input name="email" type="email" required className={`${input} mt-1.5`} placeholder="jane@company.com" />
                  </label>
                  <label className="block text-xs text-[#9CA3AF]">
                    Company *
                    <input name="company" required maxLength={200} className={`${input} mt-1.5`} placeholder="Company GmbH" />
                  </label>
                  <label className="block text-xs text-[#9CA3AF]">
                    Phone (optional)
                    <input name="phone" className={`${input} mt-1.5`} placeholder="+49 …" />
                  </label>
                  <label className="block text-xs text-[#9CA3AF]">
                    Company size *
                    <select name="companySize" required defaultValue="" className={`${input} mt-1.5`}>
                      <option value="" disabled>
                        Select…
                      </option>
                      <option value="1-10">1–10</option>
                      <option value="11-50">11–50</option>
                      <option value="51-200">51–200</option>
                      <option value="200+">200+</option>
                    </select>
                  </label>
                  <label className="block text-xs text-[#9CA3AF]">
                    Interested plan
                    <select name="interestedPlan" defaultValue={plan} className={`${input} mt-1.5`}>
                      <option value="starter">Starter</option>
                      <option value="growth">Growth</option>
                      <option value="max">Max</option>
                      <option value="unsure">Not sure yet</option>
                    </select>
                  </label>
                </div>
                <label className="block text-xs text-[#9CA3AF]">
                  What are you trying to solve?
                  <textarea name="message" rows={3} maxLength={4000} className={`${input} mt-1.5 resize-none`} placeholder="Wallets, volumes, reporting needs…" />
                </label>
                {error && <p className="text-xs text-red-300/80">{error}</p>}
                <div className="flex items-center justify-between pt-1">
                  <p className="max-w-[16rem] text-[10px] leading-relaxed text-[#6B7280]">
                    Software only — no custody, no financial services. We only use your data to contact you.
                  </p>
                  <button type="submit" disabled={state === "sending"} className="btn-primary !px-6 !py-2.5 text-sm">
                    {state === "sending" ? <RibbonLoader size={18} /> : "Request demo"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </DemoCtx.Provider>
  );
}
