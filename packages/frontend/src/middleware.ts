import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isHomePage = pathname === '/';
  if(isHomePage) {
    return NextResponse.next();
  }
  return NextResponse.redirect(new URL('/', request.url));
}

export const config = {
  runtime: "nodejs",
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
