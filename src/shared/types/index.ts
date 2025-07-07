/**
 * Central type definitions for the application
 */

import type { Base64ContentBlock } from "@langchain/core/messages";
import type { Message } from "@langchain/langgraph-sdk";

// File upload and content block types
export type ContentBlock = Base64ContentBlock;
export type ContentBlocks = ContentBlock[];

// Interrupt and action types
export interface InterruptItem {
  id: string;
  type: string;
  message?: string;
  data?: Record<string, unknown>;
  timestamp?: number;
}

export interface InterruptResponse {
  type: "response";
  args: string;
}

// Artifact context type
export interface ArtifactContext {
  id?: string;
  type?: string;
  title?: string;
  content?: string;
  language?: string;
  [key: string]: unknown;
}

// Thread state types (using LangGraph Message type)
export interface ThreadState {
  threadId: string | null;
  messages: Message[]; // From @langchain/langgraph-sdk
  isLoading: boolean;
  error: string | null;
}

// Form event types
export interface FormSubmissionEvent {
  type: "submit" | "regenerate" | "action";
  data?: Record<string, unknown>;
}

// JSON value type (more specific than unknown)
export type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue };

// API response types
export interface ApiResponse<T = JsonValue> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Configuration types
export interface AppConfig {
  apiUrl: string;
  assistantId: string;
  environment: "development" | "production";
}

// Note: Core Message types are imported from @langchain/langgraph-sdk
// Custom message extensions and tool call types
export interface ToolCall {
  id: string;
  name: string;
  args: Record<string, JsonValue>;
  result?: JsonValue;
}

// Generic utility types
export type Prettify<T> = {
  [K in keyof T]: T[K];
} & {};

export type NonEmptyArray<T> = [T, ...T[]];

export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

// Note: Stream state types are defined in @/core/providers/stream/types

// Value types for form fields and arguments
export type FieldValue =
  | string
  | number
  | boolean
  | FieldValue[]
  | { [key: string]: FieldValue };

export interface FieldConfig {
  key: string;
  value: FieldValue;
  type?: "string" | "number" | "boolean" | "object" | "array";
  required?: boolean;
}

// Event handler types
export type EventHandler<T = Event> = (event: T) => void;
export type AsyncEventHandler<T = Event> = (event: T) => Promise<void>;

// Component prop types
export interface BaseComponentProps {
  className?: string | undefined;
  children?: React.ReactNode;
}

// Error types
export interface AppError {
  message: string;
  code?: string;
  stack?: string;
  context?: Record<string, JsonValue>;
}

// Thread and message metadata types
export interface ThreadMetadata {
  id: string;
  title?: string;
  createdAt: string;
  updatedAt: string;
  messageCount: number;
}

export interface MessageMetadata {
  id: string;
  timestamp: string;
  threadId?: string;
  parentCheckpoint?: string;
}
