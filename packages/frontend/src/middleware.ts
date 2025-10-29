import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "~/lib/auth";

export async function middleware(request: NextRequest) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  const { pathname } = request.nextUrl;

  // Protected routes that require authentication
  const protectedPaths = ["/dashboard"];
  const isProtectedPath = protectedPaths.some((path) =>
    pathname.startsWith(path)
  );

  // Redirect unauthenticated users to sign-in
  if (isProtectedPath && !session) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Auth pages that authenticated users shouldn't access
  const authPaths = ["/", "/sign-up", "/forgot-password"];
  const isAuthPath = authPaths.some((path) => pathname === path);

  // Redirect authenticated users to dashboard
  if (isAuthPath && session) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/", "/sign-up", "/forgot-password"],
};
