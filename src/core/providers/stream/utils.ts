import { DEFAULT_CLIENT_CONFIG } from "@/core/config/client";
import { reportNetworkError } from "@/core/services/error-reporting";
import { fetchWithRetry } from "@/shared/utils/retry";

export async function sleep(ms = 4000, signal?: AbortSignal) {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(new DOMException("Aborted", "AbortError"));
      return;
    }

    const timeout = setTimeout(resolve, ms);

    signal?.addEventListener("abort", () => {
      clearTimeout(timeout);
      reject(new DOMException("Aborted", "AbortError"));
    });
  });
}

export async function checkGraphStatus(
  apiUrl: string,
  apiKey: string | null,
  signal?: AbortSignal,
  timeoutMs: number = 5000,
): Promise<boolean> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    // Combine external signal with timeout signal
    const combinedSignal = signal
      ? AbortSignal.any([signal, controller.signal])
      : controller.signal;

    // Use retry logic for health check (3 retries with 500ms base delay)
    const res = await fetchWithRetry(
      `${apiUrl}/info`,
      {
        signal: combinedSignal,
        ...(apiKey && {
          headers: {
            "X-Api-Key": apiKey,
          },
        }),
      },
      {
        maxRetries: 3,
        baseDelay: 500, // Fast retries for health checks
        maxDelay: 4000,
      },
    );

    return res.ok;
  } catch (e) {
    // Don't log aborted requests as errors
    if (e instanceof Error && e.name === "AbortError") {
      return false;
    }

    reportNetworkError(e as Error, {
      operation: "checkGraphStatus",
      component: "stream utilities",
      url: `${apiUrl}/info`,
    });
    return false;
  } finally {
    clearTimeout(timeoutId);
  }
}

export const DEFAULT_API_URL = DEFAULT_CLIENT_CONFIG.apiUrl;
export const DEFAULT_ASSISTANT_ID = DEFAULT_CLIENT_CONFIG.assistantId;
