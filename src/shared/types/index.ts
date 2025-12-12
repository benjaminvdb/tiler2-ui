/**
 * Central type definitions for the application
 */

/**
 * Metadata for multimodal content blocks.
 * Supports both image and file metadata fields.
 */
export interface MultimodalMetadata {
  name?: string;
  filename?: string;
}

/**
 * Multimodal content blocks representing uploaded files or images.
 * Uses flat structure with mimeType at top level for file-upload compatibility.
 */
export type MultimodalContentBlock =
  | {
      type: "image";
      mimeType: string;
      mime_type?: string; // Python backend expects snake_case
      data: string;
      metadata?: MultimodalMetadata;
    }
  | {
      type: "file";
      mimeType: string;
      mime_type?: string;
      data: string;
      source_type?: string;
      metadata?: MultimodalMetadata;
    };

export type ContentBlocks = MultimodalContentBlock[];

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
