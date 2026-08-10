"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

export default function AdminSearch({ placeholder }: { placeholder: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  return (
    <input
      defaultValue={params.get("q") ?? ""}
      placeholder={placeholder}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          const v = (e.target as HTMLInputElement).value;
          router.replace(v ? `${pathname}?q=${encodeURIComponent(v)}` : pathname);
        }
      }}
      className="w-64 rounded-lg border border-white/12 bg-white/4 px-3 py-2 text-xs text-white placeholder:text-[#6B7280] focus:border-white/30 focus:outline-none"
    />
  );
}
