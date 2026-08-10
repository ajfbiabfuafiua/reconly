import { requireAdmin } from "@/lib/profile";
import { db } from "@/lib/supabase";
import AdminSearch from "@/components/admin/AdminSearch";
import { EmptyState } from "@/components/app/Bits";

export default async function AuditLogPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  await requireAdmin();
  const { q } = await searchParams;

  let query = db().from("audit_log").select("*").order("created_at", { ascending: false }).limit(200);
  if (q) query = query.or(`action.ilike.%${q}%,actor_id.ilike.%${q}%,target_id.ilike.%${q}%`);
  const { data } = await query;
  const rows = data ?? [];

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-medium text-white">Audit log</h1>
          <p className="mt-1 text-sm text-[#6B7280]">Every admin action, immutable</p>
        </div>
        <AdminSearch placeholder="Filter by action, actor, target…" />
      </div>

      {rows.length === 0 ? (
        <EmptyState title="No entries" hint="Admin actions will appear here." />
      ) : (
        <div className="glass light-seam divide-y divide-white/6 overflow-x-auto rounded-xl">
          {rows.map((e) => (
            <details key={e.id} className="group px-5 py-3.5">
              <summary className="flex cursor-pointer list-none flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="rounded-full border border-white/20 px-2.5 py-0.5 font-mono text-[10px] text-white">
                    {e.action}
                  </span>
                  <span className="text-xs text-[#9CA3AF]">
                    {e.target_type} · <span className="font-mono text-[10px]">{String(e.target_id).slice(0, 24)}</span>
                  </span>
                </div>
                <span className="text-[10px] text-[#6B7280]">
                  {String(e.created_at).replace("T", " ").slice(0, 16)} · by{" "}
                  <span className="font-mono">{String(e.actor_id).slice(0, 18)}</span>
                </span>
              </summary>
              <pre className="mt-3 overflow-x-auto rounded-lg border border-white/8 bg-black/40 p-3 text-[10px] leading-relaxed text-[#9CA3AF]">
                {JSON.stringify(e.details, null, 2)}
              </pre>
            </details>
          ))}
        </div>
      )}
    </div>
  );
}
