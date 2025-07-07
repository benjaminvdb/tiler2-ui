/**
 * Authentication feature types
 */

export interface AuthUser {
  id: string;
  name?: string | null;
  email?: string | null;
  picture?: string | null;
}

export interface AuthState {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
}

export interface AuthConfig {
  domain: string;
  clientId: string;
  clientSecret: string;
  secret: string;
  baseUrl: string;
  audience?: string;
}

export interface AuthSession {
  rollingDuration: number;
  absoluteDuration: number;
  cookie: {
    secure: boolean;
    sameSite: "lax" | "strict" | "none";
    httpOnly: boolean;
  };
}

export interface AuthorizationParams {
  scope: string;
  audience?: string;
  redirect_uri?: string;
}
