"use server";

import { db } from "@/lib/supabase";
import { getOrCreateOwnProfile } from "@/lib/profile";

async function requireOwn() {
  const p = await getOrCreateOwnProfile();
  if (!p || p.status !== "active") throw new Error("Not authorized");
  return p;
}

export async function listConversations() {
  const p = await requireOwn();
  const { data } = await db()
    .from("assistant_conversations")
    .select("id, title, updated_at")
    .eq("clerk_user_id", p.clerk_user_id)
    .order("updated_at", { ascending: false })
    .limit(30);
  return data ?? [];
}

export async function getConversationMessages(conversationId: string) {
  const p = await requireOwn();
  const { data: conv } = await db()
    .from("assistant_conversations")
    .select("id")
    .eq("id", conversationId)
    .eq("clerk_user_id", p.clerk_user_id)
    .maybeSingle();
  if (!conv) throw new Error("Not found");
  const { data } = await db()
    .from("assistant_messages")
    .select("id, role, content, created_at")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true })
    .limit(100);
  return data ?? [];
}

export async function renameConversation(conversationId: string, title: string) {
  const p = await requireOwn();
  await db()
    .from("assistant_conversations")
    .update({ title: title.trim().slice(0, 80) || "Untitled" })
    .eq("id", conversationId)
    .eq("clerk_user_id", p.clerk_user_id);
}

export async function deleteConversation(conversationId: string) {
  const p = await requireOwn();
  await db()
    .from("assistant_conversations")
    .delete()
    .eq("id", conversationId)
    .eq("clerk_user_id", p.clerk_user_id);
}
