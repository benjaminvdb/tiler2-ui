/**
 * Auth0 session and authorization configuration
 * Defines session behavior, cookie settings, and authorization parameters
 */

const SECONDS_PER_HOUR = 60 * 60;
const SECONDS_PER_DAY = SECONDS_PER_HOUR * 24;

export const AUTH0_CONFIG = {
  session: {
    rollingDuration: 24 * SECONDS_PER_HOUR,
    absoluteDuration: 7 * SECONDS_PER_DAY,
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
