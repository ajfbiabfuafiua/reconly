import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";
import { getOrCreateOwnProfile, getSetting } from "@/lib/profile";
import { db } from "@/lib/supabase";
import { buildSnapshot, buildSystemPrompt, checkQuota } from "@/lib/assist";
import { hasAnthropic, ASSIST_MODEL } from "@/lib/env";

export const maxDuration = 60;

interface AssistBody {
  conversationId?: string | null;
  message: string;
  context?: { label?: string; [k: string]: unknown } | null;
  language?: "en" | "de";
}

export async function POST(req: Request) {
  // kill switch
  const enabled = await getSetting<boolean>("assistant_enabled", true).catch(() => true);
  if (!enabled) {
    return NextResponse.json(
      { error: "Reconly Assist is temporarily unavailable for maintenance." },
      { status: 503 }
    );
  }
  if (!hasAnthropic) {
    return NextResponse.json(
      { error: "Assist isn't configured yet (ANTHROPIC_API_KEY missing)." },
      { status: 503 }
    );
  }

  const profile = await getOrCreateOwnProfile();
  if (!profile) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (profile.status !== "active") {
    return NextResponse.json({ error: "Account not active" }, { status: 403 });
  }

  const body = (await req.json()) as AssistBody;
  const text = body.message?.trim();
  if (!text || text.length > 4000) {
    return NextResponse.json({ error: "Message must be 1–4000 characters." }, { status: 400 });
  }

  const quota = await checkQuota(profile);
  if (!quota.allowed) {
    const msg =
      quota.reason === "hourly"
        ? "You've reached the hourly assistant limit. Please try again in a bit."
        : "You've used this month's Assist quota. Upgrade to keep using Assist.";
    return NextResponse.json({ error: msg, quota: quota.reason }, { status: 429 });
  }

  // conversation: load or create
  let conversationId = body.conversationId ?? null;
  if (conversationId) {
    const { data } = await db()
      .from("assistant_conversations")
      .select("id")
      .eq("id", conversationId)
      .eq("clerk_user_id", profile.clerk_user_id)
      .maybeSingle();
    if (!data) conversationId = null;
  }
  if (!conversationId) {
    const { data, error } = await db()
      .from("assistant_conversations")
      .insert({
        clerk_user_id: profile.clerk_user_id,
        title: text.slice(0, 64),
      })
      .select("id")
      .single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    conversationId = data.id as string;
  }

  // history (last 20 messages)
  const { data: history } = await db()
    .from("assistant_messages")
    .select("role, content")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true })
    .limit(20);

  // persist the user message before calling the model
  await db().from("assistant_messages").insert({
    conversation_id: conversationId,
    role: "user",
    content: text,
    context: body.context ?? {},
  });

  const snapshot = await buildSnapshot(profile.clerk_user_id);
  const system = buildSystemPrompt(snapshot, body.language === "de" ? "de" : "en");

  const contextNote = body.context?.label
    ? `\n\n[Attached context from the app: ${body.context.label}]`
    : "";

  const client = new Anthropic();
  const encoder = new TextEncoder();
  const convId = conversationId;

  const stream = client.messages.stream({
    model: ASSIST_MODEL,
    max_tokens: 2048,
    system,
    thinking: { type: "adaptive" },
    output_config: { effort: "low" },
    messages: [
      ...(history ?? []).map((m) => ({
        role: m.role as "user" | "assistant",
        content: m.content as string,
      })),
      { role: "user" as const, content: text + contextNote },
    ],
  });

  const readable = new ReadableStream({
    async start(controller) {
      let full = "";
      try {
        for await (const event of stream) {
          if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
            full += event.delta.text;
            controller.enqueue(encoder.encode(event.delta.text));
          }
        }
        const final = await stream.finalMessage();
        await db().from("assistant_messages").insert({
          conversation_id: convId,
          role: "assistant",
          content: full,
          context: {
            model: ASSIST_MODEL,
            usage: {
              input_tokens: final.usage.input_tokens,
              output_tokens: final.usage.output_tokens,
            },
            chips: body.context ?? null,
          },
        });
        await db()
          .from("assistant_conversations")
          .update({ updated_at: new Date().toISOString() })
          .eq("id", convId);
      } catch (e) {
        controller.enqueue(
          encoder.encode("\n\n[Assist ran into a problem — your message was kept, please retry.]")
        );
        console.error("assist stream error:", e);
      } finally {
        controller.close();
      }
    },
  });

  return new Response(readable, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
      "x-conversation-id": conversationId,
      "x-remaining-month": quota.remainingMonth === null ? "unlimited" : String(quota.remainingMonth),
    },
  });
}
