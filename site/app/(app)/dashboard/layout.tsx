import { UserButton } from "@clerk/nextjs";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { isAdmin, isApproved } from "@/lib/auth";
import NavLink from "@/components/app/NavLink";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await currentUser();
  if (!user) redirect("/sign-in");
  if (!isApproved(user)) redirect("/waitlist");
  const admin = isAdmin(user);

  return (
    <div className="flex min-h-screen">
      {/* sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-60 flex-col border-r border-white/8 bg-black/60 backdrop-blur-xl md:flex">
        <a href="/" className="flex items-center gap-2.5 px-6 py-5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/ribbon.png" alt="" className="h-7 w-7 object-contain" />
          <span className="text-sm font-medium tracking-[0.18em] text-white">RECONLY</span>
        </a>
        <nav className="mt-2 flex flex-1 flex-col gap-1 px-3">
          <NavLink href="/dashboard" label="Overview" exact />
          <NavLink href="/dashboard/transactions" label="Transactions" />
          <NavLink href="/dashboard/compliance" label="Compliance" />
          <NavLink href="/dashboard/exports" label="Exports" />
          {admin && <NavLink href="/dashboard/admin" label="Admin" />}
        </nav>
        <div className="border-t border-white/8 px-6 py-4 text-[11px] text-[#6B7280]">
          Demo data · March–Aug 2026
        </div>
      </aside>

      {/* main */}
      <div className="flex min-h-screen flex-1 flex-col md:pl-60">
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-white/8 bg-black/60 px-5 backdrop-blur-xl">
          <div className="flex items-center gap-3 md:hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/ribbon.png" alt="" className="h-6 w-6 object-contain" />
            <span className="text-xs font-medium tracking-[0.18em] text-white">RECONLY</span>
          </div>
          <div className="hidden text-sm text-[#6B7280] md:block">
            Acme Digital GmbH · Fiscal year 2026
          </div>
          <UserButton />
        </header>
        <main className="flex-1 px-5 py-8 sm:px-8">{children}</main>
      </div>
    </div>
  );
}
