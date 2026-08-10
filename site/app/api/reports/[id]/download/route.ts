import { NextResponse } from "next/server";
import { requireActiveUser } from "@/lib/profile";
import { db } from "@/lib/supabase";

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const { profile } = await requireActiveUser();

  const { data: report } = await db()
    .from("reports")
    .select("*")
    .eq("id", id)
    .eq("clerk_user_id", profile.clerk_user_id)
    .maybeSingle();
  if (!report) return NextResponse.json({ error: "not found" }, { status: 404 });

  const { data, error } = await db()
    .storage.from("reports")
    .createSignedUrl(report.file_url, 60);
  if (error || !data) return NextResponse.json({ error: "file unavailable" }, { status: 404 });

  return NextResponse.redirect(data.signedUrl);
}
