/**
 * Central type definitions for the application
 */

import type { ContentBlock as LangChainContentBlock } from "@langchain/core/messages";

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
 * Metadata about individual messages in the conversation.
 */
export interface MessageMetadata {
  id: string;
  timestamp: string;
  threadId?: string;
  parentCheckpoint?: string;
}
