"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";

export default function NavLink({
  href,
  label,
  exact = false,
}: {
  href: string;
  label: string;
  exact?: boolean;
}) {
  const pathname = usePathname();
  const active = exact ? pathname === href : pathname.startsWith(href);

  return (
    <Link
      href={href}
      className={`rounded-lg px-3 py-2 text-sm transition-colors duration-150 ${
        active
          ? "bg-white/8 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.10)]"
          : "text-[#9CA3AF] hover:bg-white/4 hover:text-white"
      }`}
    >
      {label}
    </Link>
  );
}
