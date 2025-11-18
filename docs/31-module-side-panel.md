# Side Panel Module

## Overview

The side-panel module (`/home/user/tiler2-ui/src/features/side-panel/`) provides the navigation sidebar and thread history UI components. It includes the main sidebar with navigation buttons, thread list, user profile, and responsive layouts for both desktop and mobile devices. This module uses the shadcn/ui Sidebar component for a consistent, accessible navigation experience.

**Purpose**: Provide a comprehensive navigation system with thread history, quick actions (New Chat, Workflows, Wiki), user profile management, and responsive layouts that adapt to desktop and mobile viewports.

## Directory Structure

```
src/features/side-panel/
├── components/
│   ├── dialogs/
│   │   ├── delete-thread-confirm-dialog.tsx  # Delete confirmation dialog
│   │   └── rename-thread-dialog.tsx          # Rename thread dialog
│   ├── thread-history/
│   │   ├── components/
│   │   │   ├── desktop-history-panel.tsx     # Desktop thread panel
│   │   │   ├── mobile-history-sheet.tsx      # Mobile sheet component
│   │   │   ├── thread-history-loading.tsx    # Loading skeleton
│   │   │   └── thread-list.tsx               # Thread list component
│   │   ├── hooks/
│   │   │   └── use-thread-history.ts         # Thread history hook
│   │   ├── utils/
│   │   │   └── thread-text-extractor.ts      # Extract thread titles
│   │   └── index.tsx                         # Thread history component
│   ├── index.tsx                             # Component exports
│   ├── mobile-header.tsx                     # Mobile header
│   ├── navigation-button.tsx                 # Navigation button component
│   ├── new-sidebar.tsx                       # Main sidebar component
│   ├── side-panel-brand-header.tsx           # Brand header
│   ├── side-panel-content.tsx                # Panel content
│   ├── side-panel-header.tsx                 # Panel header
│   ├── side-panel-layout.tsx                 # Panel layout
│   ├── side-panel-navigation.tsx             # Navigation section
│   ├── thread-actions-menu.tsx               # Thread actions menu
│   └── thread-title.tsx                      # Thread title display
├── constants.ts                              # Constants
└── index.ts                                  # Public API exports
```

## Core Concepts

### Why This Module Exists

1. **Navigation Hub**: Central place for app navigation (Home, Workflows, Wiki)
2. **Thread Management**: Display, search, and manage conversation threads
3. **Responsive Design**: Adapt to desktop (sidebar) and mobile (sheet) layouts
4. **User Profile**: Show authentication state and user actions
5. **Quick Actions**: Fast access to common operations (New Chat, etc.)
6. **Thread Actions**: Rename and delete threads with confirmation
7. **Keyboard Shortcuts**: Integration with hotkeys module

## Key Components

### 1. NewSidebar (Main Sidebar)

**File**: `/home/user/tiler2-ui/src/features/side-panel/components/new-sidebar.tsx`

The main sidebar component using shadcn/ui Sidebar primitives:

```typescript
export const NewSidebar = (): React.JSX.Element => {
  const { navigationService } = useUIContext();
  const [threadId] = useSearchParamState("threadId");
  const { threads, threadsLoading } = useThreadHistory();
  const { deleteThread, renameThread } = useThreads();
  const { state, toggleSidebar } = useSidebar();
  const isCollapsed = state === "collapsed";

  const handleThreadClick = (clickedThreadId: string) => {
    if (clickedThreadId === threadId) return;
    navigationService.navigateToHome({ threadId: clickedThreadId });
  };

  const handleNavigate = (section: "workflows" | "wiki") => {
    if (section === "workflows") {
      navigationService.navigateToWorkflows();
    } else {
      navigateExternal("https://impossible-chauffeur-129.notion.site/...");
    }
  };

  const handleRename = async (
    targetThreadId: string,
    newTitle: string,
  ): Promise<void> => {
    try {
      await renameThread(targetThreadId, newTitle);
      toast.success("Thread renamed successfully");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to rename thread",
      );
      throw error;
    }
  };

  const handleDelete = async (targetThreadId: string): Promise<void> => {
    try {
      await deleteThread(targetThreadId);
      toast.success("Thread deleted successfully");

      if (targetThreadId === threadId) {
        navigationService.navigateToHome();
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to delete thread",
      );
      throw error;
    }
  };

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        {/* Logo and collapse button */}
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          {/* Navigation buttons: New Chat, Workflows, Wiki */}
        </SidebarGroup>

        {!isCollapsed && (
          <div className="scrollbar-sidebar flex min-h-0 flex-1 flex-col overflow-y-auto">
            <SidebarGroup>
              <SidebarGroupLabel>CHATS</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {threadsLoading ? (
                    <SidebarMenuSkeleton />
                  ) : threads.length === 0 ? (
                    <EmptyState />
                  ) : (
                    threads.map((thread) => (
                      <ThreadItem
                        key={thread.thread_id}
                        thread={thread}
                        onRename={handleRename}
                        onDelete={handleDelete}
                      />
                    ))
                  )}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </div>
        )}
      </SidebarContent>

      <SidebarUserProfile />
      <SidebarRail />
    </Sidebar>
  );
};
```

**Key Features**:

- **Collapsible**: Can collapse to icon-only mode
- **Navigation Buttons**: New Chat, Workflows, Wiki
- **Thread List**: Scrollable list of conversation threads
- **Active State**: Highlights current thread
- **Thread Actions**: Rename and delete via dropdown menu
- **User Profile**: Shows auth state at bottom
- **Keyboard Shortcuts**: Tooltips show keyboard shortcuts
- **Loading States**: Skeleton loaders while fetching

**Navigation Buttons**:
```typescript
// New Chat - Creates new conversation
<SidebarMenuButton
  onClick={() => navigationService.navigateToHome()}
  tooltip={{
    children: (
      <div className="text-center">
        <p className="font-medium">New Chat</p>
        <p className="text-xs">{getShortcutText("new-chat")}</p>
      </div>
    ),
  }}
  style={{
    backgroundColor: "var(--forest-green)",
    color: "var(--off-white)",
  }}
>
  <Plus className="h-4 w-4" />
  <span>New Chat</span>
</SidebarMenuButton>

// Workflows - Navigate to workflows page
<SidebarMenuButton onClick={() => handleNavigate("workflows")}>
  <GitBranch className="h-4 w-4" />
  <span>Workflows</span>
</SidebarMenuButton>

// Wiki - External link to documentation
<SidebarMenuButton onClick={() => handleNavigate("wiki")}>
  <BookOpen className="h-4 w-4" />
  <span>Wiki</span>
</SidebarMenuButton>
```

### 2. ThreadHistory

**File**: `/home/user/tiler2-ui/src/features/side-panel/components/thread-history/index.tsx`

Responsive thread history component that switches between desktop and mobile layouts:

```typescript
export const ThreadHistory = (): React.JSX.Element => {
  const {
    isLargeScreen,
    chatHistoryOpen,
    setChatHistoryOpen,
    threads,
    threadsLoading,
  } = useThreadHistory();

  return (
    <>
      <DesktopHistoryPanel
        chatHistoryOpen={chatHistoryOpen}
        setChatHistoryOpen={setChatHistoryOpen}
        threads={threads}
        threadsLoading={threadsLoading}
      />
      <MobileHistorySheet
        chatHistoryOpen={chatHistoryOpen}
        setChatHistoryOpen={setChatHistoryOpen}
        isLargeScreen={isLargeScreen}
        threads={threads}
      />
    </>
  );
};
```

**Desktop vs Mobile**:
- **Desktop (≥1024px)**: `DesktopHistoryPanel` - Slide-in panel
- **Mobile (<1024px)**: `MobileHistorySheet` - Bottom sheet

### 3. useThreadHistory Hook

**File**: `/home/user/tiler2-ui/src/features/side-panel/components/thread-history/hooks/use-thread-history.ts`

Manages thread history state and fetching:

```typescript
export function useThreadHistory() {
  const isLargeScreen = useMediaQuery("(min-width: 1024px)");
  const [chatHistoryOpen, setChatHistoryOpen] =
    useSearchParamState("chatHistoryOpen");

  const { getThreads, threads, setThreads, threadsLoading, setThreadsLoading } =
    useThreads();

  useEffect(() => {
    if (typeof window === "undefined") return;

    const fetchThreads = async () => {
      setThreadsLoading(true);
      try {
        const fetchedThreads = await getThreads();
        setThreads(fetchedThreads);
      } catch (error) {
        reportThreadError(error as Error, {
          operation: "fetchThreads",
          component: "useThreadHistory",
        });
      } finally {
        setThreadsLoading(false);
      }
    };

    // Delay to allow Auth0 SDK to hydrate tokens
    const timeoutId = setTimeout(fetchThreads, AUTH_BOOTSTRAP_DELAY_MS);

    return () => clearTimeout(timeoutId);
  }, [getThreads, setThreads, setThreadsLoading]);

  return {
    isLargeScreen,
    chatHistoryOpen: chatHistoryOpen === true,
    setChatHistoryOpen: (value: boolean | ((prev: boolean) => boolean)) => {
      if (typeof value === "function") {
        const prevBool = chatHistoryOpen === true;
        const newValue = value(prevBool);
        setChatHistoryOpen(newValue ? true : null);
      } else {
        setChatHistoryOpen(value ? true : null);
      }
    },
    threads,
    threadsLoading,
  };
}
```

**Key Features**:
- Fetches threads on mount with auth delay
- Tracks screen size for responsive layout
- Manages chat history open/close state
- Uses URL search params for state persistence
- Provides loading state

### 4. ThreadList

**File**: `/home/user/tiler2-ui/src/features/side-panel/components/thread-history/components/thread-list.tsx`

Displays list of threads with click handling:

```typescript
export const ThreadList: React.FC<ThreadListProps> = ({
  threads,
  onThreadClick,
}) => {
  const [threadId] = useSearchParamState("threadId");
  const { navigationService } = useUIContext();

  return (
    <div className="flex w-full flex-col items-start justify-start gap-2">
      {threads.map((t) => {
        const itemText = extractThreadDisplayText(t);
        return (
          <div key={t.thread_id} className="w-full px-1">
            <Button
              variant="ghost"
              className="w-full items-start justify-start text-left font-normal"
              onClick={(e) => {
                e.preventDefault();
                onThreadClick?.(t.thread_id);
                if (t.thread_id === threadId) return;

                navigationService.navigateToHome({ threadId: t.thread_id });
              }}
            >
              <p className="w-full truncate text-ellipsis">{itemText}</p>
            </Button>
          </div>
        );
      })}
    </div>
  );
};
```

**Features**:
- Extracts display text from thread metadata
- Highlights active thread
- Prevents navigation to current thread
- Truncates long thread titles
- Ghost button styling

### 5. Thread Actions Menu

**File**: `/home/user/tiler2-ui/src/features/side-panel/components/thread-actions-menu.tsx`

Dropdown menu for thread actions (rename, delete):

```typescript
export const ThreadActionsMenu = ({
  threadId,
  threadTitle,
  onRename,
  onDelete,
}) => {
  const [showRenameDialog, setShowRenameDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setShowRenameDialog(true)}>
            <Pencil className="mr-2 h-4 w-4" />
            Rename
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => setShowDeleteDialog(true)}
            className="text-destructive"
          >
            <Trash className="mr-2 h-4 w-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <RenameThreadDialog
        open={showRenameDialog}
        onOpenChange={setShowRenameDialog}
        threadId={threadId}
        currentTitle={threadTitle}
        onRename={onRename}
      />

      <DeleteThreadConfirmDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        threadId={threadId}
        threadTitle={threadTitle}
        onDelete={onDelete}
      />
    </>
  );
};
```

**Features**:
- Dropdown menu with rename and delete options
- Separate dialogs for each action
- Confirmation before delete
- Error handling and toast notifications
- Destructive styling for delete action

### 6. Thread Text Extractor

**File**: `/home/user/tiler2-ui/src/features/side-panel/components/thread-history/utils/thread-text-extractor.ts`

Utility to extract display text from thread metadata:

```typescript
export function extractThreadDisplayText(thread: Thread): string {
  // Try metadata.name first
  if (thread.metadata?.name && typeof thread.metadata.name === 'string') {
    return thread.metadata.name;
  }

  // Fallback to first message content
  if (thread.values?.messages?.[0]?.content) {
    const content = thread.values.messages[0].content;
    if (typeof content === 'string') {
      return truncate(content, 50);
    }
    if (Array.isArray(content) && content[0]?.text) {
      return truncate(content[0].text, 50);
    }
  }

  // Final fallback
  return 'Untitled Thread';
}

function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}
```

## Responsive Layouts

### Desktop Layout (≥1024px)

- **Persistent Sidebar**: Always visible on left
- **Collapsible**: Can collapse to icon-only mode
- **Thread List**: Scrollable list in sidebar
- **Tooltips**: Show on collapsed mode

### Mobile Layout (<1024px)

- **Bottom Sheet**: Thread history as bottom sheet
- **Hamburger Menu**: Toggle sidebar from header
- **Full Screen**: Sidebar slides over content
- **Touch Optimized**: Larger touch targets

## Integration with Other Modules

### UIProvider Integration

Side panel uses UIProvider for navigation:

```typescript
import { useUIContext } from '@/features/chat';

function Sidebar() {
  const { navigationService } = useUIContext();

  const handleNewChat = () => {
    navigationService.navigateToHome();
  };

  const handleWorkflows = () => {
    navigationService.navigateToWorkflows();
  };
}
```

### ThreadProvider Integration

Fetches and manages threads:

```typescript
import { useThreads } from '@/features/thread';

function ThreadHistory() {
  const {
    threads,
    threadsLoading,
    deleteThread,
    renameThread
  } = useThreads();

  // Display threads, handle actions
}
```

### Auth Module Integration

Displays user profile:

```typescript
import { SidebarUserProfile } from '@/features/auth';

function Sidebar() {
  return (
    <Sidebar>
      <SidebarContent>
        {/* ... navigation ... */}
      </SidebarContent>
      <SidebarUserProfile />
    </Sidebar>
  );
}
```

### Hotkeys Integration

Shows keyboard shortcuts in tooltips:

```typescript
import { getShortcutText } from '@/features/hotkeys';

<SidebarMenuButton
  tooltip={{
    children: (
      <div>
        <p>New Chat</p>
        <p className="text-xs">{getShortcutText("new-chat")}</p>
      </div>
    ),
  }}
>
  New Chat
</SidebarMenuButton>
```

## Public API

**File**: `/home/user/tiler2-ui/src/features/side-panel/index.ts`

```typescript
export { SidePanel } from "./components";
export { SidePanelLayout } from "./components/side-panel-layout";
export { SidePanelNavigation } from "./components/side-panel-navigation";
export { SidePanelHeader } from "./components/side-panel-header";
export { SidePanelContent } from "./components/side-panel-content";
export { ThreadHistory } from "./components/thread-history";
export { NavigationButton } from "./components/navigation-button";
```

## Common Patterns

### Opening Thread History

```typescript
function ChatHeader() {
  const { chatHistoryOpen, setChatHistoryOpen } = useThreadHistory();

  return (
    <button onClick={() => setChatHistoryOpen(!chatHistoryOpen)}>
      {chatHistoryOpen ? <X /> : <Menu />}
    </button>
  );
}
```

### Navigating to Thread

```typescript
function ThreadItem({ thread }) {
  const { navigationService } = useUIContext();

  const handleClick = () => {
    navigationService.navigateToHome({
      threadId: thread.thread_id
    });
  };

  return (
    <button onClick={handleClick}>
      {thread.metadata?.name || 'Untitled'}
    </button>
  );
}
```

### Deleting Thread with Confirmation

```typescript
function ThreadActions({ thread }) {
  const { deleteThread } = useThreads();
  const [showConfirm, setShowConfirm] = useState(false);

  const handleDelete = async () => {
    try {
      await deleteThread(thread.thread_id);
      toast.success("Thread deleted");
    } catch (error) {
      toast.error("Failed to delete thread");
    }
  };

  return (
    <>
      <button onClick={() => setShowConfirm(true)}>Delete</button>
      <DeleteConfirmDialog
        open={showConfirm}
        onConfirm={handleDelete}
        onCancel={() => setShowConfirm(false)}
      />
    </>
  );
}
```

## Best Practices

1. **Responsive Design**: Always consider mobile and desktop layouts
2. **Loading States**: Show skeletons while fetching threads
3. **Error Handling**: Toast notifications for user feedback
4. **Confirmation Dialogs**: Require confirmation for destructive actions
5. **Keyboard Shortcuts**: Display shortcuts in tooltips
6. **Optimistic Updates**: Update UI before API confirms
7. **Accessibility**: ARIA labels and keyboard navigation

## Shadcn/ui Sidebar Components

The module uses shadcn/ui Sidebar primitives:

- `Sidebar`: Root container
- `SidebarHeader`: Header section
- `SidebarContent`: Main content area
- `SidebarGroup`: Group of related items
- `SidebarGroupLabel`: Label for group
- `SidebarMenu`: Menu container
- `SidebarMenuItem`: Individual menu item
- `SidebarMenuButton`: Menu button with tooltip support
- `SidebarMenuSkeleton`: Loading skeleton
- `SidebarSeparator`: Visual separator
- `SidebarRail`: Resize handle
- `useSidebar`: Hook for sidebar state

## Next Steps

**Next**: [File Upload Module](/home/user/tiler2-ui/docs/32-module-file-upload.md) - Learn about file upload handling, validation, drag-and-drop, base64 encoding, and preview components for multimodal content
