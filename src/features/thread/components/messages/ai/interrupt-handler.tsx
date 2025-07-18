import { useStreamContext } from "@/core/providers/stream";
import { isAgentInboxInterruptSchema } from "@/features/thread/services/agent-inbox-interrupt";
import { ChatInterrupt } from "../chat-interrupt";

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
      ...(stream.workflowType && {
        config: {
          configurable: {
            workflow_type: stream.workflowType,
          },
        },
      }),
    });
  };

  // For agent inbox interrupts, render as chat message
  if (
    isAgentInboxInterruptSchema(interruptValue) &&
    (isLastMessage || hasNoAIOrToolMessages)
  ) {
    const interrupt = Array.isArray(interruptValue)
      ? interruptValue[0]
      : interruptValue;

    return (
      <ChatInterrupt
        interrupt={interrupt}
        onAccept={() => handleInterruptAction("accept")}
        onIgnore={() => handleInterruptAction("ignore")}
        onRespond={() => handleInterruptAction("respond")}
        onEdit={() => handleInterruptAction("edit")}
      />
    );
  }
  // For generic interrupts, also render as chat message if possible
  if (
    interruptValue &&
    !isAgentInboxInterruptSchema(interruptValue) &&
    isLastMessage
  ) {
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
