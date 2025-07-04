import { parsePartialJson } from "@langchain/core/output_parsers";
import { useStreamContext } from "@/providers/Stream";
import { AIMessage, Checkpoint, Message } from "@langchain/langgraph-sdk";
import { getContentString } from "../utils";
import { BranchSwitcher, CommandBar } from "./shared";
import { MarkdownText } from "../markdown-text";
import { LoadExternalComponent } from "@langchain/langgraph-sdk/react-ui";
import { cn } from "@/lib/utils";
import { ToolCalls, ToolResult } from "./tool-calls";
import { MessageContentComplex } from "@langchain/core/messages";
import { Fragment } from "react/jsx-runtime";
import { isAgentInboxInterruptSchema } from "@/lib/agent-inbox-interrupt";
import { useQueryState, parseAsBoolean } from "nuqs";
import { useArtifact } from "../artifact";
import { ChatInterrupt } from "./chat-interrupt";

function CustomComponent({
  message,
  thread,
}: {
  message: Message;
  thread: ReturnType<typeof useStreamContext>;
}) {
  const artifact = useArtifact();
  const { values } = useStreamContext();
  const customComponents = values.ui?.filter(
    (ui) => ui.metadata?.message_id === message.id,
  );

  if (!customComponents?.length) return null;
  return (
    <Fragment key={message.id}>
      {customComponents.map((customComponent) => (
        <LoadExternalComponent
          key={customComponent.id}
          stream={thread}
          message={customComponent}
          meta={{ ui: customComponent, artifact }}
        />
      ))}
    </Fragment>
  );
}

function parseAnthropicStreamedToolCalls(
  content: MessageContentComplex[],
): AIMessage["tool_calls"] {
  const toolCallContents = content.filter((c) => c.type === "tool_use" && c.id);

  return toolCallContents.map((tc) => {
    const toolCall = tc as Record<string, any>;
    let json: Record<string, any> = {};
    if (toolCall?.input) {
      try {
        json = parsePartialJson(toolCall.input) ?? {};
      } catch {
        // Pass
      }
    }
    return {
      name: toolCall.name ?? "",
      id: toolCall.id ?? "",
      args: json,
      type: "tool_call",
    };
  });
}

interface InterruptProps {
  interruptValue?: unknown;
  isLastMessage: boolean;
  hasNoAIOrToolMessages: boolean;
}

function Interrupt({
  interruptValue,
  isLastMessage,
  hasNoAIOrToolMessages,
}: InterruptProps) {
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
    stream.submit(undefined, {
      command: {
        resume: response,
      },
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
}

export function AssistantMessage({
  message,
  isLoading,
  handleRegenerate,
}: {
  message: Message | undefined;
  isLoading: boolean;
  handleRegenerate: (parentCheckpoint: Checkpoint | null | undefined) => void;
}) {
  const content = message?.content ?? [];
  const contentString = getContentString(content);
  const [hideToolCalls] = useQueryState(
    "hideToolCalls",
    parseAsBoolean.withDefault(true),
  );

  const thread = useStreamContext();

  // If this is the special placeholder AssistantMessage (no real message), mirror the current interrupt
  if (!message) {
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
        typeof interruptVal === "string"
          ? interruptVal
          : "Please provide input",
    };

    return (
      <ChatInterrupt
        interrupt={genericInterrupt as any}
        onIgnore={() => handleAction("ignore")}
      />
    );
  }
  const isLastMessage =
    message === undefined ||
    (thread.messages.length > 0 &&
      thread.messages[thread.messages.length - 1]?.id === message?.id);
  const hasNoAIOrToolMessages = !thread.messages.find(
    (m) => m.type === "ai" || m.type === "tool",
  );
  const meta = message ? thread.getMessagesMetadata(message) : undefined;
  const threadInterrupt = thread.interrupt;

  const parentCheckpoint = meta?.firstSeenState?.parent_checkpoint;
  const anthropicStreamedToolCalls = Array.isArray(content)
    ? parseAnthropicStreamedToolCalls(content)
    : undefined;

  const hasToolCalls =
    message &&
    "tool_calls" in message &&
    message.tool_calls &&
    message.tool_calls.length > 0;
  const toolCallsHaveContents =
    hasToolCalls &&
    message.tool_calls?.some(
      (tc) => tc.args && Object.keys(tc.args).length > 0,
    );
  const hasAnthropicToolCalls = !!anthropicStreamedToolCalls?.length;
  const isToolResult = message?.type === "tool";

  if (isToolResult && hideToolCalls) {
    return null;
  }

  return (
    <div className="group mr-auto flex items-start gap-2">
      <div className="flex flex-col gap-2">
        {isToolResult ? (
          <>
            <ToolResult message={message} />
          </>
        ) : (
          <>
            {contentString.length > 0 && (
              <div className="py-1">
                <MarkdownText>{contentString}</MarkdownText>
              </div>
            )}

            {!hideToolCalls && (
              <>
                {(hasToolCalls && toolCallsHaveContents && (
                  <ToolCalls toolCalls={message.tool_calls} />
                )) ||
                  (hasAnthropicToolCalls && (
                    <ToolCalls toolCalls={anthropicStreamedToolCalls} />
                  )) ||
                  (hasToolCalls && (
                    <ToolCalls toolCalls={message.tool_calls} />
                  ))}
              </>
            )}

            {message && (
              <CustomComponent
                message={message}
                thread={thread}
              />
            )}

            <div
              className={cn(
                "mr-auto flex items-center gap-2 transition-opacity",
                "opacity-0 group-focus-within:opacity-100 group-hover:opacity-100",
              )}
            >
              <BranchSwitcher
                branch={meta?.branch}
                branchOptions={meta?.branchOptions}
                onSelect={(branch) => thread.setBranch(branch)}
                isLoading={isLoading}
              />
              <CommandBar
                content={contentString}
                isLoading={isLoading}
                isAiMessage={true}
                handleRegenerate={() => handleRegenerate(parentCheckpoint)}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export function AssistantMessageLoading() {
  return (
    <div className="mr-auto flex items-start gap-2">
      <div className="bg-muted flex h-8 items-center gap-1 rounded-2xl px-4 py-2">
        <div className="bg-foreground/50 h-1.5 w-1.5 animate-[pulse_1.5s_ease-in-out_infinite] rounded-full"></div>
        <div className="bg-foreground/50 h-1.5 w-1.5 animate-[pulse_1.5s_ease-in-out_0.5s_infinite] rounded-full"></div>
        <div className="bg-foreground/50 h-1.5 w-1.5 animate-[pulse_1.5s_ease-in-out_1s_infinite] rounded-full"></div>
      </div>
    </div>
  );
}
