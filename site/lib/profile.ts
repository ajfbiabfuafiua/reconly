import { clerkClient, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { db } from "./supabase";
import { hasClerk, hasSupabase } from "./env";

export type Role = "user" | "admin";
export type Status = "pending" | "active" | "banned";
export type Plan = "none" | "starter" | "growth" | "max";

export interface Profile {
  clerk_user_id: string;
  email: string;
  full_name: string | null;
  company_name: string | null;
  role: Role;
  status: Status;
  plan: Plan;
  created_at: string;
  last_login_at: string | null;
  deletion_requested_at: string | null;
}

export function setupReady(): boolean {
  return hasClerk && hasSupabase;
}

/** Authoritative profile lookup — never trust publicMetadata alone. */
export async function getProfile(clerkUserId: string): Promise<Profile | null> {
  const { data, error } = await db()
    .from("profiles")
    .select("*")
    .eq("clerk_user_id", clerkUserId)
    .maybeSingle();
  if (error) throw new Error(`profiles lookup failed: ${error.message}`);
  return (data as Profile) ?? null;
}

/**
 * Self-healing profile fetch for the signed-in user: creates the pending row
 * if the webhook hasn't landed yet, and stamps last_login_at.
 */
export async function getOrCreateOwnProfile(): Promise<Profile | null> {
  const user = await currentUser();
  if (!user) return null;
  const email =
    user.emailAddresses.find((e) => e.id === user.primaryEmailAddressId)?.emailAddress ??
    user.emailAddresses[0]?.emailAddress ??
    "";
  const existing = await getProfile(user.id);
  if (existing) {
    void db()
      .from("profiles")
      .update({ last_login_at: new Date().toISOString() })
      .eq("clerk_user_id", user.id)
      .then(() => {});
    return existing;
  }
  const { data, error } = await db()
    .from("profiles")
    .upsert(
      {
        clerk_user_id: user.id,
        email: email.toLowerCase(),
        full_name: [user.firstName, user.lastName].filter(Boolean).join(" ") || null,
        last_login_at: new Date().toISOString(),
      },
      { onConflict: "clerk_user_id" }
    )
    .select()
    .single();
  if (error) throw new Error(`profile create failed: ${error.message}`);
  await mirrorToClerk(data as Profile);
  return data as Profile;
}

/** Mirror role/status/plan to Clerk publicMetadata so middleware can gate cheaply. */
export async function mirrorToClerk(p: Profile) {
  const client = await clerkClient();
  await client.users.updateUserMetadata(p.clerk_user_id, {
    publicMetadata: { role: p.role, status: p.status, plan: p.plan },
  });
}

/** Gate for /app pages. Returns the effective profile (may be an impersonation target). */
export async function requireActiveUser(): Promise<{
  profile: Profile;
  impersonating: boolean;
  adminProfile: Profile | null;
}> {
  const own = await getOrCreateOwnProfile();
  if (!own) redirect("/login");
  if (own.status === "banned") redirect("/suspended");
  if (own.status === "pending") redirect("/pending");

  // Read-only admin impersonation via cookie
  if (own.role === "admin") {
    const jar = await cookies();
    const target = jar.get("reconly_impersonate")?.value;
    if (target && target !== own.clerk_user_id) {
      const targetProfile = await getProfile(target);
      if (targetProfile) {
        return { profile: targetProfile, impersonating: true, adminProfile: own };
      }
    }
  }
  return { profile: own, impersonating: false, adminProfile: null };
}

/** Gate for /admin pages and admin server actions — server-side role re-check. */
export async function requireAdmin(): Promise<Profile> {
  const own = await getOrCreateOwnProfile();
  if (!own) redirect("/login");
  if (own.status === "banned") redirect("/suspended");
  if (own.role !== "admin") redirect("/not-found-404"); // resolves to 404
  return own;
}

/** Throwing variant for server actions (no redirect side effects). */
export async function assertAdmin(): Promise<Profile> {
  const own = await getOrCreateOwnProfile();
  if (!own || own.role !== "admin" || own.status === "banned") {
    throw new Error("Not authorized");
  }
  return own;
}

/** Reject writes during read-only impersonation. */
export async function assertNotImpersonating() {
  const jar = await cookies();
  if (jar.get("reconly_impersonate")?.value) {
    throw new Error("Read-only impersonation — writes are disabled");
  }
}

export async function getSetting<T>(key: string, fallback: T): Promise<T> {
  const { data } = await db().from("app_settings").select("value").eq("key", key).maybeSingle();
  return data ? ((data.value as T) ?? fallback) : fallback;
}

export async function setSetting(key: string, value: unknown) {
  const { error } = await db()
    .from("app_settings")
    .upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: "key" });
  if (error) throw new Error(error.message);
}
