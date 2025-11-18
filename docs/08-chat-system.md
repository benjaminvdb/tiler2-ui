# Chat System

The chat system provides real-time streaming conversations with AI, supporting multimodal inputs, markdown rendering, syntax highlighting, and interactive features.

## Why This Exists

The chat system is the primary interface for user-AI interaction. It uses Server-Sent Events (SSE) to stream responses in real-time, providing immediate feedback and a responsive user experience. The system handles various message types, supports rich content rendering, and manages complex interactions like tool calls and citations.

## Architecture Overview

### Streaming Architecture

The application uses **Server-Sent Events (SSE)** for real-time message streaming from the LangGraph backend.

**Key Components:**
- `StreamProvider` - Top-level provider managing SSE connections
- `ChatProvider` - Context for chat UI state and handlers
- `useStreamContext` - Hook to access streaming state and methods

**Flow:**
1. User submits input via ChatInput
2. Handler creates a new stream session
3. SSE connection established to `/runs/stream` endpoint
4. Server sends events (messages, metadata, errors)
5. UI updates in real-time as tokens arrive
6. Stream closes when response completes

**File:** `/home/user/tiler2-ui/src/core/providers/stream.tsx`
```typescript
export const StreamProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const clientConfig = getClientConfig();
  const finalApiUrl = useMemo(() => clientConfig.apiUrl, [clientConfig.apiUrl]);
  const finalAssistantId = useMemo(
    () => clientConfig.assistantId,
    [clientConfig.assistantId],
  );

  return (
    <StreamErrorBoundary assistantId={finalAssistantId} threadId={null}>
      <StreamSession apiUrl={finalApiUrl} assistantId={finalAssistantId}>
        {children}
      </StreamSession>
    </StreamErrorBoundary>
  );
};
```

### ChatProvider Implementation

The ChatProvider manages chat UI state and user interactions.

**File:** `/home/user/tiler2-ui/src/features/chat/providers/chat-provider.tsx`
```typescript
interface ChatContextType {
  chatStarted: boolean;
  firstTokenReceived: boolean;
  input: string;
  contentBlocks: ContentBlocks;
  isRespondingToInterrupt: boolean;
  hideToolCalls: boolean;
  dragOver: boolean;
  dropRef: React.RefObject<HTMLDivElement | null>;

  handleRegenerate: (parentCheckpoint: Checkpoint | null | undefined) => void;
  onInputChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onPaste: (e: React.ClipboardEvent<HTMLTextAreaElement | HTMLInputElement>) => void;
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveBlock: (idx: number) => void;
  onHideToolCallsChange: (value: boolean) => void;
  handleActionClick: (action: string) => void;
}

export const ChatProvider: React.FC<ChatProviderProps> = ({
  children,
  value,
}) => {
  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};
```

**Usage:**
```typescript
const {
  input,
  onInputChange,
  onSubmit,
  handleRegenerate
} = useChatContext();
```

## Message Types

The system supports multiple message types from LangChain/LangGraph SDK:

### 1. Human Messages
Messages from the user.

**Type Definition:**
```typescript
{
  type: "human"
  content: string | ContentBlock[]
  id: string
}
```

**Rendering:** `/home/user/tiler2-ui/src/features/thread/components/messages/human/index.tsx`

### 2. AI Messages
Responses from the AI assistant.

**Type Definition:**
```typescript
{
  type: "ai"
  content: string
  id: string
  tool_calls?: ToolCall[]
  response_metadata?: {
    sources?: Source[]
  }
}
```

**Rendering:** `/home/user/tiler2-ui/src/features/thread/components/messages/ai.tsx`

### 3. Tool Messages
Results from tool executions.

**Type Definition:**
```typescript
{
  type: "tool"
  content: string
  tool_call_id: string
  name: string
}
```

**Rendering:** `/home/user/tiler2-ui/src/features/thread/components/messages/tool-calls/`

### 4. System Messages
Internal state updates and interrupts.

Used for workflow interrupts and system notifications.

## Message Rendering

### Markdown Support

AI messages are rendered with full markdown support using React-Markdown.

**File:** `/home/user/tiler2-ui/src/features/thread/components/markdown/index.tsx`
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
```

**Supported Features:**
- GitHub Flavored Markdown (tables, task lists, strikethrough)
- Line breaks preserved (`remarkBreaks`)
- Math equations (`remarkMath` + `rehypeKatex`)
- Sanitized HTML (`rehypeSanitize`)
- Custom components (code blocks, citations, tables)

### Syntax Highlighting

Code blocks use Prism for syntax highlighting.

**File:** `/home/user/tiler2-ui/src/features/thread/components/syntax-highlighter.tsx`
```typescript
export const SyntaxHighlighter: FC<SyntaxHighlighterProps> = ({
  children,
  language,
  className,
}) => {
  return (
    <SyntaxHighlighterPrism
      language={language}
      style={coldarkDark}
      customStyle={{
        margin: 0,
        width: "100%",
        background: "transparent",
        padding: "1.5rem 1rem",
      }}
      className={className}
    >
      {children}
    </SyntaxHighlighterPrism>
  );
};
```

**Usage in Markdown:**
````markdown
```python
def hello_world():
    print("Hello, world!")
```
````

### LaTeX/Math Rendering

Mathematical equations are rendered using KaTeX.

**Inline Math:**
```markdown
The formula is $E = mc^2$.
```

**Block Math:**
```markdown
$$
\int_0^\infty e^{-x^2} dx = \frac{\sqrt{\pi}}{2}
$$
```

**Implementation:** Uses `remarkMath` and `rehypeKatex` plugins in markdown renderer.

### Citation Handling

Citations link to sources in the Sources section.

**File:** `/home/user/tiler2-ui/src/features/thread/components/markdown/components/citation-link.tsx`
```typescript
export const CitationLink: FC<CitationLinkProps> = ({
  href,
  children,
  className,
  ...props
}) => {
  const isCitationNumber =
    typeof children === "string" && CITATION_PATTERN.test(children);

  if (isCitationNumber && href && isExternalLink(href)) {
    return renderExternalCitation(href, children, className, props);
  }

  if (isCitationNumber) {
    return renderCitationBadge({
      children,
      className,
      title: `Citation [${children}] - Document reference`,
      props: { ...props, onClick: scrollToSources },
    });
  }

  // Regular link
  return <a href={href} {...props}>{children}</a>;
};
```

**How It Works:**
1. AI includes `[1]`, `[2]` in response
2. Citation link renders as clickable badge
3. Clicking scrolls to Sources section
4. Sources listed with full metadata

**Example:**
```markdown
According to recent studies [1], climate change is accelerating [2].

## Sources
1. IPCC Report 2023
2. Nature Climate Research
```

## Chat Input Component

The chat input handles text input, file uploads, and submission.

**File:** `/home/user/tiler2-ui/src/features/thread/components/chat-input-components/index.tsx`

**Features:**
- Auto-resizing textarea (grows with content)
- Keyboard shortcuts (Enter to send, Shift+Enter for newline)
- File attachment button
- Submit/stop button
- Drag-and-drop support
- Clipboard paste support
- Tool calls visibility toggle

**Key Implementation:**
```typescript
const ChatInputComponent = ({
  input,
  onInputChange,
  onSubmit,
  onPaste,
  onFileUpload,
  contentBlocks,
  onRemoveBlock,
  isLoading,
  hideToolCalls,
  onHideToolCallsChange,
  dragOver,
  dropRef,
}: ChatInputProps) => {
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey && !e.metaKey) {
        e.preventDefault();
        const form = e.target.closest("form");
        form?.requestSubmit();
      }
    },
    [],
  );

  return (
    <div ref={dropRef}>
      <form onSubmit={onSubmit}>
        <ContentBlocksPreview blocks={contentBlocks} onRemove={onRemoveBlock} />

        <div className="relative rounded-lg border">
          <button type="button" onClick={handleFileUploadClick}>
            <Plus className="h-4 w-4" />
          </button>

          <textarea
            value={input}
            onChange={(e) => onInputChange(e.target.value)}
            onPaste={onPaste}
            onKeyDown={handleKeyDown}
            placeholder="Ask anything..."
            disabled={isLoading}
          />

          <button type={isLoading ? "button" : "submit"}>
            {isLoading ? <Loader2 /> : <Send />}
          </button>
        </div>
      </form>
    </div>
  );
};
```

## File Attachments in Chat

Users can attach images and PDFs to messages.

**Supported Types:**
- `image/jpeg`
- `image/png`
- `image/gif`
- `image/webp`
- `application/pdf`

**Upload Methods:**
1. Click "+" button to select files
2. Drag and drop files onto chat input
3. Paste images from clipboard (Ctrl/Cmd+V)

**Preview:** Files show preview thumbnails before sending.

**Limits:**
- Maximum 10 files per message
- Total size limit: 50MB

See [Multimodal Support](/home/user/tiler2-ui/docs/11-multimodal.md) for implementation details.

## Tool Call Visibility Toggle

Users can show/hide tool call details in the UI.

**File:** `/home/user/tiler2-ui/src/features/thread/components/chat-input-components/components/tool-calls-toggle.tsx`
```typescript
export const ToolCallsToggle: React.FC<ToolCallsToggleProps> = ({
  hideToolCalls,
  onHideToolCallsChange,
}) => {
  // Only show if environment variable allows
  if (import.meta.env.VITE_HIDE_TOOL_CALLS !== "false") return null;

  return (
    <div className="flex items-center space-x-2">
      <Switch
        id="render-tool-calls"
        checked={hideToolCalls ?? true}
        onCheckedChange={onHideToolCallsChange}
      />
      <Label htmlFor="render-tool-calls">
        Hide Tool Calls
      </Label>
    </div>
  );
};
```

**Environment Variable:**
```bash
VITE_HIDE_TOOL_CALLS=false  # Show toggle
```

## Message Regeneration

Users can regenerate AI responses from any point in the conversation.

**Implementation:** `/home/user/tiler2-ui/src/features/thread/components/hooks/use-thread-handlers.ts`
```typescript
const handleRegenerate = createRegenerateHandler(
  stream,
  props.setFirstTokenReceived,
  props.prevMessageLength,
);
```

**How It Works:**
1. User clicks "Regenerate" button on AI message
2. Handler extracts parent checkpoint
3. Creates new stream from that checkpoint
4. New response replaces previous one

**Use Cases:**
- Response not satisfactory
- Want alternative phrasing
- Fix errors in response

## Handler Functions

### Submit Handler

Processes new user messages.

**File:** `/home/user/tiler2-ui/src/features/thread/components/hooks/use-thread-handlers/handlers/submit-handler.ts`

**Flow:**
1. Validate input (not empty)
2. Build message with content blocks
3. Create optimistic thread if new conversation
4. Start SSE stream
5. Reset input and file attachments

### Regenerate Handler

Re-generates AI response from a checkpoint.

**File:** `/home/user/tiler2-ui/src/features/thread/components/hooks/use-thread-handlers/handlers/regenerate-handler.ts`

**Flow:**
1. Extract parent checkpoint from message
2. Start new stream from checkpoint
3. Replace existing response

### Action Handler

Handles quick action button clicks.

**File:** `/home/user/tiler2-ui/src/features/thread/components/hooks/use-thread-handlers/handlers/action-handler.ts`

**Flow:**
1. User clicks suggested action
2. Action prompt sent as new message
3. Stream response

## Best Practices

### 1. Always Use ChatProvider Context

```typescript
// ✅ Good
const { input, onInputChange } = useChatContext();

// ❌ Bad
const [input, setInput] = useState(""); // Bypasses global state
```

### 2. Handle Loading States

```typescript
{isLoading ? (
  <LoadingMessage />
) : (
  <MessageContent message={message} />
)}
```

### 3. Sanitize User Input

Markdown renderer includes `rehypeSanitize` to prevent XSS attacks.

### 4. Stream Error Handling

```typescript
<StreamErrorBoundary assistantId={assistantId} threadId={threadId}>
  {children}
</StreamErrorBoundary>
```

## Common Patterns

### Adding a New Message Type

1. Define type in `/home/user/tiler2-ui/src/shared/types/index.ts`
2. Create renderer in `/home/user/tiler2-ui/src/features/thread/components/messages/`
3. Add to message list renderer
4. Update TypeScript types

### Custom Markdown Component

1. Create component in `/home/user/tiler2-ui/src/features/thread/components/markdown/components/`
2. Add to `defaultComponents` in `/home/user/tiler2-ui/src/features/thread/components/markdown/components/index.tsx`
3. Style using Tailwind classes

### Adding Keyboard Shortcuts

See [Keyboard Shortcuts](/home/user/tiler2-ui/docs/14-keyboard-shortcuts.md).

## Troubleshooting

### Messages Not Streaming

**Check:**
1. API URL configured correctly
2. Assistant ID valid
3. Network tab shows SSE connection
4. Backend is running

### Markdown Not Rendering

**Check:**
1. Content is valid markdown
2. Plugins loaded correctly
3. CSS imported (`markdown-styles.css`, `katex.min.css`)

### Citations Not Clickable

**Check:**
1. Citation format matches `CITATION_PATTERN`
2. Sources section has ID `sources-section`
3. JavaScript not blocked

## Related Documentation

- [Thread Management](/home/user/tiler2-ui/docs/09-thread-management.md) - Managing conversation threads
- [Multimodal Support](/home/user/tiler2-ui/docs/11-multimodal.md) - File uploads and images
- [Human-in-the-Loop](/home/user/tiler2-ui/docs/12-human-in-loop.md) - Interactive workflows
- [State Management](/home/user/tiler2-ui/docs/06-state-management.md) - Global state patterns

---

**Next:** [Thread Management](/home/user/tiler2-ui/docs/09-thread-management.md)
