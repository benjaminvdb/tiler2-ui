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
      data?: string;
      url?: string;
      metadata?: MultimodalMetadata;
    }
  | {
      type: "file";
      mimeType: string;
      mime_type?: string;
      data?: string;
      url?: string;
      source_type?: string;
      metadata?: MultimodalMetadata;
    };

export type ContentBlocks = MultimodalContentBlock[];

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
