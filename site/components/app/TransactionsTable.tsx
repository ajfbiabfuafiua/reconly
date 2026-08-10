"use client";

import { useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { Tx } from "@/lib/data";
import { bulkCategorize, updateTransaction } from "@/app/actions/app";
import { StatusBadge } from "@/components/app/Bits";
import { EmptyState } from "@/components/app/Bits";
import { RibbonLoader } from "@/components/ReconlyMark";
import { AskAssistButton } from "@/components/assist/AssistEntry";

const CATEGORIES = ["Trading", "Treasury", "Staking", "Operations", "Payroll", "Fees", "Other"];

function eur(n: number) {
  return Math.round(n).toLocaleString("en-US") + " €";
}

export default function TransactionsTable({
  rows,
  total,
  pageSize,
  page,
}: {
  rows: Tx[];
  total: number;
  pageSize: number;
  page: number;
}) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [openTx, setOpenTx] = useState<Tx | null>(null);
  const [pending, start] = useTransition();
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const pages = Math.max(1, Math.ceil(total / pageSize));

  function goto(p: number) {
    const next = new URLSearchParams(params.toString());
    next.set("page", String(p));
    router.replace(`${pathname}?${next.toString()}`);
  }

  function toggle(id: string) {
    setSelected((s) => {
      const n = new Set(s);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });
  }

  if (rows.length === 0) {
    return (
      <EmptyState
        title="No transactions match"
        hint="Adjust the filters above, or connect another wallet to import more activity."
      />
    );
  }

  return (
    <>
      {selected.size > 0 && (
        <div className="glass-strong sticky top-4 z-40 flex flex-wrap items-center gap-3 rounded-xl px-4 py-3">
          <p className="text-xs text-white">{selected.size} selected</p>
          <select
            id="bulk-cat"
            className="rounded-lg border border-white/12 bg-white/4 px-2.5 py-1.5 text-xs text-white [&>option]:bg-black"
            defaultValue=""
          >
            <option value="" disabled>
              Categorize as…
            </option>
            {CATEGORIES.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
          <button
            disabled={pending}
            className="btn-primary !px-4 !py-1.5 text-xs"
            onClick={() => {
              const cat = (document.getElementById("bulk-cat") as HTMLSelectElement).value;
              if (!cat) return;
              start(async () => {
                await bulkCategorize([...selected], cat);
                setSelected(new Set());
              });
            }}
          >
            {pending ? <RibbonLoader size={14} /> : "Apply"}
          </button>
          <AskAssistButton
            prompt={`Suggest categories for my ${selected.size} selected transactions (ids: ${[...selected].slice(0, 20).join(", ")}). Propose one category per transaction with a confidence level; do not apply anything.`}
            context={{ label: `${selected.size} selected transactions` }}
          >
            Categorize with Assist
          </AskAssistButton>
          <button onClick={() => setSelected(new Set())} className="ml-auto text-[11px] text-[#9CA3AF] hover:text-white">
            Clear ×
          </button>
        </div>
      )}

      <div className="glass light-seam overflow-x-auto rounded-xl">
        <table className="w-full min-w-[760px] text-left text-xs">
          <thead>
            <tr className="border-b border-white/10 text-[#6B7280]">
              <th className="w-10 px-4 py-3"></th>
              <th className="py-3 font-normal">Date</th>
              <th className="py-3 font-normal">Wallet</th>
              <th className="py-3 font-normal">Type</th>
              <th className="py-3 font-normal">Asset</th>
              <th className="py-3 text-right font-normal">Amount</th>
              <th className="py-3 text-right font-normal">EUR value</th>
              <th className="py-3 pl-4 font-normal">Category</th>
              <th className="px-4 py-3 text-right font-normal">Status</th>
            </tr>
          </thead>
          <tbody className="text-[#D1D5DB]">
            {rows.map((t) => (
              <tr
                key={t.id}
                className="cursor-pointer border-b border-white/5 last:border-0 hover:bg-white/3"
                onClick={() => setOpenTx(t)}
              >
                <td className="px-4 py-2.5" onClick={(e) => e.stopPropagation()}>
                  <input
                    type="checkbox"
                    checked={selected.has(t.id)}
                    onChange={() => toggle(t.id)}
                    className="accent-white"
                    aria-label="Select transaction"
                  />
                </td>
                <td className="py-2.5 text-[#9CA3AF]">{t.timestamp.slice(0, 10)}</td>
                <td className="py-2.5">{t.wallet?.label ?? "—"}</td>
                <td className="py-2.5 capitalize">{t.type.replace("_", " ")}</td>
                <td className="py-2.5 font-medium text-white">{t.asset}</td>
                <td className="py-2.5 text-right font-mono">{Number(t.amount).toLocaleString("en-US", { maximumFractionDigits: 4 })}</td>
                <td className="py-2.5 text-right">{eur(Number(t.value_eur))}</td>
                <td className="py-2.5 pl-4 text-[#9CA3AF]">{t.category ?? "—"}</td>
                <td className="px-4 py-2.5 text-right">
                  <StatusBadge status={t.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {pages > 1 && (
        <div className="flex items-center justify-center gap-3 text-xs text-[#9CA3AF]">
          <button disabled={page <= 1} onClick={() => goto(page - 1)} className="btn-ghost !px-4 !py-1.5 text-xs disabled:opacity-30">
            ← Prev
          </button>
          <span>
            Page {page} / {pages}
          </span>
          <button disabled={page >= pages} onClick={() => goto(page + 1)} className="btn-ghost !px-4 !py-1.5 text-xs disabled:opacity-30">
            Next →
          </button>
        </div>
      )}

      {openTx && <TxDrawer tx={openTx} onClose={() => setOpenTx(null)} />}
    </>
  );
}

function TxDrawer({ tx, onClose }: { tx: Tx; onClose: () => void }) {
  const [pending, start] = useTransition();
  const [category, setCategory] = useState(tx.category ?? "");

  const row = "flex items-center justify-between gap-4 border-b border-white/6 py-2.5 text-xs";

  return (
    <div className="fixed inset-0 z-[70]" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <aside className="glass-strong absolute inset-y-0 right-0 w-full max-w-[420px] overflow-y-auto border-l border-white/12 p-6 sm:rounded-l-2xl">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-base font-medium text-white">Transaction</h2>
          <button onClick={onClose} className="rounded-full p-1.5 text-[#9CA3AF] hover:bg-white/6 hover:text-white" aria-label="Close">
            <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none">
              <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <div className="space-y-0">
          <div className={row}>
            <span className="text-[#6B7280]">Hash</span>
            <span className="font-mono text-[10px] text-[#D1D5DB]">{tx.tx_hash.slice(0, 18)}…</span>
          </div>
          <div className={row}>
            <span className="text-[#6B7280]">Timestamp</span>
            <span className="text-[#D1D5DB]">{tx.timestamp.replace("T", " ").slice(0, 16)} UTC</span>
          </div>
          <div className={row}>
            <span className="text-[#6B7280]">Wallet</span>
            <span className="text-[#D1D5DB]">{tx.wallet?.label ?? "—"}</span>
          </div>
          <div className={row}>
            <span className="text-[#6B7280]">Type</span>
            <span className="capitalize text-[#D1D5DB]">{tx.type.replace("_", " ")}</span>
          </div>
          <div className={row}>
            <span className="text-[#6B7280]">Amount</span>
            <span className="font-mono text-[#D1D5DB]">
              {Number(tx.amount)} {tx.asset}
            </span>
          </div>
          <div className={row}>
            <span className="text-[#6B7280]">EUR value</span>
            <span className="text-white">{eur(Number(tx.value_eur))}</span>
          </div>
          <div className={row}>
            <span className="text-[#6B7280]">Status</span>
            <StatusBadge status={tx.status} />
          </div>
        </div>

        <label className="mt-5 block text-xs text-[#9CA3AF]">
          Category
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="mt-1.5 w-full rounded-lg border border-white/12 bg-white/4 px-3 py-2.5 text-sm text-white [&>option]:bg-black"
          >
            <option value="">Uncategorized</option>
            {CATEGORIES.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </label>

        <div className="mt-5 flex flex-wrap gap-2.5">
          <button
            disabled={pending}
            className="btn-primary !px-5 !py-2 text-xs"
            onClick={() => start(async () => updateTransaction(tx.id, { category, markReviewed: true }))}
          >
            {pending ? <RibbonLoader size={14} /> : "Save & mark reviewed"}
          </button>
          <AskAssistButton
            prompt={`Explain this transaction in plain language and how it would typically be booked: ${tx.type} ${tx.amount} ${tx.asset} on ${tx.timestamp.slice(0, 10)}, EUR value ${Math.round(Number(tx.value_eur))}, hash ${tx.tx_hash.slice(0, 14)}…`}
            context={{ label: `Tx ${tx.tx_hash.slice(0, 10)}…`, txId: tx.id }}
          >
            Explain this transaction
          </AskAssistButton>
          <AskAssistButton
            prompt={`Suggest a category for this transaction (${tx.type} ${tx.amount} ${tx.asset}, EUR ${Math.round(Number(tx.value_eur))}) based on my existing categorization patterns. Do not apply it — just propose with confidence.`}
            context={{ label: `Tx ${tx.tx_hash.slice(0, 10)}…`, txId: tx.id }}
          >
            Suggest category
          </AskAssistButton>
        </div>
      </aside>
    </div>
  );
}
