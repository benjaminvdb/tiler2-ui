/**
 * Central type definitions for the application
 */

import type { ContentBlock as LangChainContentBlock } from "@langchain/core/messages";
import type { Message } from "@langchain/langgraph-sdk";

/**
 * Multimodal content blocks representing uploaded files or images.
 * Conforms to LangChain's content block standard for interoperability with LangGraph.
 */
export type MultimodalContentBlock =
  | LangChainContentBlock.Multimodal.Image
  | LangChainContentBlock.Multimodal.File;

export type ContentBlock = MultimodalContentBlock;
export type ContentBlocks = ContentBlock[];

/**
 * Represents a human-in-the-loop interrupt that pauses the AI workflow.
 * Allows the system to wait for user decision before proceeding.
 */
export interface InterruptItem {
  id: string;
  type: string;
  message?: string;
  data?: Record<string, unknown>;
  timestamp?: number;
}

/**
 * User's response to an interrupt, providing the args to resume the workflow.
 */
export interface InterruptResponse {
  type: "response";
  args: string;
}

/**
 * Context for rendering artifacts in the side panel.
 * Contains metadata about the artifact (code, document, etc) being displayed.
 */
export interface ArtifactContext {
  id?: string;
  type?: string;
  title?: string;
  content?: string;
  language?: string;
  [key: string]: unknown;
}

/**
 * Complete thread state including conversation history and UI state.
 * Synchronized with URL search params for browser history support.
 */
export interface ThreadState {
  threadId: string | null;
  messages: Message[];
  isLoading: boolean;
  error: string | null;
}

/**
 * Events triggered by user interactions in the chat input area.
 */
export interface FormSubmissionEvent {
  type: "submit" | "regenerate" | "action";
  data?: Record<string, unknown>;
}

/**
 * Type-safe JSON value that can be serialized/deserialized without loss.
 * More specific than `unknown` while maintaining flexibility.
 */
export type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue };

/**
 * Standard API response wrapper with consistent error/success handling.
 * @template T - Type of response data (defaults to JsonValue)
 */
export interface ApiResponse<T = JsonValue> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

/**
 * Application-wide configuration loaded from environment variables.
 * Contains endpoints and model identifiers.
 */
export interface AppConfig {
  apiUrl: string;
  assistantId: string;
  environment: "development" | "production";
}

/**
 * Tool invocation with arguments and optional result.
 * Follows LangChain's ToolCall standard for model compatibility.
 */
export interface ToolCall {
  id: string;
  name: string;
  args: Record<string, JsonValue>;
  result?: JsonValue;
}

/**
 * Generic utility types for improved type inference
 */

/**
 * Flattens union types for better IntelliSense and type inference.
 */
export type Prettify<T> = {
  [K in keyof T]: T[K];
} & {};

/**
 * Array type with guaranteed at least one element.
 * Useful for validating non-empty lists.
 */
export type NonEmptyArray<T> = [T, ...T[]];

/**
 * Makes specific keys in a type optional while keeping others required.
 */
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

/**
 * Serializable field values for form inputs and tool arguments.
 */
export type FieldValue =
  | string
  | number
  | boolean
  | FieldValue[]
  | { [key: string]: FieldValue };

/**
 * Configuration for a form field including type hints and validation rules.
 */
export interface FieldConfig {
  key: string;
  value: FieldValue;
  type?: "string" | "number" | "boolean" | "object" | "array";
  required?: boolean;
}

/**
 * Synchronous and asynchronous event handlers.
 */
export type EventHandler<T = Event> = (event: T) => void;
export type AsyncEventHandler<T = Event> = (event: T) => Promise<void>;

/**
 * Common props for UI components.
 */
export interface BaseComponentProps {
  className?: string | undefined;
  children?: React.ReactNode;
}

/**
 * Structured error information with context for debugging.
 */
export interface AppError {
  message: string;
  code?: string;
  stack?: string;
  context?: Record<string, JsonValue>;
}

/**
 * Metadata about a conversation thread.
 */
export interface ThreadMetadata {
  id: string;
  title?: string;
  createdAt: string;
  updatedAt: string;
  messageCount: number;
}

/**
 * Metadata about individual messages in the conversation.
 */
export interface MessageMetadata {
  id: string;
  timestamp: string;
  threadId?: string;
  parentCheckpoint?: string;
}
