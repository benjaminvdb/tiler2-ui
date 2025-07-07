/**
 * Chat Feature Public API
 * This is the only way other features should import from chat
 */

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

// Components (when created)
// export { ChatInput } from './components/ChatInput';
// export { ChatMessage } from './components/ChatMessage';
