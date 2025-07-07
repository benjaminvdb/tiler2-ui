import { useStreamContext } from "@/core/providers/stream";
import { isAgentInboxInterruptSchema } from "@/features/thread/services/agent-inbox-interrupt";
import { ChatInterrupt } from "../chat-interrupt";

export const PlaceholderMessage: React.FC = () => {
  const thread = useStreamContext();
  const interruptVal = thread.interrupt?.value;

  if (!interruptVal) return null;

  // Helper to send resume commands
  const handleAction = (type: "accept" | "ignore" | "edit", args?: any) => {
    const response = { type, args: args ?? null };
    thread.submit(undefined, { command: { resume: response } });
  };

  if (isAgentInboxInterruptSchema(interruptVal)) {
    const interrupt = Array.isArray(interruptVal)
      ? interruptVal[0]
      : interruptVal;

    // Special case: if only allow_respond is true and all other flags are false,
    // display as a regular AI message instead of special interrupt UI
    const isRespondOnlyInterrupt =
      interrupt.config.allow_respond &&
      !interrupt.config.allow_accept &&
      !interrupt.config.allow_edit &&
      !interrupt.config.allow_ignore;

    if (isRespondOnlyInterrupt) {
      // Render as regular AI message - the user can respond normally via chat input
      return (
        <div className="flex flex-col gap-2">
          <div className="flex items-start gap-3 p-4">
            <div className="flex-1 space-y-2 overflow-hidden">
              <div className="prose prose-neutral dark:prose-invert max-w-none break-words">
                {interrupt.description ||
                  `Please confirm: ${interrupt.action_request.action}`}
              </div>
            </div>
          </div>
        </div>
      );
    }
    return (
      <ChatInterrupt
        interrupt={interrupt}
        onAccept={() => handleAction("accept")}
        onIgnore={() => handleAction("ignore")}
        onEdit={() => handleAction("edit")}
      />
    );
  }
  // Fallback generic interrupt
  const genericInterrupt = {
    action_request: {
      action: "user_input",
      args: interruptVal,
    },
    config: {
      allow_accept: false,
      allow_ignore: true,
      allow_edit: false,
      allow_respond: false,
    },
    description:
      typeof interruptVal === "string" ? interruptVal : "Please provide input",
  };

  return (
    <ChatInterrupt
      interrupt={genericInterrupt as any}
      onIgnore={() => handleAction("ignore")}
    />
  );
};
