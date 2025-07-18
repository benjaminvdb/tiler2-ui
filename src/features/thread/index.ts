/**
 * Thread Feature Public API
 * This is the only way other features should import from thread
 */

// Main component
export { Thread } from "./components";

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
export { MessageList } from "./components/layout/message-list";
export { ChatFooter } from "./components/layout/chat-footer";
