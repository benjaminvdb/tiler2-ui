import { DEFAULT_CLIENT_CONFIG } from "@/config/client";

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
): Promise<boolean> {
  try {
    const res = await fetch(`${apiUrl}/info`, {
      signal: signal || null,
      ...(apiKey && {
        headers: {
          "X-Api-Key": apiKey,
        },
      }),
    });

    return res.ok;
  } catch (e) {
    // Don't log aborted requests as errors
    if (e instanceof Error && e.name === "AbortError") {
      return false;
    }
    console.error(e);
    return false;
  }
}

export const DEFAULT_API_URL = DEFAULT_CLIENT_CONFIG.apiUrl;
export const DEFAULT_ASSISTANT_ID = DEFAULT_CLIENT_CONFIG.assistantId;
