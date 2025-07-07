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

// Types
export type {
  AuthUser,
  AuthState,
  AuthConfig,
  AuthSession,
  AuthorizationParams,
} from "./types";

// Hooks (to be created)
// export { useAuth } from './hooks/useAuth';
