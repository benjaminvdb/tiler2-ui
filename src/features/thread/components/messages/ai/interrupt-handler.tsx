import { useStreamContext } from "@/core/providers/stream";
import { ChatInterrupt } from "../chat-interrupt";
import type { HumanInterrupt } from "@langchain/langgraph/prebuilt";

const isHumanInterrupt = (value: unknown): value is HumanInterrupt => {
  if (!value || typeof value !== "object") return false;
  return (
    "action_request" in (value as Record<string, unknown>) &&
    "config" in (value as Record<string, unknown>)
  );
};

interface InterruptHandlerProps {
  interruptValue?: unknown;
  isLastMessage: boolean;
  hasNoAIOrToolMessages: boolean;
}
export const InterruptHandler: React.FC<InterruptHandlerProps> = ({
  interruptValue,
  isLastMessage,
  hasNoAIOrToolMessages,
}) => {
  const stream = useStreamContext();

  // Handle interrupt actions
  const handleInterruptAction = (
    type: "accept" | "ignore" | "respond" | "edit",
    args?: any,
  ) => {
    if (type === "respond" || type === "edit") {
      // For respond/edit, we'll let the user type in the chat input
      // The Thread component will detect the active interrupt and set response mode
      return;
    }
    const response = {
      type,
      args: args || null,
    };

    // Resume the stream with the interrupt response
    stream.submit(null, {
      command: {
        resume: response,
      },
    });
  };

  const normalizedInterrupt = Array.isArray(interruptValue)
    ? interruptValue.find(isHumanInterrupt)
    : isHumanInterrupt(interruptValue)
      ? (interruptValue as HumanInterrupt)
      : null;

  // For recognized interrupts, render as chat message
  if (
    normalizedInterrupt &&
    (isLastMessage || hasNoAIOrToolMessages)
  ) {
    return (
      <ChatInterrupt
        interrupt={normalizedInterrupt}
        onAccept={() => handleInterruptAction("accept")}
        onIgnore={() => handleInterruptAction("ignore")}
        onRespond={() => handleInterruptAction("respond")}
        onEdit={() => handleInterruptAction("edit")}
      />
    );
  }
  // For generic interrupts, also render as chat message if possible
  if (interruptValue && isLastMessage) {
    // Try to convert generic interrupt to chat format
    const genericInterrupt = {
      action_request: {
        action: "user_input",
        args: interruptValue,
      },
      config: {
        allow_accept: false,
        allow_ignore: false,
        allow_respond: true,
        allow_edit: false,
      },
      description:
        typeof interruptValue === "string"
          ? interruptValue
          : "Please provide input",
    };

    return (
      <ChatInterrupt
        interrupt={genericInterrupt as any}
        onRespond={() => handleInterruptAction("respond")}
      />
    );
  }
  return null;
};
