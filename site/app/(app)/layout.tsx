import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";

export const dynamic = "force-dynamic";

function SetupNotice() {
  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <div className="glass light-seam max-w-lg rounded-2xl p-8">
        <h1 className="text-lg font-medium text-white">Auth setup required</h1>
        <p className="mt-3 text-sm leading-relaxed text-[#9CA3AF]">
          Clerk keys are missing. Create an application at{" "}
          <span className="text-white">dashboard.clerk.com</span>, then copy{" "}
          <code className="text-white">.env.example</code> to{" "}
          <code className="text-white">.env.local</code> and fill in{" "}
          <code className="text-white">NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY</code>,{" "}
          <code className="text-white">CLERK_SECRET_KEY</code> and{" "}
          <code className="text-white">ADMIN_EMAILS</code>. Restart the dev server
          afterwards.
        </p>
        <a href="/" className="btn-ghost mt-6 inline-flex border !border-white/15 text-sm">
          Back to site
        </a>
      </div>
    </main>
  );
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  if (!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) return <SetupNotice />;

  return (
    <ClerkProvider
      appearance={{
        theme: dark,
        variables: {
          colorPrimary: "#ffffff",
          colorPrimaryForeground: "#000000",
          colorBackground: "#0a0a0a",
          colorForeground: "#ffffff",
          colorMutedForeground: "#9CA3AF",
          colorInput: "rgba(255,255,255,0.04)",
          colorInputForeground: "#ffffff",
          borderRadius: "0.75rem",
        },
        elements: {
          card: "border border-white/10 shadow-[0_-1px_24px_rgba(255,255,255,0.08)]",
        },
      }}
      signInUrl="/sign-in"
      afterSignOutUrl="/"
    >
      {children}
    </ClerkProvider>
  );
}
