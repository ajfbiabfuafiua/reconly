import { SignOutButton } from "@clerk/nextjs";
import ReconlyMark from "@/components/ReconlyMark";

export default function SuspendedPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <div className="glass max-w-md rounded-2xl border-red-900/40 p-8 text-center">
        <div className="mx-auto mb-5 inline-flex opacity-60">
          <ReconlyMark size={56} />
        </div>
        <h1 className="text-xl font-medium text-white">Account suspended</h1>
        <p className="mt-3 text-sm leading-relaxed text-[#9CA3AF]">
          Your access to Reconly has been suspended. If you believe this is a mistake, contact
          support at <span className="text-white">support@reconly.io</span>.
        </p>
        <div className="mt-7 flex items-center justify-center gap-3">
          <SignOutButton redirectUrl="/">
            <button className="btn-ghost border !border-white/15 !py-2 text-sm">Sign out</button>
          </SignOutButton>
        </div>
      </div>
    </main>
  );
}
