"use client";

import { useMemo } from "react";
import { useSearchParamState } from "@/core/routing/hooks";
import { getClientConfig } from "./client";

/**
 * Returns the effective API configuration, prioritizing values stored in the
 * URL search params (set via the onboarding form) and falling back to the
 * build-time defaults when not present.
 */
export function useRuntimeClientConfig() {
  const clientConfig = getClientConfig();
  const [apiUrlParam] = useSearchParamState("apiUrl");
  const [assistantIdParam] = useSearchParamState("assistantId");

  return useMemo(
    () => ({
      apiUrl: apiUrlParam || clientConfig.apiUrl,
      assistantId: assistantIdParam || clientConfig.assistantId,
    }),
    [apiUrlParam, assistantIdParam, clientConfig.apiUrl, clientConfig.assistantId],
  );
}
