import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { hasClerk, hasSupabase } from "@/lib/env";

export const dynamic = "force-dynamic";

function SetupNotice() {
  const missing = [
    !hasClerk && "Clerk (NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY, CLERK_SECRET_KEY, CLERK_WEBHOOK_SECRET)",
    !hasSupabase && "Supabase (NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY — run supabase/schema.sql)",
  ].filter(Boolean) as string[];

  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <div className="glass light-seam max-w-lg rounded-2xl p-8">
        <h1 className="text-lg font-medium text-white">Setup required</h1>
        <p className="mt-3 text-sm leading-relaxed text-[#9CA3AF]">
          Copy <code className="text-white">.env.example</code> to{" "}
          <code className="text-white">.env.local</code> and configure:
        </p>
        <ul className="mt-3 space-y-2 text-sm text-[#9CA3AF]">
          {missing.map((m) => (
            <li key={m} className="flex gap-2">
              <span className="text-white">→</span> {m}
            </li>
          ))}
        </ul>
        <p className="mt-4 text-xs text-[#6B7280]">
          Then restart the dev server. The marketing site works without keys.
        </p>
        <a href="/" className="btn-ghost mt-6 inline-flex border !border-white/15 text-sm">
          Back to site
        </a>
      </div>
    </main>
  );
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  if (!hasClerk || !hasSupabase) return <SetupNotice />;

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
      signInUrl="/login"
      signUpUrl="/register"
      afterSignOutUrl="/"
    >
      {children}
    </ClerkProvider>
  );
}
