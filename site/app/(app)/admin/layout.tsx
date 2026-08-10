import { requireAdmin } from "@/lib/profile";
import Shell from "@/components/app/Shell";

const NAV = [
  { href: "/admin", label: "Overview", exact: true },
  { href: "/admin/demo-requests", label: "Demo requests" },
  { href: "/admin/users", label: "Users" },
  { href: "/admin/assistant", label: "Assistant" },
  { href: "/admin/audit-log", label: "Audit log" },
  { href: "/admin/settings", label: "Settings" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const admin = await requireAdmin();
  return (
    <Shell nav={NAV} tag="ADMIN" headerNote={admin.email}>
      {children}
    </Shell>
  );
}
