import ReconlyMark from "@/components/ReconlyMark";

export default function AuthShell({
  children,
  caption,
}: {
  children: React.ReactNode;
  caption: string;
}) {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-6 py-20">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: "radial-gradient(ellipse 60% 50% at 50% 40%, #0A0A0A 0%, #000 75%)",
        }}
      />
      <div className="drift-slower pointer-events-none absolute left-1/2 top-1/2 h-[620px] w-[620px] -translate-x-1/2 -translate-y-1/2 opacity-25">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/ribbon.png" alt="" className="h-full w-full object-contain" />
      </div>
      <div className="relative z-10 flex flex-col items-center gap-8">
        <a href="/" className="flex items-center gap-2.5">
          <ReconlyMark size={30} />
          <span className="text-[15px] font-medium tracking-[0.18em] text-white">RECONLY</span>
        </a>
        {children}
        <p className="max-w-xs text-center text-xs leading-relaxed text-[#6B7280]">{caption}</p>
      </div>
    </main>
  );
}
