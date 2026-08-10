import { DemoButton } from "@/components/DemoRequest";
import ReconlyMark from "@/components/ReconlyMark";

const links = [
  { href: "#product", label: "Product" },
  { href: "#compliance", label: "Compliance" },
  { href: "#accounting", label: "Accounting" },
  { href: "#pricing", label: "Pricing" },
  { href: "#faq", label: "Docs" },
];

export default function Navbar() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-white/8 bg-black/55 backdrop-blur-xl">
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-8">
        <a href="#top" className="flex items-center gap-2.5">
          <ReconlyMark size={28} />
          <span className="text-[15px] font-medium tracking-[0.18em] text-white">
            RECONLY
          </span>
        </a>

        <div className="hidden items-center gap-8 md:flex">
          {links.map((l) => (
            <a
              key={l.label}
              href={l.href}
              className="text-sm text-[#9CA3AF] transition-colors duration-200 hover:text-white"
            >
              {l.label}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <a href="/login" className="btn-ghost hidden !py-2 text-sm sm:inline-flex">
            Sign in
          </a>
          <DemoButton className="btn-primary !py-2 !px-5 text-sm">Book a demo</DemoButton>
        </div>
      </nav>
    </header>
  );
}
