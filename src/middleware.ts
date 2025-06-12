import { NextRequest } from "next/server";
import { auth0 } from "./lib/auth0";

export async function middleware(request: NextRequest) {
  // Handle Auth0 authentication routes
  const authRes = await auth0.middleware(request);

  // Authentication routes — let the middleware handle it
  if (request.nextUrl.pathname.startsWith("/auth")) {
    return authRes;
  }

  // Public routes — no need to check for session
  if (request.nextUrl.pathname.startsWith("/api")) {
    return authRes;
  }
  
  // Optional: If you want to keep the home page public, uncomment this
  // if (request.nextUrl.pathname === "/") {
  //   return authRes;
  // }

  // Get the user session
  const session = await auth0.getSession(request);

  // If no session, redirect to login
  if (!session) {
    const { origin } = new URL(request.url);
    return Response.redirect(`${origin}/auth/login`);
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
