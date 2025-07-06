import { Checkpoint } from "@langchain/langgraph-sdk";

export const createRegenerateHandler = (
  stream: any,
  setFirstTokenReceived: (value: boolean) => void,
  prevMessageLength: React.MutableRefObject<number>,
) => {
  return (parentCheckpoint: Checkpoint | null | undefined) => {
    // Do this so the loading state is correct
    prevMessageLength.current = prevMessageLength.current - 1;
    setFirstTokenReceived(false);
    stream.submit(undefined, {
      checkpoint: parentCheckpoint,
      streamMode: ["values"],
    });
  };
};
