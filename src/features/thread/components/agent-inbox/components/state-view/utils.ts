import { BaseMessage } from "@langchain/core/messages";

export const messageTypeToLabel = (message: BaseMessage) => {
  // BaseMessage always has .type property
  const type = message.type as string;

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
