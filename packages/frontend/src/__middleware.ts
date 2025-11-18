import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protected routes that require authentication
  const protectedPaths = ["/search"];
  const isProtectedPath = protectedPaths.some((path) =>
    pathname.startsWith(path)
  );

  // Auth pages that authenticated users shouldn't access
  const authPaths = ["/", "/sign-up", "/forgot-password"];
  const isAuthPath = authPaths.some((path) => pathname === path);

  // Check if user has a session by looking for the better-auth session cookie
  const sessionCookie = request.cookies.get("better-auth.session_token");
  const hasSession = !!sessionCookie;

  // Redirect unauthenticated users to sign-in
  if (isProtectedPath && !hasSession) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Redirect authenticated users to search
  if (isAuthPath && hasSession) {
    return NextResponse.redirect(new URL("/search", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/search/:path*", "/", "/sign-up", "/forgot-password"],
};
