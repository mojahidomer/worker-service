import { auth } from "@/auth";
import { NextResponse } from "next/server";

const SIGN_IN = "/login";

export default auth((req) => {
  const { nextUrl } = req;
  const pathname = nextUrl.pathname;
  const session = req.auth;

  // Public routes — no auth required
  const isPublic =
    pathname === "/" ||
    pathname.startsWith("/login") ||
    pathname.startsWith("/register") ||
    pathname.startsWith("/api/auth");
  if (isPublic) {
    return NextResponse.next();
  }

  // Require session for protected routes
  if (!session?.user) {
    const signInUrl = new URL(SIGN_IN, nextUrl.origin);
    signInUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(signInUrl);
  }

  const role = session.user.role as string | undefined;

  // /dashboard/admin → ADMIN only
  if (pathname.startsWith("/dashboard/admin")) {
    if (role !== "ADMIN") {
      return NextResponse.redirect(new URL("/dashboard", nextUrl.origin));
    }
  }

  // /dashboard/worker → WORKER only
  if (pathname.startsWith("/dashboard/worker")) {
    if (role !== "WORKER") {
      return NextResponse.redirect(new URL("/dashboard", nextUrl.origin));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
