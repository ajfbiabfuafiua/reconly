"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  activateUser,
  banUser,
  changePlan,
  impersonate,
  setRole,
  unbanUser,
} from "@/app/actions/admin";
import type { Profile } from "@/lib/profile";
import { RibbonLoader } from "@/components/ReconlyMark";

const sel =
  "rounded-lg border border-white/12 bg-white/4 px-2.5 py-1.5 text-xs text-white [&>option]:bg-black focus:outline-none";

export default function UserRow({ profile, selfId }: { profile: Profile; selfId: string }) {
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [confirmRole, setConfirmRole] = useState<"user" | "admin" | null>(null);
  const router = useRouter();

  const isSelf = profile.clerk_user_id === selfId;

  function run(fn: () => Promise<unknown>) {
    setError(null);
    start(async () => {
      try {
        await fn();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed");
      }
    });
  }

  return (
    <div className="glass light-seam rounded-xl">
      <button className="flex w-full flex-wrap items-center justify-between gap-3 px-5 py-4 text-left" onClick={() => setOpen((o) => !o)}>
        <div>
          <p className="text-sm font-medium text-white">
            {profile.email}
            {isSelf && <span className="ml-2 text-[10px] text-[#6B7280]">(you)</span>}
            {profile.deletion_requested_at && (
              <span className="ml-2 rounded-full border border-red-400/40 px-2 py-0.5 text-[9px] text-red-300">
                deletion requested
              </span>
            )}
          </p>
          <p className="mt-0.5 text-xs text-[#6B7280]">
            {profile.full_name ?? "—"} · {profile.company_name ?? "—"} · last login{" "}
            {profile.last_login_at?.slice(0, 10) ?? "never"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {profile.role === "admin" && (
            <span className="rounded-full border border-white/30 px-2 py-0.5 text-[10px] tracking-wide text-white">admin</span>
          )}
          <span className="rounded-full border border-white/15 px-2 py-0.5 text-[10px] capitalize text-[#9CA3AF]">{profile.plan}</span>
          <span
            className={`rounded-full border px-2 py-0.5 text-[10px] capitalize ${
              profile.status === "banned"
                ? "border-red-400/50 text-red-300"
                : profile.status === "pending"
                  ? "border-white/15 text-[#9CA3AF]"
                  : "border-white/25 text-white"
            }`}
          >
            {profile.status}
          </span>
        </div>
      </button>

      {open && (
        <div className="flex flex-wrap items-center gap-2.5 border-t border-white/8 px-5 py-4">
          {pending && <RibbonLoader size={16} />}

          {profile.status === "pending" && (
            <button className="btn-primary !px-4 !py-1.5 text-xs" onClick={() => run(() => activateUser(profile.clerk_user_id))}>
              Activate
            </button>
          )}

          <label className="flex items-center gap-1.5 text-[10px] text-[#6B7280]">
            Plan
            <select
              className={sel}
              value={profile.plan}
              onChange={(e) => run(() => changePlan(profile.clerk_user_id, e.target.value))}
            >
              {["none", "starter", "growth", "max"].map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </label>

          {!isSelf && profile.role === "user" && profile.status !== "banned" && (
            <button
              className="btn-ghost border !border-white/15 !px-4 !py-1.5 text-xs"
              onClick={() => setConfirmRole("admin")}
            >
              Promote to admin
            </button>
          )}
          {!isSelf && profile.role === "admin" && (
            <button
              className="btn-ghost border !border-white/15 !px-4 !py-1.5 text-xs"
              onClick={() => setConfirmRole("user")}
            >
              Demote to user
            </button>
          )}

          {!isSelf && profile.status === "active" && profile.role === "user" && (
            <button
              className="btn-ghost !px-4 !py-1.5 text-xs text-[#9CA3AF]"
              onClick={() =>
                run(async () => {
                  await impersonate(profile.clerk_user_id);
                  router.push("/app");
                })
              }
            >
              Impersonate (read-only)
            </button>
          )}

          <span className="mx-1 h-4 w-px bg-white/10" />

          {!isSelf && profile.status !== "banned" && profile.role === "user" && (
            <button
              className="rounded-full border border-red-400/40 px-4 py-1.5 text-xs text-red-300 transition-colors hover:bg-red-950/30"
              onClick={() => {
                const reason = prompt("Reason for banning this user (required, audit-logged):");
                if (reason?.trim()) run(() => banUser(profile.clerk_user_id, reason));
              }}
            >
              Ban
            </button>
          )}
          {profile.status === "banned" && (
            <button
              className="btn-ghost border !border-white/15 !px-4 !py-1.5 text-xs"
              onClick={() => {
                const reason = prompt("Reason for unbanning (required, audit-logged):");
                if (reason?.trim()) run(() => unbanUser(profile.clerk_user_id, reason));
              }}
            >
              Unban
            </button>
          )}

          {error && <p className="w-full text-xs text-red-300/80">{error}</p>}

          {confirmRole && (
            <div className="w-full rounded-lg border border-white/15 bg-white/4 px-4 py-3">
              <p className="text-xs text-white">
                {confirmRole === "admin"
                  ? "Grant full admin access to this user?"
                  : "Remove admin access from this user?"}
              </p>
              <div className="mt-3 flex gap-2">
                <button
                  className="btn-primary !px-4 !py-1.5 text-xs"
                  onClick={() => {
                    run(() => setRole(profile.clerk_user_id, confirmRole));
                    setConfirmRole(null);
                  }}
                >
                  Confirm
                </button>
                <button className="btn-ghost !px-4 !py-1.5 text-xs text-[#9CA3AF]" onClick={() => setConfirmRole(null)}>
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
