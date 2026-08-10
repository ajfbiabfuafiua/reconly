import { requireAdmin, getSetting } from "@/lib/profile";
import AdminSettingsForm from "@/components/admin/AdminSettingsForm";

export default async function AdminSettingsPage() {
  await requireAdmin();
  const [email, manual] = await Promise.all([
    getSetting<string>("admin_notification_email", ""),
    getSetting<boolean>("manual_activation", true),
  ]);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-xl font-medium text-white">Admin settings</h1>
      <AdminSettingsForm notificationEmail={email} manualActivation={manual} />
    </div>
  );
}
