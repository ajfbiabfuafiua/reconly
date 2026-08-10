import { clerkClient, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { adminEmails, isAdmin } from "@/lib/auth";
import ApprovalButton from "./ApprovalButton";

export default async function AdminPage() {
  const me = await currentUser();
  if (!me || !isAdmin(me)) redirect("/dashboard");

  const client = await clerkClient();
  const { data: users } = await client.users.getUserList({
    limit: 200,
    orderBy: "-created_at",
  });
  const admins = adminEmails();

  const rows = users.map((u) => {
    const email = (
      u.emailAddresses.find((e) => e.id === u.primaryEmailAddressId)?.emailAddress ??
      u.emailAddresses[0]?.emailAddress ??
      ""
    ).toLowerCase();
    const admin = admins.includes(email) || u.publicMetadata?.role === "admin";
    return {
      id: u.id,
      email,
      name: [u.firstName, u.lastName].filter(Boolean).join(" ") || "—",
      created: new Date(u.createdAt).toISOString().slice(0, 10),
      approved: admin || u.publicMetadata?.approved === true,
      admin,
      isSelf: u.id === me.id,
    };
  });
  const pending = rows.filter((r) => !r.approved);
  const active = rows.filter((r) => r.approved);

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-xl font-medium text-white">Admin</h1>
        <p className="mt-1 text-sm text-[#6B7280]">
          Approve sign-ups before they can access the dashboard. Admins are set
          via <code className="text-[#9CA3AF]">ADMIN_EMAILS</code>.
        </p>
      </div>

      <section className="space-y-3">
        <h2 className="text-sm font-medium text-white">
          Waiting for access{" "}
          <span className="ml-1 rounded-full border border-white/20 px-2 py-0.5 text-[10px] text-[#9CA3AF]">
            {pending.length}
          </span>
        </h2>
        {pending.length === 0 ? (
          <div className="glass rounded-xl px-6 py-5 text-sm text-[#6B7280]">
            No pending requests — everyone who signed up has been handled.
          </div>
        ) : (
          <div className="glass light-seam divide-y divide-white/8 rounded-xl">
            {pending.map((r) => (
              <div key={r.id} className="flex flex-wrap items-center justify-between gap-3 px-6 py-4">
                <div>
                  <p className="text-sm text-white">{r.email}</p>
                  <p className="mt-0.5 text-xs text-[#6B7280]">
                    {r.name} · signed up {r.created}
                  </p>
                </div>
                <ApprovalButton userId={r.id} approve label="Grant access" primary />
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-medium text-white">Active users</h2>
        <div className="glass light-seam divide-y divide-white/8 rounded-xl">
          {active.map((r) => (
            <div key={r.id} className="flex flex-wrap items-center justify-between gap-3 px-6 py-4">
              <div>
                <p className="text-sm text-white">
                  {r.email}
                  {r.admin && (
                    <span className="ml-2 rounded-full border border-white/25 px-2 py-0.5 text-[10px] text-[#9CA3AF]">
                      admin
                    </span>
                  )}
                  {r.isSelf && (
                    <span className="ml-2 text-[10px] text-[#6B7280]">(you)</span>
                  )}
                </p>
                <p className="mt-0.5 text-xs text-[#6B7280]">
                  {r.name} · signed up {r.created}
                </p>
              </div>
              {!r.admin && !r.isSelf && (
                <ApprovalButton userId={r.id} approve={false} label="Revoke" />
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
