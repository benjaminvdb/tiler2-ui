# Chat Module

## Overview

The chat module (`/home/user/tiler2-ui/src/features/chat/`) provides the core chat interface state management through React Context providers. It manages chat input, message composition, file attachments, and UI state for the chat interface. This module serves as the glue between user interactions and the thread/streaming infrastructure.

**Purpose**: Provide a centralized state management layer for chat interactions, handling user input, file uploads, drag-and-drop, and coordinating between the chat UI and the underlying thread system.

## Directory Structure

```
src/features/chat/
├── components/
│   └── empty-state.tsx            # Empty state with onboarding options
├── providers/
│   ├── chat-provider.tsx          # Chat context provider
│   └── ui-provider.tsx            # UI state provider
├── types/
│   └── index.ts                   # TypeScript types
└── index.ts                       # Public API exports
```

## Core Concepts

### Why This Module Exists

1. **State Management**: Centralized chat state accessible throughout the component tree
2. **Separation of Concerns**: Decouples chat UI logic from thread/message logic
3. **Context Composition**: Provides multiple contexts (ChatContext, UIContext) for different concerns
4. **File Upload Coordination**: Manages file attachments and drag-and-drop state
5. **UI Responsiveness**: Tracks UI state like sidebar open/close and screen size

## Key Components

### 1. ChatProvider

**File**: `/home/user/tiler2-ui/src/features/chat/providers/chat-provider.tsx`

The `ChatProvider` manages all chat-related state and interactions:

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
  onPaste: (
    e: React.ClipboardEvent<HTMLTextAreaElement | HTMLInputElement>,
  ) => void;
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveBlock: (idx: number) => void;
  onHideToolCallsChange: (value: boolean) => void;
  handleActionClick: (action: string) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider: React.FC<ChatProviderProps> = ({
  children,
  value,
}) => {
  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};

export const useChatContext = () => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error("useChatContext must be used within a ChatProvider");
  }
  return context;
};
```

**Key State Properties**:

- `chatStarted`: Whether the user has started chatting (sent first message)
- `firstTokenReceived`: Whether the first streaming token has been received
- `input`: Current text input value
- `contentBlocks`: Attached files and multimodal content
- `isRespondingToInterrupt`: Whether responding to an interrupt/action
- `hideToolCalls`: Whether to hide tool call details in UI
- `dragOver`: Drag-and-drop hover state

**Key Methods**:

- `handleRegenerate()`: Regenerate the last AI response
- `onInputChange()`: Handle text input changes
- `onSubmit()`: Submit the chat message
- `onPaste()`: Handle paste events (for images, files)
- `onFileUpload()`: Handle file upload from input
- `onRemoveBlock()`: Remove a content block (file attachment)
- `onHideToolCallsChange()`: Toggle tool call visibility
- `handleActionClick()`: Handle interrupt action clicks

**Usage Example**:
```typescript
import { useChatContext } from '@/features/chat';

function ChatInput() {
  const {
    input,
    onInputChange,
    onSubmit,
    contentBlocks,
    onRemoveBlock
  } = useChatContext();

  return (
    <form onSubmit={onSubmit}>
      <textarea
        value={input}
        onChange={(e) => onInputChange(e.target.value)}
      />
      {contentBlocks.map((block, idx) => (
        <FilePreview
          key={idx}
          block={block}
          onRemove={() => onRemoveBlock(idx)}
        />
      ))}
      <button type="submit">Send</button>
    </form>
  );
}
```

### 2. UIProvider

**File**: `/home/user/tiler2-ui/src/features/chat/providers/ui-provider.tsx`

The `UIProvider` manages UI state separate from chat logic:

```typescript
interface UIContextType {
  chatHistoryOpen: boolean;
  isLargeScreen: boolean;
  sidePanelWidth: number;

  navigationService: NavigationService;

  onToggleChatHistory: () => void;
  onNewThread: () => void;
  onSidePanelWidthChange: (width: number) => void;
}

const UIContext = createContext<UIContextType | undefined>(undefined);

export const UIProvider: React.FC<UIProviderProps> = ({ children, value }) => {
  return <UIContext.Provider value={value}>{children}</UIContext.Provider>;
};

export const useUIContext = () => {
  const context = useContext(UIContext);
  if (context === undefined) {
    throw new Error("useUIContext must be used within a UIProvider");
  }
  return context;
};
```

**Key State Properties**:

- `chatHistoryOpen`: Whether the chat history sidebar is open
- `isLargeScreen`: Whether the current viewport is large (desktop)
- `sidePanelWidth`: Width of the side panel in pixels
- `navigationService`: Service for handling navigation

**Key Methods**:

- `onToggleChatHistory()`: Toggle chat history sidebar
- `onNewThread()`: Create a new chat thread
- `onSidePanelWidthChange()`: Update side panel width

**Usage Example**:
```typescript
import { useUIContext } from '@/features/chat';

function SidePanel() {
  const {
    chatHistoryOpen,
    isLargeScreen,
    onToggleChatHistory
  } = useUIContext();

  return (
    <aside
      className={cn(
        "side-panel",
        chatHistoryOpen && "open",
        isLargeScreen && "desktop-layout"
      )}
    >
      <button onClick={onToggleChatHistory}>
        {chatHistoryOpen ? "Close" : "Open"} History
      </button>
    </aside>
  );
}
```

### 3. Empty State Component

**File**: `/home/user/tiler2-ui/src/features/chat/components/empty-state.tsx`

Displays an onboarding experience when no chat has started:

```typescript
interface EmptyStateProps {
  onSuggestionClick?: (text: string) => void;
  onWorkflowCategoryClick?: (category: string) => void;
}

export const EmptyState = ({
  onSuggestionClick,
  onWorkflowCategoryClick,
}: EmptyStateProps): React.JSX.Element => {
  const { navigationService } = useUIContext();

  return (
    <div className="flex h-full flex-col items-center justify-start px-6 py-12">
      <div className="flex w-full max-w-2xl flex-col items-center space-y-4">
        <SatelliteGraphic />
        <OnboardingQuickActions
          navigationService={navigationService}
          onSuggestionClick={onSuggestionClick}
        />
        <WorkflowCategoryButtons
          onCategoryClick={onWorkflowCategoryClick}
        />
      </div>
    </div>
  );
};
```

**Features**:

- **Satellite Graphic**: Animated earth image with breathing effect
- **Onboarding Quick Actions**: Buttons for "Personalize Link AI" and "Tips & Tricks"
- **Workflow Category Buttons**: Color-coded category buttons (Strategy, Policies, Impacts, etc.)
- **Animation**: Framer Motion animations for smooth entry
- **Navigation**: Integrates with NavigationService to launch workflows

**Onboarding Options**:
```typescript
const onboardingOptions = [
  {
    name: "Personalize Link AI",
    icon: UserCircle,
    description: "Tell us about your company",
  },
  {
    name: "Tips & Tricks",
    icon: Sparkles,
    description: "Get the most out of Link AI",
  },
];
```

**Workflow Categories**:
```typescript
const workflowCategories = [
  { name: "Strategy", icon: Map, color: "#767C91" },
  { name: "Policies & Governance", icon: Shield, color: "#7ca2b7" },
  { name: "Impacts & Risk Assessment", icon: Target, color: "#72a6a6" },
  { name: "Interventions", icon: Lightbulb, color: "#a6c887" },
  { name: "Standards & Reporting", icon: BookCheck, color: "#e39c5a" },
  { name: "Stakeholder Engagement", icon: Users, color: "#ac876c" },
  { name: "Knowledge & Guidance", icon: BookOpen, color: "#878879" },
];
```

## Types and Interfaces

**File**: `/home/user/tiler2-ui/src/features/chat/types/index.ts`

```typescript
export interface ChatState {
  input: string;
  isLoading: boolean;
  messages: Message[];
  error: string | null;
}

export interface ChatMessage {
  id: string;
  content: string | any[];
  type: "human" | "ai" | "tool";
  timestamp?: number;
}

export interface ChatContextType {
  chatStarted: boolean;
  input: string;
  onInputChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  startNewChat: () => void;
}

export interface UIContextType {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}
```

## Public API

**File**: `/home/user/tiler2-ui/src/features/chat/index.ts`

The module exports a clean public API:

```typescript
// Providers
export { ChatProvider, useChatContext } from "./providers/chat-provider";
export { UIProvider, useUIContext } from "./providers/ui-provider";

// Types
export type {
  ChatState,
  ChatMessage,
  ChatContextType,
  UIContextType,
} from "./types";
```

## Integration with Other Modules

### Thread Module Integration

The ChatProvider is used by the ThreadProvider to manage chat input and interactions:

```typescript
// In ThreadProvider
import { ChatProvider } from '@/features/chat';

function ThreadProvider() {
  const chatContextValue = {
    chatStarted,
    input,
    onInputChange,
    onSubmit,
    contentBlocks,
    // ... other chat state
  };

  return (
    <ChatProvider value={chatContextValue}>
      <ThreadContent />
    </ChatProvider>
  );
}
```

### File Upload Integration

The ChatProvider coordinates with the file-upload module for handling attachments:

```typescript
import { useFileUpload } from '@/features/file-upload';

function useThreadHandlers() {
  const { uploadFile } = useFileUpload();

  const onFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    for (const file of Array.from(files)) {
      const block = await uploadFile(file);
      // Add to contentBlocks
    }
  };

  return { onFileUpload };
}
```

### StreamProvider Integration

The ChatProvider tracks streaming state through `firstTokenReceived`:

```typescript
// When first token arrives from stream
onFirstToken(() => {
  setFirstTokenReceived(true);
});
```

### Side Panel Integration

The UIProvider manages the side panel state used by the side-panel module:

```typescript
import { useUIContext } from '@/features/chat';

function SidePanel() {
  const {
    chatHistoryOpen,
    sidePanelWidth,
    onSidePanelWidthChange
  } = useUIContext();

  return (
    <ResizablePanel
      width={sidePanelWidth}
      onWidthChange={onSidePanelWidthChange}
    />
  );
}
```

## Context Composition Pattern

The chat module uses React Context composition to separate concerns:

```typescript
function App() {
  return (
    <UIProvider value={uiContextValue}>
      <ChatProvider value={chatContextValue}>
        <ThreadProvider>
          <ChatInterface />
        </ThreadProvider>
      </ChatProvider>
    </UIProvider>
  );
}
```

**Benefits**:
1. **Separation**: UI state separated from chat logic
2. **Composability**: Each provider can be used independently
3. **Testability**: Easy to mock individual contexts
4. **Performance**: Consumers only re-render when their specific context changes

## State Flow

### Message Submission Flow

1. User types in textarea → `onInputChange()` updates `input`
2. User attaches file → `onFileUpload()` adds to `contentBlocks`
3. User submits → `onSubmit()` called
4. ChatProvider validates input + contentBlocks
5. Calls thread submission handler with combined content
6. Clears input and contentBlocks
7. StreamProvider begins streaming response

### Interrupt Handling Flow

1. AI sends interrupt → Thread detects interrupt state
2. ChatProvider sets `isRespondingToInterrupt = true`
3. User clicks action → `handleActionClick()` called
4. Thread submits interrupt response with action
5. ChatProvider sets `isRespondingToInterrupt = false`

## Best Practices

1. **Use Context Hooks**: Always use `useChatContext()` and `useUIContext()`, never access contexts directly
2. **Error Boundaries**: Wrap providers in error boundaries to handle context errors
3. **Provider Order**: UIProvider should wrap ChatProvider to allow chat to use navigation
4. **Memoization**: Provider values should be memoized to prevent unnecessary re-renders
5. **Type Safety**: Use TypeScript interfaces for all context values

## Common Patterns

### Accessing Chat State in Components

```typescript
import { useChatContext } from '@/features/chat';

function MyComponent() {
  const { input, contentBlocks, onInputChange } = useChatContext();

  // Use chat state
}
```

### Conditional Rendering Based on Chat State

```typescript
function ChatLayout() {
  const { chatStarted, firstTokenReceived } = useChatContext();

  if (!chatStarted) {
    return <EmptyState />;
  }

  if (!firstTokenReceived) {
    return <LoadingIndicator />;
  }

  return <MessageList />;
}
```

### Managing UI State

```typescript
function Header() {
  const { chatHistoryOpen, onToggleChatHistory } = useUIContext();

  return (
    <button onClick={onToggleChatHistory}>
      {chatHistoryOpen ? <ChevronLeft /> : <ChevronRight />}
    </button>
  );
}
```

## Next Steps

**Next**: [Thread Module](/home/user/tiler2-ui/docs/29-module-thread.md) - Learn about the largest module handling message rendering, thread management, and chat UI components
