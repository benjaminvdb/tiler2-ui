/**
 * Hook for consuming Server-Sent Events (SSE) streams
 * Handles connection lifecycle, error handling, and cleanup
 */

import { useCallback, useEffect, useRef, useState } from "react";

interface UseSseOptions {
  /**
   * Whether to automatically connect on mount
   * @default false
   */
  autoConnect?: boolean;

  /**
   * Custom headers to include in the SSE request
   */
  headers?: HeadersInit;

  /**
   * Callback when connection opens
   */
  onOpen?: () => void;

  /**
   * Callback when an error occurs
   */
  onError?: (error: Error) => void;

  /**
   * Callback when connection closes
   */
  onClose?: () => void;
}

interface UseSseResult {
  /**
   * The latest data received from the SSE stream
   */
  data: string | null;

  /**
   * Whether the connection is currently open
   */
  isConnected: boolean;

  /**
   * Whether an error has occurred
   */
  hasError: boolean;

  /**
   * Error message if an error occurred
   */
  error: string | null;

  /**
   * Connect to the SSE endpoint
   */
  connect: () => void;

  /**
   * Disconnect from the SSE endpoint
   */
  disconnect: () => void;
}

/**
 * Hook for consuming Server-Sent Events (SSE) streams
 * Provides automatic connection management and error handling
 *
 * @example
 * ```tsx
 * const { data, isConnected, connect, disconnect } = useSse(
 *   '/api/v1/threads/thread-123/generate-title',
 *   {
 *     autoConnect: true,
 *     headers: { Authorization: `Bearer ${token}` },
 *     onError: (error) => console.error('SSE error:', error),
 *   }
 * );
 * ```
 */
export const useSse = (
  url: string | null,
  options: UseSseOptions = {},
): UseSseResult => {
  const {
    autoConnect = false,
    headers,
    onOpen,
    onError,
    onClose,
  } = options;

  const [data, setData] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const eventSourceRef = useRef<EventSource | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const disconnect = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsConnected(false);
  }, []);

  const connect = useCallback(() => {
    if (!url) return;

    // Clean up existing connection
    disconnect();

    try {
      // Create abort controller for fetch
      abortControllerRef.current = new AbortController();

      // For authenticated SSE, we need to use fetch with EventSource polyfill
      // because native EventSource doesn't support custom headers
      const fetchSse = async (): Promise<void> => {
        try {
          const response = await fetch(url, {
            headers: {
              Accept: "text/event-stream",
              ...headers,
            },
            signal: abortControllerRef.current?.signal ?? null,
          });

          if (!response.ok) {
            throw new Error(`SSE connection failed: ${response.statusText}`);
          }

          if (!response.body) {
            throw new Error("Response body is null");
          }

          setIsConnected(true);
          onOpen?.();

          const reader = response.body.getReader();
          const decoder = new TextDecoder();

          // Read stream
          let buffer = "";
          // eslint-disable-next-line no-constant-condition
          while (true) {
            const { done, value } = await reader.read();

            if (done) {
              break;
            }

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split("\n");
            buffer = lines.pop() || "";

            for (const line of lines) {
              if (line.startsWith("data: ")) {
                const eventData = line.slice(6);

                // Check for error messages
                if (eventData.startsWith("[ERROR]")) {
                  const errorMessage = eventData.replace("[ERROR] ", "");
                  setError(errorMessage);
                  setHasError(true);
                  onError?.(new Error(errorMessage));
                } else {
                  setData(eventData);
                }
              }
            }
          }

          disconnect();
          onClose?.();
        } catch (err) {
          if (err instanceof Error && err.name === "AbortError") {
            // Expected abort, ignore
            return;
          }

          const errorMessage =
            err instanceof Error ? err.message : "Unknown SSE error";
          setError(errorMessage);
          setHasError(true);
          setIsConnected(false);
          onError?.(err instanceof Error ? err : new Error(errorMessage));
        }
      };

      void fetchSse();
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to connect to SSE";
      setError(errorMessage);
      setHasError(true);
      onError?.(err instanceof Error ? err : new Error(errorMessage));
    }
  }, [url, headers, disconnect, onOpen, onError, onClose]);

  // Auto-connect on mount if enabled
  useEffect(() => {
    if (autoConnect && url) {
      connect();
    }

    // Cleanup on unmount
    return () => {
      disconnect();
    };
  }, [autoConnect, url, connect, disconnect]);

  return {
    data,
    isConnected,
    hasError,
    error,
    connect,
    disconnect,
  };
};
