import { NextResponse } from "next/server";
import { getAuth0 } from "@/features/auth/services/auth0";
import { getLogger } from "@/core/services/logging";

const logger = getLogger().child({
  component: "token-api",
  operation: "get_access_token",
});

/**
 * Retrieve Auth0 access token from encrypted session cookie.
 * Auth0 SDK automatically handles token caching and refresh.
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
    const { token, expiresAt } = await auth0.getAccessToken();

    return NextResponse.json({ token, expiresAt });
  } catch (error) {
    logger.error(error instanceof Error ? error : new Error(String(error)), {
      errorName: error instanceof Error ? error.name : "unknown",
    });

    if (error instanceof Error && error.name === "AccessTokenError") {
      return NextResponse.json({ error: "Session expired" }, { status: 401 });
    }

    return NextResponse.json(
      { error: "Failed to retrieve access token" },
      { status: 500 },
    );
  }
}
