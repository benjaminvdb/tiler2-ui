import { reportStreamError } from "@/core/services/observability";
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

const HEALTH_CHECK_RETRY_CONFIG = {
  maxRetries: 3,
  baseDelay: 500,
  maxDelay: 4000,
};

const combineSignals = (
  timeoutSignal: AbortSignal,
  external?: AbortSignal,
): AbortSignal =>
  external ? AbortSignal.any([external, timeoutSignal]) : timeoutSignal;

const isAbortError = (error: unknown): error is Error =>
  error instanceof Error && error.name === "AbortError";

export async function checkGraphStatus(
  apiUrl: string,
  apiKey: string | null,
  signal?: AbortSignal,
  timeoutMs: number = 5000,
): Promise<boolean> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const combinedSignal = combineSignals(controller.signal, signal);
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
        ...HEALTH_CHECK_RETRY_CONFIG,
      },
    );

    return res.ok;
  } catch (e) {
    if (isAbortError(e)) {
      return false;
    }

    reportStreamError(e as Error, {
      operation: "checkGraphStatus",
      component: "stream-utils",
      skipNotification: true,
      additionalData: {
        url: `${apiUrl}/info`,
        hasApiKey: !!apiKey,
      },
    });
    return false;
  } finally {
    clearTimeout(timeoutId);
  }
}
