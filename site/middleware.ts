import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isProtected = createRouteMatcher(["/dashboard(.*)", "/api/exports(.*)"]);

// Without Clerk keys (fresh checkout) the app routes show a setup notice
// instead of crashing — skip auth entirely in that case.
const hasKeys = !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

export default clerkMiddleware(async (auth, req) => {
  if (!hasKeys) return NextResponse.next();
  if (isProtected(req)) await auth.protect();
});

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/sign-in/:path*",
    "/waitlist",
    "/api/exports/:path*",
  ],
};
