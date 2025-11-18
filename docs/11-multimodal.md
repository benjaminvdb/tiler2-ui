# Multimodal Support

The multimodal system enables users to attach images and PDF documents to chat messages, allowing the AI to analyze visual content and documents alongside text queries.

## Why This Exists

Many sustainability tasks require analyzing visual information (charts, diagrams, site photos) or document content (reports, policies, regulations). Multimodal support allows users to upload these files directly in the chat, enabling the AI to provide contextual analysis and insights based on the visual/document content.

## Supported File Types

The system supports images and PDF documents.

**File Types:**
```typescript
export const SUPPORTED_FILE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "application/pdf",
];
```

**File:** `/home/user/tiler2-ui/src/features/file-upload/hooks/constants.ts`

### Image Support

**Formats:**
- JPEG (`.jpg`, `.jpeg`)
- PNG (`.png`)
- GIF (`.gif`)
- WebP (`.webp`)

**Use Cases:**
- Site photos
- Charts and graphs
- Diagrams and flowcharts
- Infographics
- Screenshots
- Maps

### PDF Support

**Format:** PDF (`.pdf`)

**Use Cases:**
- Reports and assessments
- Policies and procedures
- Regulations and standards
- Research papers
- Invoices and receipts
- Certificates

## File Upload Component

The file upload system is encapsulated in a custom hook.

**File:** `/home/user/tiler2-ui/src/features/file-upload/hooks/index.ts`

**Hook Interface:**
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

**Usage:**
```typescript
const {
  contentBlocks,
  handleFileUpload,
  handlePaste,
  removeBlock,
  dragOver,
  dropRef,
} = useFileUpload();

<div ref={dropRef}>
  <ContentBlocksPreview blocks={contentBlocks} onRemove={removeBlock} />
  <input type="file" onChange={handleFileUpload} />
  <textarea onPaste={handlePaste} />
</div>
```

## Drag-and-Drop Functionality

Users can drag files from their file system onto the chat input.

**File:** `/home/user/tiler2-ui/src/features/file-upload/hooks/drag-drop-handlers.ts`

**Implementation:**
```typescript
export function useDragDropHandlers({
  contentBlocks,
  setContentBlocks,
  setDragOver,
  containerRef,
}: UseDragDropHandlersProps) {
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleDragEnter = (e: DragEvent) => {
      e.preventDefault();
      setDragOver(true);
    };

    const handleDragOver = (e: DragEvent) => {
      e.preventDefault();
    };

    const handleDragLeave = (e: DragEvent) => {
      e.preventDefault();
      if (e.target === container) {
        setDragOver(false);
      }
    };

    const handleDrop = async (e: DragEvent) => {
      e.preventDefault();
      setDragOver(false);

      const files = e.dataTransfer?.files;
      if (!files) return;

      const fileArray = extractFilesFromSource(files);
      await processFiles(fileArray, contentBlocks, setContentBlocks);
    };

    container.addEventListener("dragenter", handleDragEnter);
    container.addEventListener("dragover", handleDragOver);
    container.addEventListener("dragleave", handleDragLeave);
    container.addEventListener("drop", handleDrop);

    return () => {
      container.removeEventListener("dragenter", handleDragEnter);
      container.removeEventListener("dragover", handleDragOver);
      container.removeEventListener("dragleave", handleDragLeave);
      container.removeEventListener("drop", handleDrop);
    };
  }, [contentBlocks, setContentBlocks, setDragOver, containerRef]);
}
```

**Visual Feedback:**
```typescript
<div className={cn(
  "rounded-lg border transition-all",
  dragOver
    ? "border-primary border-2 border-dotted"
    : "border-border"
)}>
  {/* Input area */}
</div>
```

## Clipboard Paste Support

Users can paste images directly from their clipboard.

**File:** `/home/user/tiler2-ui/src/features/file-upload/hooks/file-handlers.ts`

**Implementation:**
```typescript
const handlePaste = async (
  e: React.ClipboardEvent<HTMLTextAreaElement | HTMLInputElement>,
) => {
  const items = e.clipboardData.items;
  if (!items) return;

  const files = extractFilesFromSource(items);
  if (files.length === 0) return;

  e.preventDefault();

  await processFiles(files, contentBlocks, setContentBlocks, {
    showInvalidTypeError: false,
  });

  const invalidFiles = files.filter(
    (file) => !SUPPORTED_FILE_TYPES.includes(file.type),
  );
  if (invalidFiles.length > 0) {
    toast.error(ERROR_MESSAGES.INVALID_PASTE_TYPE);
  }
};
```

**Supported Sources:**
- Screenshots (Cmd/Ctrl+Shift+4 on Mac, Win+Shift+S on Windows)
- Copied images from web browsers
- Images from other applications
- PDF files (some applications)

**User Flow:**
1. Copy image to clipboard
2. Click in chat input
3. Press Cmd+V (Mac) or Ctrl+V (Windows)
4. Image appears as preview
5. Send message with image

## Base64 Encoding

Files are converted to base64 for transmission to the backend.

**File:** `/home/user/tiler2-ui/src/features/file-upload/hooks/file-processor.ts`

**Process:**
```typescript
async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // Remove data URL prefix (e.g., "data:image/png;base64,")
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

const processFile = async (file: File): Promise<MultimodalContentBlock> => {
  const base64Data = await fileToBase64(file);

  if (file.type === "application/pdf") {
    return {
      type: "file",
      mimeType: file.type,
      data: base64Data,
      metadata: {
        filename: file.name,
        size: file.size,
      },
    };
  } else {
    return {
      type: "image",
      mimeType: file.type,
      data: base64Data,
      metadata: {
        name: file.name,
        size: file.size,
      },
    };
  }
};
```

**Why Base64:**
1. Simple transmission in JSON
2. No separate file upload endpoint needed
3. Works with SSE streaming
4. Compatible with LangChain content blocks

## File Size Limits

The system enforces limits to prevent performance issues.

**Validation:** `/home/user/tiler2-ui/src/shared/utils/validation.ts`

**Limits:**
```typescript
export const fileUploadSchema = z.object({
  file: z
    .instanceof(File)
    .refine((file) => file.size <= 50 * 1024 * 1024, {
      message: "File size must be less than 50MB",
    }),
});

// Additional limits
const MAX_FILES_PER_MESSAGE = 10;
const MAX_TOTAL_SIZE = 50 * 1024 * 1024; // 50MB
```

**Enforcement:**
```typescript
const validateFiles = (
  files: File[],
  contentBlocks: MultimodalContentBlock[],
) => {
  // Check total count
  if (contentBlocks.length + files.length > MAX_FILES_PER_MESSAGE) {
    toast.error(`Maximum ${MAX_FILES_PER_MESSAGE} files per message`);
    return { validFiles: [], invalidFiles: files };
  }

  // Check total size
  const currentSize = contentBlocks.reduce(
    (sum, block) => sum + (block.metadata?.size || 0),
    0
  );
  const newSize = files.reduce((sum, file) => sum + file.size, 0);

  if (currentSize + newSize > MAX_TOTAL_SIZE) {
    toast.error("Total file size cannot exceed 50MB");
    return { validFiles: [], invalidFiles: files };
  }

  // Validate each file
  const validFiles = [];
  const invalidFiles = [];

  for (const file of files) {
    const result = validateInput(fileUploadSchema, { file });
    if (result.success) {
      validFiles.push(file);
    } else {
      invalidFiles.push(file);
    }
  }

  return { validFiles, invalidFiles };
};
```

**User Feedback:**
- Toast notification on limit exceeded
- Preview shows file size
- Upload disabled if limit reached

## Content Block Structure

Files are represented as content blocks following LangChain standards.

**Type Definitions:**
```typescript
/**
 * Multimodal content blocks representing uploaded files or images.
 * Conforms to LangChain's content block standard.
 */
export type MultimodalContentBlock =
  | LangChainContentBlock.Multimodal.Image
  | LangChainContentBlock.Multimodal.File;
```

**Image Block:**
```typescript
{
  type: "image",
  mimeType: "image/jpeg",
  data: "base64-encoded-data",
  metadata: {
    name: "photo.jpg",
    size: 1024000
  }
}
```

**File Block (PDF):**
```typescript
{
  type: "file",
  mimeType: "application/pdf",
  data: "base64-encoded-data",
  metadata: {
    filename: "report.pdf",
    size: 2048000
  }
}
```

**Integration with Messages:**
```typescript
const message = {
  type: "human",
  content: [
    { type: "text", text: "Analyze this sustainability report" },
    {
      type: "file",
      mimeType: "application/pdf",
      data: "base64...",
      metadata: { filename: "sustainability-report-2023.pdf" }
    }
  ]
};
```

## File Preview in Messages

Files display as preview thumbnails before sending.

**Component:** `/home/user/tiler2-ui/src/features/thread/components/content-blocks-preview.tsx`

**Preview Types:**

### Image Preview
```typescript
<div className="relative group">
  <img
    src={`data:${block.mimeType};base64,${block.data}`}
    alt={block.metadata?.name}
    className="max-h-32 rounded-lg object-cover"
  />
  <button
    onClick={() => onRemove(index)}
    className="absolute top-1 right-1 opacity-0 group-hover:opacity-100"
  >
    <X className="h-4 w-4" />
  </button>
</div>
```

### PDF Preview
```typescript
<div className="flex items-center gap-2 rounded-lg border bg-gray-50 p-3">
  <FileText className="h-8 w-8 text-red-500" />
  <div className="flex-1">
    <p className="text-sm font-medium">{block.metadata?.filename}</p>
    <p className="text-xs text-gray-500">
      {formatFileSize(block.metadata?.size)}
    </p>
  </div>
  <button onClick={() => onRemove(index)}>
    <X className="h-4 w-4" />
  </button>
</div>
```

**Features:**
- Thumbnail preview for images
- Icon + metadata for PDFs
- Remove button (hover on desktop, always visible on mobile)
- File size display
- Filename truncation for long names

## Duplicate Detection

The system prevents uploading the same file twice.

**File:** `/home/user/tiler2-ui/src/features/file-upload/hooks/validation.ts`

**Implementation:**
```typescript
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

**Logic:**
- Compare by filename and MIME type
- Toast error on duplicate detection
- Skip duplicate files automatically

**Error Message:**
```typescript
export const ERROR_MESSAGES = {
  DUPLICATE_FILES: (filenames: string[]) =>
    `Duplicate file(s) detected: ${filenames.join(", ")}. Each file can only be uploaded once per message.`,
};
```

## File Validation

Comprehensive validation ensures only supported files are processed.

**Validation Flow:**
```typescript
export const validateFiles = (
  files: File[],
  contentBlocks: MultimodalContentBlock[],
) => {
  // 1. Schema validation (size, type)
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

  // 2. Type validation (MIME type)
  const typeValidFiles = schemaValidFiles.filter((file) =>
    SUPPORTED_FILE_TYPES.includes(file.type),
  );
  const typeInvalidFiles = [
    ...schemaInvalidFiles,
    ...schemaValidFiles.filter(
      (file) => !SUPPORTED_FILE_TYPES.includes(file.type),
    ),
  ];

  // 3. Duplicate detection
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
```

**Validation Checks:**
1. File size ≤ 50MB
2. MIME type in supported list
3. Not a duplicate
4. Total files ≤ 10
5. Total size ≤ 50MB

**Error Handling:**
```typescript
const { validFiles, invalidFiles, duplicateFiles } = validateFiles(
  files,
  contentBlocks
);

if (invalidFiles.length > 0) {
  toast.error(ERROR_MESSAGES.INVALID_FILE_TYPE);
}

if (duplicateFiles.length > 0) {
  toast.error(ERROR_MESSAGES.DUPLICATE_FILES(
    duplicateFiles.map(f => f.name)
  ));
}
```

## Best Practices

### 1. Compress Large Images

```typescript
// Before upload
const compressImage = async (file: File): Promise<File> => {
  // Use canvas to compress
  const img = await loadImage(file);
  const canvas = document.createElement('canvas');
  // Resize and compress logic
  return compressedFile;
};
```

### 2. Show Upload Progress

```typescript
const [uploadProgress, setUploadProgress] = useState(0);

// For large files, show progress
{uploadProgress > 0 && uploadProgress < 100 && (
  <ProgressBar value={uploadProgress} />
)}
```

### 3. Clear Files After Send

```typescript
const handleSubmit = async () => {
  await sendMessage(input, contentBlocks);
  resetBlocks(); // Clear attached files
  setInput("");  // Clear text input
};
```

### 4. Validate Before Encoding

```typescript
// ✅ Good - Validate first
const { uniqueFiles } = validateFiles(files, contentBlocks);
const blocks = await Promise.all(uniqueFiles.map(processFile));

// ❌ Bad - Encode then validate
const blocks = await Promise.all(files.map(processFile));
const validBlocks = blocks.filter(validate);
```

## Common Patterns

### Multiple File Upload

```typescript
<input
  type="file"
  multiple
  accept="image/*,application/pdf"
  onChange={handleFileUpload}
/>
```

### Preview Grid

```typescript
<div className="grid grid-cols-4 gap-2">
  {contentBlocks.map((block, index) => (
    <FilePreview
      key={index}
      block={block}
      onRemove={() => removeBlock(index)}
    />
  ))}
</div>
```

### Loading State

```typescript
{isProcessingFiles ? (
  <div className="flex items-center gap-2">
    <Loader2 className="h-4 w-4 animate-spin" />
    <span>Processing files...</span>
  </div>
) : (
  <ContentBlocksPreview blocks={contentBlocks} />
)}
```

## Troubleshooting

### Files Not Uploading

**Check:**
1. File type is supported
2. File size under 50MB
3. Not exceeding 10 file limit
4. No duplicate filenames
5. Browser allows file reading

### Paste Not Working

**Check:**
1. Browser supports clipboard API
2. Image is in clipboard (not just file path)
3. Clipboard permissions granted
4. Using correct keyboard shortcut

### Preview Not Showing

**Check:**
1. Base64 encoding successful
2. Data URL format correct
3. Image not corrupted
4. CSS not hiding preview

## Security Considerations

### 1. File Type Validation

```typescript
// Server-side validation required
// Don't trust client MIME types
const validateMimeType = (buffer: Buffer): string => {
  // Use magic bytes to detect actual type
};
```

### 2. Size Limits

Enforce on both client and server:
```typescript
// Client
if (file.size > 50 * 1024 * 1024) {
  throw new Error("File too large");
}

// Server
if (base64.length > MAX_BASE64_SIZE) {
  throw new Error("Payload too large");
}
```

### 3. Sanitization

```typescript
// Sanitize filenames
const sanitizeFilename = (name: string): string => {
  return name.replace(/[^a-zA-Z0-9.-]/g, '_');
};
```

## Performance Optimization

### Lazy Loading Previews

```typescript
<img
  src={previewUrl}
  loading="lazy"
  alt={filename}
/>
```

### Image Compression

For large images, compress before encoding:
```typescript
const MAX_DIMENSION = 2048;
if (img.width > MAX_DIMENSION || img.height > MAX_DIMENSION) {
  // Resize to MAX_DIMENSION
}
```

### Debounced Processing

```typescript
const debouncedProcess = useDebounce(processFiles, 300);
```

## Related Documentation

- [Chat System](/home/user/tiler2-ui/docs/08-chat-system.md) - Chat input and message handling
- [Thread Management](/home/user/tiler2-ui/docs/09-thread-management.md) - Message storage
- [State Management](/home/user/tiler2-ui/docs/06-state-management.md) - Content block state

---

**Next:** [Human-in-the-Loop](/home/user/tiler2-ui/docs/12-human-in-loop.md)
