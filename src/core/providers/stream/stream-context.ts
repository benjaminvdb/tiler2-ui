/**
 * Stream context for accessing chat state and actions throughout the app.
 */

import { createContext, useContext } from "react";
import { StreamContextType } from "./stream-types";

export const StreamContext = createContext<StreamContextType | undefined>(
  undefined,
);

/** Hook to access streaming chat context. Must be used within StreamProvider. */
export const useStreamContext = (): StreamContextType => {
  const context = useContext(StreamContext);
  if (context === undefined) {
    throw new Error("useStreamContext must be used within a StreamProvider");
  }
  return context;
};
