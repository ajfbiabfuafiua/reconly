import { requireActiveUser, getSetting } from "@/lib/profile";
import Shell from "@/components/app/Shell";
import { AssistProvider } from "@/components/assist/AssistProvider";
import AssistOrb from "@/components/assist/AssistOrb";
import AssistPanel from "@/components/assist/AssistPanel";
import StopImpersonationButton from "@/components/app/StopImpersonation";

const NAV = [
  { href: "/app", label: "Overview", exact: true },
  { href: "/app/wallets", label: "Wallets" },
  { href: "/app/transactions", label: "Transactions" },
  { href: "/app/reports", label: "Reports" },
  { href: "/app/compliance", label: "Compliance" },
  { href: "/app/settings", label: "Settings" },
];

export default async function CustomerAppLayout({ children }: { children: React.ReactNode }) {
  const { profile, impersonating } = await requireActiveUser();
  const assistantEnabled = await getSetting<boolean>("assistant_enabled", true);

  const banner = impersonating ? (
    <div className="sticky top-0 z-50 flex items-center justify-center gap-4 border-b border-white/20 bg-white/10 px-4 py-2 backdrop-blur-xl">
      <p className="text-xs text-white">
        Viewing as customer <span className="font-medium">{profile.email}</span> — read only
      </p>
      <StopImpersonationButton />
    </div>
  ) : null;

  return (
    <AssistProvider
      enabled={assistantEnabled && !impersonating}
      plan={profile.plan}
    >
      <Shell nav={NAV} headerNote={profile.company_name ?? undefined} banner={banner}>
        {children}
      </Shell>
      {assistantEnabled && !impersonating && (
        <>
          <AssistOrb />
          <AssistPanel />
        </>
      )}
    </AssistProvider>
  );
}
