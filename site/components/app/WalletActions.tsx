"use client";

import { useState, useTransition } from "react";
import { addWallet, deleteWallet } from "@/app/actions/app";
import { RibbonLoader } from "@/components/ReconlyMark";

const input =
  "w-full rounded-lg border border-white/12 bg-white/4 px-3 py-2.5 text-sm text-white placeholder:text-[#6B7280] focus:border-white/30 focus:outline-none";

export function AddWalletButton() {
  const [open, setOpen] = useState(false);
  const [chain, setChain] = useState("ethereum");
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setError(null);
    start(async () => {
      try {
        await addWallet({
          label: String(fd.get("label") ?? ""),
          chain: String(fd.get("chain") ?? ""),
          address: String(fd.get("address") ?? ""),
          exchangeName: String(fd.get("exchangeName") ?? ""),
        });
        setOpen(false);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed");
      }
    });
  }

  return (
    <>
      <button className="btn-primary !px-5 !py-2 text-sm" onClick={() => setOpen(true)}>
        Add wallet
      </button>
      {open && (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm"
          onClick={(e) => e.target === e.currentTarget && setOpen(false)}
          role="dialog"
          aria-modal="true"
        >
          <form onSubmit={submit} className="glass-strong light-seam w-full max-w-md rounded-2xl p-7">
            <h2 className="text-lg font-medium text-white">Add a source</h2>
            <p className="mt-1 text-xs text-[#6B7280]">
              On-chain wallet or exchange account. Import starts immediately.
            </p>
            <div className="mt-5 space-y-4">
              <label className="block text-xs text-[#9CA3AF]">
                Label *
                <input name="label" required className={`${input} mt-1.5`} placeholder="Treasury Safe" />
              </label>
              <label className="block text-xs text-[#9CA3AF]">
                Chain *
                <select name="chain" value={chain} onChange={(e) => setChain(e.target.value)} className={`${input} mt-1.5`}>
                  <option value="ethereum">Ethereum</option>
                  <option value="bitcoin">Bitcoin</option>
                  <option value="solana">Solana</option>
                  <option value="polygon">Polygon</option>
                  <option value="arbitrum">Arbitrum</option>
                  <option value="base">Base</option>
                  <option value="exchange">Exchange account</option>
                </select>
              </label>
              {chain === "exchange" ? (
                <label className="block text-xs text-[#9CA3AF]">
                  Exchange name *
                  <input name="exchangeName" required className={`${input} mt-1.5`} placeholder="Kraken" />
                </label>
              ) : (
                <label className="block text-xs text-[#9CA3AF]">
                  Address *
                  <input name="address" required className={`${input} mt-1.5 font-mono`} placeholder="0x…" />
                </label>
              )}
            </div>
            {error && <p className="mt-3 text-xs text-red-300/80">{error}</p>}
            <div className="mt-6 flex justify-end gap-3">
              <button type="button" onClick={() => setOpen(false)} className="btn-ghost !py-2 text-sm text-[#9CA3AF]">
                Cancel
              </button>
              <button type="submit" disabled={pending} className="btn-primary !px-6 !py-2 text-sm">
                {pending ? <RibbonLoader size={16} /> : "Connect"}
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}

export default function WalletActions({ walletId, label }: { walletId: string; label: string }) {
  const [confirm, setConfirm] = useState(false);
  const [pending, start] = useTransition();

  return (
    <>
      <button
        className="rounded-full border border-white/10 px-3 py-1 text-[10px] text-[#9CA3AF] transition-colors hover:border-red-400/40 hover:text-red-300"
        onClick={() => setConfirm(true)}
      >
        Delete
      </button>
      {confirm && (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm"
          onClick={(e) => e.target === e.currentTarget && setConfirm(false)}
          role="dialog"
          aria-modal="true"
        >
          <div className="glass-strong w-full max-w-sm rounded-2xl p-7 text-center">
            <p className="text-sm font-medium text-white">Delete “{label}”?</p>
            <p className="mt-2 text-xs leading-relaxed text-[#6B7280]">
              All imported transactions from this source will be removed from your sub-ledger. This
              cannot be undone.
            </p>
            <div className="mt-6 flex justify-center gap-3">
              <button onClick={() => setConfirm(false)} className="btn-ghost border !border-white/15 !py-2 text-sm">
                Cancel
              </button>
              <button
                disabled={pending}
                onClick={() => start(async () => deleteWallet(walletId))}
                className="rounded-full border border-red-400/50 bg-red-950/40 px-5 py-2 text-sm text-red-200 transition-colors hover:bg-red-900/40"
              >
                {pending ? <RibbonLoader size={16} /> : "Delete source"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
