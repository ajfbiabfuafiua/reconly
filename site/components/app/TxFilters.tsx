"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

const sel =
  "rounded-lg border border-white/12 bg-white/4 px-2.5 py-2 text-xs text-white focus:border-white/30 focus:outline-none [&>option]:bg-black";

export default function TxFilters({ wallets }: { wallets: { id: string; label: string }[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  function set(key: string, value: string) {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    next.delete("page");
    router.replace(`${pathname}?${next.toString()}`);
  }

  return (
    <div className="glass flex flex-wrap items-center gap-2.5 rounded-xl px-4 py-3">
      <input
        defaultValue={params.get("q") ?? ""}
        onKeyDown={(e) => e.key === "Enter" && set("q", (e.target as HTMLInputElement).value)}
        placeholder="Search asset, hash, category…"
        className={`${sel} w-48 placeholder:text-[#6B7280]`}
      />
      <select className={sel} value={params.get("wallet") ?? ""} onChange={(e) => set("wallet", e.target.value)}>
        <option value="">All wallets</option>
        {wallets.map((w) => (
          <option key={w.id} value={w.id}>
            {w.label}
          </option>
        ))}
      </select>
      <select className={sel} value={params.get("type") ?? ""} onChange={(e) => set("type", e.target.value)}>
        <option value="">All types</option>
        {["buy", "sell", "transfer_in", "transfer_out", "staking_reward", "fee"].map((t) => (
          <option key={t} value={t}>
            {t.replace("_", " ")}
          </option>
        ))}
      </select>
      <select className={sel} value={params.get("status") ?? ""} onChange={(e) => set("status", e.target.value)}>
        <option value="">All statuses</option>
        <option value="unreviewed">Unreviewed</option>
        <option value="categorized">Categorized</option>
        <option value="flagged">Flagged</option>
      </select>
      <input type="date" className={sel} value={params.get("from") ?? ""} onChange={(e) => set("from", e.target.value)} aria-label="From date" />
      <span className="text-[10px] text-[#6B7280]">to</span>
      <input type="date" className={sel} value={params.get("to") ?? ""} onChange={(e) => set("to", e.target.value)} aria-label="To date" />
      {params.size > 0 && (
        <button onClick={() => router.replace(pathname)} className="ml-auto text-[11px] text-[#9CA3AF] hover:text-white">
          Clear filters ×
        </button>
      )}
    </div>
  );
}
