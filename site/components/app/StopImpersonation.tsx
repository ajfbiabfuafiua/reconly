"use client";

import { useRouter } from "next/navigation";
import { stopImpersonation } from "@/app/actions/admin";

export default function StopImpersonationButton() {
  const router = useRouter();
  return (
    <button
      className="rounded-full border border-white/30 px-3 py-1 text-[11px] text-white transition-colors hover:bg-white/10"
      onClick={async () => {
        await stopImpersonation();
        router.push("/admin/users");
      }}
    >
      Exit impersonation
    </button>
  );
}
