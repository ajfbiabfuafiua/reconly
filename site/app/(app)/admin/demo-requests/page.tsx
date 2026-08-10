import { requireAdmin } from "@/lib/profile";
import { db } from "@/lib/supabase";
import DemoRequestRow from "@/components/admin/DemoRequestRow";
import { EmptyState } from "@/components/app/Bits";

export default async function DemoRequestsPage() {
  await requireAdmin();
  const { data } = await db()
    .from("demo_requests")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(200);
  const rows = data ?? [];

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-xl font-medium text-white">Demo requests</h1>
        <p className="mt-1 text-sm text-[#6B7280]">{rows.length} requests</p>
      </div>
      {rows.length === 0 ? (
        <EmptyState title="No demo requests" hint="Requests from the landing page appear here." />
      ) : (
        <div className="space-y-3">
          {rows.map((r) => (
            <DemoRequestRow key={r.id} request={r} />
          ))}
        </div>
      )}
    </div>
  );
}
