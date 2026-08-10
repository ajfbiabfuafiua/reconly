import Link from "next/link";
import { requireAdmin } from "@/lib/profile";
import { db } from "@/lib/supabase";
import { Kpi, LineChart } from "@/components/app/Bits";

export default async function AdminOverview() {
  await requireAdmin();

  const [profiles, demoNew, criticalAlerts, signups, latestDemo] = await Promise.all([
    db().from("profiles").select("status", { count: "exact" }),
    db().from("demo_requests").select("id", { count: "exact", head: true }).eq("status", "new"),
    db()
      .from("compliance_alerts")
      .select("id", { count: "exact", head: true })
      .eq("severity", "critical")
      .eq("status", "open"),
    db()
      .from("profiles")
      .select("created_at")
      .gte("created_at", new Date(Date.now() - 84 * 86400000).toISOString()),
    db()
      .from("demo_requests")
      .select("id, name, company, interested_plan, status, created_at")
      .order("created_at", { ascending: false })
      .limit(6),
  ]);

  const rows = profiles.data ?? [];
  const total = profiles.count ?? rows.length;
  const active = rows.filter((p) => p.status === "active").length;
  const pending = rows.filter((p) => p.status === "pending").length;

  // signups per week (12 weeks)
  const weeks: { date: string; value: number }[] = [];
  for (let i = 11; i >= 0; i--) {
    const start = new Date(Date.now() - (i + 1) * 7 * 86400000);
    const end = new Date(Date.now() - i * 7 * 86400000);
    const count = (signups.data ?? []).filter((p) => {
      const d = new Date(p.created_at);
      return d >= start && d < end;
    }).length;
    weeks.push({ date: start.toISOString().slice(0, 10), value: count });
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <h1 className="text-xl font-medium text-white">Admin overview</h1>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <Kpi label="Total users" value={String(total)} />
        <Kpi label="Active" value={String(active)} />
        <Kpi label="Pending activation" value={String(pending)} />
        <Kpi label="New demo requests" value={String(demoNew.count ?? 0)} />
        <Kpi label="Open critical alerts" value={String(criticalAlerts.count ?? 0)} />
      </div>

      <div className="glass light-seam rounded-xl p-5">
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm font-medium text-white">Sign-ups per week</p>
          <p className="text-xs text-[#6B7280]">last 12 weeks</p>
        </div>
        <LineChart data={weeks} label="Sign-ups per week" />
      </div>

      <div className="glass light-seam rounded-xl p-5">
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm font-medium text-white">Latest demo requests</p>
          <Link href="/admin/demo-requests" className="text-xs text-[#9CA3AF] hover:text-white">
            View all →
          </Link>
        </div>
        <table className="w-full text-left text-xs">
          <tbody className="text-[#D1D5DB]">
            {(latestDemo.data ?? []).map((d) => (
              <tr key={d.id} className="border-b border-white/5 last:border-0">
                <td className="py-2.5 font-medium text-white">{d.name}</td>
                <td className="py-2.5">{d.company}</td>
                <td className="py-2.5 capitalize text-[#9CA3AF]">{d.interested_plan}</td>
                <td className="py-2.5 text-[#9CA3AF]">{d.created_at.slice(0, 10)}</td>
                <td className="py-2.5 text-right">
                  <span className="rounded-full border border-white/20 px-2 py-0.5 text-[10px] capitalize">{d.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
