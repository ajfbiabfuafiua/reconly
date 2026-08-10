"use client";

import { useTransition } from "react";
import { setAlertStatus } from "@/app/actions/app";
import { RibbonLoader } from "@/components/ReconlyMark";

export default function AlertActions({ alertId, critical }: { alertId: string; critical: boolean }) {
  const [pending, start] = useTransition();
  if (pending) return <RibbonLoader size={16} />;
  return (
    <>
      <button
        className="btn-ghost border !border-white/15 !px-4 !py-1.5 text-xs"
        onClick={() => start(async () => setAlertStatus(alertId, "resolved"))}
      >
        Mark resolved
      </button>
      {!critical && (
        <button
          className="btn-ghost !px-4 !py-1.5 text-xs text-[#9CA3AF]"
          onClick={() => start(async () => setAlertStatus(alertId, "dismissed"))}
        >
          Dismiss
        </button>
      )}
    </>
  );
}
