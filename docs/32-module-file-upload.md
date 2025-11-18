# File Upload Module

## Overview

The file-upload module (`/home/user/tiler2-ui/src/features/file-upload/`) provides comprehensive file upload functionality including drag-and-drop, paste support, file validation, base64 encoding, and duplicate detection. It supports images (JPEG, PNG, GIF, WebP) and PDFs, converting them to multimodal content blocks for AI processing.

**Purpose**: Handle all file upload operations, validate files, prevent duplicates, provide visual feedback, and convert files to the format required by the AI backend (base64-encoded multimodal content blocks).

## Directory Structure

```
src/features/file-upload/
├── hooks/
│   ├── constants.ts                  # Supported file types and error messages
│   ├── debounce.ts                   # Debounce utility
│   ├── drag-drop-handlers.ts         # Drag-and-drop event handlers
│   ├── file-handlers.ts              # File upload and paste handlers
│   ├── file-processor.ts             # File validation and processing
│   ├── index.ts                      # useFileUpload hook
│   ├── use-file-upload.tsx           # Main hook export
│   └── validation.ts                 # File validation logic
├── services/
│   └── multimodal-utils.ts           # Base64 encoding and conversion
├── types/
│   └── index.ts                      # TypeScript types
└── index.ts                          # Public API exports
```

## Core Concepts

### Why This Module Exists

1. **Multimodal Support**: Enable users to attach images and PDFs to messages
2. **File Validation**: Ensure only supported file types are uploaded
3. **Duplicate Prevention**: Prevent uploading the same file multiple times
4. **Drag-and-Drop UX**: Intuitive drag-and-drop interface
5. **Paste Support**: Paste images from clipboard
6. **Base64 Encoding**: Convert files to format required by AI backend
7. **Error Handling**: User-friendly error messages
8. **Performance**: Debounced processing to handle rapid uploads

## Key Components

### 1. useFileUpload Hook

**File**: `/home/user/tiler2-ui/src/features/file-upload/hooks/index.ts`

The main hook that provides all file upload functionality:

```typescript
interface UseFileUploadOptions {
  initialBlocks?: MultimodalContentBlock[];
}

export function useFileUpload({
  initialBlocks = [],
}: UseFileUploadOptions = {}) {
  const [contentBlocks, setContentBlocks] =
    useState<MultimodalContentBlock[]>(initialBlocks);
  const dropRef = useRef<HTMLDivElement>(null);
  const [dragOver, setDragOver] = useState(false);

  useDragDropHandlers({
    contentBlocks,
    setContentBlocks,
    setDragOver,
    containerRef: dropRef,
  });

  const { handleFileUpload, handlePaste, removeBlock, resetBlocks } =
    useFileHandlers({
      contentBlocks,
      setContentBlocks,
    });

  return {
    contentBlocks,
    setContentBlocks,
    handleFileUpload,
    dropRef,
    removeBlock,
    resetBlocks,
    dragOver,
    handlePaste,
  };
}
```

**Returns**:
- `contentBlocks`: Array of uploaded file content blocks
- `setContentBlocks`: Setter for content blocks
- `handleFileUpload`: Handler for file input changes
- `dropRef`: Ref for drag-and-drop container
- `removeBlock`: Function to remove a specific block
- `resetBlocks`: Function to clear all blocks
- `dragOver`: Whether files are being dragged over
- `handlePaste`: Handler for paste events

**Usage Example**:
```typescript
function ChatInput() {
  const {
    contentBlocks,
    handleFileUpload,
    removeBlock,
    dropRef,
    dragOver,
    handlePaste
  } = useFileUpload();

  return (
    <div
      ref={dropRef}
      className={cn("input-container", dragOver && "drag-over")}
    >
      <input
        type="file"
        onChange={handleFileUpload}
        accept="image/*,application/pdf"
      />
      <textarea onPaste={handlePaste} />

      {contentBlocks.map((block, idx) => (
        <FilePreview
          key={idx}
          block={block}
          onRemove={() => removeBlock(idx)}
        />
      ))}
    </div>
  );
}
```

### 2. File Validation

**File**: `/home/user/tiler2-ui/src/features/file-upload/hooks/validation.ts`

Validates files for type, duplicates, and schema compliance:

```typescript
export const validateFiles = (
  files: File[],
  contentBlocks: MultimodalContentBlock[],
) => {
  // Schema validation (size, type, etc.)
  const schemaValidFiles: File[] = [];
  const schemaInvalidFiles: File[] = [];

  files.forEach((file) => {
    const validation = validateInput(fileUploadSchema, { file });
    if (validation.success) {
      schemaValidFiles.push(file);
    } else {
      schemaInvalidFiles.push(file);
    }
  });

  // Type validation (supported MIME types)
  const typeValidFiles = schemaValidFiles.filter((file) =>
    SUPPORTED_FILE_TYPES.includes(file.type),
  );
  const typeInvalidFiles = [
    ...schemaInvalidFiles,
    ...schemaValidFiles.filter(
      (file) => !SUPPORTED_FILE_TYPES.includes(file.type),
    ),
  ];

  // Duplicate detection
  const duplicateFiles = typeValidFiles.filter((file) =>
    isDuplicate(file, contentBlocks),
  );
  const uniqueFiles = typeValidFiles.filter(
    (file) => !isDuplicate(file, contentBlocks),
  );

  return {
    validFiles: typeValidFiles,
    invalidFiles: typeInvalidFiles,
    duplicateFiles,
    uniqueFiles,
  };
};

export const isDuplicate = (
  file: File,
  blocks: MultimodalContentBlock[],
): boolean => {
  if (file.type === "application/pdf") {
    return blocks.some(
      (b) =>
        b.type === "file" &&
        b.mimeType === "application/pdf" &&
        b.metadata?.filename === file.name,
    );
  }
  if (SUPPORTED_FILE_TYPES.includes(file.type)) {
    return blocks.some(
      (b) =>
        b.type === "image" &&
        b.metadata?.name === file.name &&
        b.mimeType === file.type,
    );
  }
  return false;
};
```

**Validation Steps**:
1. **Schema Validation**: Check file size and basic properties
2. **Type Validation**: Ensure file type is in supported list
3. **Duplicate Detection**: Check if file already uploaded (by name and type)
4. **Categorization**: Separate valid, invalid, duplicate, and unique files

### 3. File Processing

**File**: `/home/user/tiler2-ui/src/features/file-upload/hooks/file-processor.ts`

Processes validated files and converts them to content blocks:

```typescript
async function processFilesInternal(
  files: File[],
  contentBlocks: MultimodalContentBlock[],
  setContentBlocks: React.Dispatch<
    React.SetStateAction<MultimodalContentBlock[]>
  >,
  options: FileProcessingOptions = {},
): Promise<void> {
  const { showDuplicateError = true, showInvalidTypeError = true } = options;

  if (files.length === 0) return;

  const { invalidFiles, duplicateFiles, uniqueFiles } = validateFiles(
    files,
    contentBlocks,
  );

  // Show error toasts
  if (showInvalidTypeError && invalidFiles.length > 0) {
    toast.error(ERROR_MESSAGES.INVALID_FILE_TYPE);
  }
  if (showDuplicateError && duplicateFiles.length > 0) {
    toast.error(
      ERROR_MESSAGES.DUPLICATE_FILES(duplicateFiles.map((f) => f.name)),
    );
  }

  // Process unique files
  if (uniqueFiles.length > 0) {
    try {
      const newBlocks = await Promise.all(uniqueFiles.map(fileToContentBlock));
      setContentBlocks((prev) => [...prev, ...newBlocks]);
    } catch (error) {
      logger.error(error instanceof Error ? error : new Error(String(error)), {
        operation: "process_files",
        additionalData: { fileCount: uniqueFiles.length },
      });
      toast.error("Failed to process one or more files. Please try again.");
    }
  }
}

const FILE_DEBOUNCE_MS = 300;
export const processFiles = debounce(processFilesInternal, FILE_DEBOUNCE_MS);
```

**Features**:
- Validates all files before processing
- Shows appropriate error messages
- Converts files to base64 content blocks in parallel
- Debounced to handle rapid uploads
- Error logging for failed conversions

### 4. Base64 Encoding

**File**: `/home/user/tiler2-ui/src/features/file-upload/services/multimodal-utils.ts`

Converts files to base64-encoded multimodal content blocks:

```typescript
const IMAGE_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
] as const;

const SUPPORTED_MIME_TYPES = [...IMAGE_MIME_TYPES, "application/pdf"] as const;

export const fileToContentBlock = async (
  file: File,
): Promise<MultimodalContentBlock> => {
  if (!isSupportedMimeType(file.type)) {
    const supportedList = SUPPORTED_MIME_TYPES.join(", ");
    const message = `Unsupported file type: ${file.type}. Supported types: ${supportedList}`;
    toast.error(message);
    throw new Error(message);
  }

  const data = await fileToBase64(file);

  if (IMAGE_MIME_TYPES.includes(file.type as (typeof IMAGE_MIME_TYPES)[number])) {
    return {
      type: "image",
      mimeType: file.type,
      mime_type: file.type, // Python backend expects snake_case
      data,
    } as MultimodalContentBlock;
  }

  return {
    type: "file",
    mimeType: "application/pdf",
    mime_type: "application/pdf", // Python backend expects snake_case
    data,
    source_type: "base64", // Tell Python backend we're using v0 format
  } as MultimodalContentBlock;
};

export const fileToBase64 = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      const [, base64] = result.split(","); // Remove data URL prefix
      resolve(base64 ?? "");
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};
```

**Content Block Format**:

**Image Block**:
```typescript
{
  type: "image",
  mimeType: "image/jpeg",
  mime_type: "image/jpeg",  // snake_case for Python backend
  data: "base64encodeddata..."
}
```

**PDF Block**:
```typescript
{
  type: "file",
  mimeType: "application/pdf",
  mime_type: "application/pdf",  // snake_case for Python backend
  data: "base64encodeddata...",
  source_type: "base64"  // Tells backend this is base64 format
}
```

### 5. Drag-and-Drop Handlers

**File**: `/home/user/tiler2-ui/src/features/file-upload/hooks/drag-drop-handlers.ts`

Handles drag-and-drop events:

```typescript
export function useDragDropHandlers({
  contentBlocks,
  setContentBlocks,
  setDragOver,
  containerRef,
}: UseDragDropHandlersOptions) {
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleDragEnter = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragOver(true);
    };

    const handleDragLeave = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (e.currentTarget === container) {
        setDragOver(false);
      }
    };

    const handleDragOver = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
    };

    const handleDrop = async (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragOver(false);

      const files = extractFilesFromSource(e.dataTransfer?.items);
      await processFiles(files, contentBlocks, setContentBlocks);
    };

    container.addEventListener('dragenter', handleDragEnter);
    container.addEventListener('dragleave', handleDragLeave);
    container.addEventListener('dragover', handleDragOver);
    container.addEventListener('drop', handleDrop);

    return () => {
      container.removeEventListener('dragenter', handleDragEnter);
      container.removeEventListener('dragleave', handleDragLeave);
      container.removeEventListener('dragover', handleDragOver);
      container.removeEventListener('drop', handleDrop);
    };
  }, [contentBlocks, setContentBlocks, setDragOver, containerRef]);
}
```

**Features**:
- Prevents default browser behavior
- Visual feedback with `dragOver` state
- Extracts files from drag event
- Processes dropped files

### 6. Paste Handler

**File**: `/home/user/tiler2-ui/src/features/file-upload/hooks/file-handlers.ts`

Handles pasting images from clipboard:

```typescript
export function useFileHandlers({
  contentBlocks,
  setContentBlocks,
}: UseFileHandlersOptions) {
  const handlePaste = useCallback(
    async (e: React.ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      const files: File[] = [];
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item.kind === 'file') {
          const file = item.getAsFile();
          if (file) files.push(file);
        }
      }

      if (files.length > 0) {
        e.preventDefault(); // Prevent pasting file path as text
        await processFiles(files, contentBlocks, setContentBlocks, {
          showInvalidTypeError: true,
        });
      }
    },
    [contentBlocks, setContentBlocks],
  );

  return { handlePaste, /* ... */ };
}
```

**Usage**:
```typescript
<textarea onPaste={handlePaste} />
```

When user pastes an image (e.g., from screenshot), it's automatically uploaded.

## Supported File Types

**File**: `/home/user/tiler2-ui/src/features/file-upload/hooks/constants.ts`

```typescript
export const SUPPORTED_FILE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "application/pdf",
];

export const ERROR_MESSAGES = {
  INVALID_FILE_TYPE:
    "You have uploaded invalid file type. Please upload a JPEG, PNG, GIF, WEBP image or a PDF.",
  INVALID_PASTE_TYPE:
    "You have pasted an invalid file type. Please paste a JPEG, PNG, GIF, WEBP image or a PDF.",
  DUPLICATE_FILES: (filenames: string[]) =>
    `Duplicate file(s) detected: ${filenames.join(", ")}. Each file can only be uploaded once per message.`,
} as const;
```

## Types and Interfaces

**File**: `/home/user/tiler2-ui/src/features/file-upload/types/index.ts`

```typescript
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
```

## Public API

**File**: `/home/user/tiler2-ui/src/features/file-upload/index.ts`

```typescript
export { useFileUpload } from "./hooks";
export { SUPPORTED_FILE_TYPES } from "./hooks/constants";
export type {
  FileUploadState,
  ContentBlock,
  ContentBlocks,
  FileUploadOptions,
  FileValidationResult,
  FileHandler,
} from "./types";
```

## Integration with Other Modules

### Chat Module Integration

File upload is used in the chat input:

```typescript
import { useFileUpload } from '@/features/file-upload';
import { useChatContext } from '@/features/chat';

function ChatInput() {
  const {
    contentBlocks,
    handleFileUpload,
    removeBlock,
    dropRef,
    dragOver,
    handlePaste
  } = useFileUpload();

  const { onSubmit } = useChatContext();

  const handleSubmitWithFiles = (e: React.FormEvent) => {
    // Submit message with content blocks
    onSubmit(e, contentBlocks);
    resetBlocks();
  };

  return (
    <div ref={dropRef} className={dragOver ? "drag-over" : ""}>
      <input type="file" onChange={handleFileUpload} />
      <textarea onPaste={handlePaste} />
      <FilePreviewList blocks={contentBlocks} onRemove={removeBlock} />
      <button onClick={handleSubmitWithFiles}>Send</button>
    </div>
  );
}
```

### Thread Module Integration

Thread messages display uploaded files:

```typescript
import { MultimodalPreview } from '@/features/thread';

function HumanMessage({ message }) {
  const { content } = message;

  return (
    <div>
      {Array.isArray(content) && content.map((block, idx) => (
        block.type === 'image' || block.type === 'file' ? (
          <MultimodalPreview key={idx} block={block} />
        ) : (
          <p key={idx}>{block.text}</p>
        )
      ))}
    </div>
  );
}
```

## Common Patterns

### File Upload with Preview

```typescript
function FileUploadWithPreview() {
  const {
    contentBlocks,
    handleFileUpload,
    removeBlock,
    dragOver,
    dropRef
  } = useFileUpload();

  return (
    <div
      ref={dropRef}
      className={cn(
        "border-2 border-dashed rounded-lg p-8",
        dragOver && "border-blue-500 bg-blue-50"
      )}
    >
      <input
        type="file"
        onChange={handleFileUpload}
        multiple
        accept="image/*,application/pdf"
        className="hidden"
        id="file-upload"
      />
      <label htmlFor="file-upload">
        Upload files or drag and drop
      </label>

      {contentBlocks.length > 0 && (
        <div className="mt-4 grid grid-cols-3 gap-2">
          {contentBlocks.map((block, idx) => (
            <div key={idx} className="relative">
              {block.type === 'image' ? (
                <img
                  src={`data:${block.mimeType};base64,${block.data}`}
                  alt="Upload"
                  className="w-full h-24 object-cover rounded"
                />
              ) : (
                <div className="w-full h-24 bg-gray-100 rounded flex items-center justify-center">
                  <FileIcon className="w-8 h-8" />
                </div>
              )}
              <button
                onClick={() => removeBlock(idx)}
                className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

### Paste Image from Clipboard

```typescript
function PasteImageExample() {
  const { handlePaste, contentBlocks } = useFileUpload();

  return (
    <div>
      <textarea
        onPaste={handlePaste}
        placeholder="Paste an image here..."
      />
      {contentBlocks.length > 0 && (
        <p>Pasted {contentBlocks.length} image(s)</p>
      )}
    </div>
  );
}
```

### Programmatic File Upload

```typescript
function ProgrammaticUpload() {
  const { setContentBlocks } = useFileUpload();

  const uploadFromUrl = async (url: string) => {
    const response = await fetch(url);
    const blob = await response.blob();
    const file = new File([blob], 'image.jpg', { type: 'image/jpeg' });

    const block = await fileToContentBlock(file);
    setContentBlocks((prev) => [...prev, block]);
  };

  return (
    <button onClick={() => uploadFromUrl('https://example.com/image.jpg')}>
      Upload from URL
    </button>
  );
}
```

## Best Practices

1. **Always Validate**: Use built-in validation before processing
2. **Show Feedback**: Display drag-over state and error toasts
3. **Handle Errors**: Catch and log file conversion errors
4. **Debounce**: File processing is already debounced
5. **Remove Files**: Provide UI to remove uploaded files
6. **Reset on Submit**: Clear content blocks after sending message
7. **Preview**: Show previews of uploaded images/PDFs
8. **Accessibility**: Label file inputs and provide keyboard access

## Performance Considerations

1. **Debouncing**: 300ms debounce prevents rapid processing
2. **Parallel Processing**: Multiple files processed concurrently
3. **Base64 Encoding**: Async to avoid blocking UI
4. **Memory**: Base64 increases file size by ~33%
5. **Cleanup**: Remove blocks after message sent

## Error Handling

```typescript
// Invalid file type
toast.error("You have uploaded invalid file type. Please upload a JPEG, PNG, GIF, WEBP image or a PDF.");

// Duplicate file
toast.error("Duplicate file(s) detected: image.jpg. Each file can only be uploaded once per message.");

// Processing error
toast.error("Failed to process one or more files. Please try again.");
```

All errors are logged to the observability service with operation context.

## Next Steps

**Next**: [Hotkeys Module](/home/user/tiler2-ui/docs/33-module-hotkeys.md) - Learn about keyboard shortcuts, platform detection, and hotkey management for improved accessibility and power user workflows
