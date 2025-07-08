/**
 * Authentication Feature Public API
 * This is the only way other features should import from auth
 */

// Components
export { AuthButtons } from "./components";

// Services (re-export main functions)
export {
  getAuth0,
  validateAuth0Config,
  isAuth0Configured,
  auth0Middleware,
  getAuth0Session,
  getAuth0Client,
} from "./services/auth0";
export { AUTH0_CONFIG } from "./services/auth0-config";

// Utilities
export {
  handleTokenError,
  isAccessTokenError,
  withTokenErrorHandling,
  withSyncTokenErrorHandling,
} from "./utils/token-error-handler";
export type { TokenErrorContext } from "./utils/token-error-handler";

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
