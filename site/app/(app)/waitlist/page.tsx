import { SignOutButton } from "@clerk/nextjs";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { isApproved, primaryEmail } from "@/lib/auth";

export default async function WaitlistPage() {
  const user = await currentUser();
  if (!user) redirect("/sign-in");
  if (isApproved(user)) redirect("/dashboard");

  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <div className="glass light-seam max-w-md rounded-2xl p-8 text-center">
        <div className="mx-auto mb-5 inline-flex rounded-xl border border-white/10 bg-white/4 p-3">
          <svg viewBox="0 0 32 32" fill="none" className="h-8 w-8" aria-hidden="true">
            <circle cx="16" cy="16" r="12" stroke="white" strokeWidth="1.3" />
            <path d="M16 10v6l4 3" stroke="white" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <h1 className="text-xl font-medium text-white">Waiting for approval</h1>
        <p className="mt-3 text-sm leading-relaxed text-[#9CA3AF]">
          You are signed in as{" "}
          <span className="text-white">{primaryEmail(user)}</span>. A Reconly
          admin needs to approve your account before you can access the
          dashboard — you&apos;ll receive an email once that happens.
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
