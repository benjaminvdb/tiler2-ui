import { headers } from "next/headers";

/**
 * Hook to get the CSP nonce from middleware
 * Use this in Server Components to access the nonce
 */
export async function useCSPNonce(): Promise<string | null> {
  const headersList = await headers();
  return headersList.get("x-nonce");
}