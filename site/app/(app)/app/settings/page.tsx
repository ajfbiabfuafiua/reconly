import { requireActiveUser } from "@/lib/profile";
import SettingsForms from "@/components/app/SettingsForms";

const PLAN_LABEL: Record<string, string> = {
  none: "No plan",
  starter: "Starter — €249/month",
  growth: "Growth — €749/month",
  max: "Max — from €1,990/month",
};

export default async function SettingsPage() {
  const { profile } = await requireActiveUser();

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-xl font-medium text-white">Settings</h1>
        <p className="mt-1 text-sm text-[#6B7280]">{profile.email}</p>
      </div>

      <SettingsForms
        fullName={profile.full_name ?? ""}
        companyName={profile.company_name ?? ""}
        deletionRequested={!!profile.deletion_requested_at}
      />

      <div className="glass light-seam rounded-xl p-6">
        <h2 className="text-sm font-medium text-white">Plan</h2>
        <p className="mt-2 text-sm text-[#D1D5DB]">{PLAN_LABEL[profile.plan]}</p>
        <p className="mt-1.5 text-xs text-[#6B7280]">
          Plans are managed by Reconly — contact{" "}
          <span className="text-white">hello@reconly.io</span> to change your plan.
        </p>
      </div>

      <div className="glass rounded-xl p-6">
        <h2 className="text-sm font-medium text-white">Security</h2>
        <p className="mt-1.5 text-xs leading-relaxed text-[#6B7280]">
          Password, two-factor authentication and active sessions are managed through your account
          menu (bottom-left avatar → Manage account).
        </p>
      </div>
    </div>
  );
}
