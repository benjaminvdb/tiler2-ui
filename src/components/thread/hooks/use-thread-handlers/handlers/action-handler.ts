import type { StreamContextType } from "@/providers/stream/types";

export const createActionHandler = (stream: StreamContextType) => {
  return (prompt: string) => {
    stream.submit({ messages: prompt });
  };
};
