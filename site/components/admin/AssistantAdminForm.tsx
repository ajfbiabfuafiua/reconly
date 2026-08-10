"use client";

import { useState, useTransition } from "react";
import { updateAssistantSettings } from "@/app/actions/admin";
import { RibbonLoader } from "@/components/ReconlyMark";

const input =
  "w-24 rounded-lg border border-white/12 bg-white/4 px-3 py-2 text-sm text-white focus:border-white/30 focus:outline-none";

export default function AssistantAdminForm({
  enabled,
  hourlyLimit,
  quotas,
}: {
  enabled: boolean;
  hourlyLimit: number;
  quotas: { starter: number; growth: number; max: number };
}) {
  const [saved, setSaved] = useState(false);
  const [pending, start] = useTransition();

  return (
    <form
      className="glass light-seam space-y-4 rounded-xl p-5"
      onSubmit={(e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        setSaved(false);
        start(async () => {
          await updateAssistantSettings({
            enabled: fd.get("enabled") === "on",
            hourlyLimit: Number(fd.get("hourly") ?? 30),
            quotas: {
              starter: Number(fd.get("starter") ?? 50),
              growth: Number(fd.get("growth") ?? 500),
              max: Number(fd.get("max") ?? -1),
            },
          });
          setSaved(true);
        });
      }}
    >
      <p className="text-sm font-medium text-white">Configuration</p>

      <label className="flex items-center gap-3 text-sm text-white">
        <input type="checkbox" name="enabled" defaultChecked={enabled} className="accent-white" />
        Assistant enabled
        <span className="text-[10px] text-[#6B7280]">(kill switch — orb hides, API returns maintenance)</span>
      </label>

      <label className="flex items-center justify-between gap-3 text-xs text-[#9CA3AF]">
        Hourly limit per user
        <input name="hourly" type="number" min={1} defaultValue={hourlyLimit} className={input} />
      </label>
      <label className="flex items-center justify-between gap-3 text-xs text-[#9CA3AF]">
        Starter · messages / month
        <input name="starter" type="number" defaultValue={quotas.starter} className={input} />
      </label>
      <label className="flex items-center justify-between gap-3 text-xs text-[#9CA3AF]">
        Growth · messages / month
        <input name="growth" type="number" defaultValue={quotas.growth} className={input} />
      </label>
      <label className="flex items-center justify-between gap-3 text-xs text-[#9CA3AF]">
        Max · messages / month (−1 = unlimited)
        <input name="max" type="number" defaultValue={quotas.max} className={input} />
      </label>

      <div className="flex items-center gap-3 pt-1">
        <button type="submit" disabled={pending} className="btn-primary !px-6 !py-2 text-sm">
          {pending ? <RibbonLoader size={16} /> : "Save"}
        </button>
        {saved && <span className="text-xs text-[#9CA3AF]">Saved.</span>}
      </div>
    </form>
  );
}
