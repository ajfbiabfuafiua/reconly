import { requireAdmin } from "@/lib/profile";
import { db } from "@/lib/supabase";
import UserRow from "@/components/admin/UserRow";
import AdminSearch from "@/components/admin/AdminSearch";

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const admin = await requireAdmin();
  const { q } = await searchParams;

  let query = db().from("profiles").select("*").order("created_at", { ascending: false }).limit(200);
  if (q) query = query.or(`email.ilike.%${q}%,full_name.ilike.%${q}%,company_name.ilike.%${q}%`);
  const { data } = await query;
  const rows = data ?? [];

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-medium text-white">Users</h1>
          <p className="mt-1 text-sm text-[#6B7280]">{rows.length} shown</p>
        </div>
        <AdminSearch placeholder="Search email, name, company…" />
      </div>
      <div className="space-y-3">
        {rows.map((p) => (
          <UserRow key={p.clerk_user_id} profile={p} selfId={admin.clerk_user_id} />
        ))}
      </div>
    </div>
  );
}
