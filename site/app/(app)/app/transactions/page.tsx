import { requireActiveUser } from "@/lib/profile";
import { getTransactions, getWallets } from "@/lib/data";
import TransactionsTable from "@/components/app/TransactionsTable";
import TxFilters from "@/components/app/TxFilters";

export default async function TransactionsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const sp = await searchParams;
  const { profile } = await requireActiveUser();
  const filter = {
    walletId: sp.wallet,
    type: sp.type,
    status: sp.status,
    from: sp.from,
    to: sp.to,
    q: sp.q,
    page: sp.page ? Number(sp.page) : 1,
  };
  const [{ rows, total, pageSize }, wallets] = await Promise.all([
    getTransactions(profile.clerk_user_id, filter),
    getWallets(profile.clerk_user_id),
  ]);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="text-xl font-medium text-white">Transactions</h1>
        <p className="mt-1 text-sm text-[#6B7280]">
          {total} transaction{total === 1 ? "" : "s"} match the current filters
        </p>
      </div>
      <TxFilters wallets={wallets.map((w) => ({ id: w.id, label: w.label }))} />
      <TransactionsTable rows={rows} total={total} pageSize={pageSize} page={filter.page ?? 1} />
    </div>
  );
}
