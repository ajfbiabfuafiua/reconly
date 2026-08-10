import { db } from "./supabase";

/** Every admin mutation writes here. */
export async function logAdminAction(
  actorId: string,
  action: string,
  targetType: string,
  targetId: string,
  details: Record<string, unknown> = {}
) {
  const { error } = await db().from("audit_log").insert({
    actor_id: actorId,
    action,
    target_type: targetType,
    target_id: targetId,
    details,
  });
  if (error) console.error("audit_log insert failed:", error.message);
}
