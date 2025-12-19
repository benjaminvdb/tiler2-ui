import type { StreamContextType } from "@/core/providers/stream/stream-types";

export const createActionHandler = (stream: StreamContextType) => {
  return (prompt: string) => {
    stream.sendMessage({ text: prompt });
  };
};
