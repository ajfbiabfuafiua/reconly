import { requireAdmin, getSetting } from "@/lib/profile";
import { db } from "@/lib/supabase";
import { Kpi, LineChart } from "@/components/app/Bits";
import AssistantAdminForm from "@/components/admin/AssistantAdminForm";
import ConversationInspector from "@/components/admin/ConversationInspector";
import { ASSIST_MODEL } from "@/lib/env";

// rough €/token estimate for cost monitoring (input+output blended)
const EUR_PER_1M_IN = 2.8;
const EUR_PER_1M_OUT = 14;

export default async function AssistantAdminPage() {
  await requireAdmin();

  const since = new Date(Date.now() - 30 * 86400000).toISOString();
  const [enabled, hourly, quotas, msgs, convs] = await Promise.all([
    getSetting<boolean>("assistant_enabled", true),
    getSetting<number>("assistant_hourly_limit", 30),
    getSetting<Record<string, number>>("assistant_plan_quotas", { starter: 50, growth: 500, max: -1, none: 0 }),
    db()
      .from("assistant_messages")
      .select("created_at, role, context, conversation_id")
      .gte("created_at", since)
      .order("created_at", { ascending: true })
      .limit(5000),
    db()
      .from("assistant_conversations")
      .select("id, title, clerk_user_id, updated_at")
      .order("updated_at", { ascending: false })
      .limit(25),
  ]);

  const rows = msgs.data ?? [];
  const userMsgs = rows.filter((m) => m.role === "user");

  // per-day counts (30 days)
  const perDay: { date: string; value: number }[] = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86400000).toISOString().slice(0, 10);
    perDay.push({ date: d, value: userMsgs.filter((m) => String(m.created_at).startsWith(d)).length });
  }

  // token usage + cost estimate
  let tokensIn = 0;
  let tokensOut = 0;
  for (const m of rows) {
    const u = (m.context as { usage?: { input_tokens?: number; output_tokens?: number } })?.usage;
    tokensIn += u?.input_tokens ?? 0;
    tokensOut += u?.output_tokens ?? 0;
  }
  const cost = (tokensIn / 1e6) * EUR_PER_1M_IN + (tokensOut / 1e6) * EUR_PER_1M_OUT;

  // top users by message count (last 30d)
  const byConv = new Map<string, number>();
  for (const m of userMsgs) byConv.set(m.conversation_id, (byConv.get(m.conversation_id) ?? 0) + 1);
  const convOwner = new Map((convs.data ?? []).map((c) => [c.id, c.clerk_user_id]));
  const byUser = new Map<string, number>();
  for (const [cid, n] of byConv) {
    const owner = convOwner.get(cid) ?? "unknown";
    byUser.set(owner, (byUser.get(owner) ?? 0) + n);
  }
  const topUsers = [...byUser.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8);

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-xl font-medium text-white">Assistant</h1>
        <p className="mt-1 text-sm text-[#6B7280]">
          Reconly Assist usage & configuration · model {ASSIST_MODEL}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Kpi label="Messages (30d)" value={String(userMsgs.length)} />
        <Kpi label="Tokens (30d)" value={`${Math.round((tokensIn + tokensOut) / 1000)}k`} sub={`${Math.round(tokensIn / 1000)}k in · ${Math.round(tokensOut / 1000)}k out`} />
        <Kpi label="Est. cost (30d)" value={`${cost.toFixed(2)} €`} sub="blended estimate" />
      </div>

      <div className="glass light-seam rounded-xl p-5">
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm font-medium text-white">Messages per day</p>
          <p className="text-xs text-[#6B7280]">last 30 days</p>
        </div>
        <LineChart data={perDay} label="Assistant messages per day" />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="glass light-seam rounded-xl p-5">
          <p className="mb-3 text-sm font-medium text-white">Top users (30d)</p>
          {topUsers.length === 0 ? (
            <p className="text-xs text-[#6B7280]">No usage yet.</p>
          ) : (
            <ul className="space-y-2">
              {topUsers.map(([uid, n]) => (
                <li key={uid} className="flex items-center justify-between text-xs">
                  <span className="font-mono text-[10px] text-[#9CA3AF]">{uid.slice(0, 24)}</span>
                  <span className="text-white">{n} msgs</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <AssistantAdminForm
          enabled={enabled}
          hourlyLimit={hourly}
          quotas={{
            starter: quotas.starter ?? 50,
            growth: quotas.growth ?? 500,
            max: quotas.max ?? -1,
          }}
        />
      </div>

      <ConversationInspector
        conversations={(convs.data ?? []).map((c) => ({
          id: c.id,
          title: c.title,
          owner: c.clerk_user_id,
          updated: String(c.updated_at).slice(0, 10),
        }))}
      />
    </div>
  );
}
