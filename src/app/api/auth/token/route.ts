import { NextResponse } from "next/server";
import { getAuth0 } from "@/features/auth/services/auth0";

/**
 * Server-side endpoint to securely retrieve access token
 * Token stays in encrypted session cookie - never exposed to browser storage
 *
 * Auth0 SDK automatically:
 * - Returns cached token if valid
 * - Refreshes token if expired (using refresh token)
 * - Updates session cookie with new token
 */
export async function GET() {
  const auth0 = getAuth0();

  if (!auth0) {
    return NextResponse.json(
      { error: "Auth0 not configured" },
      { status: 500 },
    );
  }

  try {
    // Get token from session - auto-refreshes if expired
    const { token } = await auth0.getAccessToken();

    return NextResponse.json({ token });
  } catch (error) {
    console.error("[Token API] Failed to get access token:", error);

    // Check if it's an Auth0-specific error
    if (error instanceof Error && error.name === "AccessTokenError") {
      return NextResponse.json({ error: "Session expired" }, { status: 401 });
    }

    return NextResponse.json(
      { error: "Failed to retrieve access token" },
      { status: 500 },
    );
  }
}
