import { NextResponse } from "next/server";
import { getOrCreateOwnProfile, mirrorToClerk } from "@/lib/profile";
import { setupReady } from "@/lib/profile";

export async function GET() {
  if (!setupReady()) return NextResponse.json({ error: "setup" }, { status: 503 });
  const profile = await getOrCreateOwnProfile();
  if (!profile) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  // keep Clerk publicMetadata in sync so middleware gates stay fresh
  await mirrorToClerk(profile).catch(() => {});
  return NextResponse.json({ status: profile.status, role: profile.role, plan: profile.plan });
}
