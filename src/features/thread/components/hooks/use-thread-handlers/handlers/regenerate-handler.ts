import { Checkpoint } from "@langchain/langgraph-sdk";
import type { StreamContextType } from "@/core/providers/stream/types";

export const createRegenerateHandler = (
  stream: StreamContextType,
  setFirstTokenReceived: (value: boolean) => void,
  prevMessageLength: React.MutableRefObject<number>,
) => {
  return (parentCheckpoint: Checkpoint | null | undefined) => {
    prevMessageLength.current = prevMessageLength.current - 1;
    setFirstTokenReceived(false);
    stream.submit(null, {
      checkpoint: parentCheckpoint || null,
      streamMode: ["values"],
      streamSubgraphs: true,
    });
  };
};
