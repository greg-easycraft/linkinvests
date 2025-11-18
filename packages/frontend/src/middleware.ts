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

  // Redirect unauthenticated users to sign-in
  if (isProtectedPath && !session) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Redirect authenticated users to search
  if (isAuthPath && session) {
    return NextResponse.redirect(new URL("/search", request.url));
  }

  return NextResponse.next();
}

export const config = {
  runtime: "nodejs",
  matcher: ["/search/:path*", "/", "/sign-up", "/forgot-password"],
};
