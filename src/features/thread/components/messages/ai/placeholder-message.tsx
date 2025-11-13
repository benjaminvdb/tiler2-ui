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

const normalizeInterrupt = (value: unknown): HumanInterrupt | null => {
  if (Array.isArray(value)) {
    return value.length && isHumanInterrupt(value[0]) ? value[0] : null;
  }
  return isHumanInterrupt(value) ? (value as HumanInterrupt) : null;
};

export const PlaceholderMessage: React.FC = () => {
  const thread = useStreamContext();
  const interruptVal = thread.interrupt?.value;

  if (!interruptVal) return null;

  const handleAction = (type: "accept" | "ignore" | "edit", args?: any) => {
    const response = { type, args: args ?? null };
    thread.submit(null, {
      command: { resume: response },
    });
  };

  const interrupt = normalizeInterrupt(interruptVal);
  if (interrupt) {
    return (
      <ChatInterrupt
        interrupt={interrupt}
        onAccept={() => handleAction("accept")}
        onIgnore={() => handleAction("ignore")}
        onEdit={() => handleAction("edit")}
      />
    );
  }
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
