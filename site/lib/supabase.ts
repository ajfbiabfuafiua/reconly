import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Data access model: ALL Supabase access happens server-side (server
 * components, server actions, route handlers) after Clerk has verified the
 * session; queries are explicitly scoped by clerk_user_id. The service-role
 * key never reaches the client. RLS (deny-by-default, checking the Clerk JWT
 * `sub` via the Clerk–Supabase third-party integration) is defined in
 * supabase/schema.sql as defense in depth for any non-service access path.
 */

let cached: SupabaseClient | null = null;

export function db(): SupabaseClient {
  if (cached) return cached;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Supabase is not configured");
  cached = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return cached;
}
