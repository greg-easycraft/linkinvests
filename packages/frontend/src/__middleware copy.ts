import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "./lib/auth";
import { headers } from "next/headers";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const session = await auth.api.getSession({
    headers: await headers()
})

  // Protected routes that require authentication
  const protectedPaths = ["/search"];
  const isProtectedPath = protectedPaths.some((path) =>
    pathname.startsWith(path)
  );

  // Auth pages that authenticated users shouldn't access
  const authPaths = ["/", "/sign-up", "/forgot-password"];
  const isAuthPath = authPaths.some((path) => pathname === path);

  // Verification pages
  const verificationPaths = ["/verify-email", "/email-verified"];
  const isVerificationPath = verificationPaths.some((path) => pathname === path);

  // Redirect unauthenticated users to sign-in
  if (isProtectedPath && !session) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Check email verification for authenticated users
  if (session) {
    const isEmailVerified = session.user.emailVerified;

    // If user is not verified and trying to access protected routes
    if (isProtectedPath && !isEmailVerified) {
      return NextResponse.redirect(new URL("/verify-email", request.url));
    }

    // If user is verified and on verification pages, redirect to app
    if (isVerificationPath && isEmailVerified) {
      return NextResponse.redirect(new URL("/search", request.url));
    }

    // If user is verified and on auth pages, redirect to app
    if (isAuthPath && isEmailVerified) {
      return NextResponse.redirect(new URL("/search", request.url));
    }

    // If user is not verified and on auth pages (except when coming from sign-up), allow access
    if (isAuthPath && !isEmailVerified) {
      // Allow unverified users to stay on auth pages
      return NextResponse.next();
    }
  }

  return NextResponse.next();
}

export const config = {
  runtime: "nodejs",
  matcher: ["/search/:path*", "/", "/sign-up", "/forgot-password", "/verify-email", "/email-verified"],
};
