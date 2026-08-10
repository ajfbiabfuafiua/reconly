export const hasClerk = !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
export const hasSupabase =
  !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.SUPABASE_SERVICE_ROLE_KEY;
export const hasAnthropic = !!process.env.ANTHROPIC_API_KEY;

/** Model for Reconly Assist — per product spec. */
export const ASSIST_MODEL = process.env.ASSIST_MODEL ?? "claude-sonnet-4-6";
