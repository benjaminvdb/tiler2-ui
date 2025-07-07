/**
 * Thread Feature Public API
 * This is the only way other features should import from thread
 */

// Main component
export { Thread } from "./components/thread";

// Provider
export { ThreadProvider, useThreads } from "./providers/thread-provider";

// Types
export type {
  ThreadState,
  ThreadMetadata,
  ThreadConfig,
  ThreadContextType,
} from "./types";

// Sub-components that might be used externally
export { MessageList } from "./components/thread/layout/message-list";
export { ChatFooter } from "./components/thread/layout/chat-footer";
export { SidebarHistory } from "./components/thread/layout/sidebar-history";
