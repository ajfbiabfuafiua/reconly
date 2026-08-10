"use client";

import { useState, useTransition } from "react";
import { createAccountFromRequest, updateDemoRequest } from "@/app/actions/admin";
import { RibbonLoader } from "@/components/ReconlyMark";

interface DemoRequest {
  id: string;
  created_at: string;
  name: string;
  email: string;
  company: string;
  phone: string | null;
  company_size: string;
  message: string;
  interested_plan: string;
  status: string;
  admin_notes: string;
  converted_user_id: string | null;
}

const sel =
  "rounded-lg border border-white/12 bg-white/4 px-2.5 py-1.5 text-xs text-white [&>option]:bg-black focus:outline-none";

export default function DemoRequestRow({ request }: { request: DemoRequest }) {
  const [open, setOpen] = useState(false);
  const [notes, setNotes] = useState(request.admin_notes);
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="glass light-seam rounded-xl">
      <button className="flex w-full flex-wrap items-center justify-between gap-3 px-5 py-4 text-left" onClick={() => setOpen((o) => !o)}>
        <div>
          <p className="text-sm font-medium text-white">
            {request.name} · {request.company}
          </p>
          <p className="mt-0.5 text-xs text-[#6B7280]">
            {request.email} · {request.company_size} employees · {request.created_at.slice(0, 10)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-full border border-white/15 px-2 py-0.5 text-[10px] capitalize text-[#9CA3AF]">
            {request.interested_plan}
          </span>
          <span className="rounded-full border border-white/25 px-2 py-0.5 text-[10px] capitalize text-white">
            {request.status}
          </span>
        </div>
      </button>

      {open && (
        <div className="border-t border-white/8 px-5 py-4">
          <p className="text-xs leading-relaxed text-[#D1D5DB]">
            {request.message || <span className="text-[#6B7280]">No message.</span>}
          </p>
          {request.phone && <p className="mt-2 text-xs text-[#6B7280]">Phone: {request.phone}</p>}

          <label className="mt-4 block text-xs text-[#9CA3AF]">
            Admin notes
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="mt-1.5 w-full rounded-lg border border-white/12 bg-white/4 px-3 py-2 text-xs text-white focus:border-white/30 focus:outline-none"
            />
          </label>

          <div className="mt-4 flex flex-wrap items-center gap-2.5">
            <select
              className={sel}
              value={request.status}
              onChange={(e) => start(async () => updateDemoRequest(request.id, { status: e.target.value }))}
            >
              {["new", "contacted", "converted", "rejected"].map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            <button
              disabled={pending}
              className="btn-ghost border !border-white/15 !px-4 !py-1.5 text-xs"
              onClick={() => start(async () => updateDemoRequest(request.id, { adminNotes: notes }))}
            >
              Save notes
            </button>
            <span className="mx-1 h-4 w-px bg-white/10" />
            <select id={`plan-${request.id}`} className={sel} defaultValue={request.interested_plan === "unsure" ? "starter" : request.interested_plan}>
              <option value="starter">Starter</option>
              <option value="growth">Growth</option>
              <option value="max">Max</option>
            </select>
            <button
              disabled={pending || request.status === "converted"}
              className="btn-primary !px-4 !py-1.5 text-xs disabled:opacity-40"
              onClick={() => {
                setError(null);
                const plan = (document.getElementById(`plan-${request.id}`) as HTMLSelectElement).value;
                start(async () => {
                  try {
                    await createAccountFromRequest(request.id, plan);
                  } catch (e) {
                    setError(e instanceof Error ? e.message : "Failed");
                  }
                });
              }}
            >
              {pending ? <RibbonLoader size={14} /> : "Create account (invite)"}
            </button>
          </div>
          {error && <p className="mt-2 text-xs text-red-300/80">{error}</p>}
          {request.converted_user_id && (
            <p className="mt-2 text-[10px] text-[#6B7280]">Linked user: {request.converted_user_id}</p>
          )}
        </div>
      )}
    </div>
  );
}
