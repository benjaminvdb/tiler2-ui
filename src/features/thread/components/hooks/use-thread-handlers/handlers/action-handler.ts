import type { StreamContextType } from "@/core/providers/stream/types";

export const createActionHandler = (stream: StreamContextType) => {
  return (prompt: string) => {
    stream.submit({ messages: [{ type: "human", content: prompt }] });
  };
};
