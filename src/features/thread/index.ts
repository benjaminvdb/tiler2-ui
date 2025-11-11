/**
 * Thread Feature Public API
 * This is the only way other features should import from thread
 */

// Main component
export { Thread } from "./components";

// Provider
export { ThreadProvider, useThreads } from "./providers/thread-provider";

// Hooks
export { useThreadTitle } from "./hooks/use-thread-title";
export { useAutoTitleGeneration } from "./hooks/use-auto-title-generation";
export { useSse } from "./hooks/use-sse";

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
