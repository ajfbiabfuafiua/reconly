"use client";

import { useState, useTransition } from "react";
import { updateAdminSettings } from "@/app/actions/admin";
import { RibbonLoader } from "@/components/ReconlyMark";

export default function AdminSettingsForm({
  notificationEmail,
  manualActivation,
}: {
  notificationEmail: string;
  manualActivation: boolean;
}) {
  const [saved, setSaved] = useState(false);
  const [pending, start] = useTransition();

  return (
    <form
      className="glass light-seam space-y-5 rounded-xl p-6"
      onSubmit={(e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        setSaved(false);
        start(async () => {
          await updateAdminSettings({
            notificationEmail: String(fd.get("email") ?? ""),
            manualActivation: fd.get("manual") === "on",
          });
          setSaved(true);
        });
      }}
    >
      <label className="block text-xs text-[#9CA3AF]">
        Admin notification email
        <input
          name="email"
          type="email"
          defaultValue={notificationEmail}
          placeholder="ops@reconly.io"
          className="mt-1.5 w-full rounded-lg border border-white/12 bg-white/4 px-3 py-2.5 text-sm text-white placeholder:text-[#6B7280] focus:border-white/30 focus:outline-none"
        />
        <span className="mt-1 block text-[10px] text-[#6B7280]">
          Demo requests and deletion requests are announced here (email delivery placeholder — currently logged).
        </span>
      </label>

      <label className="flex items-center gap-3 text-sm text-white">
        <input type="checkbox" name="manual" defaultChecked={manualActivation} className="accent-white" />
        New sign-ups require manual activation
      </label>

      <div className="flex items-center gap-3">
        <button type="submit" disabled={pending} className="btn-primary !px-6 !py-2 text-sm">
          {pending ? <RibbonLoader size={16} /> : "Save"}
        </button>
        {saved && <span className="text-xs text-[#9CA3AF]">Saved.</span>}
      </div>
    </form>
  );
}
