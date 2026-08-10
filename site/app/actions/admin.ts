"use server";

import { clerkClient } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { db } from "@/lib/supabase";
import { assertAdmin, getProfile, mirrorToClerk, setSetting, type Plan, type Profile } from "@/lib/profile";
import { logAdminAction } from "@/lib/audit";

const PLANS: Plan[] = ["none", "starter", "growth", "max"];

// ---------- users ----------

export async function activateUser(userId: string) {
  const admin = await assertAdmin();
  const { data, error } = await db()
    .from("profiles")
    .update({ status: "active" })
    .eq("clerk_user_id", userId)
    .select()
    .single();
  if (error) throw new Error(error.message);
  await mirrorToClerk(data as Profile);
  await logAdminAction(admin.clerk_user_id, "user.activate", "profile", userId, {
    to: "active",
  });
  revalidatePath("/admin/users");
}

export async function banUser(userId: string, reason: string) {
  const admin = await assertAdmin();
  if (!reason?.trim()) throw new Error("A reason is required to ban a user");
  if (userId === admin.clerk_user_id) throw new Error("You cannot ban yourself");
  const target = await getProfile(userId);
  if (target?.role === "admin") throw new Error("Demote the admin role before banning");

  const { data, error } = await db()
    .from("profiles")
    .update({ status: "banned" })
    .eq("clerk_user_id", userId)
    .select()
    .single();
  if (error) throw new Error(error.message);
  await mirrorToClerk(data as Profile);

  // Revoke all active Clerk sessions immediately
  try {
    const client = await clerkClient();
    const sessions = await client.sessions.getSessionList({ userId, status: "active" });
    await Promise.all(sessions.data.map((s) => client.sessions.revokeSession(s.id)));
  } catch (e) {
    console.error("session revocation failed:", e);
  }

  await logAdminAction(admin.clerk_user_id, "user.ban", "profile", userId, {
    reason: reason.trim(),
  });
  revalidatePath("/admin/users");
}

export async function unbanUser(userId: string, reason: string) {
  const admin = await assertAdmin();
  if (!reason?.trim()) throw new Error("A reason is required");
  const { data, error } = await db()
    .from("profiles")
    .update({ status: "active" })
    .eq("clerk_user_id", userId)
    .select()
    .single();
  if (error) throw new Error(error.message);
  await mirrorToClerk(data as Profile);
  await logAdminAction(admin.clerk_user_id, "user.unban", "profile", userId, {
    reason: reason.trim(),
  });
  revalidatePath("/admin/users");
}

export async function changePlan(userId: string, plan: string) {
  const admin = await assertAdmin();
  if (!PLANS.includes(plan as Plan)) throw new Error("Invalid plan");
  const before = await getProfile(userId);
  const { data, error } = await db()
    .from("profiles")
    .update({ plan })
    .eq("clerk_user_id", userId)
    .select()
    .single();
  if (error) throw new Error(error.message);
  await mirrorToClerk(data as Profile);
  await logAdminAction(admin.clerk_user_id, "user.plan_change", "profile", userId, {
    from: before?.plan,
    to: plan,
  });
  revalidatePath("/admin/users");
}

export async function setRole(userId: string, role: "user" | "admin") {
  const admin = await assertAdmin();
  if (userId === admin.clerk_user_id && role !== "admin") {
    throw new Error("You cannot demote yourself");
  }
  const { data, error } = await db()
    .from("profiles")
    .update({ role })
    .eq("clerk_user_id", userId)
    .select()
    .single();
  if (error) throw new Error(error.message);
  await mirrorToClerk(data as Profile);
  await logAdminAction(admin.clerk_user_id, `user.${role === "admin" ? "promote" : "demote"}`, "profile", userId, { role });
  revalidatePath("/admin/users");
}

export async function impersonate(userId: string) {
  const admin = await assertAdmin();
  const target = await getProfile(userId);
  if (!target) throw new Error("User not found");
  const jar = await cookies();
  jar.set("reconly_impersonate", userId, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 3600,
  });
  await logAdminAction(admin.clerk_user_id, "user.impersonate", "profile", userId, {
    mode: "read_only",
  });
}

export async function stopImpersonation() {
  const jar = await cookies();
  jar.delete("reconly_impersonate");
}

// ---------- demo requests ----------

export async function updateDemoRequest(
  id: string,
  patch: { status?: string; adminNotes?: string }
) {
  const admin = await assertAdmin();
  const update: Record<string, unknown> = {};
  if (patch.status !== undefined) update.status = patch.status;
  if (patch.adminNotes !== undefined) update.admin_notes = patch.adminNotes.slice(0, 4000);
  const { error } = await db().from("demo_requests").update(update).eq("id", id);
  if (error) throw new Error(error.message);
  if (patch.status) {
    await logAdminAction(admin.clerk_user_id, "demo.status_change", "demo_request", id, {
      to: patch.status,
    });
  }
  revalidatePath("/admin/demo-requests");
}

export async function createAccountFromRequest(id: string, plan: string) {
  const admin = await assertAdmin();
  if (!PLANS.includes(plan as Plan) || plan === "none") throw new Error("Pick a plan");
  const { data: reqRow } = await db().from("demo_requests").select("*").eq("id", id).maybeSingle();
  if (!reqRow) throw new Error("Request not found");

  const client = await clerkClient();
  await client.invitations.createInvitation({
    emailAddress: reqRow.email,
    publicMetadata: { invited_plan: plan },
    notify: true,
    ignoreExisting: true,
  });

  await db().from("demo_requests").update({ status: "contacted" }).eq("id", id);
  await logAdminAction(admin.clerk_user_id, "demo.invite_sent", "demo_request", id, {
    email: reqRow.email,
    plan,
  });
  revalidatePath("/admin/demo-requests");
}

// ---------- settings ----------

export async function updateAdminSettings(form: {
  notificationEmail: string;
  manualActivation: boolean;
}) {
  const admin = await assertAdmin();
  await setSetting("admin_notification_email", form.notificationEmail.trim());
  await setSetting("manual_activation", !!form.manualActivation);
  await logAdminAction(admin.clerk_user_id, "settings.update", "app_settings", "core", form);
  revalidatePath("/admin/settings");
}

export async function updateAssistantSettings(form: {
  enabled: boolean;
  hourlyLimit: number;
  quotas: { starter: number; growth: number; max: number };
}) {
  const admin = await assertAdmin();
  await setSetting("assistant_enabled", !!form.enabled);
  await setSetting("assistant_hourly_limit", Math.max(1, Math.min(1000, form.hourlyLimit | 0)));
  await setSetting("assistant_plan_quotas", {
    none: 0,
    starter: form.quotas.starter | 0,
    growth: form.quotas.growth | 0,
    max: form.quotas.max | 0,
  });
  await logAdminAction(admin.clerk_user_id, "assistant.settings_update", "app_settings", "assistant", form);
  revalidatePath("/admin/assistant");
}

/** Read-only conversation inspector — requires a reason, always audit-logged. */
export async function inspectConversation(conversationId: string, reason: string) {
  const admin = await assertAdmin();
  if (!reason?.trim()) throw new Error("A reason is required to inspect a conversation");
  const { data: conv } = await db()
    .from("assistant_conversations")
    .select("id, title, clerk_user_id")
    .eq("id", conversationId)
    .maybeSingle();
  if (!conv) throw new Error("Conversation not found");
  const { data: msgs } = await db()
    .from("assistant_messages")
    .select("role, content, created_at, context")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true })
    .limit(200);
  await logAdminAction(admin.clerk_user_id, "assistant.conversation_inspect", "assistant_conversation", conversationId, {
    reason: reason.trim(),
    owner: conv.clerk_user_id,
  });
  return { title: conv.title, owner: conv.clerk_user_id, messages: msgs ?? [] };
}
