import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isProtected = createRouteMatcher(["/app(.*)", "/admin(.*)", "/verifying", "/pending", "/suspended"]);
const isAdminRoute = createRouteMatcher(["/admin(.*)"]);

// Without Clerk keys (fresh checkout) the app routes show a setup notice.
const hasKeys = !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

type Meta = { role?: string; status?: string };

export default clerkMiddleware(async (auth, req) => {
  if (!hasKeys) return NextResponse.next();

  // legacy route redirects
  const { pathname } = req.nextUrl;
  if (pathname.startsWith("/sign-in")) {
    return NextResponse.redirect(new URL("/login", req.url));
  }
  if (pathname.startsWith("/dashboard")) {
    return NextResponse.redirect(new URL("/app", req.url));
  }
  if (pathname === "/waitlist") {
    return NextResponse.redirect(new URL("/pending", req.url));
  }

  if (!isProtected(req)) return NextResponse.next();

  const { userId, sessionClaims } = await auth();
  if (!userId) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // Fast gate from mirrored publicMetadata (authoritative re-check happens in
  // layouts against the profiles table).
  const meta = ((sessionClaims?.publicMetadata ?? sessionClaims?.metadata) as Meta) ?? {};
  if (meta.status === "banned" && pathname !== "/suspended") {
    return NextResponse.redirect(new URL("/suspended", req.url));
  }
  if (
    meta.status === "pending" &&
    (pathname.startsWith("/app") || pathname.startsWith("/admin"))
  ) {
    return NextResponse.redirect(new URL("/pending", req.url));
  }
  if (isAdminRoute(req) && meta.role !== undefined && meta.role !== "admin") {
    // non-admins get a 404, not a redirect hint
    return NextResponse.rewrite(new URL("/not-found-404", req.url));
  }
  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!_next|.*\\.(?:png|jpg|jpeg|svg|ico|css|js|woff2?)).*)",
  ],
};
