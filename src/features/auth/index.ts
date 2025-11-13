/**
 * Authentication Feature Public API
 * This is the only way other features should import from auth
 */

export { AuthButtons } from "./components";

export { getAuth0, isAuth0Configured, getAuth0Config } from "./services/auth0";
export { AUTH0_CONFIG } from "./services/auth0-config";

export {
  calculateTokenTimings,
  DEFAULT_LATENCY_BUFFER_SECONDS,
} from "./config/token-config";
export type { TokenTimings } from "./config/token-config";

export {
  handleTokenError,
  isAccessTokenError,
  withTokenErrorHandling,
  withSyncTokenErrorHandling,
} from "./utils/token-error-handler";
export type { TokenErrorContext } from "./utils/token-error-handler";
export { checkTokenExpiry, decodeJwt, getTokenInfo } from "./utils/token-utils";

export type {
  AuthUser,
  AuthState,
  AuthConfig,
  AuthSession,
  AuthorizationParams,
} from "./types";

export { useAccessToken } from "./hooks/use-access-token";
