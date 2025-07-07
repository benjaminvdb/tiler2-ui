import { NextRequest, NextResponse } from "next/server";
import {
  auth0Middleware,
  getAuth0Session,
  isAuth0Configured,
} from "@/features/auth/services/auth0";
import { AUTH_CONFIG } from "@/core/config/app";
import { reportAuthError } from "@/core/services/error-reporting";

const LOGIN_URL = AUTH_CONFIG.loginUrl ?? "/auth/login";

const PUBLIC_ROUTES = new Set<string>(["/"]);

const STATIC_EXTENSIONS = new Set<string>([
  ".ico",
  ".svg",
  ".png",
  ".css",
  ".js",
  ...(process.env.NODE_ENV === "development" ? [".map"] : []),
]);

function getExtname(pathname: string): string {
  const lastDot = pathname.lastIndexOf(".");
  const lastSlash = pathname.lastIndexOf("/");
  return lastDot === -1 || lastDot < lastSlash
    ? ""
    : pathname.slice(lastDot).toLowerCase();
}

function normalise(pathname: string): string {
  const out = pathname.toLowerCase().replace(/\/+$/, "");
  return out === "" ? "/" : out;
}

function isPublic(pathname: string): boolean {
  const p = normalise(pathname);

  if (PUBLIC_ROUTES.has(p)) return true;
  if (p.startsWith("/_next/")) return true;

  const ext = getExtname(p);
  if (STATIC_EXTENSIONS.has(ext)) return true;

  return false;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Fail closed in production if Auth0 is misconfigured
  if (!isAuth0Configured()) {
    if (process.env.NODE_ENV === "development") {
      console.warn("[Auth0] not configured – allowing all requests (dev only)");
      return NextResponse.next();
    }

    reportAuthError(new Error("Auth0 misconfiguration in production"), {
      operation: "middleware_auth_check",
      component: "middleware",
      url: pathname,
    });

    return new NextResponse("Service Temporarily Unavailable", {
      status: 503,
      headers: { "Retry-After": "60" },
    });
  }

  // Let Auth0 handle its own endpoints
  if (pathname.startsWith("/api") || pathname.startsWith("/auth")) {
    const res = await auth0Middleware(request);
    return res ?? NextResponse.next();
  }

  // Allow public routes
  if (isPublic(pathname)) return NextResponse.next();

  // Require authentication for protected routes
  const session = await getAuth0Session(request);
  if (!session) {
    const redirectUrl = new URL(LOGIN_URL, request.nextUrl.origin);

    // Prevent open redirect attacks
    if (redirectUrl.origin !== request.nextUrl.origin) {
      redirectUrl.host = request.nextUrl.host;
    }

    return NextResponse.redirect(redirectUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Exclude Next.js internals and static assets
    "/((?!_next/(?:static|image|data)|favicon\.(?:ico|svg)).*)",
  ],
};
