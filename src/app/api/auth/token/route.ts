import { NextResponse } from "next/server";
import { getAuth0 } from "@/features/auth/services/auth0";
import { getLogger } from "@/core/services/logging";

const logger = getLogger().child({
  component: "token-api",
  operation: "get_access_token",
});

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
    // Returns { token, expiresAt, scope }
    const { token, expiresAt } = await auth0.getAccessToken();

    return NextResponse.json({ token, expiresAt });
  } catch (error) {
    logger.error(error instanceof Error ? error : new Error(String(error)), {
      errorName: error instanceof Error ? error.name : "unknown",
    });

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
