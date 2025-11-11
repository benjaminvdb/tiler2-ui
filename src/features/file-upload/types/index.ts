/**
 * File Upload feature types
 */

import type { MultimodalContentBlock } from "@/shared/types";

export interface FileUploadState {
  contentBlocks: MultimodalContentBlock[];
  isLoading: boolean;
  dragOver: boolean;
  error: string | null;
}

export interface ContentBlock {
  type: string;
  data: string;
}

export type ContentBlocks = ContentBlock[];

export interface FileUploadOptions {
  initialBlocks?: MultimodalContentBlock[];
  maxFiles?: number;
  maxFileSize?: number;
  allowedTypes?: string[];
}

export interface FileValidationResult {
  isValid: boolean;
  error?: string;
}

export interface FileHandler {
  handleFileUpload: (files: FileList | File[]) => Promise<void>;
  handlePaste: (e: ClipboardEvent) => Promise<void>;
  removeBlock: (index: number) => void;
  resetBlocks: () => void;
}
