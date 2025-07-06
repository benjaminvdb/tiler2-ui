import { NextRequest, NextResponse } from "next/server";
import { auth0 } from "./lib/auth0";
import { AUTH_CONFIG } from "@/config";

const LOGIN_URL = AUTH_CONFIG.loginUrl;

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Handle API routes separately - let Auth0 middleware handle them
  if (pathname.startsWith("/api")) {
    return await auth0.middleware(request);
  }

  // Handle auth routes - let Auth0 middleware handle them
  if (pathname.startsWith("/auth")) {
    return await auth0.middleware(request);
  }

  // For protected pages, check session
  const session = await auth0.getSession(request);
  if (!session) {
    return NextResponse.redirect(new URL(LOGIN_URL, request.nextUrl.origin));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     */
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};
