# Hotkeys Module

## Overview

The hotkeys module (`/home/user/tiler2-ui/src/features/hotkeys/`) provides keyboard shortcut functionality using the `react-hotkeys-hook` library. It manages global keyboard shortcuts with platform-specific bindings (Mac vs Windows/Linux), enables shortcuts to work within form elements, and provides a utility to display shortcut text in the UI.

**Purpose**: Enable power users to navigate the application efficiently using keyboard shortcuts, with proper platform detection to use Command (⌘) on Mac and Ctrl on Windows/Linux.

## Directory Structure

```
src/features/hotkeys/
├── hotkeys-provider.tsx        # Hotkeys provider and utilities
└── index.ts                    # Public API exports
```

## Core Concepts

### Why This Module Exists

1. **Keyboard Navigation**: Fast navigation for power users
2. **Platform Detection**: Mac (⌘) vs Windows/Linux (Ctrl) key bindings
3. **Accessibility**: Keyboard-first interface support
4. **Consistency**: Centralized shortcut definitions
5. **UI Integration**: Display shortcuts in tooltips and menus
6. **Form-Friendly**: Work even when focused in text inputs
7. **Global Shortcuts**: Application-wide keyboard handling

## Key Components

### 1. HotkeysProvider

**File**: `/home/user/tiler2-ui/src/features/hotkeys/hotkeys-provider.tsx`

The provider component that registers global keyboard shortcuts:

```typescript
const HOTKEY_OPTIONS = {
  enableOnFormTags: true,  // Allow shortcuts in input/textarea
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

**Features**:
- **Platform Detection**: Automatically uses correct modifier key
- **Form-Friendly**: Works even when focused in input/textarea
- **Event Prevention**: Prevents browser shortcuts from interfering
- **Navigation Integration**: Uses NavigationService for routing
- **Headless**: No UI, just event handling

**Usage**:
```typescript
function App() {
  return (
    <UIProvider>
      <HotkeysProvider>
        <AppContent />
      </HotkeysProvider>
    </UIProvider>
  );
}
```

### 2. Platform Detection

**Function**: `isMacPlatform()`

Detects if the user is on a Mac-based platform:

```typescript
const isMacPlatform = () =>
  typeof window !== "undefined" &&
  /Mac|iPod|iPhone|iPad/.test(navigator.platform);
```

**Detected Platforms**:
- Mac computers (macOS)
- iPod, iPhone, iPad (iOS)

**Returns**: `true` if Mac platform, `false` otherwise

### 3. Shortcut Bindings

**Function**: `getShortcutBindings()`

Returns platform-specific key bindings:

```typescript
const getShortcutBindings = () => {
  const isMac = isMacPlatform();
  return {
    newChat: isMac ? "meta+alt+c" : "ctrl+alt+c",
    workflows: isMac ? "meta+alt+w" : "ctrl+alt+w",
  };
};
```

**Key Bindings**:

| Action | Mac | Windows/Linux |
|--------|-----|---------------|
| New Chat | ⌘⌥C (Command+Option+C) | Ctrl+Alt+C |
| Workflows | ⌘⌥W (Command+Option+W) | Ctrl+Alt+W |

**Modifier Keys**:
- `meta` = Command (⌘) on Mac, Windows key on Windows
- `alt` = Option (⌥) on Mac, Alt on Windows/Linux
- `ctrl` = Control on all platforms

### 4. getShortcutText Utility

**Function**: `getShortcutText()`

Returns human-readable shortcut text for display in UI:

```typescript
export const getShortcutText = (shortcut: "new-chat" | "workflows"): string => {
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

**Usage in UI**:
```typescript
import { getShortcutText } from '@/features/hotkeys';

function MenuItem() {
  return (
    <button>
      New Chat
      <span className="ml-auto text-xs text-muted-foreground">
        {getShortcutText("new-chat")}
      </span>
    </button>
  );
}
```

**Output Examples**:
- Mac: "⌘⌥C"
- Windows/Linux: "Ctrl+Alt+C"

## Available Shortcuts

### New Chat (⌘⌥C / Ctrl+Alt+C)

Creates a new chat conversation:

```typescript
useHotkeys(
  bindings.newChat,
  (event) => {
    event.preventDefault();
    onNewThread();
  },
  HOTKEY_OPTIONS,
);
```

**Action**: Calls `onNewThread()` from UIProvider
**Result**: Navigates to home with a fresh thread

### Workflows (⌘⌥W / Ctrl+Alt+W)

Navigates to the workflows page:

```typescript
useHotkeys(
  bindings.workflows,
  (event) => {
    event.preventDefault();
    navigationService.navigateToWorkflows();
  },
  HOTKEY_OPTIONS,
);
```

**Action**: Calls `navigationService.navigateToWorkflows()`
**Result**: Navigates to workflows page

## Public API

**File**: `/home/user/tiler2-ui/src/features/hotkeys/index.ts`

```typescript
export { HotkeysProvider, getShortcutText } from "./hotkeys-provider";
```

**Exports**:
- `HotkeysProvider`: React component to wrap app
- `getShortcutText`: Function to get display text for shortcuts

## Integration with Other Modules

### UIProvider Integration

Hotkeys use UIProvider for navigation:

```typescript
import { useUIContext } from '@/features/chat';

function HotkeysProvider() {
  const { navigationService, onNewThread } = useUIContext();

  // Register shortcuts that use these methods
}
```

### Side Panel Integration

Side panel displays shortcut text in tooltips:

```typescript
import { getShortcutText } from '@/features/hotkeys';

function NavigationButton() {
  return (
    <button
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
    </button>
  );
}
```

### React Hotkeys Hook Library

The module uses `react-hotkeys-hook`:

```typescript
import { useHotkeys } from 'react-hotkeys-hook';

useHotkeys(
  'ctrl+alt+c',        // Key combination
  (event) => {         // Handler
    handleAction();
  },
  {                    // Options
    enableOnFormTags: true,
    preventDefault: true,
  }
);
```

## Common Patterns

### Adding New Shortcuts

To add a new keyboard shortcut:

1. **Add binding to `getShortcutBindings()`**:
```typescript
const getShortcutBindings = () => {
  const isMac = isMacPlatform();
  return {
    newChat: isMac ? "meta+alt+c" : "ctrl+alt+c",
    workflows: isMac ? "meta+alt+w" : "ctrl+alt+w",
    // Add new shortcut
    settings: isMac ? "meta+," : "ctrl+,",
  };
};
```

2. **Register with `useHotkeys` in HotkeysProvider**:
```typescript
useHotkeys(
  bindings.settings,
  (event) => {
    event.preventDefault();
    navigationService.navigateToSettings();
  },
  HOTKEY_OPTIONS,
);
```

3. **Add to `getShortcutText()` for display**:
```typescript
export const getShortcutText = (
  shortcut: "new-chat" | "workflows" | "settings"
): string => {
  const isMac = isMacPlatform();
  if (shortcut === "settings") {
    return isMac ? "⌘," : "Ctrl+,";
  }
  // ... other shortcuts
};
```

### Component-Level Shortcuts

For shortcuts specific to a component:

```typescript
import { useHotkeys } from 'react-hotkeys-hook';

function ChatInput() {
  useHotkeys(
    'meta+enter, ctrl+enter',  // Mac: ⌘↵, Windows: Ctrl+Enter
    (event) => {
      event.preventDefault();
      submitMessage();
    },
    {
      enableOnFormTags: true,
    }
  );

  return <textarea />;
}
```

### Conditional Shortcuts

Enable shortcuts based on conditions:

```typescript
import { useHotkeys } from 'react-hotkeys-hook';

function Editor() {
  const [isEditing, setIsEditing] = useState(false);

  useHotkeys(
    'escape',
    () => {
      setIsEditing(false);
    },
    {
      enabled: isEditing,  // Only active when editing
    }
  );

  return (
    <div>
      {isEditing ? <textarea /> : <div>View mode</div>}
    </div>
  );
}
```

### Displaying Shortcuts in Menus

```typescript
import { getShortcutText } from '@/features/hotkeys';

function Menu() {
  const shortcuts = [
    { label: "New Chat", action: "new-chat", onClick: handleNewChat },
    { label: "Workflows", action: "workflows", onClick: handleWorkflows },
  ];

  return (
    <div className="menu">
      {shortcuts.map((item) => (
        <button
          key={item.action}
          onClick={item.onClick}
          className="menu-item"
        >
          <span>{item.label}</span>
          <span className="shortcut">
            {getShortcutText(item.action)}
          </span>
        </button>
      ))}
    </div>
  );
}
```

## Best Practices

1. **Platform Detection**: Always use platform-specific bindings
2. **Prevent Default**: Use `preventDefault: true` to avoid conflicts
3. **Form-Friendly**: Use `enableOnFormTags: true` for global shortcuts
4. **Visual Indicators**: Display shortcuts in tooltips and menus
5. **Avoid Conflicts**: Choose combinations unlikely to conflict with browser shortcuts
6. **Documentation**: Document shortcuts in help/wiki
7. **Consistency**: Use consistent modifier patterns (e.g., always Ctrl+Alt on Windows)
8. **Testing**: Test on both Mac and Windows/Linux

## Accessibility Considerations

1. **Keyboard-First**: All actions should be keyboard accessible
2. **Skip Links**: Consider adding skip navigation links
3. **Focus Management**: Ensure focus moves logically after shortcuts
4. **ARIA Labels**: Add labels for screen readers
5. **Documentation**: Provide shortcut cheat sheet
6. **Customization**: Consider allowing users to customize shortcuts

## Common Modifier Key Combinations

| Purpose | Mac | Windows/Linux |
|---------|-----|---------------|
| Navigation | ⌘⌥ | Ctrl+Alt |
| Editor Actions | ⌘ | Ctrl |
| Quick Actions | ⌘⇧ | Ctrl+Shift |
| Application | ⌘K | Ctrl+K |

**Avoid**:
- Single keys (conflicts with typing)
- Browser shortcuts (⌘T, ⌘W, ⌘R, etc.)
- System shortcuts (⌘Space, ⌘Tab, etc.)

## Symbol Reference

| Symbol | Name | Mac Key | Windows/Linux Key |
|--------|------|---------|-------------------|
| ⌘ | Command | Command | Windows |
| ⌥ | Option | Option | Alt |
| ⌃ | Control | Control | Ctrl |
| ⇧ | Shift | Shift | Shift |
| ↵ | Return | Return/Enter | Enter |
| ⌫ | Delete | Delete | Backspace |
| ⎋ | Escape | Escape | Escape |

## Future Enhancements

Potential improvements to the hotkeys module:

1. **Shortcut Customization**: Allow users to customize shortcuts
2. **Shortcut Cheat Sheet**: Modal showing all available shortcuts
3. **Search Shortcuts**: Add command palette (⌘K / Ctrl+K)
4. **More Actions**: Add shortcuts for common actions
5. **Scope Management**: Context-aware shortcuts
6. **Recording**: Allow users to record custom shortcuts
7. **Conflicts Detection**: Warn about conflicting shortcuts

## Testing Shortcuts

To test keyboard shortcuts:

```typescript
// In tests
import { fireEvent } from '@testing-library/react';

test('new chat shortcut works', () => {
  const { container } = render(
    <HotkeysProvider>
      <App />
    </HotkeysProvider>
  );

  fireEvent.keyDown(container, {
    key: 'c',
    metaKey: true,  // Mac
    altKey: true,
  });

  expect(mockOnNewThread).toHaveBeenCalled();
});
```

## Conclusion

The hotkeys module provides a lightweight, platform-aware keyboard shortcut system that enhances the user experience for power users. By centralizing shortcut definitions and providing utilities for display, it makes keyboard navigation consistent and discoverable throughout the application.

**Key Takeaways**:
- Platform detection ensures Mac users get ⌘ and Windows users get Ctrl
- Shortcuts work even in form elements
- Display utilities make shortcuts discoverable in UI
- Built on solid foundation (`react-hotkeys-hook`)
- Easy to extend with new shortcuts

---

**Documentation Complete**: You've now learned about all 7 feature modules:
1. [Auth Module](/home/user/tiler2-ui/docs/27-module-auth.md) - Authentication and token management
2. [Chat Module](/home/user/tiler2-ui/docs/28-module-chat.md) - Chat state and UI providers
3. [Thread Module](/home/user/tiler2-ui/docs/29-module-thread.md) - Message rendering and thread management
4. [Artifacts Module](/home/user/tiler2-ui/docs/30-module-artifacts.md) - Portal-based artifact system
5. [Side Panel Module](/home/user/tiler2-ui/docs/31-module-side-panel.md) - Navigation and thread history
6. [File Upload Module](/home/user/tiler2-ui/docs/32-module-file-upload.md) - File upload and validation
7. [Hotkeys Module](/home/user/tiler2-ui/docs/33-module-hotkeys.md) - Keyboard shortcuts

These modules work together to create a comprehensive, feature-rich chat application with multimodal support, authentication, artifact rendering, and keyboard navigation.
