/**
 * AG-UI Protocol Types for Link Chat
 *
 * This module defines types that bridge the AG-UI protocol with our existing UI components.
 * The goal is to maintain the same interface that components expect while using AG-UI under the hood.
 */

import type { Message as AGUIMessage, ToolCall } from "@ag-ui/core";
import { Source } from "@/features/thread/components/markdown/components/citation-link";

/**
 * Content block type matching our existing multimodal content format.
 * Supports text, binary (images), image_url, and tool_use types.
 */
export type ContentBlock =
  | { type: "text"; text: string }
  | { type: "binary"; mimeType: string; data?: string; url?: string }
  | { type: "image_url"; image_url: { url: string } }
  | { type: "tool_use"; id: string; name: string; input?: string };

/**
 * UI Message type that our components expect.
 * This is the canonical message format used throughout the frontend.
 */
export interface UIMessage {
  id: string;
  type: "human" | "ai" | "tool";
  content: string | ContentBlock[];
  tool_calls?: ToolCall[];
  tool_call_id?: string;
  name?: string;
}

/**
 * Graph state that components receive from the stream context.
 */
export interface GraphState {
  messages: UIMessage[];
  sources?: Source[];
}

/**
 * Configuration for submitting messages to the agent.
 */
export interface SubmitConfig {
  threadId?: string;
  metadata?: Record<string, unknown>;
  context?: Record<string, unknown>;
  optimisticValues?: (prev: GraphState) => GraphState;
  // Config for LangGraph compatibility (workflow_id, task_id, etc.)
  config?: {
    configurable?: Record<string, unknown>;
  };
  // Stream configuration
  streamMode?: string[];
  streamSubgraphs?: boolean;
}

/**
 * Submit data containing messages and optional context.
 */
export interface SubmitData {
  messages: UIMessage[];
  context?: Record<string, unknown>;
}

/**
 * Stream context type that matches the interface expected by our components.
 * This is what useStreamContext() returns.
 */
export interface StreamContextType {
  // Core state
  messages: UIMessage[];
  isLoading: boolean;
  error: Error | null;
  threadId: string | null;
  currentRunId: string | null;

  // Values object for backward compatibility with LangGraph SDK pattern
  // Components access sources via thread.values?.sources
  values: GraphState;

  // Actions
  submit: (data: SubmitData | null, config?: SubmitConfig) => void;
  stop: () => void;

  // State management
  clearError: () => void;
  retryStream: () => Promise<void>;
  setMessages: (messages: UIMessage[]) => void;
}

/**
 * Props for the StreamSession component.
 */
export interface StreamSessionProps {
  children: React.ReactNode;
  apiUrl: string;
  assistantId: string;
}

/**
 * Re-export AG-UI types that we use directly.
 */
export type { AGUIMessage, ToolCall };
