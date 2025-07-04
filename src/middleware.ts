import { NextRequest, NextResponse } from "next/server";
import { auth0 } from "./lib/auth0";

const LOGIN_URL = "/auth/login";

export async function middleware(request: NextRequest) {
  const authRes = await auth0.middleware(request);
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/auth") || pathname.startsWith("/api")) {
    return authRes;
  }

  const session = await auth0.getSession(request);
  if (!session) {
    return NextResponse.redirect(new URL(LOGIN_URL, request.nextUrl.origin));
  }

  // Validate JWT token - redirects to login if expired/invalid
  try {
    await auth0.getAccessToken(request, authRes);
  } catch (error) {
    console.warn("Access token validation failed:", error);
    return NextResponse.redirect(new URL(LOGIN_URL, request.nextUrl.origin));
  }

  return authRes;
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
