import { NextRequest, NextResponse } from "next/server";
import { auth0, isAuth0Configured } from "@/features/auth/services/auth0";
import { reportAuthError } from "@/core/services/error-reporting";
import { generateCSP } from "@/core/services/csp";
import * as Sentry from "@sentry/nextjs";

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

  if (p.startsWith("/_next/")) return true;

  const ext = getExtname(p);
  if (STATIC_EXTENSIONS.has(ext)) return true;

  return false;
}

export async function middleware(request: NextRequest) {
  try {
    const { pathname } = request.nextUrl;

    Sentry.addBreadcrumb({
      category: "middleware",
      message: `Processing request: ${pathname}`,
      level: "info",
      data: {
        url: pathname,
        method: request.method,
      },
    });

    const cspHeader = generateCSP();

    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("Content-Security-Policy", cspHeader);

    /**
     * Fail closed in production if Auth0 is misconfigured for security.
     */
    const auth0Configured = isAuth0Configured();
    if (!auth0Configured) {
      if (process.env.NODE_ENV === "development") {
        console.warn(
          "[Auth0] not configured – allowing all requests (dev only)",
        );
        const response = NextResponse.next({
          request: {
            headers: requestHeaders,
          },
        });
        response.headers.set("Content-Security-Policy", cspHeader);
        return response;
      }

      const error = new Error("Auth0 misconfiguration in production");
      Sentry.captureException(error, {
        tags: {
          category: "auth",
          severity: "critical",
          middleware_step: "auth_check",
        },
        contexts: {
          request: {
            url: pathname,
            origin: request.nextUrl.origin,
          },
        },
      });

      reportAuthError(error, {
        operation: "middleware_auth_check",
        component: "middleware",
        url: pathname,
      });

      return new NextResponse("Service Temporarily Unavailable", {
        status: 503,
        headers: { "Retry-After": "60" },
      });
    }

    /**
     * Let Auth0 handle its own endpoints first.
     */
    const authRes = await auth0.middleware(request);

    if (pathname.startsWith("/auth")) {
      if (authRes) {
        authRes.headers.set("Content-Security-Policy", cspHeader);
        return authRes;
      }
    }

    /**
     * Allow static files but NOT application routes.
     */
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

    /**
     * All routes beyond this point require authentication.
     */
    if (isAuth0Configured()) {
      const session = await auth0.getSession(request);
      if (!session) {
        Sentry.addBreadcrumb({
          category: "auth",
          message: "Unauthorized access attempt - redirecting to login",
          level: "warning",
          data: {
            url: pathname,
          },
        });

        const redirectUrl = new URL("/auth/login", request.nextUrl.origin);

        if (redirectUrl.origin !== request.nextUrl.origin) {
          redirectUrl.host = request.nextUrl.host;
        }

        return NextResponse.redirect(redirectUrl);
      }
    }

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
  } catch (error) {
    Sentry.captureException(error, {
      tags: {
        category: "middleware",
        severity: "high",
      },
      contexts: {
        request: {
          url: request.nextUrl.pathname,
          method: request.method,
        },
      },
    });

    throw error;
  }
}

export const config = {
  matcher: [
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
