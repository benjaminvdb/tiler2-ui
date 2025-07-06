import { v4 as uuidv4 } from "uuid";
import { Message } from "@langchain/langgraph-sdk";
import { ContentBlocks } from "@/types";

export const buildHumanMessage = (
  input: string,
  contentBlocks: ContentBlocks,
): Message => {
  return {
    id: uuidv4(),
    type: "human",
    content: [
      ...(input.trim().length > 0 ? [{ type: "text", text: input }] : []),
      ...contentBlocks,
    ] as Message["content"],
  };
};

export const buildInterruptResponse = (input: string) => {
  return {
    type: "response",
    args: input.trim(),
  };
};
