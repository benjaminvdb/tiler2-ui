/** React context for coordinating artifact slot elements across the component tree. */

import { createContext } from "react";
import { ArtifactSlotContextType } from "./types";

export const ArtifactSlotContext = createContext<ArtifactSlotContextType>(
  null!,
);
