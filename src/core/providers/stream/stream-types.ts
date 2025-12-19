/**
 * Stream Types for Link Chat
 *
 * These types align with the Vercel AI SDK UI message format.
 */

import type { UIMessage } from "ai";
import type { UseChatHelpers } from "@ai-sdk/react";

export type { UIMessage };

/**
 * Stream context type that matches the interface expected by our components.
 * This is what useStreamContext() returns.
 */
export type StreamContextType = UseChatHelpers<UIMessage> & {
  threadId: string | null;
  isLoading: boolean;
};

/**
 * Props for the StreamSession component.
 */
export interface StreamSessionProps {
  children: React.ReactNode;
  apiUrl: string;
  assistantId: string;
}
