"use client";

import { useState, useTransition } from "react";
import { generateReport } from "@/app/actions/app";
import { RibbonLoader } from "@/components/ReconlyMark";

export default function GenerateReportButton() {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  const now = new Date();
  const months = Array.from({ length: 12 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  });

  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setError(null);
    start(async () => {
      try {
        await generateReport(String(fd.get("type")), String(fd.get("period")));
        setOpen(false);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed");
      }
    });
  }

  const input =
    "w-full rounded-lg border border-white/12 bg-white/4 px-3 py-2.5 text-sm text-white [&>option]:bg-black focus:border-white/30 focus:outline-none";

  return (
    <>
      <button className="btn-primary !px-5 !py-2 text-sm" onClick={() => setOpen(true)}>
        Generate report
      </button>
      {open && (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm"
          onClick={(e) => e.target === e.currentTarget && setOpen(false)}
          role="dialog"
          aria-modal="true"
        >
          <form onSubmit={submit} className="glass-strong light-seam w-full max-w-sm rounded-2xl p-7">
            <h2 className="text-lg font-medium text-white">Generate report</h2>
            <div className="mt-5 space-y-4">
              <label className="block text-xs text-[#9CA3AF]">
                Type
                <select name="type" className={`${input} mt-1.5`} defaultValue="monthly_close">
                  <option value="monthly_close">Monthly close</option>
                  <option value="datev_export">DATEV export</option>
                  <option value="compliance_report">Compliance report</option>
                </select>
              </label>
              <label className="block text-xs text-[#9CA3AF]">
                Period
                <select name="period" className={`${input} mt-1.5`} defaultValue={months[1]}>
                  {months.map((m) => (
                    <option key={m}>{m}</option>
                  ))}
                </select>
              </label>
            </div>
            {error && <p className="mt-3 text-xs text-red-300/80">{error}</p>}
            <div className="mt-6 flex justify-end gap-3">
              <button type="button" onClick={() => setOpen(false)} className="btn-ghost !py-2 text-sm text-[#9CA3AF]">
                Cancel
              </button>
              <button type="submit" disabled={pending} className="btn-primary !px-6 !py-2 text-sm">
                {pending ? <RibbonLoader size={16} /> : "Generate"}
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
