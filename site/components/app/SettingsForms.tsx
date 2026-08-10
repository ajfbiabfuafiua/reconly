"use client";

import { useState, useTransition } from "react";
import { requestAccountDeletion, updateOwnProfile } from "@/app/actions/app";
import { RibbonLoader } from "@/components/ReconlyMark";

const input =
  "w-full rounded-lg border border-white/12 bg-white/4 px-3 py-2.5 text-sm text-white placeholder:text-[#6B7280] focus:border-white/30 focus:outline-none";

export default function SettingsForms({
  fullName,
  companyName,
  deletionRequested,
}: {
  fullName: string;
  companyName: string;
  deletionRequested: boolean;
}) {
  const [saved, setSaved] = useState(false);
  const [pending, start] = useTransition();
  const [delPending, delStart] = useTransition();
  const [confirming, setConfirming] = useState(false);

  return (
    <>
      <form
        className="glass light-seam rounded-xl p-6"
        onSubmit={(e) => {
          e.preventDefault();
          const fd = new FormData(e.currentTarget);
          setSaved(false);
          start(async () => {
            await updateOwnProfile({
              fullName: String(fd.get("fullName") ?? ""),
              companyName: String(fd.get("companyName") ?? ""),
            });
            setSaved(true);
          });
        }}
      >
        <h2 className="text-sm font-medium text-white">Profile</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="block text-xs text-[#9CA3AF]">
            Full name
            <input name="fullName" defaultValue={fullName} className={`${input} mt-1.5`} />
          </label>
          <label className="block text-xs text-[#9CA3AF]">
            Company
            <input name="companyName" defaultValue={companyName} className={`${input} mt-1.5`} />
          </label>
        </div>
        <div className="mt-5 flex items-center gap-3">
          <button type="submit" disabled={pending} className="btn-primary !px-6 !py-2 text-sm">
            {pending ? <RibbonLoader size={16} /> : "Save"}
          </button>
          {saved && <span className="text-xs text-[#9CA3AF]">Saved.</span>}
        </div>
      </form>

      <div className="glass rounded-xl border-red-900/30 p-6">
        <h2 className="text-sm font-medium text-white">Danger zone</h2>
        {deletionRequested ? (
          <p className="mt-2 text-xs leading-relaxed text-[#9CA3AF]">
            Account deletion has been requested — our team will contact you to confirm before any
            data is removed.
          </p>
        ) : confirming ? (
          <div className="mt-3">
            <p className="text-xs leading-relaxed text-[#9CA3AF]">
              This flags your account for deletion and notifies our team. Your data stays intact
              until we confirm with you. Continue?
            </p>
            <div className="mt-4 flex gap-3">
              <button
                disabled={delPending}
                onClick={() => delStart(async () => requestAccountDeletion())}
                className="rounded-full border border-red-400/50 bg-red-950/40 px-5 py-2 text-xs text-red-200 transition-colors hover:bg-red-900/40"
              >
                {delPending ? <RibbonLoader size={14} /> : "Yes, request deletion"}
              </button>
              <button onClick={() => setConfirming(false)} className="btn-ghost !py-2 text-xs text-[#9CA3AF]">
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setConfirming(true)}
            className="mt-3 rounded-full border border-red-400/30 px-5 py-2 text-xs text-red-300/90 transition-colors hover:border-red-400/60"
          >
            Request account deletion
          </button>
        )}
      </div>
    </>
  );
}
