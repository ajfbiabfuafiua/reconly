import { requireActiveUser } from "@/lib/profile";
import { getWallets, shortAddr } from "@/lib/data";
import { EmptyState } from "@/components/app/Bits";
import WalletActions, { AddWalletButton } from "@/components/app/WalletActions";

export default async function WalletsPage() {
  const { profile } = await requireActiveUser();
  const wallets = await getWallets(profile.clerk_user_id);

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-medium text-white">Wallets</h1>
          <p className="mt-1 text-sm text-[#6B7280]">
            {wallets.length} connected source{wallets.length === 1 ? "" : "s"}
          </p>
        </div>
        <AddWalletButton />
      </div>

      {wallets.length === 0 ? (
        <EmptyState
          title="No sources connected"
          hint="Add a wallet address or an exchange account — Reconly imports and reconciles the activity automatically."
          action={<AddWalletButton />}
        />
      ) : (
        <div className="glass light-seam overflow-x-auto rounded-xl">
          <table className="w-full min-w-[560px] text-left text-xs">
            <thead>
              <tr className="border-b border-white/10 text-[#6B7280]">
                <th className="px-5 py-3 font-normal">Label</th>
                <th className="px-2 py-3 font-normal">Chain / Exchange</th>
                <th className="px-2 py-3 font-normal">Address</th>
                <th className="px-2 py-3 text-right font-normal">Transactions</th>
                <th className="px-2 py-3 font-normal">Added</th>
                <th className="px-5 py-3 text-right font-normal"></th>
              </tr>
            </thead>
            <tbody className="text-[#D1D5DB]">
              {wallets.map((w) => (
                <tr key={w.id} className="border-b border-white/5 last:border-0">
                  <td className="px-5 py-3 font-medium text-white">{w.label}</td>
                  <td className="px-2 py-3 capitalize">{w.exchange_name ?? w.chain}</td>
                  <td className="px-2 py-3 font-mono text-[10px] text-[#9CA3AF]">{shortAddr(w.address)}</td>
                  <td className="px-2 py-3 text-right">{w.tx_count}</td>
                  <td className="px-2 py-3 text-[#9CA3AF]">{w.created_at.slice(0, 10)}</td>
                  <td className="px-5 py-3 text-right">
                    <WalletActions walletId={w.id} label={w.label} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
