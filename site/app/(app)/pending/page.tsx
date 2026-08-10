import { SignOutButton } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import { getOrCreateOwnProfile } from "@/lib/profile";
import ReconlyMark from "@/components/ReconlyMark";

export default async function PendingPage() {
  const profile = await getOrCreateOwnProfile();
  if (!profile) redirect("/login");
  if (profile.status === "banned") redirect("/suspended");
  if (profile.status === "active") redirect("/app");

  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <div className="glass light-seam max-w-md rounded-2xl p-8 text-center">
        <div className="mx-auto mb-5 inline-flex">
          <ReconlyMark size={56} animate />
        </div>
        <h1 className="text-xl font-medium text-white">Awaiting activation</h1>
        <p className="mt-3 text-sm leading-relaxed text-[#9CA3AF]">
          You are signed in as <span className="text-white">{profile.email}</span>. Your account is
          awaiting activation — we&apos;ll unlock your workspace shortly.
        </p>
        <div className="mt-7 flex items-center justify-center gap-3">
          <SignOutButton redirectUrl="/">
            <button className="btn-ghost border !border-white/15 !py-2 text-sm">Sign out</button>
          </SignOutButton>
          <a href="/" className="btn-ghost !py-2 text-sm text-[#9CA3AF]">
            Back to site
          </a>
        </div>
      </div>
    </main>
  );
}
