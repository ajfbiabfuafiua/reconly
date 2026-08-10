import { UserButton } from "@clerk/nextjs";
import ReconlyMark from "@/components/ReconlyMark";
import NavLink from "@/components/app/NavLink";

export interface NavItem {
  href: string;
  label: string;
  exact?: boolean;
}

export default function Shell({
  nav,
  tag,
  headerNote,
  banner,
  children,
}: {
  nav: NavItem[];
  tag?: string;
  headerNote?: string;
  banner?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-60 flex-col border-r border-white/8 bg-black/60 backdrop-blur-xl md:flex">
        <a href="/" className="flex items-center gap-2.5 px-6 py-5">
          <ReconlyMark size={26} />
          <span className="text-sm font-medium tracking-[0.18em] text-white">RECONLY</span>
          {tag && (
            <span className="rounded-full border border-white/25 px-2 py-0.5 text-[9px] tracking-[0.2em] text-[#9CA3AF]">
              {tag}
            </span>
          )}
        </a>
        <nav className="mt-2 flex flex-1 flex-col gap-1 px-3">
          {nav.map((n) => (
            <NavLink key={n.href} href={n.href} label={n.label} exact={n.exact} />
          ))}
        </nav>
        <div className="flex items-center justify-between border-t border-white/8 px-6 py-4">
          <span className="text-[11px] text-[#6B7280]">{headerNote ?? ""}</span>
          <UserButton />
        </div>
      </aside>

      <div className="flex min-h-screen flex-1 flex-col md:pl-60">
        {banner}
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-white/8 bg-black/60 px-5 backdrop-blur-xl md:hidden">
          <a href="/" className="flex items-center gap-2.5">
            <ReconlyMark size={22} />
            <span className="text-xs font-medium tracking-[0.18em] text-white">RECONLY</span>
            {tag && (
              <span className="rounded-full border border-white/25 px-1.5 py-0.5 text-[8px] tracking-[0.2em] text-[#9CA3AF]">
                {tag}
              </span>
            )}
          </a>
          <UserButton />
        </header>
        <main className="flex-1 px-5 pb-24 pt-8 sm:px-8 md:pb-10">{children}</main>

        {/* mobile bottom bar */}
        <nav className="fixed inset-x-0 bottom-0 z-40 flex justify-around border-t border-white/8 bg-black/70 px-2 py-2 backdrop-blur-xl md:hidden">
          {nav.slice(0, 5).map((n) => (
            <a key={n.href} href={n.href} className="rounded-lg px-3 py-1.5 text-[11px] text-[#9CA3AF]">
              {n.label}
            </a>
          ))}
        </nav>
      </div>
    </div>
  );
}
