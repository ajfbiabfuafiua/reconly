"use client";

import { useState, useTransition } from "react";
import { setApproval } from "./actions";

export default function ApprovalButton({
  userId,
  approve,
  label,
  primary = false,
}: {
  userId: string;
  approve: boolean;
  label: string;
  primary?: boolean;
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="flex items-center gap-3">
      {error && <span className="text-xs text-[#9CA3AF]">{error}</span>}
      <button
        disabled={pending}
        onClick={() =>
          startTransition(async () => {
            setError(null);
            try {
              await setApproval(userId, approve);
            } catch {
              setError("Failed — try again");
            }
          })
        }
        className={`${
          primary ? "btn-primary !px-5 !py-2" : "btn-ghost border !border-white/15 !px-5 !py-2"
        } text-xs ${pending ? "opacity-50" : ""}`}
      >
        {pending ? "…" : label}
      </button>
    </div>
  );
}
