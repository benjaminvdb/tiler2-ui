/**
 * Auth0 session and authorization configuration
 * Defines session behavior, cookie settings, and authorization parameters
 */

export const AUTH0_CONFIG = {
  session: {
    rollingDuration: 24 * 60 * 60, // 24 hours
    absoluteDuration: 7 * 24 * 60 * 60, // 7 days
    cookie: {
      secure: import.meta.env.MODE === "production",
      sameSite: "lax" as const,
      httpOnly: true,
    },
  },
  authorizationParams: {
    scope: "openid profile email offline_access",
  },
};
