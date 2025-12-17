/**
 * CopilotKit integration for Link Chat.
 *
 * Provides:
 * - CopilotKitProvider - Wraps the app with CopilotKit context and auth
 * - useCopilotChat - Hook for chat functionality with AG-UI message format
 */

export { CopilotKitProvider } from "./copilotkit-provider";
export {
  useCopilotChat,
  type ContentBlock,
  type SubmitConfig,
  type SubmitData,
  type UseCopilotChatOptions,
  type UseCopilotChatReturn,
  type Message,
} from "./use-copilot-chat";
