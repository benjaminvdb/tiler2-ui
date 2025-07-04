import { BaseMessage } from "@langchain/core/messages";

export const messageTypeToLabel = (message: BaseMessage) => {
  let type = "";
  if ("type" in message) {
    type = message.type as string;
  } else {
    type = message._getType();
  }

  switch (type) {
    case "human":
      return "User";
    case "ai":
      return "Assistant";
    case "tool":
      return "Tool";
    case "System":
      return "System";
    default:
      return "";
  }
};