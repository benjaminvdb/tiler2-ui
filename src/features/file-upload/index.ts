/**
 * File Upload Feature Public API
 * This is the only way other features should import from file upload
 */

// Main hook
export { useFileUpload } from "./hooks";

// Constants
export { SUPPORTED_FILE_TYPES } from "./hooks/constants";

// Types
export type {
  FileUploadState,
  ContentBlock,
  ContentBlocks,
  FileUploadOptions,
  FileValidationResult,
  FileHandler,
} from "./types";

// Components (when created)
// export { MultimodalPreview } from './components/MultimodalPreview';
// export { ContentBlocksPreview } from './components/ContentBlocksPreview';
