import { NextRequest, NextResponse } from "next/server";
import { auth0, isAuth0Configured } from "@/features/auth/services/auth0";
import { reportAuthError } from "@/core/services/error-reporting";
import { generateCSP } from "@/core/services/csp";

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

function isStaticFile(pathname: string): boolean {
  const p = normalise(pathname);

  // Allow Next.js internals
  if (p.startsWith("/_next/")) return true;

  // Allow static file extensions
  const ext = getExtname(p);
  if (STATIC_EXTENSIONS.has(ext)) return true;

  return false;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Generate CSP header
  const cspHeader = generateCSP();

  // Set up request headers with CSP
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("Content-Security-Policy", cspHeader);

  // Fail closed in production if Auth0 is misconfigured
  const auth0Configured = isAuth0Configured();
  if (!auth0Configured) {
    if (process.env.NODE_ENV === "development") {
      console.warn("[Auth0] not configured – allowing all requests (dev only)");
      const response = NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      });
      response.headers.set("Content-Security-Policy", cspHeader);
      return response;
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

  // First, let Auth0 handle its own requests and auto-mount auth routes
  const authRes = await auth0.middleware(request);

  // Let Auth0 handle its own endpoints
  if (pathname.startsWith("/auth")) {
    if (authRes) {
      authRes.headers.set("Content-Security-Policy", cspHeader);
      return authRes;
    }
  }

  // Allow static files and Next.js internals (but NOT application routes)
  if (isStaticFile(pathname)) {
    if (authRes) {
      authRes.headers.set("Content-Security-Policy", cspHeader);
      return authRes;
    }
    const response = NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
    response.headers.set("Content-Security-Policy", cspHeader);
    return response;
  }

  // From this point on, all routes require authentication (including home page)
  // But only if Auth0 is configured - otherwise allow in development
  if (isAuth0Configured()) {
    const session = await auth0.getSession(request);
    if (!session) {
      const redirectUrl = new URL("/auth/login", request.nextUrl.origin);

      // Prevent open redirect attacks
      if (redirectUrl.origin !== request.nextUrl.origin) {
        redirectUrl.host = request.nextUrl.host;
      }

      return NextResponse.redirect(redirectUrl);
    }
  }

  // Set CSP headers for authenticated requests
  if (authRes) {
    authRes.headers.set("Content-Security-Policy", cspHeader);
    return authRes;
  }

  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
  response.headers.set("Content-Security-Policy", cspHeader);
  return response;
}

export const config = {
  matcher: [
    // Match all request paths except for the ones starting with:
    // - _next/static (static files)
    // - _next/image (image optimization files)
    // - _next/data (data files)
    // - favicon.ico, favicon.svg (favicon files)
    {
      source:
        "/((?!_next/static|_next/image|_next/data|favicon.ico|favicon.svg).*)",
      missing: [
        { type: "header", key: "next-router-prefetch" },
        { type: "header", key: "purpose", value: "prefetch" },
      ],
    },
  ],
};
