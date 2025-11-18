# Thread Module

## Overview

The thread module (`/home/user/tiler2-ui/src/features/thread/`) is the **largest and most complex module** in the application. It handles thread management, message rendering, markdown formatting, multimodal content display, tool calls, interrupts, and the complete chat UI. This module orchestrates the entire conversation experience.

**Purpose**: Provide comprehensive thread management and message rendering, including human messages, AI messages, tool calls, interrupts, markdown rendering, multimodal content (images, PDFs), branch navigation, and message editing capabilities.

## Directory Structure

```
src/features/thread/
├── components/
│   ├── chat-input-components/              # Chat input UI components
│   │   ├── components/
│   │   │   ├── action-buttons.tsx          # Send/cancel buttons
│   │   │   ├── container.tsx               # Input container
│   │   │   ├── controls-section.tsx        # Controls row
│   │   │   ├── file-upload.tsx             # File upload button
│   │   │   ├── interrupt-indicator.tsx     # Interrupt state indicator
│   │   │   ├── textarea-input.tsx          # Auto-resize textarea
│   │   │   └── tool-calls-toggle.tsx       # Show/hide tool calls toggle
│   │   ├── index.tsx                       # Main chat input component
│   │   └── types.ts                        # Input component types
│   ├── hooks/
│   │   ├── use-thread-effects.ts           # Thread lifecycle effects
│   │   ├── use-thread-handlers.ts          # Thread event handlers
│   │   │   └── handlers/
│   │   │       ├── action-handler.ts       # Action click handler
│   │   │       ├── regenerate-handler.ts   # Regenerate handler
│   │   │       ├── submit-handler.ts       # Submit handler
│   │   │       └── utils/
│   │   │           └── message-builder.ts  # Message construction
│   │   └── use-thread-state.ts             # Thread state management
│   ├── layout/
│   │   ├── artifact-panel.tsx              # Artifact side panel
│   │   ├── chat-footer.tsx                 # Chat input footer
│   │   ├── main-chat-area.tsx              # Main chat area container
│   │   │   ├── components/
│   │   │   │   ├── animated-container.tsx  # Animation wrapper
│   │   │   │   └── scrollable-content.tsx  # Scrollable content area
│   │   │   └── utils/
│   │   │       └── layout-styles.ts        # Layout style utilities
│   │   └── message-list.tsx                # Message list component
│   ├── markdown/
│   │   ├── components/
│   │   │   ├── citation-link.tsx           # Citation links
│   │   │   ├── code.tsx                    # Code blocks with syntax highlighting
│   │   │   ├── index.tsx                   # Component exports
│   │   │   ├── markdown-elements.tsx       # Custom markdown elements
│   │   │   └── table.tsx                   # Table rendering
│   │   ├── index.tsx                       # Markdown renderer
│   │   ├── code-header.tsx                 # Code block header
│   │   ├── use-copy-to-clipboard.ts        # Copy functionality
│   │   └── utils/
│   │       ├── citation-renumbering.ts     # Citation number processing
│   │       └── citation-utils.ts           # Citation helpers
│   ├── messages/
│   │   ├── ai/
│   │   │   ├── message-content/            # AI message content rendering
│   │   │   │   ├── components/
│   │   │   │   │   ├── message-actions.tsx # Copy/regenerate actions
│   │   │   │   │   ├── message-text.tsx    # Message text display
│   │   │   │   │   ├── regular-message.tsx # Regular message layout
│   │   │   │   │   └── tool-calls-section.tsx # Tool calls display
│   │   │   │   ├── hooks/
│   │   │   │   │   └── use-message-content.ts # Message content logic
│   │   │   │   └── index.tsx               # Message content component
│   │   │   ├── custom-component.tsx        # Custom component rendering
│   │   │   ├── interrupt-handler.tsx       # Interrupt detection
│   │   │   ├── loading-message.tsx         # Loading indicator
│   │   │   ├── placeholder-message.tsx     # Empty message placeholder
│   │   │   ├── sources-list.tsx            # Citation sources
│   │   │   └── utils.ts                    # AI message utilities
│   │   ├── chat-interrupt/                 # Interrupt handling
│   │   │   ├── components/
│   │   │   │   ├── action-buttons.tsx      # Accept/edit/ignore buttons
│   │   │   │   ├── action-details.tsx      # Action details display
│   │   │   │   ├── instruction-text.tsx    # User instructions
│   │   │   │   └── interrupt-header.tsx    # Interrupt header
│   │   │   ├── types.ts                    # Interrupt types
│   │   │   └── utils/
│   │   │       └── interrupt-helpers.ts    # Interrupt utilities
│   │   ├── generic-interrupt/              # Generic interrupt component
│   │   │   ├── components/
│   │   │   │   ├── expand-button.tsx       # Expand/collapse button
│   │   │   │   ├── interrupt-header.tsx    # Header component
│   │   │   │   └── interrupt-table.tsx     # Data table display
│   │   │   ├── hooks/
│   │   │   │   └── use-expand-state.ts     # Expansion state
│   │   │   └── utils/
│   │   │       ├── data-processor.ts       # Data processing
│   │   │       └── value-helpers.ts        # Value formatting
│   │   ├── human/                          # Human message components
│   │   │   ├── components/
│   │   │   │   ├── editable-content.tsx    # Editable message
│   │   │   │   ├── message-controls.tsx    # Edit/copy controls
│   │   │   │   ├── multimodal-content.tsx  # Images/PDFs
│   │   │   │   └── text-content.tsx        # Text content
│   │   │   ├── hooks/
│   │   │   │   └── use-human-message-edit.ts # Edit logic
│   │   │   ├── index.tsx                   # Human message component
│   │   │   └── types.ts                    # Human message types
│   │   ├── shared/                         # Shared message components
│   │   │   ├── components/
│   │   │   │   ├── branch-switcher.tsx     # Branch navigation
│   │   │   │   ├── command-bar/            # Command bar component
│   │   │   │   │   ├── index.tsx
│   │   │   │   │   └── validation.ts
│   │   │   │   ├── content-copyable.tsx    # Copy to clipboard
│   │   │   │   └── expert-help-dialog.tsx  # Expert help modal
│   │   │   ├── index.tsx                   # Shared exports
│   │   │   └── types.ts                    # Shared types
│   │   ├── tool-calls/                     # Tool call components
│   │   │   ├── index.tsx                   # Tool calls component
│   │   │   ├── tool-call-item.tsx          # Individual tool call
│   │   │   ├── tool-result-content.tsx     # Tool result display
│   │   │   ├── tool-result-item.tsx        # Tool result item
│   │   │   └── utils.ts                    # Tool call utilities
│   │   ├── ai.tsx                          # AI message wrapper
│   │   ├── chat-interrupt.tsx              # Chat interrupt component
│   │   └── generic-interrupt.tsx           # Generic interrupt wrapper
│   ├── multimodal-preview/                 # Multimodal content preview
│   │   ├── components/
│   │   │   ├── fallback-preview.tsx        # Fallback for unknown types
│   │   │   ├── image-preview.tsx           # Image preview
│   │   │   ├── pdf-preview.tsx             # PDF preview
│   │   │   └── remove-button.tsx           # Remove button
│   │   ├── types.ts                        # Preview types
│   │   └── utils/
│   │       └── size-config.ts              # Size configurations
│   ├── thread-header/
│   │   └── index.tsx                       # Thread header component
│   ├── action-buttons.tsx                  # Action buttons
│   ├── content-blocks-preview.tsx          # Content blocks preview
│   ├── index.tsx                           # Main Thread component
│   ├── markdown-text.tsx                   # Markdown text wrapper
│   ├── scroll-utils.tsx                    # Scroll utilities
│   ├── syntax-highlighter.tsx              # Syntax highlighting
│   ├── tooltip-icon-button.tsx             # Tooltip button
│   └── utils.ts                            # Utility functions
├── providers/
│   └── thread-provider.tsx                 # Thread context provider
├── services/
│   └── ensure-tool-responses.ts            # Tool response handling
├── types/
│   └── index.ts                            # Thread types
├── utils/
│   ├── build-optimistic-thread.ts          # Optimistic thread creation
│   └── generate-thread-name.ts             # Thread name generation
└── index.ts                                # Public API exports
```

## Core Concepts

### Why This Module Exists

1. **Message Rendering**: Display all message types (human, AI, tool, system)
2. **Thread Management**: Create, delete, rename, and navigate threads
3. **Rich Content**: Support markdown, code blocks, math, tables, citations
4. **Multimodal**: Handle images, PDFs, and other file types
5. **Interactive Features**: Edit messages, branch navigation, regenerate responses
6. **Tool Integration**: Display tool calls and results
7. **Interrupt Handling**: Support for conversational interrupts and actions
8. **Optimistic Updates**: Smooth UX with optimistic UI updates

## Key Components

### 1. ThreadProvider

**File**: `/home/user/tiler2-ui/src/features/thread/providers/thread-provider.tsx`

Manages thread state and operations:

```typescript
interface ThreadContextType {
  getThreads: () => Promise<Thread[]>;
  threads: Thread[];
  setThreads: Dispatch<SetStateAction<Thread[]>>;
  threadsLoading: boolean;
  setThreadsLoading: Dispatch<SetStateAction<boolean>>;
  deleteThread: (threadId: string) => Promise<void>;
  renameThread: (threadId: string, newName: string) => Promise<void>;
  addOptimisticThread: (thread: Thread) => void;
  removeOptimisticThread: (threadId: string) => void;
  updateThreadInList: (threadId: string, updates: Partial<Thread>) => void;
}

export const ThreadProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const config = getClientConfig();
  const apiUrl = config.apiUrl;
  const assistantId = config.assistantId;
  const [threads, setThreads] = useState<Thread[]>([]);
  const [threadsLoading, setThreadsLoading] = useState(false);
  const fetchWithAuth = useAuthenticatedFetch();

  const getThreads = useCallback(async (): Promise<Thread[]> => {
    if (!apiUrl || !assistantId) return [];

    try {
      const response = await fetchWithAuth(`${apiUrl}/threads/search`, {
        method: "POST",
        timeoutMs: THREAD_LIST_TIMEOUT_MS,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          metadata: {
            ...getThreadSearchMetadata(assistantId),
          },
          limit: 100,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const threads = await response.json();
      return threads;
    } catch (error) {
      reportThreadError(error as Error, {
        operation: "searchThreads",
        component: "ThreadProvider",
      });
      return [];
    }
  }, [apiUrl, assistantId, fetchWithAuth]);

  // ... deleteThread, renameThread, optimistic updates
};
```

**Key Operations**:

- `getThreads()`: Fetch threads for current assistant
- `deleteThread()`: Delete a thread with optimistic update
- `renameThread()`: Rename a thread with rollback on error
- `addOptimisticThread()`: Add thread optimistically before API confirmation
- `removeOptimisticThread()`: Remove optimistic thread on error
- `updateThreadInList()`: Update thread metadata in list

### 2. Message Components

#### Human Message

**File**: `/home/user/tiler2-ui/src/features/thread/components/messages/human/index.tsx`

Displays user messages with edit capability:

```typescript
export const HumanMessage = memo(function HumanMessage({
  message,
  isLoading,
}: HumanMessageProps) {
  const thread = useStreamContext();
  const contentString = getContentString(message.content);

  const { isEditing, value, setValue, handleSubmitEdit, setIsEditing, meta } =
    useHumanMessageEdit(message, contentString);

  return (
    <div className={cn(
      "group ml-auto flex items-center gap-2",
      isEditing && "w-full max-w-xl",
    )}>
      <div className={cn("flex flex-col gap-2", isEditing && "w-full")}>
        {isEditing ? (
          <EditableContent
            value={value}
            setValue={setValue}
            onSubmit={handleSubmitEdit}
          />
        ) : (
          <div className="flex flex-col gap-2">
            <MultimodalContent content={message.content} />
            <TextContent contentString={contentString} />
          </div>
        )}
        <MessageControls
          isLoading={isLoading}
          contentString={contentString}
          isEditing={isEditing}
          setIsEditing={setIsEditing}
          handleSubmitEdit={handleSubmitEdit}
          branch={meta?.branch || ""}
          branchOptions={meta?.branchOptions || []}
          onBranchSelect={(branch) => thread.setBranch(branch)}
        />
      </div>
    </div>
  );
});
```

**Features**:
- Inline editing
- Multimodal content display (images, PDFs)
- Branch navigation
- Copy to clipboard
- Message controls (edit, cancel, save)

#### AI Message

**File**: `/home/user/tiler2-ui/src/features/thread/components/messages/ai.tsx`

Displays AI responses:

```typescript
export const AssistantMessage = memo(function AssistantMessage({
  message,
  isLoading,
  handleRegenerate,
}: AssistantMessageProps) {
  if (!message) {
    return <PlaceholderMessage />;
  }
  return (
    <MessageContent
      message={message}
      isLoading={isLoading}
      handleRegenerate={handleRegenerate}
    />
  );
});
```

**Features**:
- Markdown rendering with syntax highlighting
- Tool calls display (collapsible)
- Citations and sources
- Copy to clipboard
- Regenerate button
- Streaming text display

### 3. Interrupt Components

**File**: `/home/user/tiler2-ui/src/features/thread/components/messages/chat-interrupt.tsx`

Handles conversational interrupts where AI requests user input:

```typescript
export const ChatInterrupt: React.FC<ChatInterruptProps> = ({
  interrupt,
  onAccept,
  onRespond,
  onEdit,
  onIgnore,
}) => {
  const questionText = getQuestionText(interrupt);
  const hasArgs = hasActionArgs(interrupt.action_request);

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-blue-200 bg-blue-50/50 p-4">
      <InterruptHeader questionText={questionText} />
      <ActionDetails
        actionRequest={interrupt.action_request}
        hasArgs={hasArgs}
      />
      <ActionButtons
        config={interrupt.config}
        onAccept={onAccept}
        onEdit={onEdit}
        onIgnore={onIgnore}
      />
      <InstructionText
        config={interrupt.config}
        hasArgs={hasArgs}
      />
    </div>
  );
};
```

**Features**:
- Question display
- Action details (function name, arguments)
- Action buttons (Accept, Edit, Ignore)
- Context-aware instructions

**Example Interrupt Flow**:
1. AI wants to call a tool requiring user confirmation
2. Interrupt message displayed with blue background
3. User sees: "The AI wants to call `search_documents` with args: `{query: 'climate'}`"
4. User clicks "Accept" → Tool executes
5. User clicks "Edit" → Can modify arguments
6. User clicks "Ignore" → Skip this tool call

### 4. Markdown Rendering

**File**: `/home/user/tiler2-ui/src/features/thread/components/markdown/index.tsx`

Renders markdown with extensive plugin support:

```typescript
const MarkdownTextImpl: FC<{ children: string }> = ({ children }) => {
  return (
    <div className="markdown-content">
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkBreaks, remarkMath]}
        rehypePlugins={[rehypeKatex, rehypeSanitize]}
        components={defaultComponents as any}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
};

export const MarkdownText = memo(MarkdownTextImpl);
```

**Supported Features**:
- **GitHub Flavored Markdown (GFM)**: Tables, task lists, strikethrough
- **Math Rendering**: LaTeX equations via KaTeX
- **Code Blocks**: Syntax highlighting with copy button
- **Citations**: Numbered citations with hover/click support
- **Tables**: Custom styled tables
- **Sanitization**: XSS protection via rehype-sanitize

**Custom Components** (`/home/user/tiler2-ui/src/features/thread/components/markdown/components/`):
- Code blocks with language detection
- Tables with custom styling
- Citation links with renumbering
- Headings, lists, blockquotes

### 5. Tool Calls Display

**File**: `/home/user/tiler2-ui/src/features/thread/components/messages/tool-calls/index.tsx`

Displays tool calls and results:

```typescript
export const ToolCalls: React.FC<{
  toolCalls: AIMessage["tool_calls"];
}> = ({ toolCalls }) => {
  if (!toolCalls || toolCalls.length === 0) return null;

  return (
    <div className="mx-auto grid max-w-3xl grid-rows-[1fr_auto] gap-2">
      {toolCalls.map((tc, idx) => (
        <ToolCallItem
          key={idx}
          toolCall={tc}
        />
      ))}
    </div>
  );
};

export const ToolResult: React.FC<{ message: ToolMessage }> = ({ message }) => {
  return (
    <div className="mx-auto grid max-w-3xl grid-rows-[1fr_auto] gap-2">
      <ToolResultItem message={message} />
    </div>
  );
};
```

**Features**:
- Collapsible tool call details
- JSON formatting for arguments
- Tool result display
- Error handling for failed tools
- Visual distinction between call and result

### 6. Multimodal Preview

**File**: `/home/user/tiler2-ui/src/features/thread/components/multimodal-preview/`

Displays images and PDFs in messages:

```typescript
// Image Preview
export const ImagePreview = ({ source, alt, onRemove }: ImagePreviewProps) => (
  <div className="relative inline-block">
    <img
      src={source}
      alt={alt}
      className="max-h-64 rounded-lg border"
    />
    {onRemove && <RemoveButton onRemove={onRemove} />}
  </div>
);

// PDF Preview
export const PDFPreview = ({ source, onRemove }: PDFPreviewProps) => (
  <div className="relative inline-block">
    <embed
      src={source}
      type="application/pdf"
      className="h-64 w-full rounded-lg border"
    />
    {onRemove && <RemoveButton onRemove={onRemove} />}
  </div>
);
```

## Types and Interfaces

**File**: `/home/user/tiler2-ui/src/features/thread/types/index.ts`

```typescript
export interface ThreadState {
  threadId: string | null;
  messages: Message[];
  isLoading: boolean;
  error: string | null;
}

export interface ThreadMetadata {
  id: string;
  title?: string;
  createdAt: string;
  updatedAt: string;
  messageCount: number;
}

export interface ThreadConfig {
  apiUrl: string;
  assistantId: string;
  maxMessages?: number;
}

export interface ThreadContextType {
  getThreads: () => Promise<import("@langchain/langgraph-sdk").Thread[]>;
  threads: import("@langchain/langgraph-sdk").Thread[];
  setThreads: React.Dispatch<
    React.SetStateAction<import("@langchain/langgraph-sdk").Thread[]>
  >;
  threadsLoading: boolean;
  setThreadsLoading: React.Dispatch<React.SetStateAction<boolean>>;
}
```

## Public API

**File**: `/home/user/tiler2-ui/src/features/thread/index.ts`

```typescript
export { Thread } from "./components";
export { ThreadProvider, useThreads } from "./providers/thread-provider";
export type {
  ThreadState,
  ThreadMetadata,
  ThreadConfig,
  ThreadContextType,
} from "./types";
export { MessageList } from "./components/layout/message-list";
export { ChatFooter } from "./components/layout/chat-footer";
```

## Integration with Other Modules

### Chat Module Integration

Thread module uses ChatProvider for input state:

```typescript
import { useChatContext } from '@/features/chat';

function Thread() {
  const {
    input,
    contentBlocks,
    onSubmit,
    handleRegenerate
  } = useChatContext();

  // Render messages and input
}
```

### Artifacts Module Integration

Thread displays artifacts in a side panel:

```typescript
import { ArtifactProvider } from '@/features/artifacts';

function ThreadLayout() {
  return (
    <div className="flex">
      <MessageList />
      <ArtifactPanel /> {/* From artifacts module */}
    </div>
  );
}
```

### File Upload Integration

Thread uses file upload for multimodal content:

```typescript
import { useFileUpload } from '@/features/file-upload';

function ChatInput() {
  const { uploadFile, validateFile } = useFileUpload();

  const onPaste = async (e) => {
    const items = e.clipboardData.items;
    for (const item of items) {
      if (item.type.startsWith('image/')) {
        const file = item.getAsFile();
        const block = await uploadFile(file);
        // Add to contentBlocks
      }
    }
  };
}
```

### StreamProvider Integration

Thread displays streaming responses:

```typescript
import { useStreamContext } from '@/core/providers/stream';

function AIMessage() {
  const thread = useStreamContext();
  const { streamingMessage, isStreaming } = thread;

  return (
    <div>
      {streamingMessage && (
        <StreamingText text={streamingMessage} />
      )}
    </div>
  );
}
```

## Utilities

### Thread Name Generation

**File**: `/home/user/tiler2-ui/src/features/thread/utils/generate-thread-name.ts`

Generates thread names from first message:

```typescript
export function generateThreadName(firstMessage: string): string {
  // Truncate to ~50 chars at word boundary
  const trimmed = firstMessage.trim();
  if (trimmed.length <= 50) return trimmed;

  const truncated = trimmed.slice(0, 50);
  const lastSpace = truncated.lastIndexOf(' ');

  return lastSpace > 0
    ? truncated.slice(0, lastSpace) + '...'
    : truncated + '...';
}
```

### Optimistic Thread Building

**File**: `/home/user/tiler2-ui/src/features/thread/utils/build-optimistic-thread.ts`

Creates optimistic thread objects before API confirmation:

```typescript
export function buildOptimisticThread(
  input: string,
  assistantId: string
): Thread {
  return {
    thread_id: `temp_${Date.now()}`,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    metadata: {
      name: generateThreadName(input),
      assistant_id: assistantId,
    },
    status: 'pending',
  };
}
```

## Best Practices

1. **Memoization**: All message components use `memo()` to prevent unnecessary re-renders
2. **Lazy Loading**: Large components load on demand
3. **Error Boundaries**: Wrap message rendering in error boundaries
4. **Accessibility**: ARIA labels on interactive elements
5. **Performance**: Virtualize long message lists
6. **Type Safety**: Strict TypeScript types for all message types

## Common Patterns

### Rendering Messages by Type

```typescript
function MessageList({ messages }) {
  return messages.map((msg) => {
    switch (msg.type) {
      case 'human':
        return <HumanMessage key={msg.id} message={msg} />;
      case 'ai':
        return <AssistantMessage key={msg.id} message={msg} />;
      case 'tool':
        return <ToolResult key={msg.id} message={msg} />;
      default:
        return null;
    }
  });
}
```

### Handling Interrupts

```typescript
function AIMessage({ message }) {
  const interrupt = detectInterrupt(message);

  if (interrupt) {
    return (
      <ChatInterrupt
        interrupt={interrupt}
        onAccept={() => handleAction('accept')}
        onEdit={() => handleAction('edit')}
        onIgnore={() => handleAction('ignore')}
      />
    );
  }

  return <RegularMessage message={message} />;
}
```

### Branch Navigation

```typescript
function HumanMessage({ message, meta }) {
  const { branch, branchOptions } = meta;

  return (
    <div>
      <MessageContent />
      {branchOptions.length > 1 && (
        <BranchSwitcher
          current={branch}
          options={branchOptions}
          onSelect={(branch) => thread.setBranch(branch)}
        />
      )}
    </div>
  );
}
```

## Next Steps

**Next**: [Artifacts Module](/home/user/tiler2-ui/docs/30-module-artifacts.md) - Learn about artifact rendering and the side panel system for displaying generated content
