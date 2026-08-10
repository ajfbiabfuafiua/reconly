import { Webhook } from "svix";
import { NextResponse } from "next/server";
import { db } from "@/lib/supabase";
import { hasSupabase } from "@/lib/env";
import { mirrorToClerk, getSetting, type Profile } from "@/lib/profile";

type ClerkUserPayload = {
  id: string;
  email_addresses?: { id: string; email_address: string }[];
  primary_email_address_id?: string;
  first_name?: string | null;
  last_name?: string | null;
  public_metadata?: Record<string, unknown>;
};

function primaryEmail(u: ClerkUserPayload): string {
  const primary = u.email_addresses?.find((e) => e.id === u.primary_email_address_id);
  return (primary ?? u.email_addresses?.[0])?.email_address?.toLowerCase() ?? "";
}

export async function POST(req: Request) {
  const secret = process.env.CLERK_WEBHOOK_SECRET;
  if (!secret || !hasSupabase) {
    return NextResponse.json({ error: "webhook not configured" }, { status: 503 });
  }

  const payload = await req.text();
  const headers = {
    "svix-id": req.headers.get("svix-id") ?? "",
    "svix-timestamp": req.headers.get("svix-timestamp") ?? "",
    "svix-signature": req.headers.get("svix-signature") ?? "",
  };

  let event: { type: string; data: ClerkUserPayload };
  try {
    event = new Webhook(secret).verify(payload, headers) as typeof event;
  } catch {
    return NextResponse.json({ error: "invalid signature" }, { status: 400 });
  }

  const user = event.data;

  if (event.type === "user.created") {
    // Invitations from the admin panel carry plan/status in public_metadata;
    // organic sign-ups start pending (unless manual activation is off).
    const invitedPlan = (user.public_metadata?.invited_plan as string) ?? null;
    const manualActivation = await getSetting<boolean>("manual_activation", true);
    const status = invitedPlan ? "active" : manualActivation ? "pending" : "active";

    const { data, error } = await db()
      .from("profiles")
      .upsert(
        {
          clerk_user_id: user.id,
          email: primaryEmail(user),
          full_name: [user.first_name, user.last_name].filter(Boolean).join(" ") || null,
          status,
          plan: invitedPlan ?? "none",
        },
        { onConflict: "clerk_user_id" }
      )
      .select()
      .single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    // link a converted demo request, if any
    if (invitedPlan) {
      await db()
        .from("demo_requests")
        .update({ converted_user_id: user.id, status: "converted" })
        .eq("email", primaryEmail(user))
        .eq("status", "contacted");
    }
    await mirrorToClerk(data as Profile).catch(() => {});
  }

  if (event.type === "user.updated") {
    await db()
      .from("profiles")
      .update({
        email: primaryEmail(user),
        full_name: [user.first_name, user.last_name].filter(Boolean).join(" ") || null,
      })
      .eq("clerk_user_id", user.id);
  }

  if (event.type === "user.deleted") {
    await db().from("profiles").delete().eq("clerk_user_id", user.id);
  }

  return NextResponse.json({ ok: true });
}
