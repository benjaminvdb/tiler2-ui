import { env } from "@/env";

export function isAuth0Configured(): boolean {
  return !!(env.AUTH0_DOMAIN && env.AUTH0_CLIENT_ID);
}

export function getAuth0Config() {
  return {
    domain: env.AUTH0_DOMAIN,
    clientId: env.AUTH0_CLIENT_ID,
    audience: env.AUTH0_AUDIENCE,
  };
}

export const auth0 = null as any;
export const getAuth0 = () => null;
