/**
 * Authentication Feature Public API
 * This is the only way other features should import from auth
 */

// Components
export { AuthButtons } from "./components";

// Services (re-export main functions)
export { getAuth0, isAuth0Configured, getAuth0Config } from "./services/auth0";
export { AUTH0_CONFIG } from "./services/auth0-config";

// Configuration
export {
  calculateTokenTimings,
  DEFAULT_LATENCY_BUFFER_SECONDS,
} from "./config/token-config";
export type { TokenTimings } from "./config/token-config";

// Utilities
export {
  handleTokenError,
  isAccessTokenError,
  withTokenErrorHandling,
  withSyncTokenErrorHandling,
} from "./utils/token-error-handler";
export type { TokenErrorContext } from "./utils/token-error-handler";
export { checkTokenExpiry, decodeJwt, getTokenInfo } from "./utils/token-utils";

// Types
export type {
  AuthUser,
  AuthState,
  AuthConfig,
  AuthSession,
  AuthorizationParams,
} from "./types";

// Hooks
export { useAccessToken } from "./hooks/use-access-token";
