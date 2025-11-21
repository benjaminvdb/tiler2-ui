/**
 * Hook for saving insights with automatic authentication.
 *
 * Provides a convenient wrapper around the insights API with
 * loading states, error handling, and success feedback.
 */

import { useCallback, useState } from "react";
import { useAuthenticatedFetch } from "@/core/services/http-client";
import { createInsight } from "../services/insights-api";
import type { CreateInsightRequest, CreateInsightResponse } from "../types";

export interface UseSaveInsightReturn {
  /** Save an insight */
  saveInsight: (
    request: CreateInsightRequest,
  ) => Promise<CreateInsightResponse | null>;
  /** Whether a save is in progress */
  isSaving: boolean;
  /** Error from last save attempt */
  error: Error | null;
  /** Clear error state */
  clearError: () => void;
}

/**
 * Hook for saving insights with auth and error handling.
 *
 * @returns Save function and state
 *
 * @example
 * const { saveInsight, isSaving, error } = useSaveInsight();
 *
 * const handleSave = async () => {
 *   const insight = await saveInsight({
 *     thread_id: threadId,
 *     insight_content: selectedText,
 *     note: userNote
 *   });
 *   if (insight) {
 *     console.log('Saved:', insight.id);
 *   }
 * };
 */
export function useSaveInsight(): UseSaveInsightReturn {
  const fetch = useAuthenticatedFetch();
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const saveInsight = useCallback(
    async (
      request: CreateInsightRequest,
    ): Promise<CreateInsightResponse | null> => {
      setIsSaving(true);
      setError(null);

      try {
        const insight = await createInsight(fetch, request);
        return insight;
      } catch (err) {
        const error =
          err instanceof Error ? err : new Error("Failed to save insight");
        setError(error);
        return null;
      } finally {
        setIsSaving(false);
      }
    },
    [fetch],
  );

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    saveInsight,
    isSaving,
    error,
    clearError,
  };
}
