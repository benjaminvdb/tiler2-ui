# Keyboard Shortcuts

Keyboard shortcuts provide power users with quick access to common actions without using the mouse. The system detects platform (Mac vs Windows/Linux) and displays appropriate shortcuts.

## Why This Exists

Power users expect keyboard shortcuts for efficiency. Rather than clicking through menus, users can press key combinations to perform common actions like starting a new chat or opening workflows. Platform-specific shortcuts ensure the best experience on each operating system.

## HotkeysProvider Implementation

The HotkeysProvider manages keyboard shortcuts globally.

**File:** `/home/user/tiler2-ui/src/features/hotkeys/hotkeys-provider.tsx`

**Implementation:**
```typescript
import React from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { useUIContext } from "@/features/chat/providers/ui-provider";

const HOTKEY_OPTIONS = {
  enableOnFormTags: true,  // Work in inputs/textareas
  preventDefault: true,     // Prevent default browser behavior
} as const;

const isMacPlatform = () =>
  typeof window !== "undefined" &&
  /Mac|iPod|iPhone|iPad/.test(navigator.platform);

const getShortcutBindings = () => {
  const isMac = isMacPlatform();
  return {
    newChat: isMac ? "meta+alt+c" : "ctrl+alt+c",
    workflows: isMac ? "meta+alt+w" : "ctrl+alt+w",
  };
};

export const HotkeysProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { navigationService, onNewThread } = useUIContext();
  const bindings = getShortcutBindings();

  useHotkeys(
    bindings.newChat,
    (event) => {
      event.preventDefault();
      onNewThread();
    },
    HOTKEY_OPTIONS,
  );

  useHotkeys(
    bindings.workflows,
    (event) => {
      event.preventDefault();
      navigationService.navigateToWorkflows();
    },
    HOTKEY_OPTIONS,
  );

  return <>{children}</>;
};
```

**Key Features:**
- Platform detection (Mac vs Windows/Linux)
- Works in form elements (inputs, textareas)
- Prevents default browser shortcuts
- Integrated with navigation service

## Available Shortcuts

The system currently supports two main shortcuts.

### New Chat

**Purpose:** Start a new conversation

**Keybinding:**
- **Mac:** `Cmd+Option+C` (`⌘⌥C`)
- **Windows/Linux:** `Ctrl+Alt+C`

**Action:**
```typescript
onNewThread();
```

**Flow:**
1. User presses shortcut
2. `onNewThread()` called
3. New thread ID generated
4. Navigate to blank chat
5. Focus on input

**Example:**
```typescript
const onNewThread = () => {
  const newThreadId = crypto.randomUUID();
  navigate(`/?thread_id=${newThreadId}`);

  // Focus input after navigation
  setTimeout(() => {
    const input = document.querySelector('textarea');
    input?.focus();
  }, 100);
};
```

### Workflows

**Purpose:** Open workflow selection page

**Keybinding:**
- **Mac:** `Cmd+Option+W` (`⌘⌥W`)
- **Windows/Linux:** `Ctrl+Alt+W`

**Action:**
```typescript
navigationService.navigateToWorkflows();
```

**Flow:**
1. User presses shortcut
2. Navigate to `/workflows`
3. Display workflow selection page

## Platform Detection

The system detects the user's platform to show appropriate shortcuts.

**Detection Function:**
```typescript
const isMacPlatform = () =>
  typeof window !== "undefined" &&
  /Mac|iPod|iPhone|iPad/.test(navigator.platform);
```

**Platform-Specific Bindings:**
```typescript
const getShortcutBindings = () => {
  const isMac = isMacPlatform();
  return {
    newChat: isMac ? "meta+alt+c" : "ctrl+alt+c",
    workflows: isMac ? "meta+alt+w" : "ctrl+alt+w",
  };
};
```

**Why This Matters:**
- Mac uses `Command` (⌘) key, Windows/Linux use `Ctrl`
- Mac users expect `Cmd` for shortcuts
- Consistency with platform conventions

## Shortcut Text Display

Convert internal binding to user-friendly text.

**Function:**
```typescript
export const getShortcutText = (
  shortcut: "new-chat" | "workflows"
): string => {
  const isMac = isMacPlatform();

  if (shortcut === "new-chat") {
    return isMac ? "⌘⌥C" : "Ctrl+Alt+C";
  }

  if (shortcut === "workflows") {
    return isMac ? "⌘⌥W" : "Ctrl+Alt+W";
  }

  return "";
};
```

**Usage in UI:**
```typescript
<Button>
  New Chat
  <kbd className="ml-2">
    {getShortcutText("new-chat")}
  </kbd>
</Button>
```

**Styling:**
```css
kbd {
  padding: 0.125rem 0.375rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.25rem;
  background: #f9fafb;
  font-size: 0.75rem;
  font-family: monospace;
  color: #6b7280;
}
```

**Result:**
```
New Chat     ⌘⌥C
```

## React Hotkeys Hook

The system uses `react-hotkeys-hook` library.

**Library:** `react-hotkeys-hook`

**Basic Usage:**
```typescript
import { useHotkeys } from 'react-hotkeys-hook';

useHotkeys(
  'ctrl+k',           // Keybinding
  (event) => {        // Handler
    event.preventDefault();
    handleAction();
  },
  {                   // Options
    enableOnFormTags: true,
    preventDefault: true,
  }
);
```

**Options:**

### enableOnFormTags

Allow shortcuts in form elements:
```typescript
{
  enableOnFormTags: true  // Works in input, textarea, select
}
```

Without this, shortcuts wouldn't work when user is typing in chat input.

### preventDefault

Prevent browser default behavior:
```typescript
{
  preventDefault: true  // Stop browser from handling shortcut
}
```

Example: Prevent `Ctrl+W` from closing browser tab.

### enabled

Conditionally enable shortcut:
```typescript
useHotkeys(
  'ctrl+s',
  handleSave,
  {
    enabled: isDirty,  // Only when there are unsaved changes
  }
);
```

### scopes

Organize shortcuts by scope:
```typescript
useHotkeys(
  'esc',
  closeModal,
  {
    scopes: ['modal'],
  }
);

// Activate scope when modal opens
enableScope('modal');
```

## Adding New Shortcuts

To add a new shortcut, follow these steps.

### 1. Add to Bindings

```typescript
const getShortcutBindings = () => {
  const isMac = isMacPlatform();
  return {
    newChat: isMac ? "meta+alt+c" : "ctrl+alt+c",
    workflows: isMac ? "meta+alt+w" : "ctrl+alt+w",
    // Add new shortcut
    search: isMac ? "meta+k" : "ctrl+k",
  };
};
```

### 2. Add Hook in Provider

```typescript
export const HotkeysProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { navigationService, onNewThread, onSearch } = useUIContext();
  const bindings = getShortcutBindings();

  // Existing shortcuts...

  // Add new hook
  useHotkeys(
    bindings.search,
    (event) => {
      event.preventDefault();
      onSearch();
    },
    HOTKEY_OPTIONS,
  );

  return <>{children}</>;
};
```

### 3. Add to Display Helper

```typescript
export const getShortcutText = (
  shortcut: "new-chat" | "workflows" | "search"
): string => {
  const isMac = isMacPlatform();

  if (shortcut === "new-chat") {
    return isMac ? "⌘⌥C" : "Ctrl+Alt+C";
  }

  if (shortcut === "workflows") {
    return isMac ? "⌘⌥W" : "Ctrl+Alt+W";
  }

  // Add new shortcut
  if (shortcut === "search") {
    return isMac ? "⌘K" : "Ctrl+K";
  }

  return "";
};
```

### 4. Document in UI

Add to settings/help:
```typescript
<div className="shortcuts-list">
  <div className="shortcut-item">
    <span>Search</span>
    <kbd>{getShortcutText("search")}</kbd>
  </div>
</div>
```

## Component-Specific Shortcuts

For shortcuts specific to a component, use hooks directly in that component.

**Example - Code Block:**
```typescript
function CodeBlock({ code }: CodeBlockProps) {
  const { copy } = useCopyToClipboard();

  useHotkeys(
    'mod+shift+c',
    () => {
      copy(code);
    },
    {
      enabled: isHovered,  // Only when hovering code block
      scopes: ['code-block'],
    }
  );

  return (
    <div onMouseEnter={enableScope('code-block')}>
      <pre>{code}</pre>
    </div>
  );
}
```

**Example - Search Dialog:**
```typescript
function SearchDialog({ isOpen, onClose }: SearchDialogProps) {
  useHotkeys(
    'esc',
    () => {
      onClose();
    },
    {
      enabled: isOpen,
    }
  );

  return (
    <Dialog open={isOpen}>
      {/* Content */}
    </Dialog>
  );
}
```

## Best Practices

### 1. Use Standard Shortcuts

Follow platform conventions:
```typescript
// ✅ Good - Standard shortcuts
"meta+c"  // Copy (Mac)
"ctrl+c"  // Copy (Windows/Linux)
"meta+s"  // Save (Mac)
"ctrl+s"  // Save (Windows/Linux)

// ❌ Bad - Non-standard
"alt+shift+ctrl+s"  // Too complex
"f13"                // Obscure key
```

### 2. Avoid Conflicts

Don't override essential browser shortcuts:
```typescript
// ❌ Bad - Browser shortcuts
"ctrl+t"   // New tab
"ctrl+w"   // Close tab
"ctrl+r"   // Reload
"ctrl+n"   // New window

// ✅ Good - App-specific
"ctrl+alt+c"  // New chat
"ctrl+k"      // Search (common override)
```

### 3. Provide Visual Hints

Show shortcuts in tooltips:
```typescript
<Tooltip content={`New Chat (${getShortcutText("new-chat")})`}>
  <Button onClick={onNewThread}>New Chat</Button>
</Tooltip>
```

### 4. Make Shortcuts Discoverable

Add shortcuts page or help dialog:
```typescript
function ShortcutsHelp() {
  return (
    <Dialog>
      <DialogHeader>Keyboard Shortcuts</DialogHeader>
      <table>
        <tr>
          <td>New Chat</td>
          <td><kbd>{getShortcutText("new-chat")}</kbd></td>
        </tr>
        <tr>
          <td>Workflows</td>
          <td><kbd>{getShortcutText("workflows")}</kbd></td>
        </tr>
      </table>
    </Dialog>
  );
}
```

### 5. Handle Edge Cases

```typescript
useHotkeys(
  'ctrl+s',
  (event, handler) => {
    // Prevent if already saving
    if (isSaving) return;

    // Prevent if no changes
    if (!isDirty) return;

    handleSave();
  }
);
```

## Common Patterns

### Global Shortcuts

```typescript
// In HotkeysProvider
useHotkeys('ctrl+/', openHelp, HOTKEY_OPTIONS);
useHotkeys('ctrl+,', openSettings, HOTKEY_OPTIONS);
```

### Modal Shortcuts

```typescript
// In modal component
useHotkeys('esc', closeModal, { enabled: isOpen });
useHotkeys('enter', submitModal, { enabled: isOpen });
```

### Navigation Shortcuts

```typescript
useHotkeys('ctrl+1', () => navigate('/home'));
useHotkeys('ctrl+2', () => navigate('/workflows'));
useHotkeys('ctrl+3', () => navigate('/settings'));
```

### Text Editor Shortcuts

```typescript
useHotkeys('ctrl+b', makeBold);
useHotkeys('ctrl+i', makeItalic);
useHotkeys('ctrl+z', undo);
useHotkeys('ctrl+shift+z', redo);
```

## Debugging Shortcuts

### Log All Keypresses

```typescript
useHotkeys(
  '*',
  (event) => {
    console.log('Key pressed:', event.key);
  }
);
```

### Check Active Scopes

```typescript
import { getActiveScopes } from 'react-hotkeys-hook';

console.log('Active scopes:', getActiveScopes());
```

### Test Platform Detection

```typescript
console.log('Platform:', isMacPlatform() ? 'Mac' : 'Windows/Linux');
console.log('Shortcuts:', getShortcutBindings());
```

## Accessibility Considerations

### Don't Rely Only on Shortcuts

Always provide mouse/touch alternatives:
```typescript
// ✅ Good - Multiple ways to access
<Button onClick={onNewThread}>
  New Chat
  <kbd>{getShortcutText("new-chat")}</kbd>
</Button>

// ❌ Bad - Shortcut only
// (no visible UI)
```

### Announce Shortcuts to Screen Readers

```typescript
<span className="sr-only">
  Press {getShortcutText("new-chat")} to start a new chat
</span>
```

### Allow Customization

Future enhancement:
```typescript
interface ShortcutPreferences {
  newChat: string;
  workflows: string;
  // Allow users to set custom shortcuts
}
```

## Performance Considerations

### Debounce Expensive Actions

```typescript
const debouncedSearch = debounce(performSearch, 300);

useHotkeys('ctrl+k', () => {
  openSearchDialog();
  debouncedSearch();
});
```

### Lazy Load

Don't register shortcuts for features not loaded:
```typescript
const { isLoaded } = useFeature('advanced-search');

useHotkeys(
  'ctrl+shift+f',
  advancedSearch,
  {
    enabled: isLoaded,  // Only when feature loaded
  }
);
```

## Troubleshooting

### Shortcuts Not Working

**Check:**
1. HotkeysProvider wraps app
2. No conflicting shortcuts
3. `preventDefault` set correctly
4. Browser allows shortcut
5. Element has focus (if scoped)

### Platform Detection Wrong

**Check:**
1. `navigator.platform` available
2. Running in browser (not SSR)
3. Test on actual Mac/Windows device

### Shortcuts in Input Fields

**Check:**
1. `enableOnFormTags: true` set
2. Not conflicting with native input shortcuts
3. Consider using different key combination

## Future Enhancements

### Shortcut Customization

Allow users to customize shortcuts:
```typescript
interface ShortcutSettings {
  [action: string]: {
    mac: string;
    windows: string;
  };
}

const saveCustomShortcut = (
  action: string,
  shortcut: string
) => {
  localStorage.setItem(
    `shortcut-${action}`,
    shortcut
  );
};
```

### Shortcut Recording

Let users record new shortcuts:
```typescript
function ShortcutRecorder({ onRecord }: RecorderProps) {
  const [keys, setKeys] = useState<string[]>([]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const key = [
        e.metaKey && 'meta',
        e.ctrlKey && 'ctrl',
        e.shiftKey && 'shift',
        e.altKey && 'alt',
        e.key,
      ].filter(Boolean).join('+');

      setKeys([key]);
      onRecord(key);
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  return <div>Press keys: {keys.join('+')}</div>;
}
```

### Chord Shortcuts

Support multi-key sequences:
```typescript
// Press Ctrl+K, then C for command palette
useHotkeys('ctrl+k c', openCommandPalette);
```

## Related Documentation

- [Chat System](/home/user/tiler2-ui/docs/08-chat-system.md) - Chat interactions
- [Workflows](/home/user/tiler2-ui/docs/10-workflows.md) - Workflow navigation
- [Architecture](/home/user/tiler2-ui/docs/04-architecture.md) - Provider structure

---

**End of Features Documentation**

For more information, see:
- [Quick Start](/home/user/tiler2-ui/docs/01-quick-start.md)
- [Configuration](/home/user/tiler2-ui/docs/02-configuration.md)
- [Development Workflow](/home/user/tiler2-ui/docs/03-development-workflow.md)
