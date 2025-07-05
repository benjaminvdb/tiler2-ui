import { v4 as uuidv4 } from "uuid";
import { Message } from "@langchain/langgraph-sdk";

export function buildHumanMessage(input: string, contentBlocks: any[]): Message {
  return {
    id: uuidv4(),
    type: "human",
    content: [
      ...(input.trim().length > 0 ? [{ type: "text", text: input }] : []),
      ...contentBlocks,
    ] as Message["content"],
  };
}

export function buildInterruptResponse(input: string) {
  return {
    type: "response",
    args: input.trim(),
  };
}