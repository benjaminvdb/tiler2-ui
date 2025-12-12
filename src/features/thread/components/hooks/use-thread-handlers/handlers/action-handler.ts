import type { StreamContextType } from "@/core/providers/stream/ag-ui-types";
import { v4 as uuidv4 } from "uuid";

export const createActionHandler = (stream: StreamContextType) => {
  return (prompt: string) => {
    stream.submit({
      messages: [{ id: uuidv4(), type: "human", content: prompt }],
    });
  };
};
